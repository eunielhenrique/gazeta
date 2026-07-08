import { NextResponse } from 'next/server';
import { EDITORIAS } from '@/lib/taxonomy';
import { countsByEditoria } from '@/lib/posts';
import type { EditoriaDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const counts = await countsByEditoria();
  const items: EditoriaDTO[] = EDITORIAS.map((e) => ({
    slug: e.slug,
    nome: e.nome,
    cor: e.cor,
    texto_sobre_cor: e.texto_sobre_cor,
    escopo: e.escopo,
    keywords: e.keywords,
    count: counts[e.slug] ?? 0,
  }));
  return NextResponse.json(items);
}
