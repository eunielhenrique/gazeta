import Link from 'next/link';
import type { Metadata } from 'next';
import { getBrand } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: `Sem conexão — ${brand.name}` };
}

export default async function OfflinePage() {
  const brand = await getBrand();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--canvas)' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {brand.logoInk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoInk} alt={brand.name} style={{ height: 40, width: 'auto', margin: '0 auto 24px' }} />
        ) : (
          <span style={{ display: 'block', fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', color: brand.accentColor, margin: '0 auto 24px' }}>{brand.shortName}</span>
        )}
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
