/** DTOs servidos pela API pública — formato consumido pelo front. */

export type EditoriaDTO = {
  slug: string;
  nome: string;
  cor: string;
  texto_sobre_cor: string;
  escopo: string;
  keywords: string[];
  count?: number;
};

export type RegiaoDTO = { slug: string; nome: string };

export type PostDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  editoria: { slug: string; nome: string; cor: string; texto_sobre_cor: string };
  regiao: { slug: string; nome: string };
  cover_image_url: string | null;
  author: string;
  source: string;
  read_time_min: number;
  date: string; // "21 Jun 2026"
  published_at: string | null;
  featured: boolean;
};

export type PostListResponse = {
  items: PostDTO[];
  page: number;
  total: number;
  has_more: boolean;
};

/** Um "slide" do destaque: 1 card grande + até 2 secundários. */
export type HeroSlide = {
  hero: PostDTO;
  secondary: PostDTO[];
};

export type HomeResponse = {
  /** Até 3 grupos, montados com as últimas 9 matérias — o front revezia sozinho. */
  slides: HeroSlide[];
  latest: PostDTO[];
};
