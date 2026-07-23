import { NextResponse } from 'next/server';
import { ingestEmail } from '@/lib/pipeline';
import { prisma } from '@/lib/db';
import type { Attachment } from '@/lib/ingest-types';

const SITE_URL = process.env.SITE_URL ?? 'https://gazetadealphaville.com.br';
const MAX_INLINE_ATTACHMENTS = 6;
const MAX_INLINE_BYTES = 8 * 1024 * 1024; // por anexo, após decode

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
    let bytes: Buffer;
    try {
      bytes = Buffer.from(contentBase64, 'base64');
    } catch {
      continue;
    }
    if (bytes.length === 0 || bytes.length > MAX_INLINE_BYTES) continue;
    const asset = await prisma.mediaAsset.create({
      data: { filename: att.filename ?? null, mime: att.mime, bytes: new Uint8Array(bytes) },
    });
    out.push({ ...rest, bytes: bytes.length, url: `${SITE_URL}/api/media/${asset.id}` });
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

  const outcome = await ingestEmail({
    messageId: messageId ?? `${fromAddr}-${subject}-${Date.now()}`,
    fromAddr,
    subject,
    bodyText: bodyText || '',
    bodyHtml,
    attachments,
  });

  const code = outcome.status === 'rejected' ? 403 : outcome.status === 'duplicate' ? 200 : 201;
  return NextResponse.json(outcome, { status: code });
}
