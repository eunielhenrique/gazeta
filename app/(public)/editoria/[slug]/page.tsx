import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostCard from '@/components/PostCard';
import EditoriasSection from '@/components/EditoriasSection';
import { editoriaBySlug, EDITORIAS } from '@/lib/taxonomy';
import { listPosts, countsByEditoria } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return EDITORIAS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ed = editoriaBySlug(slug);
  if (!ed) return {};
  return { title: `${ed.nome} — Gazeta de Alphaville`, description: ed.escopo };
}

export default async function EditoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ed = editoriaBySlug(slug);
  if (!ed) notFound();

  const [{ items }, counts] = await Promise.all([listPosts({ editoria: slug, limit: 48 }), countsByEditoria()]);

  return (
    <div>
      <section style={{ background: ed.cor, color: ed.texto_sobre_cor }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 32px 48px' }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.82, marginBottom: 16 }}>Editoria</span>
          <h1 style={{ fontSize: 56, fontWeight: 600, lineHeight: '58.24px', letterSpacing: '-0.8px' }}>{ed.nome}</h1>
          <p style={{ fontSize: 20, fontWeight: 400, lineHeight: '28px', marginTop: 16, maxWidth: 640, opacity: 0.92 }}>{ed.escopo}.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
            {ed.keywords.slice(0, 8).map((k) => (
              <span key={k} style={{ fontSize: 12.8, fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--r-sm)', background: ed.texto_sobre_cor === '#ffffff' ? 'rgba(255,255,255,.16)' : 'rgba(8,8,8,.10)' }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 32px 72px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '72px 0', textAlign: 'center', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', color: 'var(--body-mid)', fontSize: 16 }}>
            Nenhuma notícia nesta editoria ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {items.map((a) => (
              <PostCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <EditoriasSection counts={counts} />
    </div>
  );
}
