import { apiFetch } from "@/lib/api-client";

export interface CheckIn {
  id: string;
  moodScore: number;
  note: string | null;
  createdAt: string;
}

export interface CheckInsResponse {
  checkIns: CheckIn[];
  weeklyLimit: number | null;
  usedThisWeek: number | null;
}

export interface MoodTrendsResult {
  points: Array<{ date: string; moodScore: number }>;
  average: number | null;
  direction: "improving" | "steady" | "declining" | "insufficient-data";
}

export class PaywallError extends Error {
  feature: string;
  constructor(message: string, feature: string) {
    super(message);
    this.feature = feature;
  }
}

async function checkInFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(`/api/checkins${path}`, init);

  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    throw new PaywallError(body.error ?? "This feature requires an upgraded plan.", body.feature ?? "unknown");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  return res.json();
}

export function fetchCheckIns(limit = 30): Promise<CheckInsResponse> {
  return checkInFetch(`?limit=${limit}`);
}

export function submitCheckIn(moodScore: number, note?: string): Promise<CheckIn> {
  return checkInFetch("", {
    method: "POST",
    body: JSON.stringify({ moodScore, note: note || undefined }),
  });
}

export function fetchMoodTrends(): Promise<MoodTrendsResult> {
  return checkInFetch("/mood-trends");
}
