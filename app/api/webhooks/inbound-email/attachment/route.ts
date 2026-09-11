import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decodeInlineImage } from '@/lib/media';
import { isPlaceholderCover } from '@/lib/cover';
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

  // Post criado antes do fallback por editoria guarda a URL do placeholder
  // preto como capa: para o efeito de "já tem foto?", isso é NÃO ter capa.
  const post = email.post;
  const needsCover = !!post && isPlaceholderCover(post.coverImageUrl);
  const setCover = async (url: string) => {
    if (!post || !needsCover) return post?.coverImageUrl ?? null;
    await prisma.post.update({ where: { id: post.id }, data: { coverImageUrl: url } });
    return url;
  };

  // Mesma foto reenviada (retentativa do encaminhador) não duplica — mas
  // ainda vira capa se o post ficou sem (caso da primeira tentativa falha).
  const known = (email.attachments as Attachment[] | null) ?? [];
  const already = filename && known.find((a) => a.filename === filename && a.url);
  if (already && already.url) {
    const coverImageUrl = await setCover(already.url);
    return NextResponse.json({ status: 'duplicate', url: already.url, coverImageUrl });
  }

  const web = await decodeInlineImage(contentBase64, mime);
  if (!web) return NextResponse.json({ status: 'skipped', reason: 'not_an_image_or_too_large' });

  const asset = await prisma.mediaAsset.create({
    data: { filename, mime: web.mime, bytes: new Uint8Array(web.bytes) },
  });
  const url = `${SITE_URL}/api/media/${asset.id}`;
  const attachment: Attachment = { filename: filename ?? undefined, mime: web.mime, bytes: web.bytes.length, url };
  await prisma.ingestEmail.update({ where: { id: email.id }, data: { attachments: [...known, attachment] as object[] } });

  const coverImageUrl = await setCover(url);
  return NextResponse.json({ status: 'stored', url, coverImageUrl, postSlug: post?.slug ?? null }, { status: 201 });
}
