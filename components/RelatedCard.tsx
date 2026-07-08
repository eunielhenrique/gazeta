'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostDTO } from '@/lib/types';

export default function RelatedCard({ article }: { article: PostDTO }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={`/noticia/${article.slug}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: h ? 'var(--shadow-2)' : 'none', transition: 'box-shadow 220ms' }}
    >
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#eee' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.cover_image_url ?? ''} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: h ? 'scale(1.05)' : 'scale(1)', transition: 'transform 400ms ease' }} />
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '5px 9px', fontSize: 12.8, fontWeight: 600, borderRadius: 'var(--r-sm)', color: article.editoria.texto_sobre_cor, background: article.editoria.cor }}>
          {article.editoria.nome}
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 600, lineHeight: '24px', letterSpacing: '-0.2px', color: 'var(--ink)', textWrap: 'pretty' }}>{article.title}</h3>
        <span style={{ fontSize: 14, color: 'var(--mute)' }}>
          {article.date} · {article.read_time_min} min
        </span>
      </div>
    </Link>
  );
}
