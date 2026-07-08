'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { InboxItem } from '@/lib/admin';
import { publishAction, reclassifyAction, discardAction } from '@/app/admin/actions';
import { IcoCheck, IcoArrow } from '@/components/icons';

type Ed = { slug: string; nome: string; cor: string; texto: string };
type Props = {
  items: InboxItem[];
  counts: Record<string, number>;
  filter: string;
  editorias: Ed[];
  limiares: { auto: number; revisao: number };
};

const STATUS_META: Record<string, { label: string; color: string; ink: string }> = {
  review: { label: 'Em revisão', color: 'var(--yellow)', ink: 'var(--ink)' },
  published: { label: 'Publicado', color: 'var(--green)', ink: 'var(--ink)' },
  draft: { label: 'Rascunho', color: 'var(--hairline)', ink: 'var(--ink)' },
  archived: { label: 'Descartado', color: 'var(--red)', ink: '#fff' },
};

const TABS: { key: string; label: string }[] = [
  { key: 'review', label: 'Revisão' },
  { key: 'published', label: 'Publicados' },
  { key: 'draft', label: 'Rascunhos' },
  { key: 'all', label: 'Todos' },
];

export default function InboxList({ items, counts, filter, editorias, limiares }: Props) {
  const edBy = new Map(editorias.map((e) => [e.slug, e]));

  return (
    <div className="gz-container" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 32px 80px' }}>
      {/* Intro / como funciona */}
      <div style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', padding: 28, marginBottom: 24 }}>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--body-mid)', marginBottom: 12 }}>Automação SECOM</span>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', lineHeight: '41.6px' }}>Caixa de classificação</h1>
        <p style={{ fontSize: 16, color: 'var(--body)', lineHeight: '25.6px', letterSpacing: '-0.16px', marginTop: 8, maxWidth: 720 }}>
          Cada e-mail da SECOM é classificado por palavras-chave e regras. O score de confiança define o fluxo: alta confiança publica sozinho, confiança média entra aqui para revisão antes de ir ao ar.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          <Threshold color="var(--green)" label={`Publica sozinho — score ≥ ${limiares.auto.toFixed(2)}`} />
          <Threshold color="var(--yellow)" label={`Revisão — ${limiares.revisao.toFixed(2)} a ${limiares.auto.toFixed(2)}`} />
          <Threshold color="var(--red)" label={`Baixa confiança — < ${limiares.revisao.toFixed(2)}`} />
        </div>
      </div>

      {/* Tabs de filtro */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--hairline)' }}>
        {TABS.map((t) => {
          const active = filter === t.key;
          const count = counts[t.key] ?? 0;
          return (
            <Link
              key={t.key}
              href={`/admin?status=${t.key}`}
              style={{
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 500,
                color: active ? 'var(--ink)' : 'var(--body-mid)',
                borderBottom: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
                marginBottom: -1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {t.label}
              <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#fff' : 'var(--body-mid)', background: active ? 'var(--ink)' : '#ececec', borderRadius: 'var(--r-full)', padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>{count}</span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '72px 0', textAlign: 'center', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', background: 'var(--canvas)', color: 'var(--body-mid)', fontSize: 16 }}>
          Nada nesta fila.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => (
            <InboxRow key={item.id} item={item} editorias={editorias} edBy={edBy} limiares={limiares} />
          ))}
        </div>
      )}
    </div>
  );
}

function Threshold({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'var(--body)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-full)', padding: '6px 12px' }}>
      <span style={{ width: 9, height: 9, borderRadius: 'var(--r-full)', background: color }} />
      {label}
    </span>
  );
}

function InboxRow({
  item,
  editorias,
  edBy,
  limiares,
}: {
  item: InboxItem;
  editorias: Ed[];
  edBy: Map<string, Ed>;
  limiares: { auto: number; revisao: number };
}) {
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState(item.editoriaSlug);
  const ed = edBy.get(item.editoriaSlug);
  const st = STATUS_META[item.status] ?? STATUS_META.draft;
  const score = item.confidence ?? item.classification?.score ?? 0;
  const scoreColor = score >= limiares.auto ? 'var(--green)' : score >= limiares.revisao ? 'var(--yellow)' : 'var(--red)';

  const scores = item.classification?.scores ?? {};
  const topScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const disabled = pending;

  return (
    <div style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', padding: 24, opacity: disabled ? 0.6 : 1, transition: 'opacity 160ms' }}>
      {/* Cabeçalho: status + origem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', fontSize: 12.8, fontWeight: 600, borderRadius: 'var(--r-sm)', background: st.color, color: st.ink }}>{st.label}</span>
        {item.email && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--mute)' }}>{item.email.fromAddr}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--mute)' }}>
          {new Date(item.email?.receivedAt ?? item.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 600, lineHeight: '28.6px', letterSpacing: '-0.3px', color: 'var(--ink)' }}>{item.title}</h3>
      <p style={{ fontSize: 15, color: 'var(--body-mid)', lineHeight: '23px', marginTop: 8, maxWidth: 820 }}>{item.excerpt}</p>

      {/* Classificação */}
      <div className="gz-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20, padding: '18px 0', borderTop: '1px solid var(--hairline)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 10 }}>Editoria sugerida</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {ed && <span style={{ display: 'inline-flex', padding: '5px 10px', fontSize: 12.8, fontWeight: 600, borderRadius: 'var(--r-sm)', background: ed.cor, color: ed.texto }}>{ed.nome}</span>}
            <span style={{ fontSize: 14, color: 'var(--body-mid)' }}>· {regiaoLabel(item.regiaoSlug)}</span>
          </div>
          {/* Score breakdown */}
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            {topScores.map(([slug, val]) => {
              const e = edBy.get(slug);
              return (
                <span key={slug} style={{ fontSize: 12, color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 'var(--r-full)', background: e?.cor ?? 'var(--mute)' }} />
                  {e?.nome ?? slug} <span style={{ fontFamily: 'var(--font-mono)' }}>{val.toFixed(2)}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 10 }}>Confiança</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>{score.toFixed(2)}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 'var(--r-full)', background: '#ececec', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(score * 100)}%`, height: '100%', background: scoreColor, borderRadius: 'var(--r-full)' }} />
            </div>
          </div>
          {item.classification?.matchedTerms && item.classification.matchedTerms.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {item.classification.matchedTerms.slice(0, 6).map((t) => (
                <span key={t} style={{ fontSize: 12, color: 'var(--body-mid)', background: '#f2f2f2', borderRadius: 'var(--r-sm)', padding: '3px 8px' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
        {item.status !== 'published' && (
          <button
            onClick={() => startTransition(() => publishAction(item.id))}
            disabled={disabled}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            <IcoCheck size={15} /> Aprovar e publicar
          </button>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <select
            value={chosen}
            onChange={(e) => setChosen(e.target.value)}
            disabled={disabled}
            style={{ height: 38, padding: '0 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--canvas)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}
          >
            {editorias.map((e) => (
              <option key={e.slug} value={e.slug}>{e.nome}</option>
            ))}
          </select>
          <button
            onClick={() => startTransition(() => reclassifyAction(item.id, chosen))}
            disabled={disabled || chosen === item.editoriaSlug}
            style={{ padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--canvas)', fontSize: 14, fontWeight: 500, color: chosen === item.editoriaSlug ? 'var(--mute-soft)' : 'var(--ink)', cursor: chosen === item.editoriaSlug ? 'default' : 'pointer' }}
          >
            Reclassificar
          </button>
        </div>

        <button
          onClick={() => startTransition(() => discardAction(item.id))}
          disabled={disabled}
          style={{ padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--canvas)', fontSize: 14, fontWeight: 500, color: 'var(--red)', cursor: 'pointer' }}
        >
          Descartar
        </button>

        {item.status === 'published' && (
          <Link href={`/noticia/${item.slug}`} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
            Ver no portal <IcoArrow />
          </Link>
        )}
      </div>
    </div>
  );
}

function regiaoLabel(slug: string): string {
  const map: Record<string, string> = {
    alphaville: 'Alphaville',
    barueri: 'Barueri',
    'santana-de-parnaiba': 'Santana de Parnaíba',
    regiao: 'Região',
  };
  return map[slug] ?? slug;
}
