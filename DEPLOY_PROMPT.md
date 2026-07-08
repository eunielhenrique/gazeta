# Prompt para IA subir a Gazeta de Alphaville na DigitalOcean

> Cole o texto abaixo para um agente de IA (Claude Code, etc.) que tenha
> `doctl` autenticado (`doctl auth init`) e acesso ao repositório no GitHub.

---

Você vai fazer o **deploy do projeto Gazeta de Alphaville na DigitalOcean App Platform**, com um **Managed Postgres**. O código já está pronto no repositório — não reescreva a aplicação, só faça o deploy e valide.

## Contexto do projeto
- **App:** Next.js 15 (App Router, TypeScript) que roda como **servidor Node** (não serverless). Front-end + API no mesmo serviço.
- **Banco:** PostgreSQL via Prisma. As migrações estão em `prisma/migrations/` e rodam sozinhas no boot do container (`npx prisma migrate deploy` está no `CMD` do `Dockerfile`).
- **Build:** via `Dockerfile` na raiz (multi-stage, expõe a porta **8080**).
- **Spec pronto:** `.do/app.yaml` (App Platform + bloco `databases:` que cria o Postgres). É só ajustar repo/branch e segredos.
- **Automação SECOM:** o app recebe e-mails por `POST /api/webhooks/inbound-email`, classifica por editoria e publica. Isso NÃO precisa estar configurado para o deploy funcionar, mas as envs abaixo controlam.

## Pré-requisitos
1. O código precisa estar num **repositório GitHub** ao qual sua conta DO tenha acesso (App Platform faz deploy a partir do GitHub). Se ainda não estiver, faça push da branch atual primeiro.
2. `doctl` autenticado.

## Variáveis de ambiente
| Var | Valor |
|---|---|
| `DATABASE_URL` | connection string do Managed Postgres (com `?sslmode=require`) |
| `DIRECT_URL` | mesma string (usada nas migrações) |
| `SECOM_ALLOWLIST` | `secom@santanadeparnaiba.sp.gov.br` (remetentes aceitos, vírgula-separado) |
| `INBOUND_WEBHOOK_SECRET` | gere um segredo forte (valida o webhook de e-mail) |
| `ADMIN_TOKEN` | gere um token forte (Bearer das rotas `/api/admin`) |

## Passos
1. **Ajuste `.do/app.yaml`:** troque `github.repo` e `branch` para o repositório real; substitua os placeholders `TROQUE_POR_UM_SEGREDO` / `TROQUE_POR_UM_TOKEN` por valores fortes (ou defina-os depois como secrets no painel).
2. **Crie o app + banco:**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```
   Isso provisiona o serviço web (via Dockerfile) e um Managed Postgres `db`; o spec injeta `DATABASE_URL`/`DIRECT_URL` a partir de `${db.DATABASE_URL}` automaticamente.
3. **Acompanhe o build/deploy:**
   ```bash
   doctl apps list
   doctl apps logs <APP_ID> --type build --follow
   doctl apps logs <APP_ID> --type run --follow
   ```
   As migrações Prisma aplicam no boot. Se aparecer erro de conexão, confirme que o Postgres terminou de provisionar e que `sslmode=require` está na string.
4. **(Opcional) Semear dados de exemplo** — o portal funciona vazio, mas para demonstrar com conteúdo, rode uma vez o seed apontando para o banco de produção. Use um console/`doctl apps` job ou localmente:
   ```bash
   DATABASE_URL="<string do managed postgres>" npm ci && npx prisma generate && npm run db:seed
   ```
5. **Valide** (troque `<URL>` pela URL pública do app):
   ```bash
   curl -s -o /dev/null -w "home %{http_code}\n"      <URL>/
   curl -s -o /dev/null -w "editoria %{http_code}\n"  <URL>/editoria/saude
   curl -s -o /dev/null -w "admin %{http_code}\n"     <URL>/admin
   curl -s <URL>/api/editorias | head -c 200
   ```
   Todas devem responder 200. `/admin` é o painel de classificação SECOM.
6. **Teste o webhook da automação** (usa o segredo configurado):
   ```bash
   curl -s -X POST <URL>/api/webhooks/inbound-email \
     -H "content-type: application/json" \
     -H "x-webhook-secret: <INBOUND_WEBHOOK_SECRET>" \
     -d '{"message_id":"t1@secom","from":"secom@santanadeparnaiba.sp.gov.br","subject":"Ginásio recebe etapa estadual de vôlei","text":"A competição de vôlei reúne 16 equipes no ginásio municipal com entrada gratuita."}'
   ```
   Deve retornar `"action":"publish"` com `"editoria":"esporte"`, e a notícia deve aparecer em `<URL>/editoria/esporte`.

## Entregue no final
- A **URL pública** do app.
- Confirmação de que migrações aplicaram e as validações passaram (200 + webhook publicando).
- Os valores gerados de `INBOUND_WEBHOOK_SECRET` e `ADMIN_TOKEN` (para o cliente configurar o provedor de e-mail e o painel).
