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
    // Vermelho lido a olho do wordmark "aaah!" mandado no chat (sem arquivo
    // pra amostrar o pixel exato) — troque pelo hex oficial assim que tiver.
    accentColor: '#e31e24',
    accentTextColor: '#ffffff',
    // TODO: soltar o arquivo oficial em public/assets/aaah/ e apontar aqui
    // (ver README § Whitelabel) — até lá a UI usa o wordmark de texto.
    logoInk: null,
    logoWhite: null,
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
