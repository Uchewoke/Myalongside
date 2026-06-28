import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Users, ShieldCheck, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About — MyAlongside",
  description: "We believe no one should face life's hardest moments alone. Learn about the people and mission behind MyAlongside.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Empathy over advice",
    description:
      "We believe lived experience is the most powerful form of understanding. Our platform connects people based on shared journeys, not credentials.",
  },
  {
    icon: ShieldCheck,
    title: "Safety first",
    description:
      "Every design decision is made with user safety in mind — from anonymous mode to our 24/7 safeguarding team and crisis resources.",
  },
  {
    icon: Users,
    title: "Community as medicine",
    description:
      "Peer connection reduces isolation. Our research shows that just one meaningful conversation with someone who 'gets it' measurably improves wellbeing.",
  },
  {
    icon: Globe,
    title: "Radical inclusion",
    description:
      "Life's hard moments don't discriminate. We build for everyone — regardless of background, language, income, or geography.",
  },
];

const TEAM = [
  {
    name: "Amara Osei",
    role: "Co-founder & CEO",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AmaraO&backgroundColor=b6e3f4",
    bio: "Lost her father at 19, navigated grief without the right support. Built MyAlongside so no one else has to.",
  },
  {
    name: "Daniel Park",
    role: "Co-founder & CTO",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DanielP&backgroundColor=c0aede",
    bio: "Survived burnout and a mental health crisis in his late 20s. Believes technology should make human connection easier, not harder.",
  },
  {
    name: "Sasha Mbeki",
    role: "Head of Safety & Safeguarding",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SashaM&backgroundColor=d1f2a5",
    bio: "15 years in crisis intervention and community mental health. Leads our safeguarding framework and mentor training.",
  },
  {
    name: "Priya Iyer",
    role: "Head of Community",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PriyaI&backgroundColor=ffdfba",
    bio: "Former Samaritans volunteer and community builder. Oversees mentor quality, community health, and seeker experience.",
  },
];

const MILESTONES = [
  { year: "2023", event: "Founded after Amara and Daniel meet at a grief support group." },
  { year: "2024", event: "Launched private beta with 50 mentors and 200 seekers across the UK." },
  { year: "2025", event: "Raised seed funding. Expanded to the US and Canada. 5,000 matched pairs." },
  { year: "2026", event: "2,400+ active members. Launched community features and AI-powered matching." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient px-6 py-24 text-center">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-teal-300">Our Story</p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            You don&apos;t have to face it alone
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75 leading-relaxed">
            MyAlongside exists because the people who helped us most through our hardest moments
            weren&apos;t professionals — they were people who had been there.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="section-label">Our Mission</p>
        <h2 className="mt-3 text-3xl font-bold text-stone-900">
          Connecting lived experience with lived need
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600 leading-relaxed">
          We match people navigating life&apos;s hardest chapters — divorce, job loss, grief, health crises,
          new parenthood — with mentors who have walked the same road. Not professionals. Real people,
          with real stories, who turned their pain into purpose.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="btn-primary">Join as a Seeker</Link>
          <Link href="/signup?role=mentor" className="btn-secondary">Become a Mentor</Link>
        </div>
      </section>

      {/* Values */}
      <section className="bg-stone-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="section-label text-center">What We Believe</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900">Our values</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="section-label text-center">Our Journey</p>
        <h2 className="mt-3 text-center text-3xl font-bold text-stone-900">How we got here</h2>
        <div className="mt-12 space-y-0">
          {MILESTONES.map(({ year, event }, i) => (
            <div key={year} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {year.slice(2)}
                </div>
                {i < MILESTONES.length - 1 && <div className="w-0.5 flex-1 bg-brand-100 my-1" />}
              </div>
              <div className="pb-10">
                <p className="text-xs font-semibold text-brand-600 mb-1">{year}</p>
                <p className="text-stone-700 leading-relaxed">{event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-stone-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="section-label text-center">The People</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900">Meet the team</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(({ name, role, avatar, bio }) => (
              <div key={name} className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={name} width={80} height={80} className="rounded-2xl bg-stone-100" />
                <h3 className="mt-4 font-bold text-stone-900">{name}</h3>
                <p className="text-sm font-medium text-brand-600">{role}</p>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
          {[
            { value: "2,400+", label: "Active members" },
            { value: "847", label: "Verified mentors" },
            { value: "12k+", label: "Conversations" },
            { value: "94%", label: "Feel less alone" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-bold text-brand-600">{value}</p>
              <p className="mt-1 text-sm text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to find your alongside?</h2>
        <p className="mx-auto mt-4 max-w-md text-white/75">
          Join thousands of people who have already found support from someone who truly gets it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-stone-50 transition-colors">
            Get started — it&apos;s free
          </Link>
        </div>
      </section>
    </div>
  );
}
