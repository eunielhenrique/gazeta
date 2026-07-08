'use client';

import { useState } from 'react';
import { IcoArrow, IcoCheck } from './icons';

export default function Newsletter() {
  const [h, setH] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

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
      style={{ display: 'block', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--ink)', padding: 32, position: 'relative', boxShadow: h ? 'var(--shadow-3)' : 'var(--shadow-2)', transition: 'box-shadow 220ms' }}
    >
      <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 14 }}>Newsletter</span>
      <div style={{ fontSize: 44.8, fontWeight: 600, color: '#fff', letterSpacing: '-0.8px', lineHeight: '46.6px' }}>Toda semana</div>
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', marginTop: 12, lineHeight: '25.6px', letterSpacing: '-0.16px' }}>
        as principais notícias de Alphaville, Barueri e Santana de Parnaíba na sua caixa de entrada.
      </div>

      {state === 'done' ? (
        <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-sm)', background: 'var(--green)', color: 'var(--ink)', fontSize: 16, fontWeight: 500 }}>
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
            style={{ height: 44, padding: '0 14px', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 16, outline: 'none' }}
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 'var(--r-sm)', background: '#fff', color: 'var(--ink)', fontSize: 16, fontWeight: 500, letterSpacing: '-0.16px', border: 'none', cursor: 'pointer' }}
          >
            {state === 'loading' ? 'Enviando…' : 'Assinar grátis'} {state !== 'loading' && <IcoArrow />}
          </button>
          {state === 'error' && <span style={{ fontSize: 13, color: 'var(--yellow)' }}>Não foi possível inscrever. Tente novamente.</span>}
        </form>
      )}

      <div style={{ marginTop: 28, aspectRatio: '1/1', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 500, color: 'rgba(255,255,255,.92)', letterSpacing: '-1px' }}>20:31</div>
      </div>
    </div>
  );
}
