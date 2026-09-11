import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decodeInlineImage } from '@/lib/media';
import type { Attachment } from '@/lib/ingest-types';

const SITE_URL = process.env.SITE_URL ?? 'https://gazetadealphaville.com.br';

export const dynamic = 'force-dynamic';

/**
 * Segunda fase da ingestão: foto de um e-mail já recebido, uma por requisição.
 *
 * O encaminhador manda primeiro o texto (requisição pequena, que publica a
 * matéria) e só depois cada foto separadamente. Assim uma foto grande demais
 * ou uma queda no meio do upload nunca impede a publicação — no pior caso a
 * matéria sai com a capa de fallback da editoria e a foto chega na tentativa
 * seguinte. A primeira foto que chegar vira capa se o post ainda não tem uma.
 *
 * Auth: mesmo `x-webhook-secret` do webhook principal.
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
  const messageId = str(p['messageId']) ?? str(p['message_id']);
  const contentBase64 = str(p['contentBase64']) ?? str(p['content_base64']);
  const mime = str(p['mime']) ?? str(p['contentType']) ?? str(p['content_type']);
  const filename = str(p['filename']) ?? null;
  if (!messageId || !contentBase64) {
    return NextResponse.json({ error: 'missing_fields', need: ['message_id', 'contentBase64'] }, { status: 400 });
  }

  const email = await prisma.ingestEmail.findUnique({ where: { messageId }, include: { post: true } });
  if (!email) return NextResponse.json({ error: 'unknown_message' }, { status: 404 });

  // Mesma foto reenviada (retentativa do encaminhador) não duplica.
  const known = (email.attachments as Attachment[] | null) ?? [];
  const already = filename && known.find((a) => a.filename === filename && a.url);
  if (already) {
    return NextResponse.json({ status: 'duplicate', url: already.url, coverImageUrl: email.post?.coverImageUrl ?? null });
  }

  const web = await decodeInlineImage(contentBase64, mime);
  if (!web) return NextResponse.json({ status: 'skipped', reason: 'not_an_image_or_too_large' });

  const asset = await prisma.mediaAsset.create({
    data: { filename, mime: web.mime, bytes: new Uint8Array(web.bytes) },
  });
  const url = `${SITE_URL}/api/media/${asset.id}`;
  const attachment: Attachment = { filename: filename ?? undefined, mime: web.mime, bytes: web.bytes.length, url };
  await prisma.ingestEmail.update({ where: { id: email.id }, data: { attachments: [...known, attachment] as object[] } });

  let coverImageUrl = email.post?.coverImageUrl ?? null;
  if (email.post && !email.post.coverImageUrl) {
    await prisma.post.update({ where: { id: email.post.id }, data: { coverImageUrl: url } });
    coverImageUrl = url;
  }
  return NextResponse.json({ status: 'stored', url, coverImageUrl, postSlug: email.post?.slug ?? null }, { status: 201 });
}
