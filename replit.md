# PYX Energia

Landing page de conversão da PYX Energia para empresas de Pernambuco interessadas em reduzir gastos com energia.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pyx-energia/` — site público e fonte visual da marca
- `artifacts/pyx-energia/src/pages/Home.tsx` — conteúdo e fluxo principal
- `artifacts/pyx-energia/src/components/Calculator.tsx` — simulador de economia
- `artifacts/pyx-energia/src/index.css` — tokens e estilos globais

## Architecture decisions

- A primeira versão é estática e direciona leads qualificados ao WhatsApp.
- Toda economia exibida pelo simulador é apresentada como estimativa.
- A promessa comercial deve permanecer consistente em “até 32%”.

## Product

- Explica energia renovável por assinatura sem obras ou investimento inicial.
- Calcula economia mensal e anual estimada.
- Encaminha o visitante ao WhatsApp com uma mensagem contextualizada.
- Inclui conteúdo rastreável, metadados sociais, sitemap e robots.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
