"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";

// Matches the SubscriptionTier enum in schema.prisma (FREE/PLUS/PRO — the
// mid tier was renamed PREMIUM -> PLUS in migration 20260610100000).
// "Pro" and "Premium" below are just display labels for PLUS and PRO.
type Tier = "FREE" | "PLUS" | "PRO";

interface Plan {
  name: "PLUS" | "PRO";
  label: string;
  price: string;
  monthlyPrice: number;
  features: string[];
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "PLUS",
    label: "Pro",
    price: "$19.99/mo",
    monthlyPrice: 19.99,
    features: [
      "Live Mentor Sessions",
      "All Communities",
      "Unlimited Connections",
      "Priority Matching",
      "Advanced Analytics",
      "Mood Trend Insights",
    ],
    highlight: false,
  },
  {
    name: "PRO",
    label: "Premium",
    price: "$29.99/mo",
    monthlyPrice: 29.99,
    features: [
      "Everything in Pro",
      "Priority Live Mentor Access",
      "Verified Mentor Badge",
      "Custom Communities",
      "API Access",
      "Dedicated Priority Support",
    ],
    highlight: true,
  },
];

export default function PaywallPage() {
  const { user, token } = useAuthStore();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const currentTier: Tier = (user?.subscriptionTier as Tier) ?? "FREE";
  const liveEventPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_LIVE_EVENT ?? "";

  const handleUpgrade = async (plan: "PLUS" | "PRO") => {
    if (!token) return;
    setLoading(plan);
    try {
      const res = await apiFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (!token) return;
    setPortalLoading(true);
    try {
      const res = await apiFetch("/api/stripe/portal/create-customer-portal-session", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

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

  const tierLabel: Record<Tier, string> = {
    FREE: "Free",
    PLUS: "Pro",
    PRO: "Premium",
  };

  return (
    <div className="max-w-4xl mx-auto py-14 px-4 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-stone-900">Choose your plan</h1>
        <p className="text-stone-500 text-lg">
          Unlock more tools to make every mentorship conversation count.
        </p>
      </div>

      {canceled && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm text-center">
          Checkout was canceled. You have not been charged.
        </div>
      )}

      {/* Current plan */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-stone-500">Current plan</p>
          <p className="text-xl font-semibold text-stone-800">{tierLabel[currentTier]}</p>
        </div>
        {currentTier !== "FREE" && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="text-sm bg-white border border-stone-300 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-50 disabled:opacity-50"
          >
            {portalLoading ? "Loading…" : "Manage Billing"}
          </button>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free tier card */}
        <div className="border border-stone-200 rounded-2xl p-6 flex flex-col gap-4 bg-white">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">Free</p>
            <p className="text-3xl font-bold text-stone-900 mt-1">$0</p>
            <p className="text-sm text-stone-500 mt-0.5">forever</p>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 flex-1">
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Basic chat &amp; matching</li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Live Mentor (limited access)</li>
          </ul>
          <div className="h-10 flex items-center">
            {currentTier === "FREE" && (
              <span className="text-sm text-stone-400 font-medium">Current plan</span>
            )}
          </div>
        </div>

        {/* Paid plan cards */}
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.name;
          return (
            <div
              key={plan.name}
              className={`relative border rounded-2xl p-6 flex flex-col gap-4 ${
                plan.highlight
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg"
                  : "border-stone-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
                  {plan.label}
                </p>
                <p className="text-3xl font-bold text-stone-900 mt-1">{plan.price}</p>
              </div>
              <ul className="space-y-2 text-sm text-stone-600 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={isCurrent || loading === plan.name}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                  isCurrent
                    ? "bg-stone-100 text-stone-400 cursor-default"
                    : plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-stone-900 text-white hover:bg-stone-700"
                } disabled:opacity-60`}
              >
                {isCurrent
                  ? "Current plan"
                  : loading === plan.name
                  ? "Redirecting…"
                  : `Upgrade to ${plan.label}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Live Event Access trial */}
      <div className="rounded-2xl bg-brand-gradient p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Live Event Access</p>
        <h2 className="mt-2 text-3xl font-bold">Unlock every Live Event</h2>
        <p className="mt-2 text-sm text-white/85">
          Start your 7-day free trial and join every event hosted by mentors with lived experience.
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
          <p className="mt-3 text-sm text-stone-600">7-day free trial</p>
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
            {isStartingTrial ? "Redirecting..." : "Start 7-day trial"} <ArrowRight className="h-4 w-4" />
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
