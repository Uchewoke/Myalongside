// Kept in sync with apps/web/src/lib/constants.ts LIFE_EVENTS -- the `slug`
// here must match that file's `id` exactly, since the signup form submits
// those ids directly as lifeEventSlugs for a Prisma nested connect.
export const LIFE_EVENTS = [
  {
    slug: "divorce",
    label: "Divorce & Separation",
    emoji: "💔",
    category: "Relationships",
    description: "Navigating the end of a marriage or long-term relationship",
  },
  {
    slug: "job-loss",
    label: "Job Loss & Career",
    emoji: "💼",
    category: "Career",
    description: "Redundancy, resignation, career pivots and rebuilding",
  },
  {
    slug: "grief",
    label: "Grief & Bereavement",
    emoji: "🕊️",
    category: "Loss",
    description: "Losing a loved one and finding a path through grief",
  },
  {
    slug: "health-crisis",
    label: "Health Crisis",
    emoji: "🏥",
    category: "Health",
    description: "Serious illness, diagnosis, and medical challenges",
  },
  {
    slug: "new-parent",
    label: "New Parenthood",
    emoji: "👶",
    category: "Family",
    description: "The overwhelming joy and challenges of a new baby",
  },
  {
    slug: "mental-health",
    label: "Mental Health",
    emoji: "🧠",
    category: "Wellness",
    description: "Anxiety, depression, burnout and emotional wellbeing",
  },
  {
    slug: "addiction",
    label: "Addiction & Recovery",
    emoji: "🌱",
    category: "Wellness",
    description: "Recovery journeys and rebuilding a healthier life",
  },
  {
    slug: "relocation",
    label: "Relocation & Moving",
    emoji: "🏠",
    category: "Life Change",
    description: "Moving cities, countries, and finding your footing",
  },
  {
    slug: "financial",
    label: "Financial Crisis",
    emoji: "💰",
    category: "Finance",
    description: "Debt, bankruptcy, financial hardship and rebuilding",
  },
  {
    slug: "empty-nest",
    label: "Empty Nest",
    emoji: "🪹",
    category: "Life Stage",
    description: "Children leaving home and rediscovering your identity",
  },
  {
    slug: "relationship",
    label: "Relationship Breakup",
    emoji: "💬",
    category: "Relationships",
    description: "Navigating heartbreak and rediscovering yourself",
  },
  {
    slug: "fresh-start",
    label: "Fresh Start",
    emoji: "🌅",
    category: "Life Stage",
    description: "Major life reinvention and new beginnings",
  },
];
