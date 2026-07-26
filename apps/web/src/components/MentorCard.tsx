"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Loader2, MessageCircle, Star } from "lucide-react";
import { MockUser } from "@/lib/mock-data";
import { LIFE_EVENTS, MENTOR_AVAILABILITY } from "@/lib/constants";
import { connectWithMentor } from "@/lib/connect";
import { clsx } from "clsx";

interface MentorCardProps {
  mentor: MockUser;
  compact?: boolean;
}

export default function MentorCard({ mentor, compact = false }: MentorCardProps) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const availability =
    MENTOR_AVAILABILITY[mentor.availability ?? "UNAVAILABLE"];

  const events = mentor.lifeEvents
    .map((id) => LIFE_EVENTS.find((e) => e.id === id))
    .filter(Boolean)
    .slice(0, compact ? 2 : 3);

  async function handleConnect() {
    if (connecting) return;
    setConnecting(true);
    setConnectError(null);
    try {
      const conversationId = await connectWithMentor(mentor.id, mentor.lifeEvents[0]);
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Couldn't start this conversation.");
      setConnecting(false);
    }
  }

  if (compact) {
    return (
      <div className="card group flex items-start gap-4 p-4">
        <Link href={`/mentors/${mentor.id}`} className="relative flex-shrink-0">
          <Image
            src={mentor.avatar}
            alt={mentor.name}
            width={48}
            height={48}
            className="rounded-full bg-stone-100"
            unoptimized={mentor.avatar?.includes('dicebear.com')}
          />
          {mentor.availability === "AVAILABLE" && (
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </Link>
        <Link href={`/mentors/${mentor.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-stone-900 text-sm">{mentor.name}</p>
            {mentor.isVerified && (
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">{mentor.tagline}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {events.map((e) => e && (
              <span key={e.id} className={clsx("badge border text-[10px]", e.color)}>
                {e.emoji} {e.label}
              </span>
            ))}
          </div>
        </Link>
        <button
          onClick={handleConnect}
          disabled={connecting}
          title={connectError ?? undefined}
          className="flex-shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 transition-colors disabled:opacity-50"
        >
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="card group flex flex-col p-6 transition-all duration-200 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <Link href={`/mentors/${mentor.id}`} className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0">
            <Image
              src={mentor.avatar}
              alt={mentor.name}
              width={56}
              height={56}
              className="rounded-full bg-stone-100"
              unoptimized={mentor.avatar?.includes('dicebear.com')}
            />
            {mentor.availability === "AVAILABLE" && (
              <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stone-900">{mentor.name}</h3>
              {mentor.isVerified && (
                <CheckCircle className="h-4 w-4 text-brand-500" aria-label="Verified mentor" />
              )}
            </div>
            <p className="text-xs text-stone-500">{mentor.location}</p>
          </div>
        </Link>
        <span className={clsx("badge text-xs flex-shrink-0", availability.color)}>
          {availability.label}
        </span>
      </div>

      {/* Tagline */}
      <p className="mt-4 text-sm font-medium italic text-stone-700 leading-relaxed border-l-2 border-brand-300 pl-3">
        &ldquo;{mentor.tagline}&rdquo;
      </p>

      {/* Bio */}
      {mentor.bio && (
        <p className="mt-3 text-sm leading-relaxed text-stone-500 line-clamp-3">
          {mentor.bio}
        </p>
      )}

      {/* Life events */}
      <div className="mt-4 flex flex-wrap gap-2">
        {events.map((e) => e && (
          <span key={e.id} className={clsx("badge border text-xs", e.color)}>
            {e.emoji} {e.label}
          </span>
        ))}
      </div>

      {mentor.matchExplanation && (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              AI Match Read
            </p>
            {typeof mentor.matchScore === "number" && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm">
                {mentor.matchScore}% fit
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            {mentor.matchExplanation}
          </p>
          {mentor.matchedSignals && mentor.matchedSignals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.matchedSignals.slice(0, 3).map((signal) => (
                <span
                  key={signal}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600"
                >
                  {signal}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <div className="flex items-center gap-3">
          {mentor.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-stone-900">{mentor.rating}</span>
              <span className="text-stone-400">({mentor.reviewCount})</span>
            </div>
          )}
          {mentor.yearsExperience && (
            <span className="text-xs text-stone-400">
              {mentor.yearsExperience}y exp
            </span>
          )}
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn-primary !text-xs !px-4 !py-2 disabled:opacity-50"
        >
          {connecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              Connect
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {connectError && (
        <p className="mt-2 text-xs text-red-500 text-right">{connectError}</p>
      )}
    </div>
  );
}
