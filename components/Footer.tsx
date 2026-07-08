import Link from 'next/link';
import Image from 'next/image';
import { EDITORIAS } from '@/lib/taxonomy';

export default function Footer() {
  const cols: { label: string; links: { label: string; href: string }[] }[] = [
    { label: 'Editorias', links: EDITORIAS.map((e) => ({ label: e.nome, href: `/editoria/${e.slug}` })) },
    {
      label: 'Gazeta',
      links: [
        { label: 'Sobre', href: '/sobre' },
        { label: 'Newsletter', href: '/newsletter' },
        { label: 'Anuncie', href: '/sobre' },
        { label: 'Contato', href: '/sobre' },
      ],
    },
    {
      label: 'Serviços',
      links: [
        { label: 'Assinatura', href: '/newsletter' },
        { label: 'Painel SECOM', href: '/admin' },
        { label: 'Guia local', href: '/sobre' },
        { label: 'Eventos', href: '/editoria/cultura' },
      ],
    },
  ];
  return (
    <footer style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)', padding: '48px 32px 32px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,1fr)', gap: 48, paddingBottom: 40, borderBottom: '1px solid var(--hairline)' }}>
          <div>
            <Image src="/assets/logo-ink.png" alt="Gazeta de Alphaville" width={106} height={40} style={{ height: 40, width: 'auto', marginBottom: 16 }} />
            <p style={{ fontSize: 14, color: 'var(--body-mid)', lineHeight: '22.4px', maxWidth: 240 }}>
              Notícias de Alphaville, Barueri, Santana de Parnaíba e região.
            </p>
          </div>
          {cols.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 16 }}>{g.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.links.map((l) => (
                  <Link key={l.label} href={l.href} style={{ fontSize: 14, color: 'var(--body-mid)' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--mute)' }}>© 2026 Gazeta de Alphaville. Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Termos de uso', 'Privacidade', 'Cookies'].map((l) => (
              <Link key={l} href="/sobre" style={{ fontSize: 14, color: 'var(--mute)' }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
