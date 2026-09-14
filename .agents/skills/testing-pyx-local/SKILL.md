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

# Access and safety
- Home `/` mounts ChatWidget behind Clerk loading; `/painel` also requires a real authenticated Clerk session. Missing Clerk configuration may leave both routes blank with requests to `clerk.localhost`. Do not mock Clerk or bypass login to claim UI coverage.
- Without Clerk, public `/api/chat/messages` and `/api/webhooks/whatsapp` can still be exercised with curl. Label this API/bank persistence coverage, not a widget or dashboard test.
- Use `WHATSAPP_PROVIDER=log` with test-only contacts. It records replies without sending real messages. Never claim provider delivery from log-mode results.
- Set `GEMINI_API_KEY=''` explicitly when testing deterministic fallback; inherited credentials otherwise activate Gemini.

# Evidence
- Use a fresh chat session identifier per run and retain response conversationId/leadId for SQL queries.
- Assert progressive name/city/CPF-or-CNPJ/bill extraction, no fabricated city/bill before input, exact monthly/annual savings, stage changes, message counts, activities and a single pending follow-up.
- WhatsApp webhooks acknowledge before processing: poll expected database state rather than treating HTTP 200 as proof of processing.
- Cover Evolution data.key/message and Meta entry/changes/value payloads; after SAIR assert opt_outs record, closed conversation, bot disabled, and no outgoing reply to a later inbound message.

# Devin Secrets Needed
- `DATABASE_URL` for the intended isolated database.
- `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional `VITE_CLERK_PROXY_URL`, and an authorized test account/session for full UI/CRM testing.
- `GEMINI_API_KEY` only for model-backed coverage, not fallback.
- Real WhatsApp delivery additionally needs the selected provider's credentials; avoid it unless explicitly requested.
