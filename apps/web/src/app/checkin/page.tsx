"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CheckIn,
  MoodTrendsResult,
  fetchCheckIns,
  submitCheckIn,
  fetchMoodTrends,
} from "@/lib/checkins";

const MOOD_OPTIONS = [
  { score: 1, emoji: "😞", label: "Struggling" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

export default function CheckInPage() {
  const { token } = useAuthStore();

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [trends, setTrends] = useState<MoodTrendsResult | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const loadCheckIns = useCallback(async () => {
    if (!token) return;
    const data = await fetchCheckIns();
    setCheckIns(data.checkIns);
  }, [token]);

  const loadTrends = useCallback(async () => {
    if (!token) return;
    setTrendsLoading(true);
    setTrendsError(null);
    try {
      setTrends(await fetchMoodTrends());
    } catch {
      setTrendsError("Couldn't load mood trends.");
    } finally {
      setTrendsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCheckIns();
    loadTrends();
  }, [loadCheckIns, loadTrends]);

  const handleSubmitCheckIn = async () => {
    if (!token || selectedMood === null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCheckIn(selectedMood, note);
      setSelectedMood(null);
      setNote("");
      await loadCheckIns();
      // Refresh derived insights now that there's new data.
      loadTrends();
    } catch {
      setSubmitError("Couldn't save check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Check in with yourself</h1>
        <p className="text-stone-500">Sign in to log mood check-ins and track your trends.</p>
        <Link
          href="/login"
          className="inline-block bg-brand-gradient text-white px-5 py-2.5 rounded-lg shadow"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Check in with yourself</h1>
        <p className="text-stone-500 mt-1">Log your mood and track your trends over time.</p>
      </div>

      {/* Mood check-in form */}
      <div className="card p-6 space-y-4">
        <p className="font-semibold text-stone-800">How are you doing today?</p>
        <div className="flex justify-between gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.score}
              onClick={() => setSelectedMood(opt.score)}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl border py-3 transition ${
                selectedMood === opt.score
                  ? "border-brand-600 bg-brand-50"
                  : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs text-stone-500">{opt.label}</span>
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything on your mind? (optional)"
          className="input-field w-full text-sm"
          rows={3}
          maxLength={2000}
        />
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <button
          onClick={handleSubmitCheckIn}
          disabled={selectedMood === null || submitting}
          className="w-full bg-brand-gradient text-white py-2.5 rounded-xl font-semibold disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save check-in"}
        </button>

        {checkIns.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-stone-100">
            <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">Recent</p>
            {checkIns.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm text-stone-600">
                <span>{MOOD_OPTIONS.find((o) => o.score === c.moodScore)?.emoji}</span>
                <span className="flex-1">{c.note || <span className="text-stone-400">No note</span>}</span>
                <span className="text-xs text-stone-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mood Trends */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold text-stone-800">Mood trends</h2>
        </div>
        {trendsLoading && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
        {trendsError && <p className="text-sm text-red-600">{trendsError}</p>}
        {!trendsLoading && trends && (
          <div className="space-y-3">
            {trends.points.length === 0 ? (
              <p className="text-sm text-stone-500">Log a few check-ins to see your trend.</p>
            ) : (
              <>
                <div className="flex items-end gap-1 h-24">
                  {trends.points.slice(-30).map((p, i) => (
                    <div
                      key={i}
                      title={`${p.date}: ${p.moodScore}/5`}
                      className="flex-1 bg-brand-200 rounded-t"
                      style={{ height: `${(p.moodScore / 5) * 100}%` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-600">
                  Average mood: {trends.average?.toFixed(1)}/5 — trend is{" "}
                  <span className="font-semibold">{trends.direction}</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
