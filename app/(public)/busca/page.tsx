import ArticleFeed from '@/components/ArticleFeed';
import { listPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const { items } = query ? await listPosts({ q: query, limit: 48 }) : await listPosts({ limit: 48 });

  return (
    <ArticleFeed
      articles={items}
      title={query ? `Resultados para "${query}"` : 'Todas as notícias'}
      showSidebar={false}
      emptyHint="Nenhuma notícia encontrada. Tente outros termos."
    />
  );
}
