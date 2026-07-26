"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  priceId: string;
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS ?? "price_1Plus",
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "price_1Pro",
    highlight: true,
  },
];

export default function UpgradePage() {
  const { user, token } = useAuthStore();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentTier: Tier = (user?.subscriptionTier as Tier) ?? "FREE";

  const handleUpgrade = async (priceId: string) => {
    if (!token) return;
    setLoading(priceId);
    try {
      const res = await apiFetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId }),
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
                onClick={() => handleUpgrade(plan.priceId)}
                disabled={isCurrent || loading === plan.priceId}
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
                  : loading === plan.priceId
                  ? "Redirecting…"
                  : `Upgrade to ${plan.label}`}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
