import { NextResponse } from 'next/server';
import { ingestEmail } from '@/lib/pipeline';
import type { Attachment } from '@/lib/ingest-types';

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
  const attachments = (Array.isArray(p['attachments']) ? p['attachments'] : []) as Attachment[];

  if (!fromAddr || (!bodyText && !bodyHtml)) {
    return NextResponse.json({ error: 'missing_fields', need: ['from', 'text|html'] }, { status: 400 });
  }

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
