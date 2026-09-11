import type { Brand } from './brand';
import { EDITORIAS, editoriaBySlug } from './taxonomy';

/**
 * Capa de fallback — release da SECOM sem foto anexa (nota, comunicado,
 * aviso). Em vez do SVG preto "sem imagem disponível", o post recebe uma
 * capa gerada na hora com a cor da editoria e a marca do domínio que está
 * servindo (whitelabel: aaah.com.br e gazeta geram capas diferentes para o
 * MESMO post, porque o caminho é relativo e resolve no host da requisição).
 */

/** Caminho legado gravado pela automação antes do fallback por editoria. */
const LEGACY_PLACEHOLDER = '/capa-padrao.svg';

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 675;

/** true = o post não tem foto própria (null ou o placeholder antigo). */
export function isPlaceholderCover(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.endsWith(LEGACY_PLACEHOLDER);
}

/** URL relativa — resolve no domínio atual, então cada marca vê a sua capa. */
export function fallbackCoverPath(editoriaSlug: string): string {
  return `/api/capa/${encodeURIComponent(editoriaSlug)}`;
}

/** Capa real do post, ou a de fallback da editoria quando não há foto. */
export function resolveCoverUrl(url: string | null | undefined, editoriaSlug: string): string {
  return isPlaceholderCover(url) ? fallbackCoverPath(editoriaSlug) : (url as string);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Cor da editoria respeitando o override de paleta da marca (mesma regra do grid da home). */
export function coverColors(brand: Brand, editoriaSlug: string): { background: string; text: string; nome: string } {
  const ed = editoriaBySlug(editoriaSlug);
  const idx = EDITORIAS.findIndex((e) => e.slug === editoriaSlug);
  const palette = brand.editoriaPalette;
  const background = (idx >= 0 ? palette?.colors[idx] : undefined) ?? ed?.cor ?? '#7a3dff';
  const text = (idx >= 0 ? palette?.text : undefined) ?? ed?.texto_sobre_cor ?? '#ffffff';
  return { background, text, nome: ed?.nome ?? 'Notícias' };
}

const FONT = "Poppins, 'Segoe UI', Helvetica, Arial, sans-serif";

/** SVG 16:9 (mesma proporção da capa no post e nos cards) — sem fontes externas. */
export function renderCoverSvg(brand: Brand, editoriaSlug: string): string {
  const { background, text, nome } = coverColors(brand, editoriaSlug);
  const w = COVER_WIDTH;
  const h = COVER_HEIGHT;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(`${nome} — ${brand.name}`)}">
  <rect width="${w}" height="${h}" fill="${escapeXml(background)}"/>
  <g fill="${escapeXml(text)}" opacity="0.08">
    <circle cx="${w - 120}" cy="${h + 80}" r="420"/>
    <circle cx="${w + 40}" cy="-60" r="260"/>
  </g>
  <g font-family="${escapeXml(FONT)}" fill="${escapeXml(text)}">
    <text x="72" y="104" font-size="26" font-weight="600" letter-spacing="4" style="text-transform:uppercase">${escapeXml(brand.name.toUpperCase())}</text>
    <text x="72" y="${h - 132}" font-size="96" font-weight="700" letter-spacing="-3">${escapeXml(nome)}</text>
    <text x="72" y="${h - 72}" font-size="26" font-weight="500" opacity="0.85">${escapeXml(brand.regionLabel)}</text>
  </g>
</svg>
`;
}
