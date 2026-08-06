// Presentation-only metadata for the 12 AI marketing agents. The prompts/system
// instructions ("role") stay server-side in backend/src/lib/agents.ts — this file
// only carries what the admin UI needs to render the nav and starter prompts.

export type AgentId =
  | "cmo" | "content" | "social" | "designer" | "video" | "copywriter"
  | "email" | "seo" | "research" | "support" | "sales" | "analytics";

export interface AgentMeta {
  id: AgentId;
  name: string;
  accent: string;
  blurb: string;
  kind?: "image";
  note?: string;
  starters: string[];
}

export const AGENTS: Record<AgentId, AgentMeta> = {
  cmo: {
    id: "cmo", name: "AI CMO", accent: "#0E7C7B", blurb: "Growth strategy for mentor + mentee recruitment.",
    starters: [
      "Build a dual-funnel strategy: recruiting mentors AND mentees for MyAlongside",
      "How should we position mentor recruitment vs mentee acquisition differently?",
      "Prioritize channels to reach people who've survived a hard life event (future mentors)",
    ],
  },
  content: {
    id: "content", name: "AI Content Manager", accent: "#C2410C", blurb: "Blogs & newsletters for both audiences.",
    starters: [
      "Draft a blog: 'Turning your hardest chapter into someone's lifeline' (mentor recruitment)",
      "Write a blog for someone newly divorced on not facing it alone (mentee)",
      "Plan a content series covering 6 of the 40+ life events",
    ],
  },
  social: {
    id: "social", name: "AI Social Media Manager", accent: "#7048E8", blurb: "Posts for mentor + mentee funnels.",
    starters: [
      "Write 3 mentor-recruitment posts: 'you survived it — help someone else through it'",
      "Write 3 gentle mentee-facing posts about being truly understood",
      "Plan a 7-day calendar split between mentor and mentee messaging",
    ],
  },
  designer: {
    id: "designer", name: "AI Graphic Designer", accent: "#0891B2", kind: "image",
    blurb: "Generates real recruitment ad images.",
    note: "Generates a real raster image ad via the configured image provider.",
    starters: [
      "A warm mentor-recruitment ad: 'Become the person you needed back then'",
      "A gentle mentee ad: 'Find someone who's walked your exact path'",
      "An ad showing hope after a hard chapter, soft teal palette",
    ],
  },
  video: {
    id: "video", name: "AI Video Creator", accent: "#DB2777", blurb: "Reels/Shorts scripts for both funnels.",
    note: "Outputs scripts, shot lists, and storyboards.",
    starters: [
      "Script a 30s mentor-recruitment Reel: 'the road you survived can guide someone'",
      "Storyboard a gentle mentee Short: 'you don't have to explain — they get it'",
      "Give me 5 hooks for mentor recruitment that aren't cheesy",
    ],
  },
  copywriter: {
    id: "copywriter", name: "AI Copywriter", accent: "#E8590C", blurb: "Landing pages & ads for recruitment.",
    starters: [
      "Write a mentor-recruitment landing page for MyAlongside",
      "Give me 5 ad variations for mentor recruitment",
      "Write 8 headlines for the mentee 'Get Matched Free' offer",
    ],
  },
  email: {
    id: "email", name: "AI Email Marketer", accent: "#0CA678", blurb: "Onboarding & nurture for both sides.",
    starters: [
      "Write a 3-email mentor-recruitment nurture sequence",
      "Write a gentle welcome email for a newly matched mentee",
      "Draft a re-engagement email for mentors who signed up but never activated",
    ],
  },
  seo: {
    id: "seo", name: "AI SEO Specialist", accent: "#1971C2", blurb: "Keywords for mentor + life-event search.",
    starters: [
      "Keyword cluster for 'how to become a peer mentor'",
      "Keyword cluster for 'support after divorce' (mentee intent)",
      "Meta title + description for the divorce life-event landing page",
    ],
  },
  research: {
    id: "research", name: "AI Research Analyst", accent: "#5F3DC4", blurb: "Competitor & audience analysis.",
    starters: [
      "Analyze the peer-support / mentorship competitive landscape",
      "Build a SWOT for MyAlongside",
      "Where do people who survived hard life events gather online (mentor sourcing)?",
    ],
  },
  support: {
    id: "support", name: "AI Customer Support", accent: "#087F5B", blurb: "Mentor & mentee questions.",
    starters: [
      "Answer a prospective mentor: 'Am I qualified to be a mentor?'",
      "Answer a mentee: 'Is this therapy? Is it confidential?'",
      "Write an FAQ covering safety, verification, and cost",
    ],
  },
  sales: {
    id: "sales", name: "AI Mentor Recruiter", accent: "#2B8A3E", blurb: "Qualifies & converts prospective mentors.",
    starters: [
      "Write qualifying questions for a prospective mentor",
      "Draft a warm outreach message inviting someone to become a mentor",
      "Handle the hesitation: 'I'm not sure my experience is enough'",
    ],
  },
  analytics: {
    id: "analytics", name: "AI Analytics Agent", accent: "#1864AB", blurb: "Tracks both recruitment funnels.",
    starters: [
      "Which KPIs matter for mentor recruitment vs mentee acquisition?",
      "Design a dashboard tracking mentor supply vs mentee demand balance",
      "Interpret: mentee signups up 30%, mentor signups flat — what do we do?",
    ],
  },
};

export const AGENT_ORDER: AgentId[] = [
  "cmo", "content", "social", "designer", "video", "copywriter",
  "email", "seo", "research", "support", "sales", "analytics",
];

export type CampaignTrack = "mentor" | "mentee";

export const CAMPAIGN_LABELS: Record<CampaignTrack, string> = {
  mentor: "Mentor Recruitment",
  mentee: "Mentee Acquisition",
};
