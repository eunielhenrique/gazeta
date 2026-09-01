import type { Metadata, Viewport } from 'next';
import { Poppins, Inconsolata } from 'next/font/google';
import './globals.css';
import PWARegister from '@/components/PWARegister';
import { getBrand } from '@/lib/brand';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inconsolata',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: `${brand.name} — Notícias de ${brand.regionList}`,
    description: brand.description,
    metadataBase: new URL(`https://${brand.domain}`),
    applicationName: brand.name,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: brand.shortName,
    },
    icons: {
      icon: [
        { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      title: brand.name,
      description: `Notícias de ${brand.regionLabel}.`,
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080808',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inconsolata.variable}`}>
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
