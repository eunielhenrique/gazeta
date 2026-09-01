import ArticleFeed from '@/components/ArticleFeed';
import { listPosts } from '@/lib/posts';
import { getBrand } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const [{ items }, brand] = await Promise.all([
    query ? listPosts({ q: query, limit: 48 }) : listPosts({ limit: 48 }),
    getBrand(),
  ]);

  return (
    <ArticleFeed
      articles={items}
      title={query ? `Resultados para "${query}"` : 'Todas as notícias'}
      showSidebar={false}
      emptyHint="Nenhuma notícia encontrada. Tente outros termos."
      brand={brand}
    />
  );
}
