import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import RelatedCard from '@/components/RelatedCard';
import { Avatar } from '@/components/primitives';
import { getPostBySlug } from '@/lib/posts';
import { regiaoNome } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) return {};
  const { post } = data;
  return {
    title: `${post.title} — Gazeta de Alphaville`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.cover_image_url ? [post.cover_image_url] : [] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) notFound();
  const { post, related } = data;

  const paragraphs = post.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const sourceCity = post.regiao.slug === 'regiao' ? 'Santana de Parnaíba' : regiaoNome(post.regiao.slug);

  return (
    <article>
      <section style={{ background: 'var(--canvas)' }}>
        <div className="gz-container" style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px 24px' }}>
          <Link href={`/editoria/${post.editoria.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ display: 'inline-flex', padding: '5px 9px', fontSize: 12.8, fontWeight: 600, borderRadius: 'var(--r-sm)', color: post.editoria.texto_sobre_cor, background: post.editoria.cor }}>{post.editoria.nome}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--body-mid)' }}>{post.regiao.nome}</span>
          </Link>
          <h1 className="gz-d-post" style={{ fontSize: 44.8, fontWeight: 600, lineHeight: '46.6px', letterSpacing: '-0.8px', color: 'var(--ink)', textWrap: 'balance' }}>{post.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingBottom: 24, borderBottom: '1px solid var(--hairline)' }}>
            <Avatar name={post.author} size={40} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{post.author}</div>
              <div style={{ fontSize: 14, color: 'var(--mute)' }}>
                {post.date} · {post.read_time_min} min de leitura
              </div>
            </div>
          </div>
        </div>
        <div className="gz-container" style={{ maxWidth: 1040, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ aspectRatio: '16/9', borderRadius: 'var(--r-md)', overflow: 'hidden', background: '#eee' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image_url ?? ''} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section className="gz-container" style={{ maxWidth: 820, margin: '0 auto', padding: '40px 32px 24px' }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 18, fontWeight: 400, lineHeight: '30px', letterSpacing: '-0.16px', color: 'var(--body)', marginBottom: 24 }}>
            {p}
          </p>
        ))}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingTop: 24, borderTop: '1px solid var(--hairline)' }}>
          <span style={{ fontSize: 14, color: 'var(--mute)', marginRight: 4 }}>Fonte:</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>{post.source || `SECOM · Prefeitura de ${sourceCity}`}</span>
        </div>
      </section>

      {related.length > 0 && (
        <section className="gz-container" style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)', padding: '56px 32px 80px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <h2 className="gz-d-md" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginBottom: 28 }}>Mais em {post.editoria.nome}</h2>
            <div className="gz-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {related.map((a) => (
                <RelatedCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
