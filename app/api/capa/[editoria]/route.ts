import { NextResponse } from 'next/server';
import { getBrand } from '@/lib/brand';
import { renderCoverSvg } from '@/lib/cover';

export const dynamic = 'force-dynamic';

/**
 * Capa de fallback por editoria, na identidade da marca do domínio atual.
 * Usada pelos posts que chegaram da SECOM sem foto anexa (ver lib/cover.ts).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ editoria: string }> }) {
  const { editoria } = await params;
  const brand = await getBrand();
  return new NextResponse(renderCoverSvg(brand, editoria), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
