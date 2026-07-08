import { prisma } from './db';
import { classify } from './classifier';
import { slugify, readTimeMin, excerptFrom, cleanSubject } from './format';
import type { Attachment } from './ingest-types';

/**
 * Núcleo da automação: recebe um e-mail cru da SECOM e executa
 * ingestão → classificação → decisão de publicação, gravando
 * ingest_email, classification e (quando aplicável) post.
 *
 * Idempotente por Message-ID. Retorna o que aconteceu para o chamador
 * (webhook, poller IMAP ou seed) reportar.
 */

export type RawEmail = {
  messageId: string;
  fromAddr: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string | null;
  attachments?: Attachment[];
  rawHeaders?: Record<string, string>;
  receivedAt?: Date;
};

export type IngestOutcome = {
  status: 'created' | 'duplicate' | 'rejected';
  emailId?: string;
  postId?: string;
  postSlug?: string;
  action?: 'publish' | 'review' | 'discard';
  editoria?: string;
  regiao?: string;
  score?: number;
  reason?: string;
};

/** Allowlist de remetentes da SECOM (env: SECOM_ALLOWLIST, vírgula-separado). */
function isAllowedSender(from: string): boolean {
  const raw = process.env.SECOM_ALLOWLIST?.trim();
  if (!raw) return true; // sem allowlist configurada → aceita (dev)
  const addr = from.toLowerCase();
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((allowed) => addr === allowed || addr.endsWith(`@${allowed}`) || addr.includes(allowed));
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'noticia';
  let i = 2;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function ingestEmail(raw: RawEmail): Promise<IngestOutcome> {
  // 1. Allowlist
  if (!isAllowedSender(raw.fromAddr)) {
    return { status: 'rejected', reason: 'sender-not-allowed' };
  }

  // 2. Idempotência por Message-ID
  const existing = await prisma.ingestEmail.findUnique({ where: { messageId: raw.messageId } });
  if (existing) {
    const post = await prisma.post.findUnique({ where: { emailId: existing.id } });
    return { status: 'duplicate', emailId: existing.id, postId: post?.id, postSlug: post?.slug };
  }

  // 3. Classifica
  const result = classify({ subject: raw.subject, body: raw.bodyText });
  const { decision } = result;

  // 4. Registra e-mail (auditoria)
  const email = await prisma.ingestEmail.create({
    data: {
      messageId: raw.messageId,
      fromAddr: raw.fromAddr,
      subject: raw.subject,
      bodyText: raw.bodyText,
      bodyHtml: raw.bodyHtml ?? null,
      attachments: (raw.attachments ?? []) as object[],
      rawHeaders: raw.rawHeaders ?? {},
      status: decision.emailStatus,
      receivedAt: raw.receivedAt ?? new Date(),
    },
  });

  // 5. Registra classificação (explicável)
  await prisma.classification.create({
    data: {
      emailId: email.id,
      editoriaSlug: result.editoria,
      regiaoSlug: result.regiao,
      score: result.score,
      scores: result.scores,
      matchedTerms: result.matched,
      taxonomiaVersao: result.taxonomiaVersao,
      method: 'rules',
    },
  });

  // 6. Descarte: não gera post publicável, fica só o log
  if (decision.action === 'discard') {
    return {
      status: 'created',
      emailId: email.id,
      action: 'discard',
      editoria: result.editoria,
      regiao: result.regiao,
      score: result.score,
    };
  }

  // 7. Gera o post (auto-publica ou entra em revisão)
  const title = cleanSubject(raw.subject);
  const excerpt = excerptFrom(raw.bodyText);
  const slug = await uniqueSlug(slugify(title));
  const cover =
    raw.attachments?.find((a) => a.mime?.startsWith('image/'))?.url ??
    `https://picsum.photos/seed/${slug}/1200/700`;
  const willPublish = decision.action === 'publish';

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt,
      body: raw.bodyText,
      editoriaSlug: result.editoria,
      regiaoSlug: result.regiao,
      coverImageUrl: cover,
      readTimeMin: readTimeMin(raw.bodyText),
      status: decision.postStatus,
      confidence: result.score,
      emailId: email.id,
      publishedAt: willPublish ? (raw.receivedAt ?? new Date()) : null,
    },
  });

  return {
    status: 'created',
    emailId: email.id,
    postId: post.id,
    postSlug: post.slug,
    action: decision.action,
    editoria: result.editoria,
    regiao: result.regiao,
    score: result.score,
  };
}
