"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { MOCK_MENTORS } from "@/lib/mock-data";
import { LIFE_EVENTS } from "@/lib/constants";
import MentorCard from "@/components/MentorCard";
import { clsx } from "clsx";

export default function FindMentorPage() {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const filtered = MOCK_MENTORS.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesEvent = !selectedEvent || m.lifeEvents.includes(selectedEvent as never);
    return matchesSearch && matchesEvent;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Find a Mentor</h1>
        <p className="mt-1 text-stone-500">Connect with someone who has walked a similar path.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          placeholder="Search by name or experience…"
          className="input-field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Life event filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedEvent(null)}
          className={clsx(
            "badge border cursor-pointer transition-colors",
            !selectedEvent
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-stone-600 border-stone-200 hover:border-brand-400"
          )}
        >
          All
        </button>
        {LIFE_EVENTS.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            className={clsx(
              "badge border cursor-pointer transition-colors",
              selectedEvent === event.id
                ? event.color
                : "bg-white text-stone-600 border-stone-200 hover:border-brand-400"
            )}
          >
            {event.emoji} {event.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">
          <p className="text-lg font-medium">No mentors found</p>
          <p className="mt-1 text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
