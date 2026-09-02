'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/lib/types';
import type { PostDTO } from '@/lib/types';
import type { Brand } from '@/lib/brand';
import { authorLabel } from '@/lib/format';
import { Avatar, CatBadge } from './primitives';

/** Troca de slide a cada 8s — tempo pra ler o título antes de revezar. */
const INTERVALO_MS = 8000;

function SecondaryCard({ a, brand, delayMs = 0 }: { a: PostDTO; brand: Brand; delayMs?: number }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={`/noticia/${a.slug}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="gz-hero-sec gz-hero-fade"
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
        animationDelay: `${delayMs}ms`,
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
        <h3 className="gz-d-sec" style={{ fontSize: 24, fontWeight: 600, lineHeight: '31.2px', letterSpacing: '-0.4px', color: '#fff', textWrap: 'balance' }}>{a.title}</h3>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.64)' }}>
          {authorLabel(a.author, brand.shortName).split(' ')[0]} · {a.date} · {a.read_time_min} min
        </div>
      </div>
    </Link>
  );
}

export default function Hero({ slides, brand }: { slides: HeroSlide[]; brand: Brand }) {
  const [h, setH] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  // A lista de posts pode encolher entre uma atualização e outra (ex.: post
  // descartado) — trava o índice dentro dos limites em vez de quebrar.
  const slide = slides[idx] ?? slides[0];
  if (!slide) return null;
  const { hero, secondary } = slide;

  return (
    <section style={{ background: 'var(--canvas)' }}>
      <div className="gz-container" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 32px' }}>
        <div
          className="gz-hero-grid"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, alignItems: 'stretch' }}
        >
          <Link
            key={hero.id}
            href={`/noticia/${hero.slug}`}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            className="gz-hero-main gz-hero-fade"
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
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,.96) 0%, rgba(8,8,8,.86) 32%, rgba(8,8,8,.55) 60%, rgba(8,8,8,.12) 100%)' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CatBadge editoria={hero.editoria} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.82)', textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{hero.regiao.nome}</span>
              </div>
              <h2 className="gz-d-hero" style={{ fontSize: 44.8, fontWeight: 600, lineHeight: '46.6px', letterSpacing: '-0.8px', color: '#fff', textWrap: 'balance', maxWidth: 600, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{hero.title}</h2>
              <p style={{ fontSize: 16, fontWeight: 500, lineHeight: '25.6px', letterSpacing: '-0.16px', color: 'rgba(255,255,255,.94)', maxWidth: 540, textShadow: '0 1px 3px rgba(0,0,0,.55)' }}>{hero.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                <Avatar name={authorLabel(hero.author, brand.shortName)} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{authorLabel(hero.author, brand.shortName)}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,.62)' }}>
                    {hero.date} · {hero.read_time_min} min de leitura
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {secondary.map((a, i) => (
              <SecondaryCard key={a.id} a={a} brand={brand} delayMs={i * 90} />
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {slides.map((s, i) => (
              <button
                key={s.hero.id}
                onClick={() => setIdx(i)}
                aria-label={`Ver destaque ${i + 1} de ${slides.length}`}
                aria-current={i === idx}
                style={{
                  width: i === idx ? 22 : 8,
                  height: 8,
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  background: i === idx ? brand.accentColor : 'var(--hairline)',
                  transition: 'width 220ms, background 220ms',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
