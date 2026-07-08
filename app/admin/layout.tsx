import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f6' }}>
      <header className="gz-header" style={{ position: 'sticky', top: 0, zIndex: 300, background: 'var(--ink)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div className="gz-header-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/assets/logo-white.png" alt="Gazeta de Alphaville" width={92} height={35} style={{ height: 35, width: 'auto' }} />
          <div className="gz-header-divider" style={{ width: 1, height: 20, background: 'rgba(255,255,255,.16)' }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '-0.16px' }}>Painel de Classificação · SECOM</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link href="/" style={{ padding: '8px 14px', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
              Ver portal
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
