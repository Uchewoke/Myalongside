import path from "path";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import oauthRoutes from "./routes/oauth.routes";
import mentorRoutes from "./routes/mentor.routes";
import matchRoutes from "./routes/match.routes";
import messageRoutes from "./routes/message.routes";
import checkinRoutes from "./routes/checkin.routes";
import stripeRoutes from "./routes/stripe.routes";
import stripePortalRoutes from "./routes/stripe.portal.routes";
import marketingRoutes from "./routes/marketing.routes";
import mfaRoutes from "./routes/mfa.routes";
import adminRoutes from "./routes/admin.routes";
import { handleStripeWebhook } from "./controllers/stripe.controller";
import { requestId, sanitizeInputs } from "./middleware/security.middleware";
import { declarePublic, denyUndeclared } from "./middleware/permissions.middleware";

// Load env from backend/.env first, then fallback to root/.env for monorepo runs.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env"), override: false });

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Proxy trust ───────────────────────────────────────────────────────────────
// The API runs behind a single Nginx reverse proxy, so trust exactly one hop.
// This makes req.ip / X-Forwarded-For reflect the real client for rate limiting
// while refusing to trust client-supplied forwarding headers beyond that hop.
// If a CDN or second proxy is ever added in front of Nginx, raise this to match
// the number of trusted hops (e.g. 2). Never use `true` — it trusts every hop
// and reintroduces X-Forwarded-For spoofing.
app.set("trust proxy", 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'none'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// The apex and `www` hosts both resolve to the site in production (either can
// be the browser's Origin depending on how the visitor arrived), but WEB_URL
// is also used elsewhere as a single canonical redirect base (OAuth callback,
// Stripe checkout/portal URLs) so it must stay one value there. Expand it to
// both hostname variants for the CORS allow-list only.
const withWwwVariant = (url: string): string[] => {
  try {
    const parsed = new URL(url);
    const altHost = parsed.hostname.startsWith("www.")
      ? parsed.hostname.slice(4)
      : `www.${parsed.hostname}`;
    const alt = new URL(url);
    alt.hostname = altHost;
    return [parsed.origin, alt.origin];
  } catch {
    return [url];
  }
};

app.use(
  cors({
    origin: [
      ...withWwwVariant(process.env.WEB_URL ?? "http://localhost:3000"),
      process.env.ADMIN_URL ?? "http://localhost:3001",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "x-request-id"],
    exposedHeaders: ["x-request-id"],
  })
);

// ── Request tracing ───────────────────────────────────────────────────────────
app.use(requestId);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Auth endpoints — tight limit to slow brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts, please try again later." },
});

// Messaging — prevent spam flooding
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Message rate limit reached. Please slow down." },
});

// ── Stripe webhook (raw body required for signature verification) ──────────────
// Explicitly declared public: Stripe authenticates the call via signature,
// not a session, so no auth middleware applies here.
app.post(
  "/api/stripe/webhook",
  declarePublic,
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "64kb" }));

// ── Input sanitization (applied after JSON parsing) ───────────────────────────
app.use(sanitizeInputs);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", declarePublic, (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// /api/auth/mfa is mounted before the broader /api/auth routers so its
// requests match here first — otherwise they'd fall through authRoutes and
// oauthRoutes unmatched first, burning three authLimiter hits per call
// instead of one.
app.use("/api/auth/mfa", authLimiter, mfaRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authLimiter, oauthRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/stripe-portal", stripePortalRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/admin", adminRoutes);

// ── Deny by default ───────────────────────────────────────────────────────────
// Fail-closed safety net: any request that matched a route but never ran a
// declared Permission check (e.g. a handler bypassing the secure router) is
// rejected here instead of falling through.
app.use(denyUndeclared);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
);

app.listen(PORT, () => {
  console.log(`MyAlongside API running on http://localhost:${PORT}`);
});

export default app;
