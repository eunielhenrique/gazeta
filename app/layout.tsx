import type { Metadata, Viewport } from 'next';
import { Poppins, Inconsolata } from 'next/font/google';
import './globals.css';
import PWARegister from '@/components/PWARegister';

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

export const metadata: Metadata = {
  title: 'Gazeta de Alphaville — Notícias de Alphaville, Barueri e Santana de Parnaíba',
  description:
    'Portal regional de notícias de Alphaville, Barueri, Santana de Parnaíba e região. Cidade, Segurança, Saúde, Educação, Mobilidade, Economia, Cultura e Esporte.',
  metadataBase: new URL('https://gazetadealphaville.com.br'),
  manifest: '/manifest.webmanifest',
  applicationName: 'Gazeta de Alphaville',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gazeta',
  },
  icons: {
    icon: [
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Gazeta de Alphaville',
    description: 'Notícias de Alphaville, Barueri, Santana de Parnaíba e região.',
    type: 'website',
    locale: 'pt_BR',
  },
};

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
