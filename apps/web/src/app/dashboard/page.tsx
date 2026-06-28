"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Users, TrendingUp, ArrowRight } from "lucide-react";
import { MOCK_CURRENT_USER, MOCK_CONVERSATIONS, MOCK_MENTORS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { LIFE_EVENTS } from "@/lib/constants";
import MentorCard from "@/components/MentorCard";
import { getPublicProfile } from "@/lib/public-profile";

export default function DashboardPage() {
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);
  const firstName = publicUser.displayName.split(" ")[0];

  const suggestedMentors = MOCK_MENTORS.filter((m) => m.availability === "AVAILABLE").slice(0, 2);
  const totalUnread = MOCK_CONVERSATIONS.reduce((a, c) => a + c.unreadCount, 0);

  const stats = [
    { label: "Active Conversations", value: MOCK_CONVERSATIONS.length, icon: MessageCircle, color: "text-brand-600 bg-brand-50" },
    { label: "Mentors Matched", value: 3, icon: Users, color: "text-emerald-600 bg-emerald-50" },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Conversations */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Recent Conversations</h2>
            <Link href="/chat" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {MOCK_CONVERSATIONS.map((conv) => {
              const event = LIFE_EVENTS.find((e) => e.id === conv.lifeEvent);
              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.participantId}`}
                  className="card flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      width={44}
                      height={44}
                      className="rounded-full bg-stone-100"
                      unoptimized
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-stone-900 truncate">{conv.participantName}</p>
                      <span className="text-xs text-stone-400 flex-shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500 truncate">{conv.lastMessage}</p>
                    {event && (
                      <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${event.color}`}>
                        {event.emoji} {event.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Suggested Mentors */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Suggested Mentors</h2>
            <Link href="/find-mentor" className="text-sm text-brand-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {suggestedMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
