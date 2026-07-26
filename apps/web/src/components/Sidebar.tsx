"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Heart,
  User,
  LogOut,
  Settings,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { signOut } from "@/lib/api-client";
import { getPublicProfile } from "@/lib/public-profile";

const SEEKER_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/find-mentor", icon: Users, label: "Find a Mentor" },
  { href: "/chat", icon: MessageCircle, label: "Messages", badge: 2 },
  { href: "/checkin", icon: Sparkles, label: "Check-In" },
  { href: "/community", icon: BookOpen, label: "Community" },
  { href: "/profile", icon: User, label: "My Profile" },
  { href: "/upgrade", icon: CreditCard, label: "Upgrade" },
];

const MENTOR_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageCircle, label: "Messages", badge: 2 },
  { href: "/community", icon: BookOpen, label: "Community" },
  { href: "/profile", icon: User, label: "Mentor Profile" },
  { href: "/upgrade", icon: CreditCard, label: "Upgrade" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);
  const navItems = user.role === "MENTOR" ? MENTOR_NAV_ITEMS : SEEKER_NAV_ITEMS;
  const settingsLabel = user.role === "MENTOR" ? "Mentor Settings" : "Seeker Settings";

  return (
    <aside
      className={clsx(
        "relative flex flex-col border-r border-stone-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-stone-100 px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-base font-bold text-stone-900">
              My<span className="text-brand-600">Alongside</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
            <Heart className="h-4 w-4 text-white" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Navigation
          </p>
        )}
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                "sidebar-link relative",
                isActive && "sidebar-link-active",
                collapsed && "justify-center !px-2"
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0 h-[18px] w-[18px]" />
              {!collapsed && <span>{label}</span>}
              {badge && badge > 0 && (
                <span
                  className={clsx(
                    "flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white",
                    collapsed ? "absolute -right-0.5 -top-0.5" : "ml-auto"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-stone-100 p-3">
        <Link
          href="/settings"
          title={collapsed ? settingsLabel : undefined}
          className={clsx(
            "sidebar-link",
            pathname.startsWith("/settings") && "sidebar-link-active",
            collapsed && "justify-center !px-2"
          )}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>{settingsLabel}</span>}
        </Link>

        <button
          className={clsx("sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-700", collapsed && "justify-center !px-2")}
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await signOut();
            router.push("/login");
          }}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User card */}
        {!collapsed && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-stone-50 p-3">
            <Image
              src={publicUser.avatar}
              alt={publicUser.displayName}
              width={36}
              height={36}
              className="rounded-full bg-stone-200"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{publicUser.displayName}</p>
              <p className="truncate text-xs text-stone-400 capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
            <Bell className="h-4 w-4 flex-shrink-0 text-stone-400" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm hover:bg-stone-50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-stone-500" />
        )}
      </button>
    </aside>
  );
}
