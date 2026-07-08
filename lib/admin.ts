import { prisma } from './db';
import { editoriaBySlug } from './taxonomy';

/** Item da caixa de entrada do painel SECOM (post + e-mail de origem + classificação). */
export type InboxItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  editoriaSlug: string;
  regiaoSlug: string;
  status: string;
  confidence: number | null;
  coverImageUrl: string | null;
  createdAt: string;
  publishedAt: string | null;
  email: {
    fromAddr: string;
    subject: string;
    receivedAt: string;
    status: string;
  } | null;
  classification: {
    score: number;
    scores: Record<string, number>;
    matchedTerms: string[];
    taxonomiaVersao: string;
    method: string;
  } | null;
};

export async function getInbox(filter?: 'review' | 'published' | 'draft' | 'all'): Promise<InboxItem[]> {
  const where = !filter || filter === 'all' ? {} : { status: filter as never };
  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: { email: { include: { classification: true } } },
  });
  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    editoriaSlug: p.editoriaSlug,
    regiaoSlug: p.regiaoSlug,
    status: p.status,
    confidence: p.confidence,
    coverImageUrl: p.coverImageUrl,
    createdAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    email: p.email
      ? { fromAddr: p.email.fromAddr, subject: p.email.subject, receivedAt: p.email.receivedAt.toISOString(), status: p.email.status }
      : null,
    classification: p.email?.classification
      ? {
          score: p.email.classification.score,
          scores: p.email.classification.scores as Record<string, number>,
          matchedTerms: p.email.classification.matchedTerms as string[],
          taxonomiaVersao: p.email.classification.taxonomiaVersao,
          method: p.email.classification.method,
        }
      : null,
  }));
}

export async function getInboxCounts() {
  const grouped = await prisma.post.groupBy({ by: ['status'], _count: { _all: true } });
  const map: Record<string, number> = { review: 0, published: 0, draft: 0, archived: 0 };
  for (const g of grouped) map[g.status] = g._count._all;
  map.all = Object.values(map).reduce((a, b) => a + b, 0);
  return map;
}

export async function publishPost(id: string) {
  const post = await prisma.post.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date() },
  });
  if (post.emailId) await prisma.ingestEmail.update({ where: { id: post.emailId }, data: { status: 'published' } });
  return post;
}

export async function reclassifyPost(id: string, editoriaSlug: string) {
  if (!editoriaBySlug(editoriaSlug)) throw new Error('editoria_invalida');
  const post = await prisma.post.update({ where: { id }, data: { editoriaSlug } });
  if (post.emailId) {
    await prisma.classification.updateMany({ where: { emailId: post.emailId }, data: { editoriaSlug, method: 'rules_llm' } });
  }
  return post;
}

export async function discardPost(id: string) {
  const post = await prisma.post.update({ where: { id }, data: { status: 'archived', publishedAt: null } });
  if (post.emailId) await prisma.ingestEmail.update({ where: { id: post.emailId }, data: { status: 'discarded' } });
  return post;
}

export async function updatePost(
  id: string,
  data: { title?: string; excerpt?: string; body?: string; coverImageUrl?: string },
) {
  return prisma.post.update({ where: { id }, data });
}
