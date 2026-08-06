"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import { useAuthStore, toAuthUser } from "@/store/useAuthStore";

export default function OAuthCallbackClient({ code }: { code: string | null }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("Missing sign-in code. Please try again.");
      return;
    }

    (async () => {
      try {
        const exchangeRes = await fetch(`${API_BASE}/api/auth/oauth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const tokens = await exchangeRes.json();
        if (!exchangeRes.ok) {
          const fallbackMessage = "Couldn't complete sign-in.";
          if (exchangeRes.status === 401) {
            throw new Error(
              "This sign-in link is invalid or has expired. Please start a new sign-in."
            );
          }
          if (exchangeRes.status === 400) {
            throw new Error(tokens.error ?? "Missing sign-in code. Please start again.");
          }
          throw new Error(tokens.error ?? fallbackMessage);
        }

        const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        const profileBody = await profileRes.json();
        if (!profileRes.ok) {
          throw new Error(profileBody.error ?? "Couldn't load your profile.");
        }

        login(toAuthUser(profileBody.user), tokens.accessToken, tokens.refreshToken);
        router.replace("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't complete sign-in.");
      }
    })();
  }, [code, router, login]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-stone-600">{error}</p>
        <Link href="/login" className="btn-primary">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm text-stone-500">Signing you in…</p>
    </div>
  );
}