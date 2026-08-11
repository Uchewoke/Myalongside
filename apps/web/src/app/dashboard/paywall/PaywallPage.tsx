"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";

export default function PaywallPage() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const liveEventPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_LIVE_EVENT ?? "";

  const handleStartTrial = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!liveEventPriceId) return;

    setIsStartingTrial(true);
    try {
      const res = await apiFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ plan: "LIVE_EVENT" }),
      });

      if (!res.ok) {
        return;
      }

      const data: { url?: string } = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-14 px-4 space-y-10">
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm text-center">
          Checkout was canceled. You have not been charged.
        </div>
      )}

      {/* Live Event Access trial */}
      <div className="rounded-2xl bg-brand-gradient p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Live Event Access</p>
        <h2 className="mt-2 text-3xl font-bold">Unlock every Live Event</h2>
        <p className="mt-2 text-sm text-white/85">
          Start your 30-day free trial and join every event hosted by mentors with lived experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-stone-900">
            <CalendarDays className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold">What you get</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>Unlimited access to all live mentor events</li>
            <li>Priority seat reservation for high-demand sessions</li>
            <li>Event replays and downloadable resources</li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Pricing</h3>
          </div>
          <p className="mt-3 text-sm text-stone-600">30-day free trial</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">$5.99<span className="text-base font-medium text-stone-500">/month</span></p>
          <p className="mt-2 text-xs text-stone-500">Cancel anytime during trial. No commitment.</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">Ready to unlock Live Events?</p>
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={!liveEventPriceId || isStartingTrial}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            {isStartingTrial ? "Redirecting..." : "Start 30-day trial"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {!liveEventPriceId && (
          <p className="mt-3 text-xs text-amber-700">
            Missing NEXT_PUBLIC_STRIPE_PRICE_LIVE_EVENT. Add it to your env to enable checkout.
          </p>
        )}
      </div>
    </div>
  );
}
