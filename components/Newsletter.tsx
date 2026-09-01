'use client';

import { useState } from 'react';
import type { Brand } from '@/lib/brand';
import { IcoArrow, IcoCheck } from './icons';
import Agora from './Agora';

export default function Newsletter({ brand }: { brand: Brand }) {
  const [h, setH] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const f = brand.footer;
  const overlay = (a: number) => (f.onDark ? `rgba(255,255,255,${a})` : `rgba(20,20,20,${a})`);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ display: 'block', borderRadius: 'var(--r-md)', overflow: 'hidden', background: f.background, padding: 32, position: 'relative', boxShadow: h ? 'var(--shadow-3)' : 'var(--shadow-2)', transition: 'box-shadow 220ms' }}
    >
      <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: brand.accentColor, marginBottom: 14 }}>Newsletter</span>
      <div style={{ fontSize: 44.8, fontWeight: 600, color: f.heading, letterSpacing: '-0.8px', lineHeight: '46.6px' }}>Toda semana</div>
      <div style={{ fontSize: 16, color: f.text, marginTop: 12, lineHeight: '25.6px', letterSpacing: '-0.16px' }}>
        as principais notícias de {brand.regionList} na sua caixa de entrada.
      </div>

      {state === 'done' ? (
        <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-sm)', background: brand.accentColor, color: brand.accentTextColor, fontSize: 16, fontWeight: 500 }}>
          <IcoCheck /> Inscrição confirmada
        </div>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{ height: 44, padding: '0 14px', borderRadius: 'var(--r-sm)', border: `1px solid ${overlay(0.18)}`, background: overlay(0.06), color: f.heading, fontSize: 16, outline: 'none' }}
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 'var(--r-sm)', background: brand.accentColor, color: brand.accentTextColor, fontSize: 16, fontWeight: 500, letterSpacing: '-0.16px', border: 'none', cursor: 'pointer' }}
          >
            {state === 'loading' ? 'Enviando…' : 'Assinar grátis'} {state !== 'loading' && <IcoArrow />}
          </button>
          {state === 'error' && <span style={{ fontSize: 13, color: 'var(--yellow)' }}>Não foi possível inscrever. Tente novamente.</span>}
        </form>
      )}

      <Agora brand={brand} />
    </div>
  );
}
