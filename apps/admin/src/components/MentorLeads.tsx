"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  lifeEvent: string;
  story: string;
  availability: string;
  score: number;
  status: string;
  qualificationNotes: string;
  createdAt: string;
}

const FILTERS = ["ALL", "NEW", "QUALIFIED", "NOT_READY", "CONTACTED", "CONVERTED"] as const;

const STATUS_STYLES: Record<string, string> = {
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  NOT_READY: "bg-amber-100 text-amber-700",
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-sky-100 text-sky-700",
  CONVERTED: "bg-teal-100 text-teal-700",
};

export function MentorLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const query = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/marketing/leads${query}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Unable to load leads.");
      setLeads(data.leads ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/marketing/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No leads in this view yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{lead.name}</h2>
                  <a href={`mailto:${lead.email}`} className="text-sm text-slate-500 hover:underline">
                    {lead.email}
                  </a>
                </div>
                <p className={`text-2xl font-bold ${lead.score >= 60 ? "text-emerald-700" : "text-amber-600"}`}>
                  {lead.score}
                  <span className="text-xs font-medium text-slate-400">/100</span>
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[lead.status] ?? "bg-slate-100 text-slate-700"}`}>
                  {lead.status.replace("_", " ").toLowerCase()}
                </span>
                <span className="text-xs text-slate-500">{lead.lifeEvent}</span>
                {lead.availability && <span className="text-xs text-slate-500">· {lead.availability}</span>}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.story}</p>
              {lead.qualificationNotes && (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold">AI assessment: </span>
                  {lead.qualificationNotes}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus(lead.id, "CONTACTED")}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
                >
                  Mark contacted
                </button>
                <button
                  onClick={() => setStatus(lead.id, "QUALIFIED")}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                >
                  Approve → create mentor account
                </button>
                <button
                  onClick={() => setStatus(lead.id, "NOT_READY")}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
                >
                  Not ready
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
