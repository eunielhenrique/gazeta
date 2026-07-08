import type { Post } from '@prisma/client';
import { editoriaBySlug, regiaoNome } from './taxonomy';
import { formatDate } from './format';
import type { PostDTO } from './types';

export function toPostDTO(post: Post): PostDTO {
  const ed = editoriaBySlug(post.editoriaSlug);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    editoria: {
      slug: post.editoriaSlug,
      nome: ed?.nome ?? post.editoriaSlug,
      cor: ed?.cor ?? '#7a3dff',
      texto_sobre_cor: ed?.texto_sobre_cor ?? '#ffffff',
    },
    regiao: { slug: post.regiaoSlug, nome: regiaoNome(post.regiaoSlug) },
    cover_image_url: post.coverImageUrl,
    author: post.author,
    source: post.source,
    read_time_min: post.readTimeMin,
    date: formatDate(post.publishedAt ?? post.createdAt),
    published_at: post.publishedAt?.toISOString() ?? null,
    featured: post.featured,
  };
}
