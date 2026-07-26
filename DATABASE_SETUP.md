# Database Setup Guide

This guide walks you through configuring MyAlongside with Neon PostgreSQL and Prisma.

## Prerequisites

- Neon account at https://console.neon.tech
- Node.js 18+
- npm or pnpm

## Step 1: Get Neon Connection Strings

1. Go to https://console.neon.tech and sign in
2. Create or select your project (MyAlongside)
3. Create three branches for development:
   - **local** (`br-withered-surf-akpjehsz` or create new)
   - **staging** (`br-old-king-akf2tghv` or create new)
   - **prod** (`br-sparkling-sun-akqjwwtg` or create new)

4. For each branch, copy the connection string (Connection string tab → Pooled)
   - Format: `postgresql://user:password@ep-XXXX.region.neon.tech/myalongside?sslmode=require`

## Step 2: Configure `.env.neon`

```bash
cp .env.neon.example .env.neon
```

Edit `.env.neon` and paste your Neon URLs:

```env
NEON_DATABASE_URL_LOCAL=postgresql://user:password@LOCAL_HOST/myalongside_local?sslmode=require
NEON_DATABASE_URL_STAGING=postgresql://user:password@STAGING_HOST/myalongside_staging?sslmode=require
NEON_DATABASE_URL_PROD=postgresql://user:password@PROD_HOST/myalongside_prod?sslmode=require
```

⚠️ **Keep `.env.neon` private** — it's in `.gitignore`. Never commit it.

## Step 3: Configure `.env`

For **local development**, create `.env`:

```bash
cp .env.example .env
```

Edit `.env` with dev values:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@LOCAL_HOST/myalongside_local?sslmode=require
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

## Step 4: Switch to Local Branch & Migrate

Initialize schema in your local Neon branch:

```bash
# Ensure local branch is active
npm run neon:use:local

# Create migrations from schema
npm run prisma:migrate:dev -- --name init

# Seed initial data (life events, test users)
npm run prisma:seed
```

## Step 5: Verify

Start the backend and check if database connects:

```bash
npm run dev:backend
```

Look for: `✓ Connected to PostgreSQL` in logs.

## Staging/Production Setup

Once local is working, replicate for other environments:

```bash
# Switch to staging
npm run neon:use:staging

# Deploy migrations (no prompts, safer for prod)
npm run prisma:migrate:deploy

# Optional: seed staging too
npm run prisma:seed
```

Repeat for `prod` with `npm run neon:use:prod`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run neon:use:local` | Activate local Neon branch |
| `npm run neon:use:staging` | Activate staging Neon branch |
| `npm run neon:use:prod` | Activate production Neon branch |
| `npm run neon:sync:prod-env` | Generate `.env.production.local` from Neon prod URL |
| `npm run prisma:migrate:dev` | Create + apply migrations (local only) |
| `npm run prisma:migrate:deploy` | Apply existing migrations (staging/prod) |
| `npm run prisma:seed` | Populate initial data |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- Check that your DATABASE_URL in `.env` is correct
- Verify Neon connection string has `?sslmode=require`

**Error: "no database named myalongside_local"**
- Neon auto-creates databases — check your branch name

**Migrations out of sync**
- Reset local safely: `npm run prisma:migrate:reset` (⚠️ deletes local data)

**Need to check data?**
- Visual browser: `npm run prisma:studio`
- CLI query: `npx prisma db execute --stdin < query.sql`

## Schema Overview

**Core Models:**
- **User** — Seekers, Mentors, Admins
- **MentorProfile** — Mentor-specific fields (tagline, rating, availability)
- **LifeEvent** — Types: divorce, grief, job-loss, health-crisis, etc.
- **UserLifeEvent** — Many-to-many junction (user → life events they're navigating/survived)
- **Match** — Seeker ↔ Mentor pairing
- **Conversation** — Chat thread for a match
- **Message** — Individual messages
- **Report** — Safety reports
- **RefreshToken** — JWT refresh token storage

See [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) for full details.
