"use client";

import { useMemo } from "react";

const reports = [
  {
    id: "rep_101",
    against: "u_88",
    reporter: "u_14",
    reason: "Harassment",
    details: "Repeated hostile messages, pressure to respond immediately, and insulting language after boundaries were set.",
    status: "OPEN",
    priority: "HIGH",
    createdAt: "2025-03-10",
  },
  {
    id: "rep_102",
    against: "u_19",
    reporter: "u_32",
    reason: "Unsafe Advice",
    details: "Mentor pushed the seeker to stop medication and ignore their care team during a stress-related crisis.",
    status: "REVIEWING",
    priority: "MEDIUM",
    createdAt: "2025-03-11",
  },
  {
    id: "rep_103",
    against: "u_42",
    reporter: "u_07",
    reason: "Spam",
    details: "Unsolicited repetitive outreach across multiple conversations with promotional content.",
    status: "RESOLVED",
    priority: "LOW",
    createdAt: "2025-03-11",
  },
];

export default function AdminReportsPage() {
  const reportCount = useMemo(() => reports.length, []);
  const openCount = useMemo(() => reports.filter((r) => r.status === "OPEN").length, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-8 md:p-10">
      <header className="max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">Safety</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">Moderation reports</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Review incidents and route them to a human moderator.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Reports in queue</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{reportCount}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Open</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{openCount}</p>
        </article>
      </section>

      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{report.id}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{report.reason}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Reporter {report.reporter} flagged {report.against} · {report.status} · {report.createdAt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{report.status}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    report.priority === "HIGH"
                      ? "bg-rose-100 text-rose-700"
                      : report.priority === "MEDIUM"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {report.priority}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-700">{report.details}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
