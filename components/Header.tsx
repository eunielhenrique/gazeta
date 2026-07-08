'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { NAV } from '@/lib/taxonomy';
import { IcoSearch, IcoX, IcoMenu, IcoArrow } from './icons';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (pathname === '/busca') {
      setQ(searchParams.get('q') ?? '');
      setSearchOpen(true);
    }
  }, [pathname, searchParams]);

  // Fecha o menu ao trocar de rota.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const activeSlug =
    pathname === '/' ? 'tudo' : pathname.startsWith('/editoria/') ? decodeURIComponent(pathname.split('/')[2]) : null;

  const submit = () => {
    const term = q.trim();
    if (term) router.push(`/busca?q=${encodeURIComponent(term)}`);
  };
  const close = () => {
    setQ('');
    setSearchOpen(false);
    if (pathname === '/busca') router.push('/');
  };

  return (
    <header
      className="gz-header"
      style={{ position: 'sticky', top: 0, zIndex: 300, background: 'var(--canvas)', borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="gz-header-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/logo-ink.png" alt="Gazeta de Alphaville" width={100} height={38} style={{ height: 38, width: 'auto' }} priority />
        </Link>
        <div className="gz-header-divider" style={{ width: 1, height: 20, background: 'var(--hairline)', flexShrink: 0 }} />

        {/* Navegação inline (desktop) */}
        <nav className="gz-nav-inline no-scroll-bar" style={{ display: 'flex', gap: 2, flex: 1, marginLeft: 4, overflowX: 'auto' }}>
          {NAV.map((item) => {
            const active = activeSlug === item.slug;
            const edColor = item.slug === 'tudo' ? 'var(--ink)' : editoriaColor(item.slug);
            return (
              <Link
                key={item.slug}
                href={item.slug === 'tudo' ? '/' : `/editoria/${item.slug}`}
                style={{
                  padding: '6px 11px',
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  color: active ? edColor : 'var(--body-mid)',
                  borderBottom: `2px solid ${active && item.slug !== 'tudo' ? edColor : 'transparent'}`,
                  transition: 'color 140ms',
                }}
              >
                {item.nome}
              </Link>
            );
          })}
        </nav>

        {/* Espaçador (mobile, empurra os botões pra direita já que a nav some) */}
        <div className="gz-nav-spacer" style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {searchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)', pointerEvents: 'none', display: 'flex' }}>
                  <IcoSearch />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                    if (e.key === 'Escape') close();
                  }}
                  placeholder="Buscar notícias…"
                  className="gz-search-input"
                  style={{ width: 230, height: 40, paddingLeft: 36, paddingRight: 12, border: '1px solid var(--ink)', borderRadius: 'var(--r-sm)', background: 'var(--canvas)', fontSize: 16, color: 'var(--ink)', outline: 'none', letterSpacing: '-0.16px' }}
                />
              </div>
              <button onClick={close} aria-label="Fechar busca" style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--body-mid)', flexShrink: 0 }}>
                <IcoX />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar" style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)', flexShrink: 0 }}>
              <IcoSearch />
            </button>
          )}
          <Link className="gz-cta" href="/newsletter" style={{ padding: '12px 20px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', color: '#fff', fontSize: 16, fontWeight: 500, letterSpacing: '-0.16px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Assine
          </Link>
          {/* Hambúrguer (mobile) */}
          <button
            className="gz-hamburger"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: menuOpen ? 'var(--ink)' : 'var(--canvas)', color: menuOpen ? '#fff' : 'var(--ink)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            {menuOpen ? <IcoX size={18} /> : <IcoMenu />}
          </button>
        </div>
      </div>

      {/* Drawer (mobile) */}
      {menuOpen && (
        <>
          <div className="gz-drawer" style={{ borderTop: '1px solid var(--hairline)', background: 'var(--canvas)', padding: '8px 14px 16px', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV.map((item) => {
                const active = activeSlug === item.slug;
                const edColor = item.slug === 'tudo' ? 'var(--ink)' : editoriaColor(item.slug);
                return (
                  <Link
                    key={item.slug}
                    href={item.slug === 'tudo' ? '/' : `/editoria/${item.slug}`}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 8px',
                      fontSize: 17,
                      fontWeight: 500,
                      color: active ? 'var(--ink)' : 'var(--body)',
                      borderBottom: '1px solid var(--hairline)',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: edColor, flexShrink: 0 }} />
                    {item.nome}
                    {active && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--mute)' }}>atual</span>}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/newsletter"
              onClick={() => setMenuOpen(false)}
              style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', color: '#fff', fontSize: 16, fontWeight: 500 }}
            >
              Assine a newsletter <IcoArrow />
            </Link>
          </div>
          <div onClick={() => setMenuOpen(false)} className="gz-drawer" style={{ position: 'fixed', inset: 0, top: 0, background: 'transparent', zIndex: -1 }} />
        </>
      )}
    </header>
  );
}

const COLORS: Record<string, string> = {
  cidade: 'var(--blue)',
  seguranca: 'var(--red)',
  saude: 'var(--green)',
  educacao: 'var(--purple)',
  mobilidade: 'var(--yellow)',
  economia: 'var(--blue-deep)',
  cultura: 'var(--pink)',
  esporte: 'var(--orange)',
};
function editoriaColor(slug: string): string {
  return COLORS[slug] ?? 'var(--ink)';
}
