---
name: testing-pyx-local
description: Run PYX public chat and WhatsApp conversation flows locally with PostgreSQL, distinguishing API persistence coverage from authenticated UI coverage.
---

# Local runtime
- Source `~/.nvm/nvm.sh` to select the installed Node/pnpm toolchain.
- API: `PORT=5000 DATABASE_URL="$DATABASE_URL" GEMINI_API_KEY='' WHATSAPP_PROVIDER=log pnpm --filter @workspace/api-server dev`. This script builds then starts, but does not watch source changes; rebuild/restart after edits.
- Frontend: `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/pyx-energia dev`.
- Confirm PostgreSQL schema and access first. This project uses conversations, messages, leads, activities, follow_up_tasks, contacts, campaigns and opt_outs tables.
- The Vite config may not proxy `/api`; arrange a legitimate same-origin reverse proxy or deployment routing before attempting widget requests. API listens independently of Vite.

# Single-process production runtime
- For deployment coverage, load the supplied Clerk environment securely before the build as well as before runtime. Build from repo root with `PORT=5000 BASE_PATH=/ pnpm run build`; Vite embeds `VITE_CLERK_PUBLISHABLE_KEY` at build time.
- Stop the separate Vite/API dev listeners. From repo root run `NODE_ENV=production PORT=8080 STATIC_DIR=artifacts/pyx-energia/dist/public WHATSAPP_PROVIDER=log GEMINI_API_KEY='' DATABASE_URL="$DATABASE_URL" node artifacts/api-server/dist/index.mjs` with Clerk keys and a test `CRON_SECRET` exported. Do not use the temporary QA Vite proxy for this mode.
- Confirm only the production listener is serving the test URL. Test `/painel` by direct address entry and reload, not only client-side navigation. Known Clerk nested routes such as `/sign-in/factor-one` also exercise the SPA fallback; Clerk may normalize the URL to `/sign-in`. Unknown client routes may correctly render React's NotFound screen.
- An existing official administrative Clerk session on localhost may remain valid across ports. Reuse it when authorized; changing ports does not require creating another account.
- Cron HTTP 200 only means the pass completed, not that any message was sent. Verify an active campaign with an imported pending contact, eligible business window, and persisted `log-*` outbound plus UI counters.
- To distinguish external cron from the unchanged 30-second internal scheduler, prepare only the authorized QA campaign, stop the server, adjust that campaign's window if authorized/needed, then restart and issue the cron request before the first timer tick. Capture startup and outbound timestamps showing elapsed time <30 seconds. Never infer causality from eventual contact status alone.
- Check no token/incorrect token returns 401 and does not consume the eligible contact. Bearer and query token are supported; with `CRON_SECRET` unset/empty the endpoint returns 404 even when a token is supplied. Restore the original runtime configuration and any QA-only window adjustments afterward.

# Access and safety
- Home `/` mounts ChatWidget behind Clerk loading; `/painel` also requires a real authenticated Clerk session. Missing Clerk configuration may leave both routes blank with requests to `clerk.localhost`. Do not mock Clerk or bypass login to claim UI coverage.
- Without Clerk, public `/api/chat/messages` and `/api/webhooks/whatsapp` can still be exercised with curl. Label this API/bank persistence coverage, not a widget or dashboard test.
- Use `WHATSAPP_PROVIDER=log` with test-only contacts. It records replies without sending real messages. Never claim provider delivery from log-mode results.
- Set `GEMINI_API_KEY=''` explicitly when testing deterministic fallback; inherited credentials otherwise activate Gemini.
- Load supplied Clerk environment files securely into both API and Vite processes; do not print their contents. Development Clerk instances connect directly, since the API Clerk proxy middleware runs only in production.
- For local same-origin transport, a temporary Vite config may merge `server.proxy["/api"] = { target: "http://localhost:5000", changeOrigin: false }`. This is separate from Clerk's Frontend API proxy.
- Use an anonymous/incognito window for the public widget and an authenticated window for Dashboard: signed-in Home redirects to `/painel`.
- Clerk signup can require Cloudflare verification and password login can require new-device email verification. Escalate unavailable challenges; never bypass them. If the owner explicitly provides an official administrative sign-in ticket, disclose that method instead of claiming the normal email flow passed. Clerk may also require a test organization.
- Do not treat a rendered Dashboard as proof of API authorization: verify expected data and request status. Failed requests can appear as empty lists.
- Campaign dispatch defaults to 9–18 America/Recife. If the owner authorizes a test-only SQL window adjustment, first verify outside-window rejection, change only the identified campaign, disclose the adjustment, and restore the original window afterward.

# Evidence
- Use a fresh chat session identifier per run and retain response conversationId/leadId for SQL queries.
- Assert progressive name/city/CPF-or-CNPJ/bill extraction, no fabricated city/bill before input, exact monthly/annual savings, stage changes, message counts, activities and a single pending follow-up.
- WhatsApp webhooks acknowledge before processing: poll expected database state rather than treating HTTP 200 as proof of processing.
- Cover Evolution data.key/message and Meta entry/changes/value payloads; after SAIR assert opt_outs record, closed conversation, bot disabled, and no outgoing reply to a later inbound message.

# Devin Secrets Needed
- `DATABASE_URL` for the intended isolated database.
- `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional `VITE_CLERK_PROXY_URL`, and an authorized test account/session for full UI/CRM testing.
- `GEMINI_API_KEY` only for model-backed coverage, not fallback.
- `CRON_SECRET` for external campaign cron tests; a local test-only value may be configured when authorized.
- Real WhatsApp delivery additionally needs the selected provider's credentials; avoid it unless explicitly requested.
