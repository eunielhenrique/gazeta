import type { MetadataRoute } from 'next';
import { getBrand } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand();
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: brand.themeColor,
    categories: ['news', 'magazines'],
    icons: [
      { src: brand.icons.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: brand.icons.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: brand.icons.iconMaskable512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Últimas', url: '/' },
      { name: 'Cidade', url: '/editoria/cidade' },
      { name: 'Segurança', url: '/editoria/seguranca' },
    ],
  };
}
