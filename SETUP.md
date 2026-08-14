# MyAlongside AI Marketing Team — Integration Guide

Adds 12 AI marketing employees with **two chained recruitment campaigns** —
**Mentor Recruitment** and **Mentee Acquisition** — plus real image-ad
generation, to the MyAlongside Next.js codebase.

## What's included

```
lib/
  agents.ts        # 12 agents, system prompts, safety rules, 2 campaign tracks
  anthropic.ts     # server-only Claude wrapper
  imagegen.ts      # OpenAI / Google Imagen adapters for ad images
  client.ts        # browser helpers: askAgent, generateAd, runCampaign(track)
app/api/
  agent/route.ts          # POST -> one agent chat turn
  campaign/route.ts       # POST { track } -> SSE stream of the chained campaign
  generate-image/route.ts # POST -> Claude writes prompt, image model renders it
app/marketing/page.tsx    # mounts the team at /marketing
components/MarketingTeam.tsx  # UI with mentor/mentee track toggle
```

## 1. Install

```bash
npm install @anthropic-ai/sdk
```

## 2. Environment variables

Copy `.env.local.example` to `.env.local`:

```
ANTHROPIC_API_KEY=...     # required — all text agents
IMAGE_PROVIDER=openai     # openai | google
OPENAI_API_KEY=...        # only if you want raster image ads
```

The Anthropic API is text-only, so ad images are rendered by an image model
(OpenAI gpt-image-1 or Google Imagen). Skip the image key if you don't need ads yet.

## 3. Path alias

Ensure `tsconfig.json` has:

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

## 4. Run

```bash
npm run dev
```

Open `http://localhost:3000/marketing`.

## The two recruitment tracks

In **Run Full Campaign**, toggle between:

- **Mentor Recruitment** — Research (where survivors gather + what motivates giving
  back) → CMO strategy → Copywriter (purpose-led headlines) → Social → warm mentor
  invite email → SEO for "become a peer mentor" intent.
- **Mentee Acquisition** — Research (how people seek peer support + trust) → CMO
  strategy → Copywriter (being-understood headlines) → gentle Social → welcoming
  mentee email (with the 988 safety note) → SEO across life-event support intent.

Each agent reads the accumulated output of the prior steps, so a track reads as one
coordinated campaign. **Export Kit** downloads it as Markdown with the safety
disclaimer baked in.

## Built-in safety guardrails (important for this platform)

Because MyAlongside serves people in crisis, `COMPANY_CONTEXT` in `lib/agents.ts`
instructs every agent to:

- never present peer support as professional/clinical care,
- never exploit or sensationalize suffering to sell,
- keep mentee-facing crisis content compatible with the **988** disclaimer,
- avoid fabricating specific testimonials.

Keep these rules if you edit the prompts. Have a human review crisis-adjacent copy
before publishing.

## Before production

- Add auth + rate limiting to the API routes (image + campaign calls cost money).
- The campaign route sets `maxDuration = 300`; deploy on a plan that allows
  long-running functions or move it to a background job.
- Route mentee-facing output through human review given the sensitivity.

## Human review gate for mentee-facing copy

Because mentee copy reaches people in crisis, the **Mentee Acquisition** track now
requires human sign-off before export:

- After the kit generates, each section shows an **Approve this section** button.
- **Export Kit** stays disabled until every section is approved.
- The exported Markdown records that all sections were human-reviewed.
- The **Mentor Recruitment** track exports freely (no crisis exposure).

This is a client-side gate for the marketing tool. If you also publish copy through
an automated pipeline, enforce the same approval server-side before anything ships.

## Mentor lead capture + qualification (database)

New pieces:

```
lib/leads.ts              # SQLite store (better-sqlite3): insert, qualify, list, update
lib/qualify.ts            # mentor-recruiter agent scores a lead -> structured JSON
app/api/mentor-leads/     # POST capture+qualify · GET list · PATCH status override
components/BecomeMentorForm.tsx   # public "Become a Mentor" capture form
components/MentorLeads.tsx        # admin dashboard
app/marketing/leads/page.tsx      # dashboard route
```

**Install everything new:**
```bash
npm install @anthropic-ai/sdk @prisma/client @upstash/ratelimit @upstash/redis lucide-react
npm install -D prisma
npx prisma generate
npx prisma migrate deploy   # creates the mentor_leads table
```

**Flow:**
1. A prospective mentor submits `BecomeMentorForm` (embed it at `/signup?role=mentor`).
2. `POST /api/mentor-leads` persists the lead immediately, then the mentor-recruiter
   agent scores it 0–100 against lived-experience, perspective, empathy, and
   availability, returning strengths/concerns and a rationale.
3. **Safety:** if the applicant appears to still be in acute crisis, they are marked
   `not_ready` regardless of score — this protects them and future mentees. No one is
   shamed; the UI thanks everyone and promises a human follow-up.
4. Review and act on leads at `/marketing/leads` (mark contacted/converted, or
   override to qualified).

**Database (Postgres + Prisma, Vercel-ready):**
- `prisma/schema.prisma` defines the `MentorLead` model; `lib/prisma.ts` is a
  connection-pooled singleton safe for serverless.
- Set `DATABASE_URL` to a **pooled** connection string and `DIRECT_URL` to the
  non-pooled string for migrations.
- `postinstall` runs `prisma generate` so the client is ready on Vercel builds.
- Swapping providers later means only changing the datasource — the app code is
  unchanged.

## Admin auth (middleware)

`middleware.ts` protects the leads dashboard and admin APIs:

- `/marketing/leads` — unauthenticated visits redirect to `/marketing/login`.
- `GET`/`PATCH /api/mentor-leads` — unauthenticated calls get `401`.
- `POST /api/mentor-leads` — stays public (it's the capture endpoint) and is rate-limited.

Auth is a signed, HttpOnly session cookie (HMAC-SHA256 via Web Crypto, so it runs in
Edge middleware with no dependencies). Reviewers sign in at `/marketing/login` with
`ADMIN_PASSWORD`; the cookie is signed with `AUTH_SECRET` and lasts 12 hours.

```
ADMIN_PASSWORD=strong-password-here
AUTH_SECRET=$(openssl rand -base64 48)
```

For per-user accounts instead of one shared password, replace `lib/auth.ts` and the
login route with NextAuth/Auth.js — the middleware's `verifySessionToken` call is the
only other touch point.

## Rate limiting

`lib/ratelimit.ts` throttles the public capture endpoint and admin login attempts by
IP. It uses **Upstash Redis** (serverless-native, shared across Vercel functions) when
configured, and a per-instance in-memory fallback otherwise.

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
# RATELIMIT_MAX=5          # requests
# RATELIMIT_WINDOW=60 s    # per window
```

> The in-memory fallback is fine for local dev but **not reliable on serverless**
> (each function instance has its own memory). Set the Upstash vars in production.

For stronger bot protection on the public form, add a CAPCHA (e.g. Cloudflare Turnstile)
to `BecomeMentorForm` and verify the token in the `POST` handler.

## CAPTCHA (Cloudflare Turnstile)

Bot protection on the public mentor form is wired end-to-end:

- `components/Turnstile.tsx` renders the widget (loads Cloudflare's script, returns a token).
- `BecomeMentorForm` blocks submit until the challenge is solved and sends the token.
- `lib/turnstile.ts` verifies the token server-side in `POST /api/mentor-leads`
  **before** any DB write or Claude call.

Get keys from the Cloudflare dashboard (Turnstile) and set:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...   # browser widget
TURNSTILE_SECRET_KEY=...             # server verification
```

If these are unset, CAPTCHA is skipped automatically — so local dev works without
keys, and it enforces as soon as you add them in production. No extra npm packages
needed (the widget loads from Cloudflare's CDN; verification is a plain fetch).

## Email notifications (Resend)

When a mentor lead scores at or above the threshold, the team gets an email so they
can follow up fast.

- `lib/notify.ts` sends via Resend; it's fired **fire-and-forget** from the
  mentor-leads POST handler, so a mail failure never breaks signup.
- Crisis-flagged (`not_ready`) applicants never trigger an alert.

```
RESEND_API_KEY=re_...
NOTIFY_FROM=MyAlongside <team@myalongside.com>   # must be a verified sender
NOTIFY_TO=a@you.com,b@you.com                     # comma-separated
# NOTIFY_SCORE_THRESHOLD=75                        # default 75
```

Unset any of these and notifications are skipped (dev-safe). Uses Resend's REST API
directly — the `resend` package is listed for convenience but not required.

## Mentor ↔ mentee matching

Suggest qualified mentors for a mentee's life event.

- `lib/matching.ts` normalizes life-event labels (form labels, URL slugs, and
  synonyms all map to one canonical key), pulls the eligible mentor pool
  (`qualified`/`contacted` only — never `not_ready`), and ranks by a confidence
  score blending the mentor's qualification score with availability signals.
- `app/api/match` — `GET ?event=divorce` returns ranked mentors; `POST` also saves
  the mentee (new `Mentee` model) and returns suggestions.
- `/marketing/match` — an admin UI to pick an event and view matches.

Run `npx prisma migrate deploy` after pulling this in — the schema adds the `mentees`
table and a `lifeEvent` index on mentors.

Both endpoints are admin-only (they expose mentor contact info) and covered by
middleware. To let mentees self-serve matches, add a separate public, rate-limited
endpoint that returns non-identifying mentor previews only.

## Customizing

Edit `lib/agents.ts`: change any agent's `role`, edit the `CAMPAIGN_TRACKS` steps,
or update `COMPANY_CONTEXT` — all agents pick it up automatically. Tune the mentor
scoring criteria and the `not_ready` threshold in `lib/qualify.ts`.
