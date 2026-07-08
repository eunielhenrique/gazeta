import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <Suspense fallback={<div style={{ height: 67, borderBottom: '1px solid var(--hairline)' }} />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
}
