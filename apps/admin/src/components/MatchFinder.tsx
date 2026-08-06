"use client";

import { useState } from "react";

interface MentorMatch {
  mentor: {
    id: string;
    name: string;
    email: string;
    availability: string;
    score: number;
  };
  matchScore: number;
  reasons: string[];
}

const LIFE_EVENTS = [
  "Divorce & Separation",
  "Job Loss & Career",
  "Grief & Bereavement",
  "Health Crisis",
  "New Parenthood",
  "Mental Health",
  "Addiction & Recovery",
  "Relocation & Moving",
  "Financial Crisis",
  "Empty Nest",
  "Relationship Breakup",
  "Fresh Start",
];

export function MatchFinder() {
  const [event, setEvent] = useState(LIFE_EVENTS[0]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[] | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setError("");
    setLoading(true);
    setMatches(null);
    try {
      const res = await fetch(`/api/marketing/match?event=${encodeURIComponent(event)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Lookup failed.");
      setMatches(data.matches ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="min-w-[220px] flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
        >
          {LIFE_EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-70"
        >
          {loading ? "Matching…" : "Find mentors"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      {matches && matches.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">
          No qualified mentors for this life event yet. As more mentors are approved, they&apos;ll show up here.
        </p>
      )}

      {matches && matches.length > 0 && (
        <div className="mt-6 space-y-4">
          {matches.map((m, i) => (
            <article key={m.mentor.id} className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-950">{m.mentor.name}</p>
                    <a href={`mailto:${m.mentor.email}`} className="text-xs text-slate-500 hover:underline">
                      {m.mentor.email}
                    </a>
                  </div>
                  <p className="text-right text-lg font-bold text-emerald-700">
                    {m.matchScore}
                    <span className="block text-[11px] font-medium text-slate-400">% match</span>
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  {m.mentor.availability && <span>{m.mentor.availability}</span>}
                  <span>mentor score {m.mentor.score}/100</span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                  {m.reasons.map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
