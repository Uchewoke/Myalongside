"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  Shield,
  Heart,
  Users,
  MessageCircle,
  CheckCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { LIFE_EVENTS } from "@/lib/constants";

const STATS = [
  { label: "Mentors Ready", value: "2,400+" },
  { label: "Conversations Started", value: "18,700+" },
  { label: "Life Events Covered", value: "40+" },
  { label: "Avg. Match Rating", value: "4.9 ★" },
];

const TESTIMONIALS = [
  {
    name: "Leah T.",
    event: "Divorce",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=LeahT&backgroundColor=ffd5dc",
    quote:
      "I found a mentor who had walked the exact same path — 12-year marriage, two kids, same age as me when it ended. Talking to her felt like finally being understood without having to explain everything.",
    matchedWith: "Mentor Sarah C.",
  },
  {
    name: "Jordan M.",
    event: "Job Loss",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanM&backgroundColor=c0aede",
    quote:
      "I was 47, just laid off, and terrified I'd never recover my career. My mentor had rebuilt from the exact same situation. Within 6 weeks of our conversations I had direction and confidence I hadn't felt in years.",
    matchedWith: "Mentor Marcus W.",
  },
  {
    name: "Amara D.",
    event: "Health Crisis",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AmaraD&backgroundColor=d1f2a5",
    quote:
      "When I got diagnosed, I felt utterly alone in a way that friends and family — no matter how loving — couldn't fix. My MyAlongside mentor was the only person who knew, without me having to explain, what I was actually feeling.",
    matchedWith: "Mentor Dr. Priya N.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Heart,
    title: "Share Your Story",
    description:
      "Tell us what life event you're navigating. Be as open or private as you like — there's no judgement here.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Get Matched",
    description:
      "We find mentors who have personally lived through the same challenge — not just studied it. Real experience, real empathy.",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Start Talking",
    description:
      "Connect via chat on your own schedule. You set the pace, the depth, and the frequency. Your mentor is there when you need them.",
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#1a1040]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              My<span className="text-gradient bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">Alongside</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#how-it-works" className="text-sm text-stone-300 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#life-events" className="text-sm text-stone-300 hover:text-white transition-colors">
              Life Events
            </Link>
            <Link href="#stories" className="text-sm text-stone-300 hover:text-white transition-colors">
              Stories
            </Link>
            <Link href="/login" className="text-sm text-stone-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm !px-5 !py-2.5">
              Get Matched Free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="text-stone-300 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#1a1040] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {["How It Works", "Life Events", "Stories"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-stone-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <hr className="border-white/10" />
              <Link href="/login" className="text-sm text-stone-300">Sign In</Link>
              <Link href="/signup" className="btn-primary text-center text-sm">
                Get Matched Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden bg-hero-gradient pt-20">
        {/* Background orbs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-violet-800/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
                Peer mentorship that truly understands
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                You don&apos;t have to face{" "}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-teal-400 bg-clip-text text-transparent">
                    life&apos;s hardest moments
                  </span>
                </span>{" "}
                alone.
              </h1>

              <p className="text-lg leading-relaxed text-stone-300 sm:text-xl">
                MyAlongside connects you with a mentor who has personally lived
                through the same challenge you&apos;re facing right now — not
                someone who studied it, but someone who{" "}
                <em className="text-white not-italic font-medium">survived it</em>.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" className="btn-primary text-base !px-7 !py-3.5 shadow-glow">
                  Find My Mentor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/signup?role=mentor" className="btn-secondary text-base !px-7 !py-3.5 !bg-white/5 !border-white/20 !text-stone-200 hover:!bg-white/10">
                  Become a Mentor
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { icon: Shield, text: "Safe & confidential" },
                  { icon: CheckCircle, text: "Verified mentors" },
                  { icon: Star, text: "Free to start" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-stone-400">
                    <Icon className="h-4 w-4 text-teal-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating match cards */}
            <div className="relative hidden lg:flex lg:justify-center">
              <div className="relative h-[500px] w-[420px]">
                {/* Main card */}
                <div className="absolute left-4 top-10 w-80 animate-float glass-card border-white/15 bg-white/8 p-5 shadow-2xl">
                  <div className="flex items-start gap-4">
                    <Image
                      src="https://api.dicebear.com/9.x/avataaars/svg?seed=SarahChen&backgroundColor=b6e3f4"
                      alt="Sarah Chen"
                      width={52}
                      height={52}
                      className="rounded-full bg-violet-100"
                      unoptimized
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">Sarah Chen</p>
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 border border-green-500/30">
                          Available
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-400">
                        💔 Divorce & Separation · ★ 4.9
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-300">
                        &ldquo;I went through divorce after 12 years. It became the catalyst for my greatest growth.&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white">
                      Connect with Sarah
                    </button>
                    <button className="rounded-lg border border-white/20 px-3 py-2 text-xs text-stone-300">
                      View Profile
                    </button>
                  </div>
                </div>

                {/* Match score badge */}
                <div className="absolute right-0 top-24 animate-float glass-card border-white/15 bg-white/8 px-4 py-3 shadow-xl" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-teal-500">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Match Score</p>
                      <p className="text-lg font-bold text-white">97%</p>
                    </div>
                  </div>
                </div>

                {/* Second mentor card */}
                <div className="absolute bottom-12 right-4 w-72 animate-float glass-card border-white/15 bg-white/8 p-4 shadow-xl" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusW&backgroundColor=c0aede"
                      alt="Marcus Williams"
                      width={40}
                      height={40}
                      className="rounded-full bg-violet-100"
                      unoptimized
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">Marcus Williams</p>
                      <p className="text-xs text-stone-400">💼 Job Loss · ★ 4.8 · 89 reviews</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-stone-300">
                    &ldquo;From redundancy to founder. I know every step of that road.&rdquo;
                  </p>
                </div>

                {/* Notification pill */}
                <div className="absolute left-0 bottom-32 animate-float glass-card border-white/15 bg-white/8 px-3 py-2 shadow-xl" style={{ animationDelay: "3s" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-stone-300">New mentor available for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-4">
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="section-label">Simple Process</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Finding your mentor takes minutes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-500">
              No long questionnaires. No waitlists. Just a meaningful match with
              someone who truly gets it.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative">
                {/* Connector line */}
                <div className="absolute left-full top-10 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-brand-200 to-transparent sm:block" style={{ width: "calc(100% - 80px)" }} />

                <div className="card group relative z-10 p-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="mb-2 text-xs font-bold text-brand-400">Step {step}</div>
                  <h3 className="text-xl font-bold text-stone-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Life Events ── */}
      <section id="life-events" className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="section-label">Life Events We Cover</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Whatever you&apos;re going through,{" "}
              <span className="text-gradient">we have mentors for it</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500">
              Our mentors have first-hand experience across 40+ life events.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {LIFE_EVENTS.map((event) => (
              <Link
                key={event.id}
                href={`/find-mentor?event=${event.id}`}
                className={`group card border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${event.color}`}
              >
                <div className="text-2xl">{event.emoji}</div>
                <h3 className="mt-3 text-sm font-semibold leading-tight">
                  {event.label}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed opacity-75">
                  {event.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80 group-hover:opacity-100">
                  Find mentors
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="stories" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="section-label">Real Stories</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              The moment someone truly understood
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card group space-y-5 p-8">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4" fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-stone-600 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full bg-stone-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                    <p className="text-xs text-stone-400">
                      {t.event} · {t.matchedWith}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-violet-300">
            <Users className="h-3.5 w-3.5" />
            Join 18,700+ people finding support
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Your mentor is waiting for you.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-stone-300">
            It&apos;s free to start. No credit card. Just a conversation with
            someone who has walked your path.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-primary !text-base !px-8 !py-4 shadow-glow">
              Get Matched — It&apos;s Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/signup?role=mentor" className="btn-secondary !text-base !px-8 !py-4 !bg-white/5 !border-white/20 !text-stone-200 hover:!bg-white/10">
              Share Your Story as a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-950 px-4 py-12 text-stone-400 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                  <Heart className="h-4 w-4 text-white" fill="currentColor" />
                </div>
                <span className="text-lg font-bold text-white">MyAlongside</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed">
                Peer mentorship for life&apos;s hardest moments. Connect with
                someone who truly understands.
              </p>
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold text-stone-300">Platform</p>
              <div className="flex flex-col gap-2 text-sm">
                {["Find a Mentor", "Become a Mentor", "Life Events", "Community"].map((l) => (
                  <Link key={l} href="#" className="hover:text-stone-200 transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold text-stone-300">Company</p>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { label: "About", href: "/company/about" },
                  { label: "Blog", href: "/company/blog" },
                  { label: "Careers", href: "/company/careers" },
                  { label: "Press", href: "/company/press" },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} className="hover:text-stone-200 transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold text-stone-300">Legal</p>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Terms of Service", href: "/legal/terms" },
                  { label: "Community Guidelines", href: "/legal/community-guidelines" },
                  { label: "Safety", href: "/legal/safety" },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} className="hover:text-stone-200 transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-xs">
            <p>© 2026 MyAlongside Inc. · Made with ❤️ for those walking hard roads.</p>
            <p className="mt-2 text-stone-600">
              MyAlongside is a peer support platform and not a substitute for professional mental health care. If you&apos;re in crisis, please call 988 (US) or your local emergency services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
