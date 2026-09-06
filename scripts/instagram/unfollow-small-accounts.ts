/**
 * Deixa de seguir, na SUA conta do Instagram, perfis com menos de N seguidores.
 *
 * Como funciona
 * ─────────────
 * 1. Abre um Chrome real (perfil persistente em .instagram/profile). Na primeira
 *    vez você faz login manualmente; nas próximas a sessão já está salva.
 * 2. Lê a lista de quem você segue usando os mesmos endpoints que o site do
 *    Instagram usa no navegador (sem senha no código, sem lib de terceiros).
 * 3. Consulta o número de seguidores de cada perfil (com cache local de 7 dias).
 * 4. Gera .instagram/report.csv com os candidatos abaixo do limite.
 * 5. Só com --apply é que de fato deixa de seguir, respeitando --limit por
 *    execução e pausas aleatórias entre ações.
 *
 * Aviso: automação de ações viola os termos de uso da Meta. A conta pode
 * receber bloqueio temporário de ações ("action block") ou pedido de
 * verificação. Os padrões abaixo são conservadores de propósito. Não rode em
 * paralelo nem várias vezes por dia.
 *
 * Uso
 * ───
 *   npm run ig:unfollow                       # simulação: só gera o relatório
 *   npm run ig:unfollow -- --apply            # deixa de seguir até 25 perfis
 *   npm run ig:unfollow -- --apply --limit 15 --threshold 500
 *   npm run ig:unfollow -- --refresh          # ignora o cache de seguidores
 *
 * Whitelist: crie .instagram/whitelist.txt com um @usuario por linha para
 * nunca deixar de seguir aquelas contas (amigos, clientes, parceiros).
 */

import { parseArgs } from 'node:util';
import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright-core';

// ───────────────────────────── argumentos ─────────────────────────────

const { values: args } = parseArgs({
  options: {
    threshold: { type: 'string', default: '1000' },
    limit: { type: 'string', default: '25' },
    apply: { type: 'boolean', default: false },
    refresh: { type: 'boolean', default: false },
    'data-dir': { type: 'string', default: '.instagram' },
    'min-pause': { type: 'string', default: '45' },
    'max-pause': { type: 'string', default: '120' },
    'skip-verified': { type: 'boolean', default: true },
    help: { type: 'boolean', default: false },
  },
});

if (args.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
  process.exit(0);
}

const THRESHOLD = Number(args.threshold);
const LIMIT = Number(args.limit);
const APPLY = Boolean(args.apply);
const REFRESH = Boolean(args.refresh);
const DATA_DIR = String(args['data-dir']);
const MIN_PAUSE_S = Number(args['min-pause']);
const MAX_PAUSE_S = Number(args['max-pause']);
const SKIP_VERIFIED = Boolean(args['skip-verified']);

if (!Number.isFinite(THRESHOLD) || THRESHOLD <= 0) fail('--threshold precisa ser um número > 0');
if (!Number.isFinite(LIMIT) || LIMIT <= 0) fail('--limit precisa ser um número > 0');
if (MIN_PAUSE_S < 20) fail('--min-pause abaixo de 20s é pedir bloqueio; use 20 ou mais');
if (MAX_PAUSE_S < MIN_PAUSE_S) fail('--max-pause precisa ser >= --min-pause');

const PROFILE_DIR = join(DATA_DIR, 'profile');
const FOLLOWING_FILE = join(DATA_DIR, 'following.json');
const COUNTS_FILE = join(DATA_DIR, 'follower-counts.json');
const WHITELIST_FILE = join(DATA_DIR, 'whitelist.txt');
const REPORT_FILE = join(DATA_DIR, 'report.csv');
const LOG_FILE = join(DATA_DIR, 'unfollowed.jsonl');

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IG_APP_ID = '936619743392459'; // id público do web app do Instagram

// ───────────────────────────── tipos ─────────────────────────────

type FollowingUser = {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  is_verified: boolean;
};

type CountEntry = { followers: number; fetchedAt: number };
type CountsCache = Record<string, CountEntry>;

type ApiResult<T> = { status: number; body: T | null; text: string };

// ───────────────────────────── util ─────────────────────────────

function fail(msg: string): never {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

function log(msg: string) {
  const t = new Date().toISOString().slice(11, 19);
  console.log(`[${t}] ${msg}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randSleep = (minS: number, maxS: number) => sleep(rand(minS, maxS) * 1000);

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadWhitelist(): Set<string> {
  if (!existsSync(WHITELIST_FILE)) return new Set();
  return new Set(
    readFileSync(WHITELIST_FILE, 'utf8')
      .split('\n')
      .map((l) => l.trim().replace(/^@/, '').toLowerCase())
      .filter((l) => l && !l.startsWith('#')),
  );
}

function csvCell(v: string | number | boolean) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ───────────────────────────── navegador ─────────────────────────────

async function launch(): Promise<BrowserContext> {
  mkdirSync(PROFILE_DIR, { recursive: true });
  const common: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless: false,
    viewport: null,
    locale: 'pt-BR',
    args: ['--disable-blink-features=AutomationControlled'],
  };

  const explicit = process.env.IG_BROWSER_PATH;
  if (explicit) {
    return chromium.launchPersistentContext(PROFILE_DIR, { ...common, executablePath: explicit });
  }
  for (const channel of ['chrome', 'msedge', 'chromium'] as const) {
    try {
      return await chromium.launchPersistentContext(PROFILE_DIR, { ...common, channel });
    } catch {
      /* tenta o próximo */
    }
  }
  return fail(
    'Nenhum navegador encontrado. Instale o Google Chrome ou defina IG_BROWSER_PATH com o caminho do executável.',
  );
}

async function getCookie(ctx: BrowserContext, name: string): Promise<string | undefined> {
  const cookies = await ctx.cookies('https://www.instagram.com');
  return cookies.find((c) => c.name === name)?.value;
}

async function ensureLoggedIn(ctx: BrowserContext, page: Page): Promise<{ userId: string; csrf: string }> {
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });

  const deadline = Date.now() + 10 * 60 * 1000;
  let announced = false;
  while (Date.now() < deadline) {
    const userId = await getCookie(ctx, 'ds_user_id');
    const csrf = await getCookie(ctx, 'csrftoken');
    if (userId && csrf) {
      // dá tempo do app carregar por completo depois do login
      await sleep(3000);
      return { userId, csrf };
    }
    if (!announced) {
      log('Faça login no Instagram na janela que abriu. Aguardando até 10 minutos…');
      announced = true;
    }
    await sleep(2000);
  }
  return fail('Login não detectado a tempo.');
}

/** Faz uma chamada aos endpoints internos do site, dentro da página logada. */
async function igFetch<T>(
  page: Page,
  csrf: string,
  path: string,
  init?: { method?: 'GET' | 'POST'; form?: Record<string, string> },
): Promise<ApiResult<T>> {
  return page.evaluate(
    async ({ path, csrf, method, form, appId }) => {
      const headers: Record<string, string> = {
        'x-csrftoken': csrf,
        'x-ig-app-id': appId,
        'x-requested-with': 'XMLHttpRequest',
        'x-asbd-id': '129477',
        accept: '*/*',
      };
      let body: string | undefined;
      if (form) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(form).toString();
      }
      const res = await fetch(`https://www.instagram.com${path}`, {
        method: method ?? 'GET',
        headers,
        body,
        credentials: 'include',
      });
      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* HTML de checkpoint/login, deixa body nulo */
      }
      return { status: res.status, body: parsed as never, text: text.slice(0, 500) };
    },
    { path, csrf, method: init?.method ?? 'GET', form: init?.form, appId: IG_APP_ID },
  );
}

/** Detecta rate limit / checkpoint e decide entre esperar ou abortar. */
async function guard(res: ApiResult<unknown>, what: string): Promise<'ok' | 'retry'> {
  if (res.status === 200 && res.body) return 'ok';
  const txt = res.text.toLowerCase();
  if (res.status === 429 || txt.includes('please wait a few minutes') || txt.includes('rate limit')) {
    log(`⚠ Rate limit ao ${what}. Pausando 10 minutos antes de tentar de novo.`);
    await sleep(10 * 60 * 1000);
    return 'retry';
  }
  if (txt.includes('checkpoint') || txt.includes('challenge') || res.status === 401 || res.status === 403) {
    return fail(
      `Instagram pediu verificação/bloqueou a sessão ao ${what} (HTTP ${res.status}). ` +
        'Abra o Instagram no navegador, resolva o aviso e rode de novo mais tarde.',
    );
  }
  return fail(`Resposta inesperada ao ${what}: HTTP ${res.status} ${res.text}`);
}

// ───────────────────────────── etapas ─────────────────────────────

async function fetchFollowing(page: Page, csrf: string, userId: string): Promise<FollowingUser[]> {
  const cached = readJson<{ fetchedAt: number; users: FollowingUser[] } | null>(FOLLOWING_FILE, null);
  if (cached && !REFRESH && Date.now() - cached.fetchedAt < 24 * 60 * 60 * 1000) {
    log(`Lista de seguindo carregada do cache (${cached.users.length} perfis, < 24h).`);
    return cached.users;
  }

  type Resp = { users: FollowingUser[]; next_max_id?: string; status: string };
  const users: FollowingUser[] = [];
  let maxId = '';
  let pageNo = 0;
  for (;;) {
    const qs = `count=100${maxId ? `&max_id=${encodeURIComponent(maxId)}` : ''}`;
    const res = await igFetch<Resp>(page, csrf, `/api/v1/friendships/${userId}/following/?${qs}`);
    if ((await guard(res, 'listar seguindo')) === 'retry') continue;
    const body = res.body!;
    for (const u of body.users ?? []) {
      users.push({
        pk: String(u.pk),
        username: u.username,
        full_name: u.full_name ?? '',
        is_private: Boolean(u.is_private),
        is_verified: Boolean(u.is_verified),
      });
    }
    pageNo++;
    log(`Seguindo: página ${pageNo}, ${users.length} perfis até agora.`);
    if (!body.next_max_id) break;
    maxId = body.next_max_id;
    await randSleep(2, 4);
  }
  writeJson(FOLLOWING_FILE, { fetchedAt: Date.now(), users });
  return users;
}

async function fetchFollowerCount(page: Page, csrf: string, u: FollowingUser): Promise<number | null> {
  type Resp = { data?: { user?: { edge_followed_by?: { count: number } } | null } };
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await igFetch<Resp>(
      page,
      csrf,
      `/api/v1/users/web_profile_info/?username=${encodeURIComponent(u.username)}`,
    );
    if (res.status === 404) return null; // conta apagada/renomeada
    if ((await guard(res, `consultar @${u.username}`)) === 'retry') continue;
    const count = res.body?.data?.user?.edge_followed_by?.count;
    return typeof count === 'number' ? count : null;
  }
  return null;
}

async function unfollow(page: Page, csrf: string, u: FollowingUser): Promise<boolean> {
  type Resp = { status: string; friendship_status?: { following: boolean } };
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await igFetch<Resp>(page, csrf, `/api/v1/friendships/destroy/${u.pk}/`, {
      method: 'POST',
      form: { container_module: 'profile', user_id: u.pk },
    });
    if ((await guard(res, `deixar de seguir @${u.username}`)) === 'retry') continue;
    return res.body?.status === 'ok' && res.body.friendship_status?.following === false;
  }
  return false;
}

// ───────────────────────────── main ─────────────────────────────

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  log(
    `Modo: ${APPLY ? 'APLICAR (vai deixar de seguir)' : 'SIMULAÇÃO (só relatório)'} · ` +
      `limite < ${THRESHOLD} seguidores · máx ${LIMIT} por execução`,
  );

  const whitelist = loadWhitelist();
  if (whitelist.size) log(`Whitelist: ${whitelist.size} contas protegidas.`);

  const ctx = await launch();
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  const { userId, csrf } = await ensureLoggedIn(ctx, page);
  log(`Sessão ok (user id ${userId}).`);

  const following = await fetchFollowing(page, csrf, userId);

  // contagem de seguidores, com cache
  const counts = readJson<CountsCache>(COUNTS_FILE, {});
  let looked = 0;
  for (const u of following) {
    const c = counts[u.pk];
    const fresh = c && !REFRESH && Date.now() - c.fetchedAt < CACHE_TTL_MS;
    if (fresh) continue;
    const n = await fetchFollowerCount(page, csrf, u);
    if (n !== null) counts[u.pk] = { followers: n, fetchedAt: Date.now() };
    looked++;
    if (looked % 10 === 0) {
      writeJson(COUNTS_FILE, counts);
      log(`Consultados ${looked} perfis…`);
    }
    await randSleep(2, 5);
  }
  writeJson(COUNTS_FILE, counts);

  // candidatos
  const candidates = following.filter((u) => {
    const c = counts[u.pk];
    if (!c) return false;
    if (whitelist.has(u.username.toLowerCase())) return false;
    if (SKIP_VERIFIED && u.is_verified) return false;
    return c.followers < THRESHOLD;
  });
  candidates.sort((a, b) => counts[a.pk].followers - counts[b.pk].followers);

  const rows = [
    ['username', 'full_name', 'followers', 'is_private', 'is_verified', 'whitelisted'].join(','),
    ...following
      .filter((u) => counts[u.pk])
      .sort((a, b) => counts[a.pk].followers - counts[b.pk].followers)
      .map((u) =>
        [
          u.username,
          u.full_name,
          counts[u.pk].followers,
          u.is_private,
          u.is_verified,
          whitelist.has(u.username.toLowerCase()),
        ]
          .map(csvCell)
          .join(','),
      ),
  ];
  writeFileSync(REPORT_FILE, rows.join('\n') + '\n');

  log('');
  log(`Você segue ${following.length} perfis; ${candidates.length} têm menos de ${THRESHOLD} seguidores.`);
  log(`Relatório completo: ${REPORT_FILE}`);

  if (!APPLY) {
    log('Simulação encerrada. Revise o CSV, ajuste a whitelist e rode com --apply para executar.');
    await ctx.close();
    return;
  }

  const batch = candidates.slice(0, LIMIT);
  log(`Deixando de seguir ${batch.length} perfis com pausas de ${MIN_PAUSE_S}–${MAX_PAUSE_S}s…`);
  let done = 0;
  let failures = 0;
  const doneSet = new Set<string>();
  for (const u of batch) {
    const ok = await unfollow(page, csrf, u);
    appendFileSync(
      LOG_FILE,
      JSON.stringify({ at: new Date().toISOString(), username: u.username, pk: u.pk, followers: counts[u.pk].followers, ok }) +
        '\n',
    );
    if (ok) {
      done++;
      doneSet.add(u.pk);
      log(`✓ @${u.username} (${counts[u.pk].followers} seguidores) — ${done}/${batch.length}`);
    } else {
      failures++;
      log(`✗ falhou em @${u.username}`);
      if (failures >= 3) {
        log('3 falhas seguidas: parando por segurança. Tente de novo mais tarde.');
        break;
      }
    }
    if (u !== batch[batch.length - 1]) await randSleep(MIN_PAUSE_S, MAX_PAUSE_S);
  }

  // tira do cache de "seguindo" quem já saiu, pra próxima execução começar limpa
  const remaining = following.filter((u) => !doneSet.has(u.pk));
  writeJson(FOLLOWING_FILE, { fetchedAt: Date.now(), users: remaining });

  log(`Concluído: ${done} deixados de seguir, ${failures} falhas. Restam ${candidates.length - done} candidatos.`);
  await ctx.close();
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
