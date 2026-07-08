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

export type HomeResponse = {
  hero: PostDTO | null;
  secondary: PostDTO[];
  latest: PostDTO[];
};
