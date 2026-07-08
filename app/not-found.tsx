import Link from 'next/link';
import { IcoArrow } from '@/components/icons';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--canvas)' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 80, fontWeight: 600, letterSpacing: '-0.8px', color: 'var(--ink)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginTop: 16 }}>Página não encontrada</h1>
        <p style={{ fontSize: 16, color: 'var(--body-mid)', marginTop: 12, lineHeight: '25.6px' }}>
          A notícia que você procura pode ter saído do ar ou o endereço está incorreto.
        </p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '12px 20px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', color: '#fff', fontSize: 16, fontWeight: 500 }}>
          Voltar para a home <IcoArrow />
        </Link>
      </div>
    </div>
  );
}
