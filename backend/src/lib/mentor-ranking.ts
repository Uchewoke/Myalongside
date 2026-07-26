const EVENT_ALIASES: Record<string, string[]> = {
  divorce: ["divorce", "separation", "co-parenting", "coparenting", "custody"],
  "job-loss": ["job loss", "laid off", "laid-off", "redundancy", "career transition", "unemployed"],
  grief: ["grief", "bereavement", "widowed", "loss", "mourning"],
  "health-crisis": ["health", "cancer", "breast cancer", "diagnosis", "illness", "treatment"],
  "mental-health": ["mental health", "anxiety", "depression", "burnout", "overwhelmed"],
  addiction: ["addiction", "recovery", "sober", "sobriety", "substance"],
  relocation: ["relocation", "moving", "new city", "new country", "culture shock"],
  financial: ["financial", "debt", "bankruptcy", "money", "bills"],
  "fresh-start": ["fresh start", "reinvention", "starting over", "new chapter", "midlife"],
};

const LANGUAGE_ALIASES: Record<string, string[]> = {
  English: ["english"],
  Spanish: ["spanish", "espanol", "español"],
  Mandarin: ["mandarin", "chinese"],
  Hindi: ["hindi"],
  Tamil: ["tamil"],
  Korean: ["korean"],
};

const TONE_KEYWORDS: Record<string, string[]> = {
  empathetic: ["understand", "walk with", "healing", "support", "gentle", "compassion"],
  practical: ["steps", "strategy", "plan", "reframe", "exact", "action"],
  hopeful: ["hope", "light", "possible", "growth", "thriving", "purpose"],
  clinical: ["doctor", "clinical", "diagnosis", "treatment", "medical"],
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "to",
  "for",
  "of",
  "i",
  "me",
  "my",
  "someone",
  "mentor",
  "who",
  "through",
  "went",
  "with",
  "need",
  "want",
  "survived",
]);

export interface RankingSeekerProfile {
  bio?: string | null;
  languages: string[];
  lifeEvents: string[];
}

export interface RankingMentorProfile {
  id: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  languages: string[];
  isVerified: boolean;
  tagline?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  yearsExperience?: number | null;
  isAvailable: boolean;
  lifeEvents: Array<{
    slug: string;
    label: string;
    status: string;
    description?: string | null;
  }>;
}

export interface RankedMentorResult extends RankingMentorProfile {
  matchScore: number;
  matchExplanation: string;
  matchedSignals: string[];
  scoreBreakdown: {
    lifeEventFit: number;
    contextSimilarity: number;
    tone: number;
    availability: number;
    language: number;
    rapport: number;
  };
}

export interface RankingInterpretation {
  detectedLifeEvents: string[];
  detectedLanguages: string[];
  detectedTone: string[];
  tokens: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function pickAliases(text: string, aliases: Record<string, string[]>): string[] {
  return Object.entries(aliases)
    .filter(([, values]) => values.some((value) => text.includes(normalize(value))))
    .map(([key]) => key);
}

function detectTone(text: string): string[] {
  return Object.entries(TONE_KEYWORDS)
    .filter(([, values]) => values.some((value) => text.includes(normalize(value))))
    .map(([key]) => key);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function interpretSearch(query: string): RankingInterpretation {
  const normalized = normalize(query);

  return {
    detectedLifeEvents: pickAliases(normalized, EVENT_ALIASES),
    detectedLanguages: pickAliases(normalized, LANGUAGE_ALIASES),
    detectedTone: detectTone(normalized),
    tokens: unique(tokenize(query)),
  };
}

function buildMentorCorpus(mentor: RankingMentorProfile): string {
  return normalize(
    [
      mentor.name,
      mentor.tagline ?? "",
      mentor.bio ?? "",
      mentor.location ?? "",
      mentor.languages.join(" "),
      mentor.lifeEvents.map((event) => `${event.slug} ${event.label} ${event.description ?? ""}`).join(" "),
    ].join(" ")
  );
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function buildExplanation(mentor: RankingMentorProfile, signals: string[]): string {
  const primaryEvent = mentor.lifeEvents[0]?.label?.toLowerCase();
  const reasons = signals.slice(0, 3);

  if (primaryEvent && reasons.length === 0) {
    reasons.push(`they have lived experience with ${primaryEvent}`);
  }

  if (reasons.length === 1) {
    return `We recommended ${mentor.name} because ${reasons[0]}.`;
  }

  if (reasons.length === 2) {
    return `We recommended ${mentor.name} because ${reasons[0]} and ${reasons[1]}.`;
  }

  return `We recommended ${mentor.name} because ${reasons[0]}, ${reasons[1]}, and ${reasons[2]}.`;
}

export function rankMentors(input: {
  seeker: RankingSeekerProfile;
  mentors: RankingMentorProfile[];
  query?: string;
  selectedLifeEvents?: string[];
  onlyAvailable?: boolean;
  limit?: number;
}): { interpretation: RankingInterpretation; mentors: RankedMentorResult[] } {
  const interpretation = interpretSearch(input.query ?? "");
  const desiredLifeEvents = unique([
    ...input.seeker.lifeEvents,
    ...(input.selectedLifeEvents ?? []),
    ...interpretation.detectedLifeEvents,
  ]);
  const desiredLanguages = unique([
    ...input.seeker.languages,
    ...interpretation.detectedLanguages,
  ]);
  const queryTokens = interpretation.tokens;
  const seekerContextTokens = unique(tokenize(input.seeker.bio ?? ""));
  const contextMatchTokens = unique([...queryTokens, ...seekerContextTokens]);

  const ranked = input.mentors
    .filter((mentor) => (input.onlyAvailable ? mentor.isAvailable : true))
    .map((mentor) => {
      const mentorCorpus = buildMentorCorpus(mentor);
      const mentorEventSlugs = mentor.lifeEvents.map((event) => event.slug);
      const mentorLanguages = mentor.languages.map((language) => language.toLowerCase());
      const mentorTones = detectTone(mentorCorpus);

      const sharedEvents = desiredLifeEvents.filter((event) => mentorEventSlugs.includes(event));
      const sharedLanguages = desiredLanguages.filter((language) =>
        mentorLanguages.includes(language.toLowerCase())
      );
      const matchingTokens = contextMatchTokens.filter((token) => mentorCorpus.includes(token));
      const toneMatches = interpretation.detectedTone.filter((tone) => mentorTones.includes(tone));

      const lifeEventFit = clamp(sharedEvents.length * 18 + mentor.lifeEvents.length * 2, 35);
      const contextSimilarity = clamp(matchingTokens.length * 4 + sharedEvents.length * 3, 20);
      const tone = clamp(
        interpretation.detectedTone.length === 0
          ? mentorTones.length > 0
            ? 6
            : 4
          : toneMatches.length * 5,
        10
      );
      const availability = mentor.isAvailable ? 15 : 5;
      const language = clamp(sharedLanguages.length * 5, 10);
      const rapport = clamp(
        (mentor.isVerified ? 3 : 0) +
          Math.min(4, Math.round((mentor.rating ?? 0) / 1.5)) +
          (sharedEvents.length > 0 ? 3 : 0),
        10
      );

      const matchedSignals = unique([
        ...sharedEvents.map((event) => `they've been through ${event.replace(/-/g, " ")}`),
        ...sharedLanguages.map((language) => `they can support you in ${language}`),
        ...(mentor.isAvailable ? ["they're available this week"] : []),
        ...matchingTokens.slice(0, 2).map((token) => `their profile closely matches your ${token} context`),
        ...toneMatches.map((matchedTone) => `their mentoring style reads as ${matchedTone}`),
      ]);

      const matchScore = clamp(
        lifeEventFit + contextSimilarity + tone + availability + language + rapport,
        100
      );

      return {
        ...mentor,
        matchScore,
        matchedSignals,
        matchExplanation: buildExplanation(mentor, matchedSignals),
        scoreBreakdown: {
          lifeEventFit,
          contextSimilarity,
          tone,
          availability,
          language,
          rapport,
        },
      };
    })
    .sort((left, right) => right.matchScore - left.matchScore || (right.rating ?? 0) - (left.rating ?? 0))
    .slice(0, input.limit ?? 20);

  return { interpretation, mentors: ranked };
}