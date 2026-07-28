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

/** Limpa prefixos comuns de assunto de e-mail encaminhado (aplicado em loop: "Enc: Release: X" → "X"). */
export function cleanSubject(subject: string | null | undefined): string {
  let s = (subject || '').replace(/\[\s*secom\s*\]/gi, '').trim();
  const prefix = /^\s*(res|re|enc|fw|fwd|encaminhado|release)\s*:\s*/i;
  while (prefix.test(s)) s = s.replace(prefix, '');
  return s.trim();
}

/** Normaliza quebras de linha: \r\n e \r viram \n. */
export function normalizeNewlines(text: string | null | undefined): string {
  return (text || '').replace(/\r\n?/g, '\n');
}

/**
 * Corta assinatura e rodapé institucional do e-mail da SECOM: blocos
 * "Crédito:"/"Fotos/texto:"/"Legenda:", delimitador "--", "Atenciosamente"
 * e o disclaimer de confidencialidade. Remove também o título repetido na
 * primeira linha do corpo. Se o corte zerar o texto, devolve o original.
 */
export function cleanEmailBody(bodyText: string, title?: string): string {
  let text = normalizeNewlines(bodyText).trim();
  const markers = [
    /^--+\s*$/m,
    /^\s*atenciosamente[;,.:]?\s*$/im,
    /^\s*cr[eé]ditos?:/im,
    /^\s*fotos?\s*\/?\s*texto:/im,
    /^\s*legenda:/im,
    /a informa[çc][ãa]o contida nesta mensagem/i,
  ];
  let cut = text.length;
  for (const re of markers) {
    const m = re.exec(text);
    if (m && m.index < cut) cut = m.index;
  }
  const trimmed = text.slice(0, cut).trim();
  if (trimmed) text = trimmed;

  // placeholders de imagem inline do Gmail não são conteúdo
  text = text.replace(/\[image:[^\]]*\]/gi, '').trim();

  if (title) {
    const paras = text.split(/\n\s*\n/);
    if (paras.length > 1 && normalize(paras[0].replace(/\n/g, ' ')) === normalize(title)) {
      text = paras.slice(1).join('\n\n').trim();
    }
  }
  return text;
}

/**
 * Parágrafos para exibição: blocos separados por linha em branco;
 * quebras simples (soft wrap de e-mail) viram espaço.
 */
export function bodyParagraphs(body: string): string[] {
  return normalizeNewlines(body)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
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
