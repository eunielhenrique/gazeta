'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EDITORIAS } from '@/lib/taxonomy';

function EditoriaCard({ ed, count }: { ed: (typeof EDITORIAS)[number]; count: number }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={`/editoria/${ed.slug}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        minHeight: 180,
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        padding: 24,
        background: ed.cor,
        color: ed.texto_sobre_cor,
        boxShadow: h ? 'var(--shadow-3)' : 'none',
        transform: h ? 'translateY(-3px)' : 'none',
        transition: 'box-shadow 220ms, transform 220ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px' }}>{ed.nome}</span>
        <span style={{ fontSize: 12.8, fontWeight: 600, opacity: 0.8 }}>{count} nesta semana</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', opacity: 0.92 }}>{ed.escopo}</p>
    </Link>
  );
}

export default function EditoriasSection({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="gz-container" style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)', padding: '64px 32px 80px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--body-mid)', marginBottom: 14 }}>Editorias</span>
          <h2 className="gz-d-section" style={{ fontSize: 44.8, fontWeight: 600, lineHeight: '46.6px', letterSpacing: '-0.8px', color: 'var(--ink)', maxWidth: 720 }}>
            Cada notícia da SECOM é classificada e publicada na editoria certa, automaticamente
          </h2>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '25.6px', letterSpacing: '-0.16px', color: 'var(--body)', maxWidth: 620, marginTop: 14 }}>
            Ao receber um e-mail, o sistema identifica a editoria pelas palavras-chave do conteúdo e publica no portal — sem intervenção manual. Estas são as oito editorias monitoradas.
          </p>
        </div>
        <div className="gz-editorias-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {EDITORIAS.map((ed) => (
            <EditoriaCard key={ed.slug} ed={ed} count={counts[ed.slug] ?? 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
