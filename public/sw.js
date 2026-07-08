// Service worker — Gazeta de Alphaville (PWA)
// Estratégia:
//  - navegações (páginas): network-first (notícia é conteúdo fresco), com
//    fallback pro cache e, por fim, uma página offline.
//  - estáticos (_next, assets, ícones): stale-while-revalidate.
const VERSION = 'gza-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = '/offline';

const PRECACHE = ['/', '/offline', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear API/admin/webhook.
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return;

  // Navegações → network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL))),
    );
    return;
  }

  // Estáticos → stale-while-revalidate.
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/assets/') || /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
