import type { Metadata } from 'next';
import { EDITORIAS, TAXONOMIA_VERSAO } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: 'Sobre — Gazeta de Alphaville',
  description: 'Quem somos e como funciona a publicação automática a partir dos comunicados oficiais.',
};

export default function SobrePage() {
  return (
    <section className="gz-container" style={{ maxWidth: 820, margin: '0 auto', padding: '64px 32px 80px' }}>
      <span style={{ display: 'block', fontSize: 15, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--body-mid)', marginBottom: 16 }}>Expediente</span>
      <h1 className="gz-d-section" style={{ fontSize: 44.8, fontWeight: 600, lineHeight: '46.6px', letterSpacing: '-0.8px', color: 'var(--ink)' }}>Sobre a Gazeta de Alphaville</h1>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[
          'A Gazeta de Alphaville é um portal regional de notícias cobrindo Alphaville, Barueri, Santana de Parnaíba e região. Publicamos serviços, decisões públicas e a agenda que afeta o dia a dia de quem vive na região.',
          'Parte do nosso conteúdo chega diretamente das assessorias de comunicação (SECOM) das prefeituras. Cada comunicado recebido por e-mail é classificado automaticamente na editoria correta — Cidade, Segurança, Saúde, Educação, Mobilidade, Economia, Cultura ou Esporte — e publicado no portal, com a fonte sempre creditada.',
          'Comunicados de menor confiança de classificação passam por revisão editorial antes de irem ao ar. A taxonomia que orienta essa classificação é pública e versionada.',
        ].map((p, i) => (
          <p key={i} style={{ fontSize: 18, fontWeight: 400, lineHeight: '30px', letterSpacing: '-0.16px', color: 'var(--body)' }}>
            {p}
          </p>
        ))}
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', marginTop: 40, marginBottom: 16 }}>Editorias monitoradas</h2>
      <div className="gz-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {EDITORIAS.map((ed) => (
          <div key={ed.slug} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 16, border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: ed.cor, marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{ed.nome}</div>
              <div style={{ fontSize: 14, color: 'var(--body-mid)', lineHeight: '20px' }}>{ed.escopo}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 32 }}>Taxonomia de editorias v{TAXONOMIA_VERSAO}.</p>
    </section>
  );
}
