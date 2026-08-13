import { NextResponse } from 'next/server';
import { ALPHAVILLE, FUSO } from '@/lib/tempo';

/**
 * Tempo agora em Alphaville, via Open-Meteo (grátis, sem chave, 10k/dia).
 * O cache de 10 min do Next segura o volume — o modelo do Open-Meteo
 * atualiza a cada 15 min, então buscar mais que isso não traz dado novo.
 */
export const revalidate = 600;

const URL_OPEN_METEO =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${ALPHAVILLE.lat}&longitude=${ALPHAVILLE.lon}` +
  `&current=temperature_2m,weather_code&timezone=${encodeURIComponent(FUSO)}`;

export async function GET() {
  try {
    const res = await fetch(URL_OPEN_METEO, { next: { revalidate } });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      temperatura: data?.current?.temperature_2m ?? null,
      codigo: data?.current?.weather_code ?? null,
    });
  } catch {
    // Sem dado é '—' na tela — nunca um número inventado.
    return NextResponse.json({ temperatura: null, codigo: null }, { status: 200 });
  }
}
