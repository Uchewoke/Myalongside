// lib/matching.ts
// Suggests qualified mentors for a mentee based on shared life event.
// Server-only. Life-event labels vary across the app (form labels like
// "Divorce & Separation" vs URL slugs like "divorce"), so we normalize first.

import { prisma } from "./prisma";
import type { MentorLead } from "./leads";

// Canonical key -> synonyms/labels/slugs that should all map to it.
const EVENT_ALIASES: Record<string, string[]> = {
  divorce: ["divorce", "separation", "divorce & separation"],
  job_loss: ["job loss", "job loss & career", "career", "redundancy", "layoff", "job-loss"],
  grief: ["grief", "bereavement", "grief & bereavement", "loss of a loved one"],
  health: ["health", "health crisis", "illness", "diagnosis"],
  new_parent: ["new parenthood", "new parent", "new baby", "new-parent"],
  mental_health: ["mental health", "anxiety", "depression", "burnout", "mental-health"],
  addiction: ["addiction", "recovery", "addiction & recovery", "sobriety"],
  relocation: ["relocation", "moving", "relocation & moving"],
  financial: ["financial", "financial crisis", "debt", "bankruptcy"],
  empty_nest: ["empty nest", "empty-nest"],
  relationship: ["relationship breakup", "breakup", "heartbreak", "relationship"],
  fresh_start: ["fresh start", "reinvention", "new beginning", "fresh-start"],
};

/** Map any free-form life-event label/slug to a canonical key. */
export function normalizeEvent(raw: string): string {
  const v = raw.trim().toLowerCase().replace(/[_-]+/g, " ");
  for (const [key, aliases] of Object.entries(EVENT_ALIASES)) {
    if (key.replace("_", " ") === v) return key;
    if (aliases.some((a) => v === a || v.includes(a) || a.includes(v))) return key;
  }
  return v.replace(/\s+/g, "_"); // fall back to a slugified form
}

export interface MentorMatch {
  mentor: MentorLead;
  matchScore: number;      // 0-100 suggestion confidence
  reasons: string[];
}

export interface MatchResult {
  event: string;           // canonical event matched on
  matches: MentorMatch[];
}

function serialize(row: any): MentorLead {
  return {
    ...row,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Find and rank qualified mentors for a given life event.
 * Only "qualified" or "contacted" mentors are eligible (never not_ready).
 */
export async function suggestMentors(lifeEvent: string, limit = 5): Promise<MatchResult> {
  const target = normalizeEvent(lifeEvent);

  // Pull the eligible mentor pool once, then match in memory (event labels are
  // free-form so we can't do this purely in SQL without a normalized column).
  const rows = await prisma.mentorLead.findMany({
    where: { status: { in: ["qualified", "contacted"] } },
    orderBy: [{ score: "desc" }],
    take: 200,
  });

  const matches: MentorMatch[] = [];
  for (const row of rows) {
    const mentor = serialize(row);
    const mentorEvent = normalizeEvent(mentor.lifeEvent);
    if (mentorEvent !== target) continue;

    const reasons: string[] = [`Lived through the same challenge (${mentor.lifeEvent})`];
    // Suggestion confidence blends the mentor's qualification score with signals.
    let matchScore = Math.round(mentor.score * 0.8);
    if (mentor.availability) { matchScore += 8; reasons.push(`Has stated availability (${mentor.availability})`); }
    if (mentor.status === "qualified") { matchScore += 5; reasons.push("Qualified and not yet assigned"); }
    matchScore = Math.max(0, Math.min(100, matchScore));

    matches.push({ mentor, matchScore, reasons });
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return { event: target, matches: matches.slice(0, limit) };
}

/** Persist a mentee (upsert by email) so matches can be requested later. */
export async function upsertMentee(input: { name: string; email: string; lifeEvent: string; story: string }) {
  const email = input.email.trim().toLowerCase();
  const data = {
    name: input.name.trim(),
    email,
    lifeEvent: input.lifeEvent.trim(),
    story: input.story.trim(),
  };
  const row = await prisma.mentee.upsert({ where: { email }, update: data, create: data });
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
