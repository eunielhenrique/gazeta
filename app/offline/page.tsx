import Link from 'next/link';

export const metadata = { title: 'Sem conexão — Gazeta de Alphaville' };

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--canvas)' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-ink.png" alt="Gazeta de Alphaville" style={{ height: 40, width: 'auto', margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>Você está sem conexão</h1>
        <p style={{ fontSize: 16, color: 'var(--body-mid)', marginTop: 12, lineHeight: '25.6px' }}>
          Não foi possível carregar esta página. Verifique sua internet e tente novamente.
        </p>
        <Link href="/" style={{ display: 'inline-flex', marginTop: 24, padding: '12px 20px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', color: '#fff', fontSize: 16, fontWeight: 500 }}>
          Tentar a página inicial
        </Link>
      </div>
    </div>
  );
}
