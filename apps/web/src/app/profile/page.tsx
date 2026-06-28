"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin, Languages, Edit3, Calendar } from "lucide-react";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { getPublicProfile } from "@/lib/public-profile";
import { LIFE_EVENTS } from "@/lib/constants";
import { clsx } from "clsx";

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);

  const lifeEvents = (user.lifeEvents ?? [])
    .map((id) => LIFE_EVENTS.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
        <Link href="/settings" className="btn-secondary flex items-center gap-2 !text-sm !px-4 !py-2">
          <Edit3 className="h-4 w-4" /> Edit Profile
        </Link>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <Image
              src={publicUser.avatar}
              alt={publicUser.displayName}
              width={80}
              height={80}
              className="rounded-2xl bg-stone-100"
              unoptimized
            />
            {!publicUser.isAnonymous && (
              <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-600">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-stone-900">{publicUser.displayName}</h2>
            <span
              className={clsx(
                "mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold",
                user.role === "MENTOR" ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"
              )}
            >
              {user.role === "MENTOR" ? "Mentor" : "Seeker"}
            </span>
            {(user as { tagline?: string }).tagline && (
              <p className="mt-3 text-sm italic text-stone-600 border-l-2 border-brand-300 pl-3">
                &ldquo;{(user as { tagline?: string }).tagline}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <MapPin className="h-4 w-4 flex-shrink-0 text-stone-400" />
              {user.location}
            </div>
          )}
          {user.languages && user.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Languages className="h-4 w-4 flex-shrink-0 text-stone-400" />
              {user.languages.join(", ")}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="h-4 w-4 flex-shrink-0 text-stone-400" />
            Member since June 2026
          </div>
        </div>
      </div>

      {/* Life events */}
      {lifeEvents.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-stone-900 mb-3">My Life Journey</h3>
          <div className="flex flex-wrap gap-2">
            {lifeEvents.map(
              (event) =>
                event && (
                  <span key={event.id} className={clsx("badge border text-sm", event.color)}>
                    {event.emoji} {event.label}
                  </span>
                )
            )}
          </div>
        </div>
      )}

      {/* Privacy summary */}
      <div className="card p-6">
        <h3 className="font-semibold text-stone-900 mb-1">Privacy</h3>
        <p className="text-sm text-stone-500 mb-4">Control how your profile appears to others.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-700">Anonymous mode</span>
            <span
              className={clsx(
                "text-xs font-medium rounded-full px-2.5 py-1",
                user.settings?.general?.anonymousMode
                  ? "bg-amber-100 text-amber-700"
                  : "bg-stone-100 text-stone-500"
              )}
            >
              {user.settings?.general?.anonymousMode ? "On" : "Off"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-700">Community profile</span>
            <span
              className={clsx(
                "text-xs font-medium rounded-full px-2.5 py-1",
                user.settings?.general?.allowCommunityProfile
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-stone-100 text-stone-500"
              )}
            >
              {user.settings?.general?.allowCommunityProfile ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
        <Link href="/settings" className="mt-4 inline-flex items-center text-sm text-brand-600 hover:underline">
          Manage in Settings →
        </Link>
      </div>
    </div>
  );
}
