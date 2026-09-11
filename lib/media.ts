import sharp from 'sharp';

export const MAX_INLINE_BYTES = 25 * 1024 * 1024; // por anexo, após decode (foto de câmera passa de 7 MB)
export const MAX_STORED_BYTES = 8 * 1024 * 1024; // teto do que vai pro banco sem conseguir redimensionar
const RESIZE_ABOVE_BYTES = 600 * 1024; // acima disso, reencoda para web
const MAX_WIDTH = 1920;

/** Foto de câmera vira JPEG de tela (~200-500 KB); se o sharp não der conta, mantém o original. */
export async function toWebImage(bytes: Buffer, mime: string): Promise<{ bytes: Buffer; mime: string }> {
  if (bytes.length <= RESIZE_ABOVE_BYTES) return { bytes, mime };
  try {
    const out = await sharp(bytes, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return { bytes: out, mime: 'image/jpeg' };
  } catch {
    return { bytes, mime };
  }
}

/**
 * Decodifica o base64 de uma foto e a deixa em tamanho de web. null quando
 * não é imagem, está vazia, corrompida ou grande demais para guardar.
 */
export async function decodeInlineImage(
  contentBase64: string,
  mime: string | undefined,
): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!mime?.startsWith('image/')) return null;
  let bytes: Buffer;
  try {
    bytes = Buffer.from(contentBase64, 'base64');
  } catch {
    return null;
  }
  if (bytes.length === 0 || bytes.length > MAX_INLINE_BYTES) return null;
  const web = await toWebImage(bytes, mime);
  if (web.bytes.length > MAX_STORED_BYTES) return null;
  return web;
}
