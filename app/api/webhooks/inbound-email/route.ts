import { NextResponse } from 'next/server';
import { ingestEmail } from '@/lib/pipeline';
import { prisma } from '@/lib/db';
import { decodeInlineImage } from '@/lib/media';
import type { Attachment } from '@/lib/ingest-types';

const SITE_URL = process.env.SITE_URL ?? 'https://gazetadealphaville.com.br';
const MAX_INLINE_ATTACHMENTS = 6;

type InboundAttachment = Attachment & { contentBase64?: string };

/**
 * Anexos podem vir com `url` (provedor de inbound parse já hospedou) ou com
 * `contentBase64` (remetentes como o Apps Script mandam o binário inline).
 * Imagens inline são gravadas em media_asset e viram URLs /api/media/{id};
 * o base64 nunca segue adiante para o log de auditoria.
 */
async function storeInlineAttachments(raw: InboundAttachment[]): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const att of raw.slice(0, MAX_INLINE_ATTACHMENTS)) {
    const { contentBase64, ...rest } = att;
    if (!contentBase64 || !att.mime?.startsWith('image/')) {
      out.push(rest);
      continue;
    }
    const web = await decodeInlineImage(contentBase64, att.mime);
    if (!web) continue;
    const asset = await prisma.mediaAsset.create({
      data: { filename: att.filename ?? null, mime: web.mime, bytes: new Uint8Array(web.bytes) },
    });
    out.push({ ...rest, mime: web.mime, bytes: web.bytes.length, url: `${SITE_URL}/api/media/${asset.id}` });
  }
  return out;
}

export const dynamic = 'force-dynamic';

/**
 * Endpoint de ingestão de e-mail da SECOM. Configure um provedor de inbound
 * parse (SendGrid / Mailgun / Postmark) para fazer POST aqui. Aceita um
 * corpo JSON genérico — mapeia os campos mais comuns dos provedores.
 *
 * Auth: header `x-webhook-secret` deve casar com INBOUND_WEBHOOK_SECRET
 * (se a env estiver configurada).
 */
export async function POST(req: Request) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let p: Record<string, unknown>;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const messageId =
    str(p['messageId']) ?? str(p['message_id']) ?? str(p['Message-Id']) ?? str(p['MessageID']);
  const fromAddr = str(p['fromAddr']) ?? str(p['from']) ?? str(p['sender']) ?? str(p['From']);
  const subject = str(p['subject']) ?? str(p['Subject']) ?? '';
  const bodyText = str(p['bodyText']) ?? str(p['text']) ?? str(p['body_text']) ?? str(p['plain']) ?? '';
  const bodyHtml = str(p['bodyHtml']) ?? str(p['html']) ?? str(p['body_html']) ?? null;
  const rawAttachments = (Array.isArray(p['attachments']) ? p['attachments'] : []) as InboundAttachment[];

  if (!fromAddr || (!bodyText && !bodyHtml)) {
    return NextResponse.json({ error: 'missing_fields', need: ['from', 'text|html'] }, { status: 400 });
  }

  const attachments = await storeInlineAttachments(rawAttachments);

  // Data original do e-mail (o encaminhador manda `received_at`): release
  // reenviado dias depois entra com a data em que a SECOM soltou, não a de hoje.
  const receivedRaw = str(p['receivedAt']) ?? str(p['received_at']) ?? str(p['date']);
  const receivedAt = receivedRaw ? new Date(receivedRaw) : undefined;

  const outcome = await ingestEmail({
    messageId: messageId ?? `${fromAddr}-${subject}-${Date.now()}`,
    fromAddr,
    subject,
    bodyText: bodyText || '',
    bodyHtml,
    attachments,
    receivedAt: receivedAt && !Number.isNaN(receivedAt.getTime()) ? receivedAt : undefined,
  });

  const code = outcome.status === 'rejected' ? 403 : outcome.status === 'duplicate' ? 200 : 201;
  return NextResponse.json(outcome, { status: code });
}
