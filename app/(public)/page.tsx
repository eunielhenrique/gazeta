import Hero from '@/components/Hero';
import ArticleFeed from '@/components/ArticleFeed';
import EditoriasSection from '@/components/EditoriasSection';
import { getHome, countsByEditoria } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [home, counts] = await Promise.all([getHome(), countsByEditoria()]);

  return (
    <>
      {home.hero && <Hero hero={home.hero} secondary={home.secondary} />}
      <ArticleFeed articles={home.latest} title="Últimas" />
      <EditoriasSection counts={counts} />
    </>
  );
}
