"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email?: string;
  };
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/reports", label: "Reports" },
  { href: "/users", label: "Users" },
  { href: "/marketing/leads", label: "Mentor Leads" },
  { href: "/marketing/match", label: "Match Finder" },
  { href: "/marketing/team", label: "AI Marketing Team" },
];

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(241,245,249,0.9)_42%,_rgba(226,232,240,0.95)_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <aside className="lg:w-72">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">MyAlongside</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">Admin Console</h1>
              <p className="mt-2 text-sm text-slate-600">Moderation, operations, and support tooling for the platform team.</p>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-slate-300"}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Signed in</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="mt-1 text-sm text-slate-600">{user.email ?? "Admin account"}</p>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isPending}
                className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}