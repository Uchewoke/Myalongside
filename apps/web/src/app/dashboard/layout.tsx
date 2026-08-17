"use client";

import Sidebar from "@/components/Sidebar";
import { Bell, Menu, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { getPublicProfile } from "@/lib/public-profile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
          {/* Mobile menu trigger */}
          <button
            className="mr-3 rounded-xl p-2 text-stone-500 hover:bg-stone-100 transition-colors md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative hidden w-72 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Search mentors, topics…"
              className="input-field !py-2 pl-9 text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Notifications */}
            <button className="relative rounded-xl p-2 text-stone-500 hover:bg-stone-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
              <Image
                src={publicUser.avatar}
                alt={publicUser.displayName}
                width={36}
                height={36}
                className="rounded-full bg-stone-100"
                unoptimized
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-stone-800 leading-tight">{publicUser.displayName}</p>
                <p className="text-xs text-stone-400">Seeker</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
