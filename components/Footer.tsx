import Link from 'next/link';
import Image from 'next/image';
import { EDITORIAS } from '@/lib/taxonomy';
import type { Brand } from '@/lib/brand';

export default function Footer({ brand }: { brand: Brand }) {
  const cols: { label: string; links: { label: string; href: string }[] }[] = [
    { label: 'Editorias', links: EDITORIAS.map((e) => ({ label: e.nome, href: `/editoria/${e.slug}` })) },
    {
      label: brand.shortName,
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
        { label: 'Expediente', href: '/sobre' },
        { label: 'Guia local', href: '/sobre' },
        { label: 'Eventos', href: '/editoria/cultura' },
      ],
    },
  ];
  const f = brand.footer;
  const logo = f.onDark ? brand.logoWhite : brand.logoInk;
  return (
    <footer className="gz-container" style={{ background: f.background, padding: '48px 32px 32px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="gz-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,1fr)', gap: 48, paddingBottom: 40, borderBottom: `1px solid ${f.hairline}` }}>
          <div>
            {logo ? (
              <Image src={logo} alt={brand.name} width={106} height={40} style={{ height: 40, width: 'auto', marginBottom: 16 }} />
            ) : (
              <span style={{ display: 'block', fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', color: brand.accentColor, marginBottom: 16 }}>{brand.shortName}</span>
            )}
            <p style={{ fontSize: 14, color: f.text, lineHeight: '22.4px', maxWidth: 240 }}>
              Notícias de {brand.regionLabel}.
            </p>
          </div>
          {cols.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: f.heading, marginBottom: 16 }}>{g.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.links.map((l) => (
                  <Link key={l.label} href={l.href} style={{ fontSize: 14, color: f.text }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="gz-footer-bottom" style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, color: f.muted }}>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Termos de uso', 'Privacidade', 'Cookies'].map((l) => (
              <Link key={l} href="/sobre" style={{ fontSize: 14, color: f.muted }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
