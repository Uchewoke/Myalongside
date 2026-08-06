"use client";
// components/MatchFinder.tsx
// Admin tool: pick a life event, see ranked qualified mentors for it.

import React, { useState } from "react";
import { Loader2, Sparkles, Mail, Clock } from "lucide-react";
import { findMatches, MentorMatch } from "@/lib/client";

const BRAND = "#0E7C7B";

const LIFE_EVENTS = [
  "Divorce & Separation", "Job Loss & Career", "Grief & Bereavement", "Health Crisis",
  "New Parenthood", "Mental Health", "Addiction & Recovery", "Relocation & Moving",
  "Financial Crisis", "Empty Nest", "Relationship Breakup", "Fresh Start",
];

export default function MatchFinder() {
  const [event, setEvent] = useState(LIFE_EVENTS[0]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[] | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setError(""); setLoading(true); setMatches(null);
    try {
      const res = await findMatches(event);
      setMatches(res.matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mf-wrap">
      <div className="mf-eyebrow">MyAlongside</div>
      <h1>Find a mentor match</h1>
      <p className="mf-sub">Pick the life event a mentee is navigating. We'll rank qualified mentors who've lived through the same thing.</p>

      <div className="mf-controls">
        <select value={event} onChange={(e) => setEvent(e.target.value)}>
          {LIFE_EVENTS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <button onClick={run} disabled={loading}>
          {loading ? <><Loader2 className="spin" size={15} /> Matching…</> : <><Sparkles size={15} /> Find mentors</>}
        </button>
      </div>

      {error && <div className="mf-error">{error}</div>}

      {matches && (
        matches.length === 0 ? (
          <p className="mf-empty">No qualified mentors for this life event yet. As more mentors are approved, they'll show up here.</p>
        ) : (
          <div className="mf-list">
            {matches.map((m, i) => (
              <div key={m.mentor.id} className="mf-card">
                <div className="mf-rank">{i + 1}</div>
                <div className="mf-body">
                  <div className="mf-top">
                    <div>
                      <div className="mf-name">{m.mentor.name}</div>
                      <a className="mf-email" href={`mailto:${m.mentor.email}`}><Mail size={12} /> {m.mentor.email}</a>
                    </div>
                    <div className="mf-score">{m.matchScore}<span>% match</span></div>
                  </div>
                  <div className="mf-meta">
                    {m.mentor.availability && <span className="mf-avail"><Clock size={11} /> {m.mentor.availability}</span>}
                    <span className="mf-qual">mentor score {m.mentor.score}/100</span>
                  </div>
                  <ul className="mf-reasons">{m.reasons.map((r, j) => <li key={j}>{r}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <style jsx>{`
        .mf-wrap { font-family: 'Inter', system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 26px 18px; color: #1a1a1a; }
        .mf-eyebrow { font-size: 11.5px; letter-spacing: .5px; text-transform: uppercase; color: ${BRAND}; font-weight: 700; }
        h1 { font-size: 24px; font-weight: 800; margin: 2px 0 4px; }
        .mf-sub { font-size: 14px; color: #667; line-height: 1.55; margin: 0 0 18px; }
        .mf-controls { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        select { flex: 1; min-width: 220px; border: 1px solid #dde3e3; border-radius: 10px; padding: 11px 13px; font-size: 14px; font-family: inherit; outline: none; }
        select:focus { border-color: ${BRAND}; }
        .mf-controls button { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: #fff; background: ${BRAND}; border: none; border-radius: 10px; padding: 11px 18px; cursor: pointer; }
        .mf-controls button:disabled { opacity: .7; cursor: default; }
        .mf-error { font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px; padding: 9px 12px; margin-bottom: 12px; }
        .mf-empty { color: #999; font-size: 14px; line-height: 1.6; }
        .mf-list { display: flex; flex-direction: column; gap: 12px; }
        .mf-card { display: flex; gap: 14px; background: #fff; border: 1px solid #ececec; border-radius: 13px; padding: 15px 16px; box-shadow: 0 1px 6px rgba(0,0,0,.03); }
        .mf-rank { width: 28px; height: 28px; flex-shrink: 0; border-radius: 8px; background: ${BRAND}18; color: ${BRAND}; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .mf-body { flex: 1; }
        .mf-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .mf-name { font-weight: 700; font-size: 15.5px; }
        .mf-email { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: #789; text-decoration: none; margin-top: 2px; }
        .mf-score { font-size: 18px; font-weight: 800; color: ${BRAND}; text-align: right; }
        .mf-score span { font-size: 11px; font-weight: 600; color: #aaa; display: block; }
        .mf-meta { display: flex; gap: 10px; margin: 8px 0; flex-wrap: wrap; }
        .mf-avail { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #789; }
        .mf-qual { font-size: 12px; color: #999; }
        .mf-reasons { margin: 6px 0 0; padding-left: 18px; font-size: 13px; color: #445; line-height: 1.5; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
