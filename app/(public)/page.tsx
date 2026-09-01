import Hero from '@/components/Hero';
import AdBanner from '@/components/AdBanner';
import ArticleFeed from '@/components/ArticleFeed';
import EditoriasSection from '@/components/EditoriasSection';
import { getHome, countsByEditoria } from '@/lib/posts';
import { getBrand } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [home, counts, brand] = await Promise.all([getHome(), countsByEditoria(), getBrand()]);

  return (
    <>
      <AdBanner />
      {home.hero && <Hero hero={home.hero} secondary={home.secondary} brand={brand} />}
      <ArticleFeed articles={home.latest} title="Últimas" brand={brand} />
      <EditoriasSection counts={counts} />
    </>
  );
}
