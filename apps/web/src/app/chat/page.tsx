"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { MOCK_CONVERSATIONS } from "@/lib/mock-data";
import { LIFE_EVENTS } from "@/lib/constants";
import { clsx } from "clsx";

export default function ChatInboxPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
        <p className="mt-1 text-stone-500">Your conversations with mentors.</p>
      </div>

      {MOCK_CONVERSATIONS.length === 0 ? (
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
          {MOCK_CONVERSATIONS.map((conv) => {
            const event = LIFE_EVENTS.find((e) => e.id === conv.lifeEvent);
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.participantId}`}
                className={clsx(
                  "card flex items-center gap-4 p-4 hover:shadow-md transition-all",
                  conv.unreadCount > 0 && "border-brand-200 bg-brand-50/30"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    width={52}
                    height={52}
                    className="rounded-full bg-stone-100"
                    unoptimized
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={clsx(
                        "text-sm truncate",
                        conv.unreadCount > 0 ? "font-bold text-stone-900" : "font-semibold text-stone-800"
                      )}
                    >
                      {conv.participantName}
                    </p>
                    <span className="text-xs text-stone-400 flex-shrink-0">{conv.lastMessageTime}</span>
                  </div>
                  <p
                    className={clsx(
                      "mt-0.5 text-xs truncate",
                      conv.unreadCount > 0 ? "text-stone-700 font-medium" : "text-stone-500"
                    )}
                  >
                    {conv.lastMessage}
                  </p>
                  {event && (
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${event.color}`}
                    >
                      {event.emoji} {event.label}
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
