# MyAlongside

A mentorship platform monorepo with a user-facing web app, an admin dashboard, and a shared backend API.

## Project Structure

This is an npm workspaces monorepo:

- [apps/web](apps/web/) — Next.js user-facing app (chat, mentor matching, dashboard). Runs on port 3000.
- [apps/admin](apps/admin/) — Next.js admin dashboard (reports, moderation). Runs on port 3001.
- [backend](backend/) — Express + Prisma API server. Runs on port 4000.

## Getting Started

Install dependencies:

```bash
npm install
```

Run each workspace in its own terminal:

```bash
npm run dev:web       # user app on http://localhost:3000
npm run dev:admin     # admin app on http://localhost:3001
npm run dev:backend   # API server on http://localhost:4000
```

Build all workspaces:

```bash
npm run build
```

Lint all workspaces:

```bash
npm run lint
```

## Database

The backend uses Prisma against a Postgres database. Set `DATABASE_URL` in `.env` (see `.env.example`).

Common commands:

```bash
npm run prisma:migrate:dev   # run migrations
npm run prisma:seed          # seed the database
npm run prisma:studio        # open Prisma Studio
```

## Architecture Notes

- Backend entry and middleware stack: [backend/src/index.ts](backend/src/index.ts)
- HTTP-layer logic lives in `backend/src/controllers`, business logic in `backend/src/services`, routes in `backend/src/routes`
- Frontend UI components: `apps/web/src/components`; shared frontend helpers: `apps/web/src/lib`
- `ADMIN_SERVICE_TOKEN` must match between the admin server and backend for admin moderation proxy flows
- The Stripe webhook uses a raw body at `/api/stripe/webhook` — no JSON parser runs before this route
- Never commit secrets or env files (`.env*` is gitignored)

More detail for agents/contributors is in [AGENTS.md](AGENTS.md).
