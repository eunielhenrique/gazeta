import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBrand } from '@/lib/brand';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <Suspense fallback={<div style={{ height: 67, borderBottom: '1px solid var(--hairline)' }} />}>
        <Header brand={brand} />
      </Suspense>
      {children}
      <Footer brand={brand} />
    </div>
  );
}
