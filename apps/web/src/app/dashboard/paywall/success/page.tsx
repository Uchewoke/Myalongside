"use client";

import Link from "next/link";

export default function PaywallSuccessPage() {
  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold text-emerald-700">Upgrade Successful</h1>
      <p className="text-stone-700">
        Your plan was updated successfully. Your new features are now available on your account.
      </p>
      <div className="pt-2">
        <Link
          href="/dashboard/paywall"
          className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-lg shadow"
        >
          Back to Billing
        </Link>
      </div>
    </div>
  );
}
