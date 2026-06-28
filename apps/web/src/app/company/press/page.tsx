import type { Metadata } from "next";
import { Download, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Press — MyAlongside",
  description: "Media kit, press releases, and coverage for MyAlongside. Contact us at press@myalongside.com.",
};

const PRESS_COVERAGE = [
  {
    publication: "The Guardian",
    logo: "TG",
    color: "bg-[#052962] text-white",
    title: "The peer support apps trying to fill the mental health gap",
    excerpt: "\"MyAlongside fills a gap that neither therapy nor social media can — it connects people with shared experience, not just shared hashtags.\"",
    date: "March 2026",
    url: "#",
  },
  {
    publication: "TechCrunch",
    logo: "TC",
    color: "bg-[#0a7d3e] text-white",
    title: "MyAlongside raises £2.5m seed to scale peer mentorship platform",
    excerpt: "The London-based startup has matched over 5,000 pairs of seekers and mentors since launching its private beta in 2024.",
    date: "January 2026",
    url: "#",
  },
  {
    publication: "Wired UK",
    logo: "W",
    color: "bg-stone-900 text-white",
    title: "Can lived experience replace professional therapy?",
    excerpt: "MyAlongside co-founder Amara Osei argues the mental health crisis can't be solved by adding more therapists — we need to activate the wisdom already in communities.",
    date: "November 2025",
    url: "#",
  },
  {
    publication: "BBC News",
    logo: "BBC",
    color: "bg-[#bb1919] text-white",
    title: "New app pairs grief sufferers with mentors who've 'been there'",
    excerpt: "The platform has seen a 340% increase in registrations since its UK public launch, with grief and divorce the most common life events cited.",
    date: "September 2025",
    url: "#",
  },
  {
    publication: "Forbes",
    logo: "F",
    color: "bg-stone-800 text-white",
    title: "30 Under 30: Social Entrepreneurs 2025",
    excerpt: "Amara Osei and Daniel Park named in Forbes' Social Entrepreneurs category for their work building MyAlongside.",
    date: "August 2025",
    url: "#",
  },
  {
    publication: "Stylist",
    logo: "S",
    color: "bg-violet-700 text-white",
    title: "Meet the people turning their worst experiences into a lifeline for others",
    excerpt: "Feature on MyAlongside mentors — the people who've walked the hardest roads and come back to guide others.",
    date: "June 2025",
    url: "#",
  },
];

const PRESS_RELEASES = [
  {
    title: "MyAlongside launches community features and video mentoring",
    date: "15 June 2026",
    summary: "New community forums, group creation, and Jitsi-powered video calls now available to all members.",
  },
  {
    title: "MyAlongside crosses 2,400 active members milestone",
    date: "1 May 2026",
    summary: "Platform reports 94% of members feel less alone after first mentor connection.",
  },
  {
    title: "MyAlongside raises £2.5m seed round led by Kindred Capital",
    date: "10 January 2026",
    summary: "Funding will be used to expand the engineering team, grow into the US market, and develop AI-powered mentor matching.",
  },
  {
    title: "MyAlongside launches publicly in the UK",
    date: "1 September 2025",
    summary: "After a 12-month private beta with 50 mentors and 200 seekers, MyAlongside opens its doors to the public.",
  },
];

export default function PressPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-b border-stone-100 bg-stone-50 px-6 py-16 text-center">
        <p className="section-label">Press Room</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">MyAlongside in the media</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          For press enquiries, interviews, or media kit requests, contact us at{" "}
          <a href="mailto:press@myalongside.com" className="text-brand-600 hover:underline font-medium">
            press@myalongside.com
          </a>
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">

        {/* Key facts */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">At a glance</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "2023", label: "Founded" },
              { value: "2,400+", label: "Members" },
              { value: "847", label: "Mentors" },
              { value: "UK, US, CA", label: "Markets" },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-card">
                <p className="text-2xl font-bold text-brand-600">{value}</p>
                <p className="mt-1 text-xs text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Media kit */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">Media Kit</p>
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
            <h2 className="text-xl font-bold text-stone-900 mb-1">Download our media kit</h2>
            <p className="text-sm text-stone-500 mb-6">
              Contains logos (SVG, PNG), brand guidelines, product screenshots, founder headshots, and approved company descriptions.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Full media kit (.zip)
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Logos only (.zip)
              </a>
              <a
                href="mailto:press@myalongside.com"
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Request interview
              </a>
            </div>
          </div>
        </div>

        {/* Press releases */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">Press Releases</p>
          <div className="space-y-3">
            {PRESS_RELEASES.map((pr) => (
              <div key={pr.title} className="flex items-start justify-between gap-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-card transition-shadow">
                <div>
                  <p className="text-xs text-stone-400 mb-1">{pr.date}</p>
                  <h3 className="font-bold text-stone-900 leading-snug">{pr.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{pr.summary}</p>
                </div>
                <a href="#" className="flex-shrink-0 flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1">
                  <ExternalLink className="h-3.5 w-3.5" /> PDF
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">Coverage</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {PRESS_COVERAGE.map((item) => (
              <a
                key={item.title}
                href={item.url}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 ${item.color}`}>
                    {item.logo}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-stone-700">{item.publication}</p>
                    <p className="text-xs text-stone-400">{item.date}</p>
                  </div>
                </div>
                <h3 className="font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed italic flex-1">{item.excerpt}</p>
                <span className="mt-4 flex items-center gap-1 text-xs text-brand-600 font-medium">
                  Read article <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-brand-50 border border-brand-100 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Press enquiries</h3>
            <p className="mt-1 text-sm text-stone-600">
              We respond to all media requests within one business day.
            </p>
          </div>
          <a
            href="mailto:press@myalongside.com"
            className="btn-primary whitespace-nowrap flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            press@myalongside.com
          </a>
        </div>
      </div>
    </div>
  );
}
