/**
 * Subscription feature gating.
 *
 * Single source of truth for which features each tier unlocks. Consumed by
 * `hasFeature()` (controllers) and `requireFeature()` (route middleware) so the
 * paywall is enforced at the edge instead of being advisory-only.
 */

export type Tier = "FREE" | "PLUS" | "PRO";

export type Feature =
  | "basic-chat"
  | "basic-matching"
  | "basic-journey-tracking"
  | "all-communities"
  | "unlimited-connections"
  | "priority-matching"
  | "advanced-analytics"
  | "host-live-sessions"
  | "verified-mentor-badge"
  | "custom-communities"
  | "api-access"
  | "mood-trends"
  | "live-mentor";

const PLUS_FEATURES: Feature[] = [
  "basic-chat",
  "basic-matching",
  "basic-journey-tracking",
  "all-communities",
  "unlimited-connections",
  "priority-matching",
  "advanced-analytics",
  "mood-trends",
  "live-mentor",
];

export const TIER_FEATURES: Record<Tier, Feature[]> = {
  FREE: ["basic-chat", "basic-matching", "basic-journey-tracking", "live-mentor"],
  PLUS: PLUS_FEATURES,
  PRO: [
    ...PLUS_FEATURES,
    "host-live-sessions",
    "verified-mentor-badge",
    "custom-communities",
    "api-access",
  ],
};

/**
 * Free tier is capped at a fixed number of self-guided check-ins per
 * calendar week (Monday–Sunday, UTC). Plus/Pro are unlimited (`null`).
 */
export const CHECK_IN_WEEKLY_LIMIT: Record<Tier, number | null> = {
  FREE: 3,
  PLUS: null,
  PRO: null,
};

export function getCheckInWeeklyLimit(user: {
  subscriptionTier?: string | null;
}): number | null {
  const raw = (user.subscriptionTier ?? "FREE").toUpperCase();
  const tier: Tier = raw === "PLUS" || raw === "PRO" ? raw : "FREE";
  // Note: don't use `??` here — CHECK_IN_WEEKLY_LIMIT.PLUS/PRO are
  // intentionally `null` (unlimited), and `??` would treat that as
  // "missing" and wrongly fall back to the FREE limit.
  return CHECK_IN_WEEKLY_LIMIT[tier];
}

/**
 * Monday 00:00 UTC of the week containing `date`. Shared by check-in weekly
 * caps and weekly-synthesis caching so both roll over at the same instant.
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

/**
 * Returns true if the user's subscription tier includes the given feature.
 * Unknown/absent tiers fall back to FREE.
 */
export function hasFeature(
  user: { subscriptionTier?: string | null },
  feature: Feature | string
): boolean {
  const tier = (user.subscriptionTier ?? "FREE").toUpperCase() as Tier;
  const features = TIER_FEATURES[tier] ?? TIER_FEATURES.FREE;
  return features.includes(feature as Feature);
}
