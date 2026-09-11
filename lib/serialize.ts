import type { Post } from '@prisma/client';
import { editoriaBySlug, regiaoNome } from './taxonomy';
import { cleanEmailBody, cleanSubject, excerptFrom, formatDate, readTimeMin } from './format';
import { resolveCoverUrl } from './cover';
import type { PostDTO } from './types';

/**
 * Posts publicados antes de uma melhoria na limpeza (jargão "Sugestão de
 * pauta:" no título, assinatura da assessoria no corpo) são saneados na
 * leitura — sem migração no banco. Post já limpo passa intacto; resumo e
 * tempo de leitura só são refeitos quando título ou corpo mudaram, para
 * preservar edições manuais feitas pelo admin.
 */
export function sanitizeStoredPost(post: Post): Pick<Post, 'title' | 'body' | 'excerpt' | 'readTimeMin'> {
  const title = cleanSubject(post.title);
  const body = cleanEmailBody(post.body, title);
  if (title === post.title && body === post.body) {
    return { title, body, excerpt: post.excerpt, readTimeMin: post.readTimeMin };
  }
  return { title, body, excerpt: excerptFrom(body), readTimeMin: readTimeMin(body) };
}

export function toPostDTO(post: Post): PostDTO {
  const ed = editoriaBySlug(post.editoriaSlug);
  const clean = sanitizeStoredPost(post);
  return {
    id: post.id,
    slug: post.slug,
    title: clean.title,
    excerpt: clean.excerpt,
    body: clean.body,
    editoria: {
      slug: post.editoriaSlug,
      nome: ed?.nome ?? post.editoriaSlug,
      cor: ed?.cor ?? '#7a3dff',
      texto_sobre_cor: ed?.texto_sobre_cor ?? '#ffffff',
    },
    regiao: { slug: post.regiaoSlug, nome: regiaoNome(post.regiaoSlug) },
    cover_image_url: resolveCoverUrl(post.coverImageUrl, post.editoriaSlug),
    author: post.author,
    source: post.source,
    read_time_min: clean.readTimeMin,
    date: formatDate(post.publishedAt ?? post.createdAt),
    published_at: post.publishedAt?.toISOString() ?? null,
    featured: post.featured,
  };
}
