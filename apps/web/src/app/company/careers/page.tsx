import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Briefcase, Heart, Zap, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — MyAlongside",
  description: "Help us build a world where no one faces life's hardest moments alone. Join the MyAlongside team.",
};

const PERKS = [
  { icon: Heart, title: "Mission-driven work", description: "Every line of code, every design decision, every support ticket directly helps people through the hardest moments of their lives." },
  { icon: Zap, title: "Async-first culture", description: "We're a remote team across the UK, US, and West Africa. We optimise for deep work and intentional collaboration, not meetings." },
  { icon: Users, title: "Competitive pay & equity", description: "Transparent salary bands, meaningful equity, and annual reviews benchmarked to market." },
  { icon: ShieldCheck, title: "Mental health budget", description: "£1,500/year for therapy, coaching, or whatever supports your mental health. We mean it — this is used, not just listed." },
];

const JOBS = [
  {
    id: "swe-backend",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote (UK/EU)",
    type: "Full-time",
    salary: "£90k – £115k",
    description:
      "Own the data and API layer that powers connections between seekers and mentors. You'll work across Postgres, Prisma, Node.js, and our matching algorithms.",
    tags: ["Node.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
  {
    id: "swe-frontend",
    title: "Product Engineer (Frontend)",
    department: "Engineering",
    location: "Remote (UK/EU/US)",
    type: "Full-time",
    salary: "£80k – £105k",
    description:
      "Build the interfaces that seekers and mentors use every day. React, Next.js, and Tailwind in a monorepo. Strong eye for UX required.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "trust-safety",
    title: "Trust & Safety Specialist",
    department: "Safety",
    location: "Remote (UK)",
    type: "Full-time",
    salary: "£45k – £60k",
    description:
      "Review reports, investigate patterns, and make judgment calls on difficult content moderation cases. You'll work closely with Sasha and our safeguarding framework.",
    tags: ["Content Moderation", "Safeguarding", "Mental Health"],
  },
  {
    id: "community-manager",
    title: "Community Manager",
    department: "Community",
    location: "Remote (UK/US)",
    type: "Full-time",
    salary: "£40k – £55k",
    description:
      "Cultivate our mentor community, run onboarding sessions, create training resources, and be the first point of contact for mentor concerns.",
    tags: ["Community Building", "Mentorship", "Training"],
  },
  {
    id: "growth",
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    salary: "£55k – £75k",
    description:
      "Own our acquisition strategy across SEO, partnerships, and social. We're a word-of-mouth company — your job is to give people the language to share us.",
    tags: ["SEO", "Partnerships", "Content", "Analytics"],
  },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-brand-100 text-brand-700",
  Safety: "bg-rose-100 text-rose-700",
  Community: "bg-teal-100 text-teal-700",
  Marketing: "bg-orange-100 text-orange-700",
};

export default function CareersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient px-6 py-24 text-center">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-teal-300">Join the team</p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Build something that truly matters
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75 leading-relaxed">
            We&apos;re a small team with an ambitious mission — connecting lived experience with lived need,
            at scale. Come help us do it.
          </p>
          <a href="#open-roles" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow hover:bg-stone-50 transition-colors">
            See open roles
          </a>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="section-label text-center">Why MyAlongside</p>
        <h2 className="mt-3 text-center text-3xl font-bold text-stone-900">More than a job</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section id="open-roles" className="bg-stone-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="section-label text-center">Open Roles</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900">
            {JOBS.length} positions available
          </h2>
          <div className="mt-12 space-y-4">
            {JOBS.map((job) => (
              <div key={job.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DEPT_COLORS[job.department] ?? "bg-stone-100 text-stone-600"}`}>
                        {job.department}
                      </span>
                      <span className="text-xs text-stone-400">{job.salary}</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">{job.title}</h3>
                    <p className="mt-1 text-sm text-stone-500 leading-relaxed">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.department}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={`mailto:careers@myalongside.com?subject=Application: ${job.title}`}
                      className="btn-primary !px-4 !py-2 !text-sm whitespace-nowrap"
                    >
                      Apply now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No perfect fit */}
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="font-semibold text-stone-800">Don&apos;t see a perfect fit?</p>
            <p className="mt-2 text-sm text-stone-500">
              We hire for mission-alignment as much as skills. Send us a short note about who you are and what you&apos;d build.
            </p>
            <a
              href="mailto:careers@myalongside.com?subject=Speculative application"
              className="mt-4 inline-flex btn-secondary !px-4 !py-2 !text-sm"
            >
              Send a speculative application
            </a>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="section-label">The Process</p>
        <h2 className="mt-3 text-3xl font-bold text-stone-900">Simple, human, honest</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-4 text-left">
          {[
            { step: "01", title: "Apply", desc: "Send your CV and a short paragraph on why MyAlongside." },
            { step: "02", title: "Intro call", desc: "30 min with a team member — no tricks, just a conversation." },
            { step: "03", title: "Task / portfolio", desc: "A short, paid task relevant to the role. Max 3 hours." },
            { step: "04", title: "Final chat", desc: "Meet the team. Ask us anything. We decide together." },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <p className="text-3xl font-bold text-brand-100">{step}</p>
              <p className="mt-1 font-bold text-stone-900">{title}</p>
              <p className="mt-1 text-sm text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
