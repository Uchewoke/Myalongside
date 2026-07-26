

> **Warning:** LLM analysis failed [combined]: vscode.lm request failed: You've exhausted your premium model quota. Please enable additional paid premium requests, upgrade to Copilot Pro+, or wait for your allowance to renew.

# MyAlongside Agent Instructions

This file helps coding agents become productive quickly in this repository.

## Current Dependency Note

- For the web workspace, keep `main` on the stable Next.js line and treat the runtime PostCSS advisory as blocked until stable Next includes the fix.
- See `NEXT_POSTCSS_AUDIT_BLOCKER.md` before changing web dependencies or trying to clear `npm audit` on `main`.
- Canary validation for this issue lives on branch `next-canary-validation` (commit `e9350bf`).

## Project Map

- Monorepo with npm workspaces:
  - `apps/web` (Next.js user app, port 3000)
  - `apps/admin` (Next.js admin app, port 3001)
  - `backend` (Express + Prisma API, port 4000)
- Root scripts orchestrate workspace commands from `package.json`.

## Quick Start Commands

- Install deps: `npm install`
- Run web: `npm run dev:web`
- Run admin: `npm run dev:admin`
- Run backend: `npm run dev:backend`
- Run all build scripts: `npm run build`
- Lint all workspaces: `npm run lint`

## Database And Prisma

- Use root helpers for Neon branch switching:
  - `npm run neon:use:local`
  - `npm run neon:use:staging`
  - `npm run neon:use:prod`
- Common DB flow:
  - `npm run prisma:migrate:dev`
  - `npm run prisma:seed`
- If backend type errors reference missing Prisma client fields, run:
  - `npm exec prisma generate --workspace=backend`

For setup details, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

## Architecture Boundaries

- Backend entry and middleware stack: `backend/src/index.ts`.
- Keep HTTP-layer logic in `backend/src/controllers` and business logic in `backend/src/services`.
- Route registration lives in `backend/src/routes`.
- Frontend UI components live in `apps/web/src/components`.
- Shared frontend helpers live in `apps/web/src/lib`.

## Auth, Security, And Env Pitfalls

- Backend loads env from `backend/.env` first, then `../.env` fallback (monorepo runs).
- `ADMIN_SERVICE_TOKEN` must match between admin server and backend for admin moderation proxy flows.
- Stripe webhook uses raw body at `/api/stripe/webhook`; do not add JSON parser before this route.
- Never commit secrets or env files (`.env*` and `.env.neon` are gitignored).

## Suggested Agent Workflow

1. Read this file and relevant feature doc(s) before editing.
2. Prefer targeted commands (`--workspace=...`) instead of whole-monorepo runs when possible.
3. After backend schema/service changes, run Prisma generation and a backend build.
4. After frontend changes, run at least the affected app lint/build.
5. Keep changes scoped; do not refactor unrelated files.
