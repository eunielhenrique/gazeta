import Link from 'next/link';
import type { PostDTO } from '@/lib/types';
import PostCard from './PostCard';
import Newsletter from './Newsletter';
import { IcoArrow } from './icons';

/**
 * Lista vertical de cards + sidebar (newsletter). Usado na home e na busca.
 * `title` e `showSeeAll` controlam o cabeçalho da seção.
 */
export default function ArticleFeed({
  articles,
  title,
  emptyHint,
  showSidebar = true,
}: {
  articles: PostDTO[];
  title: string;
  emptyHint?: string;
  showSidebar?: boolean;
}) {
  const empty = articles.length === 0;
  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 32px 72px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
        <h2 style={{ fontSize: 44.8, fontWeight: 600, letterSpacing: '-0.8px', lineHeight: '46.6px', color: 'var(--ink)' }}>{title}</h2>
      </div>

      {empty ? (
        <div style={{ padding: '72px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--ink)' }}>Nenhum resultado</div>
          <div style={{ fontSize: 16, color: 'var(--body-mid)' }}>{emptyHint ?? 'Tente outros termos ou explore as editorias.'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: showSidebar ? '1fr 320px' : '1fr', gap: 32, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {articles.map((a) => (
              <PostCard key={a.id} article={a} />
            ))}
            {showSidebar && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <Link href="/busca?q=" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', fontSize: 16, fontWeight: 500, letterSpacing: '-0.16px', color: 'var(--ink)', background: 'var(--canvas)' }}>
                  Ver todas as notícias <IcoArrow />
                </Link>
              </div>
            )}
          </div>
          {showSidebar && (
            <div style={{ position: 'sticky', top: 96 }}>
              <Newsletter />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
