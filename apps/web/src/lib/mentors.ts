import type { MockUser } from "@/lib/mock-data";
import type { LifeEventId } from "@/lib/constants";
import { avatarOrFallback } from "@/lib/avatar";

/** Shape returned by GET /api/mentors/search (see rankMentors in the backend). */
export interface RankedMentor {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  languages: string[];
  isVerified: boolean;
  tagline?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  yearsExperience?: number | null;
  isAvailable: boolean;
  lifeEvents: Array<{ slug: string; label: string }>;
  matchScore: number;
  matchExplanation: string;
  matchedSignals: string[];
}

/** Maps a ranked-search result into the shape MentorCard expects. */
export function toCardMentor(mentor: RankedMentor): MockUser {
  return {
    id: mentor.id,
    name: mentor.name,
    avatar: avatarOrFallback(mentor),
    role: "MENTOR",
    tagline: mentor.tagline ?? "",
    lifeEvents: mentor.lifeEvents.map((e) => e.slug as LifeEventId),
    yearsExperience: mentor.yearsExperience ?? undefined,
    rating: mentor.rating ?? undefined,
    reviewCount: mentor.reviewCount ?? undefined,
    isVerified: mentor.isVerified,
    availability: mentor.isAvailable ? "AVAILABLE" : "UNAVAILABLE",
    bio: mentor.bio ?? undefined,
    location: mentor.location ?? undefined,
    languages: mentor.languages,
    matchScore: mentor.matchScore,
    matchExplanation: mentor.matchExplanation,
    matchedSignals: mentor.matchedSignals,
  };
}
