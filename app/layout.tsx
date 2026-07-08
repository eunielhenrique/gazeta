import type { Metadata } from 'next';
import { Poppins, Inconsolata } from 'next/font/google';
import './globals.css';

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
  openGraph: {
    title: 'Gazeta de Alphaville',
    description: 'Notícias de Alphaville, Barueri, Santana de Parnaíba e região.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inconsolata.variable}`}>
      <body>{children}</body>
    </html>
  );
}
