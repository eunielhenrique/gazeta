'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostDTO } from '@/lib/types';
import { Avatar, CatBadge } from './primitives';

function SecondaryCard({ a }: { a: PostDTO }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={`/noticia/${a.slug}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: 250,
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        padding: 26,
        boxShadow: h ? 'var(--shadow-3)' : 'var(--shadow-2)',
        transition: 'box-shadow 220ms',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#eee' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.cover_image_url ?? ''} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: h ? 'scale(1.04)' : 'scale(1)', transition: 'transform 500ms ease' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,.9) 0%, rgba(8,8,8,.45) 50%, rgba(8,8,8,.06) 84%)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CatBadge editoria={a.editoria} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.8)' }}>{a.regiao.nome}</span>
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 600, lineHeight: '31.2px', letterSpacing: '-0.4px', color: '#fff', textWrap: 'balance' }}>{a.title}</h3>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.64)' }}>
          {a.author.split(' ')[0]} · {a.date} · {a.read_time_min} min
        </div>
      </div>
    </Link>
  );
}

export default function Hero({ hero, secondary }: { hero: PostDTO; secondary: PostDTO[] }) {
  const [h, setH] = useState(false);
  return (
    <section style={{ background: 'var(--canvas)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, alignItems: 'stretch' }}>
          <Link
            href={`/noticia/${hero.slug}`}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: 520,
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              padding: 40,
              boxShadow: h ? 'var(--shadow-3)' : 'var(--shadow-2)',
              transition: 'box-shadow 220ms',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#eee' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.cover_image_url ?? ''} alt={hero.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: h ? 'scale(1.04)' : 'scale(1)', transition: 'transform 500ms ease' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,.9) 0%, rgba(8,8,8,.5) 44%, rgba(8,8,8,.08) 74%, rgba(8,8,8,.28) 100%)' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CatBadge editoria={hero.editoria} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.82)' }}>{hero.regiao.nome}</span>
              </div>
              <h2 style={{ fontSize: 44.8, fontWeight: 600, lineHeight: '46.6px', letterSpacing: '-0.8px', color: '#fff', textWrap: 'balance', maxWidth: 600 }}>{hero.title}</h2>
              <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '25.6px', letterSpacing: '-0.16px', color: 'rgba(255,255,255,.8)', maxWidth: 540 }}>{hero.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                <Avatar name={hero.author} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{hero.author}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,.62)' }}>
                    {hero.date} · {hero.read_time_min} min de leitura
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {secondary.map((a) => (
              <SecondaryCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
