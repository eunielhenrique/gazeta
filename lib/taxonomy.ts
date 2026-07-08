import taxonomiaJson from './taxonomia.json';

/**
 * Fonte da verdade das editorias e regiões — carregada de `taxonomia.json`
 * (o mesmo arquivo que alimenta o classificador). Cor, escopo, keywords e
 * limiares vivem aqui; o front e o backend leem daqui, nunca hardcodam.
 */

export type Editoria = {
  slug: string;
  nome: string;
  cor: string;
  cor_token: string;
  texto_sobre_cor: string;
  escopo: string;
  keywords: string[];
  regex: string[];
  peso: number;
};

export type Regiao = { slug: string; nome: string };

export type Taxonomia = {
  versao: string;
  atualizado_em: string;
  descricao: string;
  regioes: Regiao[];
  regiao_padrao: string;
  editorias: Editoria[];
  fallback: { editoria: string; descricao: string };
  limiares: {
    auto_publicar: number;
    revisao_manual: number;
    descartar_abaixo_de: number;
    observacao: string;
  };
};

export const taxonomia = taxonomiaJson as Taxonomia;

export const EDITORIAS = taxonomia.editorias;
export const REGIOES = taxonomia.regioes;
export const LIMIARES = taxonomia.limiares;
export const TAXONOMIA_VERSAO = taxonomia.versao;

const bySlug = new Map(EDITORIAS.map((e) => [e.slug, e]));
const byNome = new Map(EDITORIAS.map((e) => [e.nome, e]));
const regiaoBySlug = new Map(REGIOES.map((r) => [r.slug, r]));
const regiaoByNome = new Map(REGIOES.map((r) => [r.nome, r]));

export function editoriaBySlug(slug: string): Editoria | undefined {
  return bySlug.get(slug);
}
export function editoriaByNome(nome: string): Editoria | undefined {
  return byNome.get(nome);
}
export function regiaoNome(slug: string): string {
  return regiaoBySlug.get(slug)?.nome ?? slug;
}
export function regiaoSlug(nome: string): string {
  return regiaoByNome.get(nome)?.slug ?? taxonomia.regiao_padrao;
}

/** Ordem de exibição das editorias na navegação/footer. */
export const EDITORIA_SLUGS = EDITORIAS.map((e) => e.slug);
export const NAV = [{ slug: 'tudo', nome: 'Últimas' }, ...EDITORIAS.map((e) => ({ slug: e.slug, nome: e.nome }))];
