'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostDTO } from '@/lib/types';
import { Avatar, CatBadge, ReadTime } from './primitives';

export default function PostCard({ article }: { article: PostDTO }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={`/noticia/${article.slug}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="gz-postcard"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 0,
        background: 'var(--canvas)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-md)',
        padding: 16,
        boxShadow: h ? 'var(--shadow-2)' : 'none',
        transition: 'box-shadow 220ms',
      }}
    >
      <div className="gz-postcard-img" style={{ overflow: 'hidden', background: '#eee', borderRadius: 'var(--r-md)', minHeight: 220 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover_image_url ?? ''}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: h ? 'scale(1.05)' : 'scale(1)', transition: 'transform 400ms ease' }}
        />
      </div>
      <div className="gz-postcard-body" style={{ position: 'relative', padding: '12px 20px 12px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <CatBadge editoria={article.editoria} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--body-mid)' }}>{article.regiao.nome}</span>
          <span style={{ marginLeft: 'auto', paddingLeft: 12 }}>
            <ReadTime min={article.read_time_min} />
          </span>
        </div>
        <h3 className="gz-d-sec" style={{ fontSize: 24, fontWeight: 600, lineHeight: '31.2px', letterSpacing: '-0.4px', color: 'var(--ink)', textWrap: 'pretty', maxWidth: '92%' }}>{article.title}</h3>
        <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '25.6px', letterSpacing: '-0.16px', color: 'var(--body)', maxWidth: '96%' }}>
          {article.excerpt.length > 128 ? article.excerpt.slice(0, 128) + '…' : article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <Avatar name={article.author} size={36} />
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{article.author}</span>
          <span style={{ color: 'var(--mute-soft)' }}>·</span>
          <span style={{ fontSize: 14, color: 'var(--mute)' }}>{article.date}</span>
        </div>
      </div>
    </Link>
  );
}
