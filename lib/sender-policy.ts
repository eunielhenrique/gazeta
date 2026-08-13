/**
 * Quem pode virar notícia no portal.
 *
 * Duas listas, nesta ordem: a blocklist vence a allowlist. Lógica pura
 * (sem banco/rede) para ficar testável — o pipeline só consulta.
 */

/**
 * Remetentes que nunca publicam, mesmo estando dentro da allowlist da SECOM.
 *
 * `smafel@` (Secretaria de Esportes) manda agenda interna — escala do estádio,
 * tabela de campeonato, programação da semana. É pauta de serviço, não release,
 * e estava publicando sozinha no portal. Fica versionado (e não só na env) para
 * o bloqueio valer no deploy do git, sem depender de mexer no App Spec.
 *
 * A env `SECOM_BLOCKLIST` (vírgula-separada) acrescenta outros remetentes.
 * Entrada com `@` bloqueia o endereço; sem `@`, bloqueia o domínio inteiro.
 */
const BLOCKLIST_PADRAO = ['smafel@santanadeparnaiba.sp.gov.br'];

/** `"SMAFEL" <smafel@x.gov.br>` → `smafel@x.gov.br`. */
export function normalizeSender(from: string): string {
  const angled = from.match(/<([^>]+)>/);
  return (angled ? angled[1] : from).trim().toLowerCase();
}

function entries(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Bloqueado por endereço exato ou por domínio (entrada sem `@`). */
export function isBlockedSender(from: string): boolean {
  const addr = normalizeSender(from);
  return [...BLOCKLIST_PADRAO, ...entries(process.env.SECOM_BLOCKLIST)].some((blocked) =>
    blocked.includes('@') ? addr === blocked : addr.endsWith(`@${blocked}`),
  );
}

/** Allowlist de remetentes da SECOM (env: SECOM_ALLOWLIST, vírgula-separado). */
export function isAllowedSender(from: string): boolean {
  const allowed = entries(process.env.SECOM_ALLOWLIST);
  if (allowed.length === 0) return true; // sem allowlist configurada → aceita (dev)
  const addr = normalizeSender(from);
  return allowed.some((a) => addr === a || addr.endsWith(`@${a}`) || addr.includes(a));
}
