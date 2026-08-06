"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Users, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import type { MockUser } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api-client";
import { avatarOrFallback } from "@/lib/avatar";
import { type MatchListItem, otherParticipant, previewText, timeAgo } from "@/lib/matches";
import { type RankedMentor, toCardMentor } from "@/lib/mentors";
import MentorCard from "@/components/MentorCard";
import { getPublicProfile } from "@/lib/public-profile";

export default function DashboardPage() {
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const publicUser = authUser ? getPublicProfile(authUser) : null;
  const firstName = publicUser?.displayName.split(" ")[0] ?? "there";

  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [suggestedMentors, setSuggestedMentors] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [matchesRes, mentorsRes] = await Promise.all([
          apiFetch("/api/matches"),
          apiFetch("/api/mentors/search?availability=AVAILABLE&limit=2"),
        ]);

        if (matchesRes.ok) {
          const data: MatchListItem[] = await matchesRes.json();
          if (!cancelled) setMatches(data.filter((m) => m.conversation));
        }

        if (mentorsRes.ok) {
          const data: { mentors: RankedMentor[] } = await mentorsRes.json();
          if (!cancelled) setSuggestedMentors(data.mentors.map(toCardMentor));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token || !authUser) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Welcome</h1>
        <p className="text-stone-500">Sign in to see your dashboard.</p>
        <Link href="/login" className="btn-primary inline-flex">Sign in</Link>
      </div>
    );
  }

  const totalUnread = matches.reduce((a, m) => a + (m.conversation?._count.messages ?? 0), 0);
  const recentMatches = matches.slice(0, 5);

  const stats = [
    { label: "Active Conversations", value: matches.length, icon: MessageCircle, color: "text-brand-600 bg-brand-50" },
    { label: "Mentors Matched", value: matches.length, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Unread Messages", value: totalUnread, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-brand-gradient p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-white/80 text-sm">Here&apos;s what&apos;s happening with your journey today.</p>
        <Link
          href="/find-mentor"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors"
        >
          Find a Mentor <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-sm text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Event */}
      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Live Event</h2>
          <Link href="/dashboard/paywall" className="text-sm text-brand-600 hover:underline">Pricing</Link>
        </div>
        <p className="text-sm text-stone-600">
          Join mentor-led live events with a 7-day free trial, then $5.99/month.
        </p>
        <Link
          href="/dashboard/paywall"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
        >
          Unlock Live Events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Conversations */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Recent Conversations</h2>
              <Link href="/chat" className="text-sm text-brand-600 hover:underline">View all</Link>
            </div>
            {recentMatches.length === 0 ? (
              <div className="card p-6 text-center text-sm text-stone-400">
                No conversations yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map((match) => {
                  const other = otherParticipant(match, authUser.id);
                  const conversation = match.conversation!;
                  const lastMessage = conversation.messages[0];
                  const unreadCount = conversation._count.messages;

                  return (
                    <Link
                      key={match.id}
                      href={`/chat/${conversation.id}`}
                      className="card flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="relative flex-shrink-0">
                        <Image
                          src={avatarOrFallback(other)}
                          alt={other.name}
                          width={44}
                          height={44}
                          className="rounded-full bg-stone-100"
                          unoptimized
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-stone-900 truncate">{other.name}</p>
                          <span className="text-xs text-stone-400 flex-shrink-0">
                            {timeAgo(lastMessage?.createdAt ?? conversation.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-stone-500 truncate">{previewText(lastMessage)}</p>
                        {match.lifeEvent && (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border bg-stone-50 text-stone-600 border-stone-200">
                            {match.lifeEvent.emoji} {match.lifeEvent.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggested Mentors */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Suggested Mentors</h2>
              <Link href="/find-mentor" className="text-sm text-brand-600 hover:underline">See all</Link>
            </div>
            {suggestedMentors.length === 0 ? (
              <div className="card p-6 text-center text-sm text-stone-400">
                No suggestions yet — try searching for a mentor.
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
