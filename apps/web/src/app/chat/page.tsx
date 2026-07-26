"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { avatarOrFallback } from "@/lib/avatar";
import { type MatchListItem, otherParticipant, previewText, timeAgo } from "@/lib/matches";
import { clsx } from "clsx";

export default function ChatInboxPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch("/api/matches");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Couldn't load your conversations.");
        }
        const data: MatchListItem[] = await res.json();
        if (!cancelled) setMatches(data.filter((m) => m.conversation));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load your conversations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token || !user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
        <p className="text-stone-500">Sign in to see your conversations with mentors.</p>
        <Link href="/login" className="btn-primary inline-flex">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
        <p className="mt-1 text-stone-500">Your conversations with mentors.</p>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-stone-300 mb-3" />
          <p className="font-medium text-stone-600">No conversations yet</p>
          <p className="mt-1 text-sm text-stone-400">Find a mentor to start chatting.</p>
          <Link href="/find-mentor" className="btn-primary mt-4 inline-flex">
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => {
            const other = otherParticipant(match, user.id);
            const conversation = match.conversation!;
            const lastMessage = conversation.messages[0];
            const unreadCount = conversation._count.messages;

            return (
              <Link
                key={match.id}
                href={`/chat/${conversation.id}`}
                className={clsx(
                  "card flex items-center gap-4 p-4 hover:shadow-md transition-all",
                  unreadCount > 0 && "border-brand-200 bg-brand-50/30"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={avatarOrFallback(other)}
                    alt={other.name}
                    width={52}
                    height={52}
                    className="rounded-full bg-stone-100"
                    unoptimized
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={clsx(
                        "text-sm truncate",
                        unreadCount > 0 ? "font-bold text-stone-900" : "font-semibold text-stone-800"
                      )}
                    >
                      {other.name}
                    </p>
                    <span className="text-xs text-stone-400 flex-shrink-0">
                      {timeAgo(lastMessage?.createdAt ?? conversation.updatedAt)}
                    </span>
                  </div>
                  <p
                    className={clsx(
                      "mt-0.5 text-xs truncate",
                      unreadCount > 0 ? "text-stone-700 font-medium" : "text-stone-500"
                    )}
                  >
                    {previewText(lastMessage)}
                  </p>
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
  );
}
