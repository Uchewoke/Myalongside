import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { MatchFinder } from "@/components/MatchFinder";

export default async function MarketingMatchPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 md:p-10">
      <header className="max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Marketing</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">Match finder</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Pick a life event a mentee is navigating to see ranked, qualified mentors.
        </p>
      </header>
      <div className="mt-8 max-w-3xl">
        <MatchFinder />
      </div>
    </main>
  );
}
