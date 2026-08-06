// Mentor-lead qualification: scores a prospective mentor with Claude against
// lived-experience, stability, empathy, and availability criteria.
//
// Safety-critical: MyAlongside serves people in crisis, so this prompt must
// keep flagging anyone who appears to still be in acute distress as NOT_READY
// regardless of score, and must never present peer support as clinical care.

import { LeadStatus } from "@prisma/client";
import { runAgent } from "../lib/anthropic";

export interface LeadQualificationInput {
  name: string;
  lifeEvent: string;
  story: string;
  availability?: string;
}

export interface Qualification {
  score: number; // 0-100
  status: LeadStatus; // QUALIFIED | NOT_READY (auto-set from score/flags)
  notes: string;
  strengths: string[];
  concerns: string[];
}

const QUALIFY_SYSTEM = `You are a compassionate mentor-recruitment specialist for MyAlongside, a
peer-support platform connecting people who have been through a hard life
event with mentors who have lived through the same thing.

Ground rules: never present peer support as professional/clinical care, never
exploit or sensationalize suffering, and never fabricate testimonials.

TASK: Assess a prospective peer MENTOR. This is compassionate screening, not
gatekeeping. Judge on:
- Lived experience: have they genuinely been through the life event they'd mentor on?
- Perspective & stability: enough distance/healing to support others (not still in acute crisis)?
- Empathy & communication: warmth, ability to listen.
- Availability: realistic time to commit.

SAFETY: If the person appears to still be in acute distress or crisis, they are
"acuteCrisis: true" (this protects them and future mentees) — this is not a
judgment, just a signal to route them to support first. Lack of "credentials"
is NOT disqualifying; lived experience is the qualification.

Respond with ONLY a JSON object, no markdown, no preamble:
{
  "score": <0-100 integer>,
  "notes": "<one or two sentence rationale>",
  "strengths": ["<short>", ...],
  "concerns": ["<short>", ...],
  "acuteCrisis": <true|false>
}`;

/** Fallback used when Claude scoring is unavailable — never hard-fail signup. */
function manualReviewFallback(): Qualification {
  return {
    score: 50,
    status: LeadStatus.NEW,
    notes: "Automatic scoring unavailable — flagged for manual review.",
    strengths: [],
    concerns: ["Could not auto-score this lead."],
  };
}

export async function qualifyLead(input: LeadQualificationInput): Promise<Qualification> {
  const userMsg = `Prospective mentor:
Name: ${input.name}
Life event they'd mentor on: ${input.lifeEvent}
Their story: ${input.story}
Stated availability: ${input.availability || "not specified"}`;

  let raw: string;
  try {
    raw = await runAgent({
      system: QUALIFY_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 600,
    });
  } catch {
    return manualReviewFallback();
  }

  let parsed: { score?: number; notes?: string; strengths?: string[]; concerns?: string[]; acuteCrisis?: boolean };
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return manualReviewFallback();
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
  const acute = parsed.acuteCrisis === true;
  // Acute crisis -> not ready regardless of score; else threshold at 60.
  const status: LeadStatus = acute ? LeadStatus.NOT_READY : score >= 60 ? LeadStatus.QUALIFIED : LeadStatus.NOT_READY;

  return {
    score,
    status,
    notes: parsed.notes ?? "",
    strengths: parsed.strengths ?? [],
    concerns: parsed.concerns ?? [],
  };
}
