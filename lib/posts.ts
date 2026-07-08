import { prisma } from './db';
import { toPostDTO } from './serialize';
import type { PostDTO, HomeResponse } from './types';
import type { Prisma } from '@prisma/client';

const PUBLISHED = { status: 'published' as const };

/** Home: destaque (featured, senão o mais recente) + 2 secundários + feed. */
export async function getHome(): Promise<HomeResponse> {
  const published = await prisma.post.findMany({
    where: PUBLISHED,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
  if (published.length === 0) return { hero: null, secondary: [], latest: [] };

  const heroIdx = Math.max(
    0,
    published.findIndex((p) => p.featured),
  );
  const heroPost = published[published.findIndex((p) => p.featured) >= 0 ? heroIdx : 0];
  const rest = published.filter((p) => p.id !== heroPost.id);

  return {
    hero: toPostDTO(heroPost),
    secondary: rest.slice(0, 2).map(toPostDTO),
    latest: rest.slice(2).map(toPostDTO),
  };
}

export type ListParams = {
  editoria?: string;
  regiao?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export async function listPosts(params: ListParams): Promise<{
  items: PostDTO[];
  page: number;
  total: number;
  has_more: boolean;
}> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 12));

  const where: Prisma.PostWhereInput = { ...PUBLISHED };
  if (params.editoria && params.editoria !== 'tudo') where.editoriaSlug = params.editoria;
  if (params.regiao) where.regiaoSlug = params.regiao;
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { excerpt: { contains: params.q, mode: 'insensitive' } },
      { body: { contains: params.q, mode: 'insensitive' } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { items: rows.map(toPostDTO), page, total, has_more: page * limit < total };
}

export async function getPostBySlug(
  slug: string,
): Promise<{ post: PostDTO; related: PostDTO[] } | null> {
  const post = await prisma.post.findFirst({ where: { slug, ...PUBLISHED } });
  if (!post) return null;
  const related = await prisma.post.findMany({
    where: { editoriaSlug: post.editoriaSlug, ...PUBLISHED, NOT: { id: post.id } },
    orderBy: [{ publishedAt: 'desc' }],
    take: 3,
  });
  return { post: toPostDTO(post), related: related.map(toPostDTO) };
}

/** Contagem de posts publicados por editoria (para os cards de editoria). */
export async function countsByEditoria(): Promise<Record<string, number>> {
  const grouped = await prisma.post.groupBy({
    by: ['editoriaSlug'],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map((g) => [g.editoriaSlug, g._count._all]));
}
