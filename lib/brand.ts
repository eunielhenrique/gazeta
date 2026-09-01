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

/** Lê o host da requisição atual — Server Components, layouts e metadata. */
export async function getBrand(): Promise<Brand> {
  const h = await headers();
  return resolveBrand(h.get('host'));
}
