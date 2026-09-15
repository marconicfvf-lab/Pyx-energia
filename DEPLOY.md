# Deploy

O app é um único serviço Node: a API Express serve `/api` e, quando `STATIC_DIR`
está definido, também o site e o painel (`/painel`) a partir do build do Vite.

## Build

```bash
pnpm install
PORT=5000 BASE_PATH=/ pnpm run build
```

Saídas: `artifacts/api-server/dist/index.mjs` e `artifacts/pyx-energia/dist/public`.

## Execução

```bash
STATIC_DIR=artifacts/pyx-energia/dist/public PORT=8080 node artifacts/api-server/dist/index.mjs
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Postgres (Neon, Supabase, RDS...) |
| `PORT` | sim | Porta HTTP |
| `STATIC_DIR` | em host único | Pasta do build do site |
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | sim | Login do painel |
| `VITE_CLERK_PUBLISHABLE_KEY` | sim (build) | Mesma publishable key |
| `WHATSAPP_PROVIDER` | não | `evolution`, `cloud` ou `log` (padrão) |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` | se `evolution` | Evolution API |
| `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN` | se `cloud` | Meta Cloud API |
| `WHATSAPP_WEBHOOK_TOKEN` | recomendada | Valida `/api/webhooks/whatsapp` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | não | Sem chave o robô usa o fluxo determinístico |
| `PYX_DISCOUNT_PERCENT` / `PYX_MAX_DISCOUNT_PERCENT` | não | Desconto usado na estimativa |
| `PYX_SALES_WHATSAPP` | não | Número comercial mostrado no fallback |
| `CRON_SECRET` | em serverless | Habilita `GET`/`POST /api/cron/campaigns` |

## Disparo das campanhas

Em um processo sempre ativo (VPS, Render, Railway, Fly) o scheduler interno roda
a cada 30s e nada mais é necessário.

Em hosts serverless (Vercel, Lambda) o processo morre entre requisições: defina
`CRON_SECRET` e chame periodicamente

```
GET /api/cron/campaigns
Authorization: Bearer $CRON_SECRET
```

Sem `CRON_SECRET` o endpoint responde 404.

O cron do plano Hobby da Vercel roda só uma vez por dia (um contato por
campanha por dia). Para o ritmo configurado nas campanhas, o repositório traz o
workflow gratuito `.github/workflows/campanhas-cron.yml`, que chama o endpoint a
cada 5 minutos. Configure no GitHub:

- variável `APP_URL` (Settings → Secrets and variables → Actions → Variables),
  ex.: `https://pyxenergia.com`;
- secret `CRON_SECRET` com o mesmo valor usado no host.

## Migrações

```bash
DATABASE_URL=... pnpm --filter @workspace/db run push
```
