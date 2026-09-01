'use client';

import { useEffect, useState } from 'react';
import type { Brand } from '@/lib/brand';
import { dataSP, descreveTempo, formataTemp, horaSP } from '@/lib/tempo';

type Tempo = { temperatura: number | null; codigo: number | null };

/**
 * Relógio de Alphaville + tempo agora.
 *
 * A hora sai do relógio de quem acessa, fixada no fuso de São Paulo — nada
 * de API de horas. Só monta depois do mount: renderizar hora no servidor
 * daria divergência de hidratação (o servidor formata num instante, o
 * browser noutro).
 */
export default function Agora({ brand }: { brand: Brand }) {
  const [agora, setAgora] = useState<Date | null>(null);
  const [tempo, setTempo] = useState<Tempo | null>(null);
  const f = brand.footer;
  const overlay = (a: number) => (f.onDark ? `rgba(255,255,255,${a})` : `rgba(20,20,20,${a})`);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let vivo = true;
    fetch('/api/tempo')
      .then((r) => r.json())
      .then((t) => vivo && setTempo(t))
      .catch(() => vivo && setTempo({ temperatura: null, codigo: null }));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div
      style={{
        marginTop: 28,
        aspectRatio: '1/1',
        borderRadius: 'var(--r-md)',
        background: overlay(0.05),
        border: `1px solid ${overlay(0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 52,
          fontWeight: 500,
          color: f.heading,
          letterSpacing: '-1px',
          lineHeight: 1,
          // Segura a altura no primeiro paint, antes do relógio montar.
          minHeight: 52,
        }}
      >
        {agora ? horaSP(agora) : '--:--'}
      </div>

      <div
        style={{
          fontSize: 13,
          color: f.text,
          letterSpacing: '-0.13px',
          textTransform: 'capitalize',
        }}
      >
        {agora ? dataSP(agora) : ''}
      </div>

      {tempo && (tempo.temperatura !== null || tempo.codigo !== null) && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 12,
            borderTop: `1px solid ${overlay(0.1)}`,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, color: f.heading }}>
            {formataTemp(tempo.temperatura)}
          </div>
          <div style={{ fontSize: 12, color: f.muted, letterSpacing: '.2px' }}>
            {descreveTempo(tempo.codigo)} · {brand.regionShort}
          </div>
        </div>
      )}
    </div>
  );
}
