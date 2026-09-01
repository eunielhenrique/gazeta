# Gazeta de Alphaville — motor whitelabel

Portal regional de notícias de **Alphaville · Barueri · Santana de Parnaíba e região**, com **publicação automática** a partir dos e-mails da SECOM: cada comunicado recebido é classificado por editoria e publicado no portal — alta confiança publica sozinho, confiança média entra na fila de revisão do painel.

Implementação do design exportado do Claude Design (protótipo original preservado em `project/` e transcrições em `chats/`).

## Whitelabel: uma base, várias marcas

Este é o MESMO código/banco/automação servindo mais de um domínio — hoje
`gazetadealphaville.com.br` e `aaah.com.br`. Não há conteúdo duplicado nem
segunda automação: os posts, a classificação e a fila SECOM são únicos; só a
**identidade visual** (nome, logo, metadata, PWA) muda conforme o domínio de
acesso, resolvido em runtime pelo header `host` — ver `lib/brand.ts`.

Adicionar uma marca nova:

1. Acrescente uma entrada em `BRANDS` (`lib/brand.ts`) com `id`, `domain`,
   `name`, `shortName`, `description` e os textos de região.
2. Solte os arquivos oficiais de logo em `public/assets/<id>/logo-ink.png`
   (fundo claro) e `logo-white.png` (fundo escuro) e aponte `logoInk` /
   `logoWhite` pra eles. Sem os arquivos, a UI cai sozinha num wordmark de
   texto (`shortName`) — nunca inventa/aproxima o logo.
3. Aponte o domínio novo pro mesmo app no DNS e acrescente-o em
   `domains:` do `.do/app.yaml` (ver comentário lá — fica no nível do app,
   um serviço só atende todos os domínios).
4. `npm test` — `lib/brand.test.ts` cobre a resolução por host.

Nenhuma tabela nova, nenhuma automação duplicada: o pipeline SECOM
(`lib/pipeline.ts`) e o banco continuam únicos e alimentam todas as marcas.

## Stack

- **Next.js 15** (App Router, TypeScript) — front-end + API num só serviço (roda como servidor Node).
- **Prisma + PostgreSQL** — em produção, Managed Postgres da **DigitalOcean**.
- **Classificador determinístico** (keywords + regex) portado do handoff, com ponto de extensão para LLM.
- Fontes **Poppins** + **Inconsolata**; linguagem visual Webflow (canvas branco, ink `#080808`, 8 acentos cromáticos por editoria).

## Rodando localmente

Requer Node 22+ e um Postgres acessível.

```bash
cp .env.example .env          # ajuste DATABASE_URL / DIRECT_URL
npm install
npm run db:push               # cria as tabelas
npm run db:seed               # ingere e-mails de exemplo pelo pipeline real
npm run dev                   # http://localhost:3000
```

- Portal: `/`
- Editoria: `/editoria/{slug}` (ex.: `/editoria/saude`)
- Notícia: `/noticia/{slug}`
- Busca: `/busca?q=`
- Newsletter: `/newsletter` · Sobre: `/sobre`
- **Painel de Classificação SECOM:** `/admin`

`npm run db:reset` recria o banco e re-semeia.

## A automação SECOM

Fluxo: **e-mail → ingestão → classificação → decisão de publicação**, tudo idempotente por `Message-ID`.

```
e-mail (webhook/IMAP) → classificador → score
   score ≥ 0.72  → publica sozinho        (post.status = published)
   0.45–0.72     → fila de revisão         (post.status = review)  → painel /admin
   < 0.45        → baixa confiança/descarte (só log de auditoria)
```

- **Taxonomia** (fonte da verdade): `lib/taxonomia.json` — 8 editorias com cor, escopo, keywords, regex, pesos e limiares. O front e o classificador leem daqui; cores nunca são hardcodadas na UI.
- **Classificador:** `lib/classifier.ts` — título conta 2×, regex vale 2×, normalização `score/(score+K)`, detecção de município.
- **Pipeline:** `lib/pipeline.ts` — `ingestEmail()` grava `ingest_email` (auditoria imutável), `classification` (explicável) e o `post`.

### Ingestão de e-mail

Configure um provedor de inbound parse (SendGrid / Mailgun / Postmark) apontando para:

```
POST /api/webhooks/inbound-email      header: x-webhook-secret: $INBOUND_WEBHOOK_SECRET
{ "message_id", "from", "subject", "text", "html", "attachments": [] }
```

Só remetentes em `SECOM_ALLOWLIST` são aceitos — e quem estiver na **blocklist** é
recusado (403 `sender-blocked`) antes de virar log ou post, mesmo dentro da allowlist.
A blocklist é `lib/sender-policy.ts` (versionada: `smafel@santanadeparnaiba.sp.gov.br`,
agenda esportiva interna) mais o que vier na env `SECOM_BLOCKLIST`.

## API

**Pública**

| Rota | Descrição |
|---|---|
| `GET /api/home` | destaque + secundários + últimas |
| `GET /api/posts?editoria=&regiao=&q=&page=&limit=` | lista paginada |
| `GET /api/posts/{slug}` | notícia + relacionados |
| `GET /api/editorias` | editorias com contagem |
| `GET /api/regioes` | municípios |
| `POST /api/newsletter` | `{ email }` |

**Interna** (Bearer `ADMIN_TOKEN`)

| Rota | Descrição |
|---|---|
| `POST /api/webhooks/inbound-email` | ingestão SECOM |
| `GET /api/admin/inbox?status=review\|published\|draft\|all` | fila do painel |
| `POST /api/admin/posts/{id}/publish` | aprova e publica |
| `POST /api/admin/posts/{id}/reclassify` | `{ editoria_slug }` |
| `POST /api/admin/posts/{id}/discard` | descarta |
| `PATCH /api/admin/posts/{id}` | edita título/resumo/corpo/capa |

## Deploy — DigitalOcean App Platform

Tudo roda como um serviço Docker + Managed Postgres. Spec em `.do/app.yaml`.

1. Crie o Managed Postgres (ou deixe o `databases:` do spec criar um).
2. Ajuste `github.repo`/`branch` e os segredos (`INBOUND_WEBHOOK_SECRET`, `ADMIN_TOKEN`) no `.do/app.yaml`.
3. `doctl apps create --spec .do/app.yaml` (ou importe o App Spec no painel).
4. As migrações rodam sozinhas no boot (`prisma migrate deploy` no `CMD` do Dockerfile). Para semear uma vez: `npm run db:seed` com a `DATABASE_URL` de produção.

### Variáveis de ambiente

| Var | Uso |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pool / direto p/ migração) |
| `SECOM_ALLOWLIST` | remetentes aceitos no webhook (vírgula-separado) |
| `SECOM_BLOCKLIST` | remetentes recusados, vence a allowlist (vírgula-separado; sem `@` = domínio) |
| `INBOUND_WEBHOOK_SECRET` | valida o webhook de e-mail |
| `ADMIN_TOKEN` | Bearer das rotas `/api/admin` |

## Estrutura

```
app/                 rotas (public) + admin + api
  (public)/          home, editoria, noticia, busca, newsletter, sobre
  admin/             painel de classificação SECOM (+ server actions)
  api/               rotas públicas e internas
components/          Header, Hero, PostCard, EditoriasSection, admin/InboxList…
lib/                 taxonomy, classifier, pipeline, posts, admin, db, serialize
prisma/              schema, migrations, seed (via pipeline)
.do/app.yaml         spec do DigitalOcean App Platform
project/ · chats/    bundle de design original (referência)
```
