import InboxList from '@/components/admin/InboxList';
import { getInbox, getInboxCounts } from '@/lib/admin';
import { EDITORIAS, LIMIARES } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel de Classificação SECOM — Gazeta de Alphaville' };

const FILTERS = ['review', 'published', 'draft', 'all'] as const;
type Filter = (typeof FILTERS)[number];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter: Filter = FILTERS.includes(status as Filter) ? (status as Filter) : 'review';

  const [items, counts] = await Promise.all([getInbox(filter), getInboxCounts()]);
  const editorias = EDITORIAS.map((e) => ({ slug: e.slug, nome: e.nome, cor: e.cor, texto: e.texto_sobre_cor }));

  return (
    <InboxList
      items={items}
      counts={counts}
      filter={filter}
      editorias={editorias}
      limiares={{ auto: LIMIARES.auto_publicar, revisao: LIMIARES.revisao_manual }}
    />
  );
}
