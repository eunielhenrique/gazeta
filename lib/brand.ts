import { headers } from 'next/headers';

/**
 * Marca (whitelabel) — cada domínio serve o MESMO conteúdo/automação SECOM,
 * só troca identidade visual (nome, logo, metadata). Nenhuma tabela nova:
 * a marca é resolvida em tempo de requisição pelo header `host`.
 */
export type Brand = {
  id: string;
  domain: string;
  name: string;
  shortName: string;
  description: string;
  /** Frase corrida ("Alphaville, Barueri e Santana de Parnaíba"), sem "e região". */
  regionList: string;
  /** Para meta/rodapé ("Alphaville, Barueri, Santana de Parnaíba e região."). */
  regionLabel: string;
  regionShort: string;
  themeColor: string;
  /** Cor primária da marca — CTA (botão "Assine") e wordmark de texto quando não há logo. */
  accentColor: string;
  accentTextColor: string;
  /** null = sem arquivo oficial ainda; UI cai no wordmark de texto. */
  logoInk: string | null;
  logoWhite: string | null;
  /** Aba do navegador, atalho no celular, ícone do PWA. */
  icons: {
    favicon64: string;
    icon192: string;
    icon512: string;
    iconMaskable512: string;
    appleTouchIcon: string;
  };
  /**
   * Override das cores das 8 editorias (mesma ordem de lib/taxonomia.json:
   * cidade, segurança, saúde, educação, mobilidade, economia, cultura,
   * esporte). null = usa a cor de cada editoria na taxonomia (padrão
   * multicolor). Usado no grid de editorias da home.
   */
  editoriaPalette: { colors: string[]; text: string } | null;
  /** Rodapé — não é sempre escuro: cada marca define o próprio tema. */
  footer: {
    background: string;
    heading: string;
    text: string;
    muted: string;
    hairline: string;
    /** true = usa logoWhite (fundo escuro); false = usa logoInk (fundo claro). */
    onDark: boolean;
  };
};

const REGION_LIST = 'Alphaville, Barueri e Santana de Parnaíba';
const REGION_LABEL = 'Alphaville, Barueri, Santana de Parnaíba e região';
const REGION_SHORT = 'Alphaville';

export const BRANDS: Record<string, Brand> = {
  gazeta: {
    id: 'gazeta',
    domain: 'gazetadealphaville.com.br',
    name: 'Gazeta de Alphaville',
    shortName: 'Gazeta',
    description: `Portal regional de notícias de ${REGION_LABEL}. Cidade, Segurança, Saúde, Educação, Mobilidade, Economia, Cultura e Esporte.`,
    regionList: REGION_LIST,
    regionLabel: REGION_LABEL,
    regionShort: REGION_SHORT,
    themeColor: '#080808',
    accentColor: '#080808', // sem acento próprio — mantém o ink original do site.
    accentTextColor: '#ffffff',
    logoInk: '/assets/gazeta/logo-ink.png',
    logoWhite: '/assets/gazeta/logo-white.png',
    editoriaPalette: null, // paleta multicolor original da taxonomia.
    icons: {
      favicon64: '/favicon-64.png',
      icon192: '/icon-192.png',
      icon512: '/icon-512.png',
      iconMaskable512: '/icon-maskable-512.png',
      appleTouchIcon: '/apple-touch-icon.png',
    },
    footer: {
      background: '#080808',
      heading: '#ffffff',
      text: 'rgba(255,255,255,.6)',
      muted: 'rgba(255,255,255,.45)',
      hairline: 'rgba(255,255,255,.12)',
      onDark: true,
    },
  },
  aaah: {
    id: 'aaah',
    domain: 'aaah.com.br',
    name: 'aaah!',
    shortName: 'aaah!',
    description: `Portal regional de notícias de ${REGION_LABEL}. Cidade, Segurança, Saúde, Educação, Mobilidade, Economia, Cultura e Esporte.`,
    regionList: REGION_LIST,
    regionLabel: REGION_LABEL,
    regionShort: REGION_SHORT,
    themeColor: '#080808',
    // Vermelho amostrado do próprio arquivo do logo (pixel dominante do
    // traço: rgb(254,0,0)).
    accentColor: '#fe0000',
    accentTextColor: '#ffffff',
    // Logo oficial (fundo transparente, funciona em claro e escuro).
    logoInk: '/assets/aaah/logo-ink.png',
    logoWhite: '/assets/aaah/logo-white.png',
    // Tons diversificados de vermelho pastel (não o arco-íris da taxonomia)
    // pra manter as 8 editorias na família de cor da marca.
    editoriaPalette: {
      colors: ['#F2A6A6', '#E8837E', '#F2B8AE', '#D98E9B', '#F0A38C', '#C97B7B', '#E8A0A8', '#DE8B78'],
      text: '#3A1210',
    },
    icons: {
      favicon64: '/assets/aaah/favicon-64.png',
      icon192: '/assets/aaah/icon-192.png',
      icon512: '/assets/aaah/icon-512.png',
      iconMaskable512: '/assets/aaah/icon-maskable-512.png',
      appleTouchIcon: '/assets/aaah/apple-touch-icon.png',
    },
    // Rodapé na cor da marca — logo branca por cima do vermelho.
    footer: {
      background: '#fe0000',
      heading: '#ffffff',
      text: 'rgba(255,255,255,.75)',
      muted: 'rgba(255,255,255,.55)',
      hairline: 'rgba(255,255,255,.2)',
      onDark: true,
    },
  },
};

export const DEFAULT_BRAND_ID = 'gazeta';

/** Pura e testável sem next/headers: resolve a marca a partir do host da requisição. */
export function resolveBrand(host: string | null | undefined): Brand {
  const clean = (host ?? '')
    .toLowerCase()
    .split(':')[0]
    .replace(/^www\./, '');
  const match = Object.values(BRANDS).find((b) => b.domain === clean);
  return match ?? BRANDS[DEFAULT_BRAND_ID];
}

/**
 * Lê o host da requisição atual — Server Components, layouts e metadata.
 *
 * Domínios "alias" (ex.: aaah.com.br) atrás do load balancer da DigitalOcean
 * App Platform chegam ao container com `host` reescrito pro domínio PRIMARY
 * do app — o hostname pedido de verdade vem em `x-forwarded-host`. Outros
 * proxies (Vercel, dev local) mandam o host real direto em `host`, então
 * `x-forwarded-host` é só preferido quando presente.
 */
export async function getBrand(): Promise<Brand> {
  const h = await headers();
  return resolveBrand(h.get('x-forwarded-host') ?? h.get('host'));
}
