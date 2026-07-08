import type { Metadata } from 'next';
import Newsletter from '@/components/Newsletter';
import { EDITORIAS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: 'Assine a newsletter — Gazeta de Alphaville',
  description: 'Receba as principais notícias de Alphaville, Barueri e Santana de Parnaíba toda semana.',
};

export default function NewsletterPage() {
  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 32px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 56, alignItems: 'start' }}>
        <div>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--body-mid)', marginBottom: 16 }}>Newsletter</span>
          <h1 style={{ fontSize: 56, fontWeight: 600, lineHeight: '58.24px', letterSpacing: '-0.8px', color: 'var(--ink)', maxWidth: 640 }}>
            A região inteira, resumida na sua caixa de entrada
          </h1>
          <p style={{ fontSize: 20, fontWeight: 400, lineHeight: '30px', color: 'var(--body)', marginTop: 20, maxWidth: 560 }}>
            Toda semana, um resumo das notícias que importam em Alphaville, Barueri e Santana de Parnaíba — direto das fontes oficiais, classificadas por editoria. Grátis, sem spam.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
            {EDITORIAS.map((ed) => (
              <span key={ed.slug} style={{ fontSize: 12.8, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--r-sm)', color: ed.texto_sobre_cor, background: ed.cor }}>
                {ed.nome}
              </span>
            ))}
          </div>
        </div>
        <Newsletter />
      </div>
    </section>
  );
}
