/**
 * Hora local e condição do tempo para o card "Agora" do portal.
 * Lógica pura (sem rede) — o fetch mora em app/api/tempo.
 */

/** A região coberta pelo portal: Alphaville · Barueri · Santana de Parnaíba. */
export const FUSO = 'America/Sao_Paulo';
export const ALPHAVILLE = { lat: -23.5106, lon: -46.8761 };

/** `20:31` no fuso de São Paulo, seja qual for o fuso de quem acessa. */
export function horaSP(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** `quinta-feira, 13 de agosto`. */
export function dataSP(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(d);
}

/**
 * Códigos WMO do Open-Meteo → português.
 * Faixas contíguas viram intervalo; o resto cai no rótulo genérico.
 */
const TEMPO_WMO: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predomínio de sol',
  2: 'Parcialmente nublado',
  3: 'Encoberto',
  45: 'Névoa',
  48: 'Névoa com geada',
  51: 'Garoa fraca',
  53: 'Garoa',
  55: 'Garoa forte',
  56: 'Garoa congelante',
  57: 'Garoa congelante forte',
  61: 'Chuva fraca',
  63: 'Chuva',
  65: 'Chuva forte',
  66: 'Chuva congelante',
  67: 'Chuva congelante forte',
  71: 'Neve fraca',
  73: 'Neve',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas isoladas',
  81: 'Pancadas de chuva',
  82: 'Pancadas fortes',
  85: 'Pancadas de neve',
  86: 'Pancadas de neve forte',
  95: 'Trovoada',
  96: 'Trovoada com granizo',
  99: 'Trovoada com granizo forte',
};

export function descreveTempo(code: number | null | undefined): string {
  if (code == null) return '—';
  return TEMPO_WMO[code] ?? 'Tempo instável';
}

/** `23°` — inteiro, do jeito que boletim de tempo mostra. */
export function formataTemp(c: number | null | undefined): string {
  return c == null || Number.isNaN(c) ? '—' : `${Math.round(c)}°`;
}
