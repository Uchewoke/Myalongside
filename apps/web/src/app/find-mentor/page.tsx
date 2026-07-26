"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { LIFE_EVENTS } from "@/lib/constants";
import type { MockUser } from "@/lib/mock-data";
import { type RankedMentor, toCardMentor } from "@/lib/mentors";
import MentorCard from "@/components/MentorCard";
import { clsx } from "clsx";

export default function FindMentorPage() {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [mentors, setMentors] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (selectedEvent) params.set("lifeEvents", selectedEvent);
        params.set("availability", availableOnly ? "AVAILABLE" : "ANY");
        params.set("limit", "20");

        const res = await apiFetch(`/api/mentors/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Couldn't load mentors. Please try again.");
        }

        const data: { mentors: RankedMentor[] } = await res.json();
        setMentors(data.mentors.map(toCardMentor));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Couldn't load mentors. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedEvent, availableOnly]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Find a Mentor</h1>
        <p className="mt-1 text-stone-500">Connect with someone who has walked a similar path.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search by name or experience…"
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setAvailableOnly((v) => !v)}
          aria-pressed={availableOnly}
          className={clsx(
            "flex-shrink-0 flex items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors",
            availableOnly
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-stone-600 border-stone-200 hover:border-green-400"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          Available now
        </button>
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
      {loading ? (
        <div className="card p-12 text-center text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          <p className="text-sm">Finding mentors for you…</p>
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">
          <p className="text-lg font-medium">No mentors found</p>
          <p className="mt-1 text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
