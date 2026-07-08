/** Utilidades de texto compartilhadas entre front e pipeline. */

export function normalize(str: string | null | undefined): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/\s+/g, ' ')
    .trim();
}

/** Slug estável a partir do título (kebab, sem acento). */
export function slugify(title: string): string {
  return normalize(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Limpa prefixos comuns de assunto de e-mail encaminhado. */
export function cleanSubject(subject: string | null | undefined): string {
  return (subject || '')
    .replace(/^\s*(res|re|enc|fw|fwd|encaminhado)\s*:\s*/gi, '')
    .replace(/\[\s*secom\s*\]/gi, '')
    .trim();
}

/** read_time_min ~ 200 palavras/min. */
export function readTimeMin(text: string): number {
  const words = normalize(text).split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Resumo: primeiras 2–3 frases do corpo. */
export function excerptFrom(body: string, maxChars = 220): string {
  const clean = body.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxChars && out) break;
    out += s;
    if (out.length >= maxChars) break;
  }
  return out.trim() || clean.slice(0, maxChars);
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Data curta em pt-BR, ex.: "21 Jun 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
