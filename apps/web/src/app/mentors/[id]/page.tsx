"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, MessageCircle, Star } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { avatarOrFallback } from "@/lib/avatar";
import { connectWithMentor } from "@/lib/connect";
import { clsx } from "clsx";

interface MentorDetail {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  languages: string[];
  isVerified: boolean;
  mentorProfile: {
    tagline: string;
    yearsExperience: number;
    isAvailable: boolean;
    rating: number;
    reviewCount: number;
  } | null;
  userLifeEvents: Array<{
    status: "GOING_THROUGH" | "SURVIVED" | "BOTH";
    lifeEvent: { slug: string; label: string; emoji: string; description: string };
  }>;
}

const STATUS_LABEL: Record<MentorDetail["userLifeEvents"][number]["status"], string> = {
  GOING_THROUGH: "Currently navigating this",
  SURVIVED: "Has navigated this",
  BOTH: "Has lived experience with this",
};

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch(`/api/mentors/${id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Couldn't load this mentor's profile.");
        }
        if (!cancelled) setMentor(await res.json());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load this mentor's profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  async function handleConnect() {
    if (!mentor || connecting) return;
    setConnecting(true);
    setConnectError(null);
    try {
      const conversationId = await connectWithMentor(mentor.id, mentor.userLifeEvents[0]?.lifeEvent.slug);
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Couldn't start this conversation.");
      setConnecting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-stone-500">Sign in to view mentor profiles.</p>
        <Link href="/login" className="btn-primary inline-flex">Sign in</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-stone-500">{error ?? "Mentor not found."}</p>
        <Link href="/find-mentor" className="btn-secondary inline-flex">Back to Find a Mentor</Link>
      </div>
    );
  }

  const avatar = avatarOrFallback(mentor);
  const profile = mentor.mentorProfile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/find-mentor"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Find a Mentor
      </Link>

      <div className="card p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <Image
                src={avatar}
                alt={mentor.name}
                width={72}
                height={72}
                className="rounded-full bg-stone-100"
                unoptimized
              />
              {profile?.isAvailable && (
                <span className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-stone-900">{mentor.name}</h1>
                {mentor.isVerified && (
                  <CheckCircle className="h-4 w-4 text-brand-500" aria-label="Verified mentor" />
                )}
              </div>
              {mentor.location && <p className="text-sm text-stone-500">{mentor.location}</p>}
              {profile && (
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-stone-900">{profile.rating}</span>
                    <span className="text-stone-400">({profile.reviewCount})</span>
                  </div>
                  <span className="text-xs text-stone-400">{profile.yearsExperience}y experience</span>
                </div>
              )}
            </div>
          </div>
          {profile && (
            <span
              className={clsx(
                "badge text-xs flex-shrink-0",
                profile.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
              )}
            >
              {profile.isAvailable ? "Available Now" : "Not Available"}
            </span>
          )}
        </div>

        {/* Tagline */}
        {profile?.tagline && (
          <p className="text-sm font-medium italic text-stone-700 leading-relaxed border-l-2 border-brand-300 pl-3">
            &ldquo;{profile.tagline}&rdquo;
          </p>
        )}

        {/* Bio */}
        {mentor.bio && (
          <p className="text-sm leading-relaxed text-stone-600">{mentor.bio}</p>
        )}

        {/* Languages */}
        {mentor.languages.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">Languages</p>
            <p className="text-sm text-stone-600">{mentor.languages.join(", ")}</p>
          </div>
        )}

        {/* Life events */}
        {mentor.userLifeEvents.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
              Lived Experience
            </p>
            <div className="space-y-2">
              {mentor.userLifeEvents.map(({ status, lifeEvent }) => (
                <div key={lifeEvent.slug} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                  <p className="text-sm font-medium text-stone-800">
                    {lifeEvent.emoji} {lifeEvent.label}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">{STATUS_LABEL[status]}</p>
                  {lifeEvent.description && (
                    <p className="mt-1 text-xs text-stone-500">{lifeEvent.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connect */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn-primary w-full justify-center !py-3 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Message {mentor.name.split(" ")[0]}
              </>
            )}
          </button>
          {connectError && (
            <p className="mt-2 text-xs text-red-500 text-center">{connectError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
