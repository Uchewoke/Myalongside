import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — MyAlongside",
  description: "Stories, research, and insights on peer support, mental health, and navigating life's hardest moments.",
};

const FEATURED_POST = {
  slug: "power-of-peer-support",
  category: "Research",
  title: "Why peer support works: the science behind being heard by someone who's been there",
  excerpt:
    "A growing body of research shows that shared lived experience is not just comforting — it's clinically effective. We explore why, and what it means for how we design MyAlongside.",
  author: { name: "Dr. Sasha Mbeki", role: "Head of Safety & Safeguarding", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SashaM&backgroundColor=d1f2a5" },
  date: "12 June 2026",
  readTime: "8 min read",
  tag: "bg-violet-100 text-violet-700",
};

const POSTS = [
  {
    slug: "five-things-grief",
    category: "Stories",
    title: "5 things nobody tells you about grief — and what actually helped",
    excerpt: "Grief isn't linear. It's messy, unpredictable, and often nothing like what people say. Here's what our community told us.",
    author: "Priya Iyer",
    date: "5 June 2026",
    readTime: "6 min read",
    tag: "bg-rose-100 text-rose-700",
  },
  {
    slug: "mentor-burnout",
    category: "Mentor Wellbeing",
    title: "How to support others without losing yourself: a guide for mentors",
    excerpt: "Compassion fatigue is real. We share practical strategies our mentors use to stay grounded while showing up for seekers.",
    author: "Amara Osei",
    date: "28 May 2026",
    readTime: "5 min read",
    tag: "bg-teal-100 text-teal-700",
  },
  {
    slug: "anonymous-mode",
    category: "Product",
    title: "Introducing anonymous mode: support without fear of judgment",
    excerpt: "Sometimes the bravest thing you can do is ask for help — anonymously. Here's how we built anonymous mode and why.",
    author: "Daniel Park",
    date: "20 May 2026",
    readTime: "4 min read",
    tag: "bg-brand-100 text-brand-700",
  },
  {
    slug: "job-loss-identity",
    category: "Stories",
    title: "When your job was your identity: rebuilding after redundancy",
    excerpt: "For many of us, losing a job means losing a sense of self. Three MyAlongside members share how they found themselves again.",
    author: "Community Team",
    date: "14 May 2026",
    readTime: "7 min read",
    tag: "bg-orange-100 text-orange-700",
  },
  {
    slug: "ai-matching",
    category: "Product",
    title: "How our AI matching works — and what it deliberately doesn't do",
    excerpt: "We use AI to suggest mentors based on life event overlap, language, and availability. But we never let it replace human judgment.",
    author: "Daniel Park",
    date: "6 May 2026",
    readTime: "5 min read",
    tag: "bg-brand-100 text-brand-700",
  },
  {
    slug: "divorce-new-chapter",
    category: "Stories",
    title: "Divorce at 41: how I stopped surviving and started living",
    excerpt: "One member's honest account of what it took to move from rock bottom to a life she actually wants.",
    author: "Anonymous Seeker",
    date: "28 Apr 2026",
    readTime: "9 min read",
    tag: "bg-rose-100 text-rose-700",
  },
];

export default function BlogPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-b border-stone-100 bg-stone-50 px-6 py-16 text-center">
        <p className="section-label">The MyAlongside Blog</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">Stories, research & insights</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Honest writing about peer support, mental health, and what it really takes to come through hard times.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        {/* Featured post */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">Featured</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card hover:shadow-card-hover transition-shadow">
            <div className="h-3 w-full bg-brand-gradient" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FEATURED_POST.tag}`}>
                  {FEATURED_POST.category}
                </span>
                <span className="text-xs text-stone-400">{FEATURED_POST.date} · {FEATURED_POST.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 leading-snug">{FEATURED_POST.title}</h2>
              <p className="mt-3 text-stone-600 leading-relaxed">{FEATURED_POST.excerpt}</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FEATURED_POST.author.avatar} alt={FEATURED_POST.author.name} width={36} height={36} className="rounded-full bg-stone-100" />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{FEATURED_POST.author.name}</p>
                    <p className="text-xs text-stone-400">{FEATURED_POST.author.role}</p>
                  </div>
                </div>
                <Link href={`/company/blog/${FEATURED_POST.slug}`} className="btn-primary !px-4 !py-2 !text-sm">
                  Read article →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Post grid */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">Latest</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/company/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${post.tag}`}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-stone-400">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <p className="text-xs text-stone-400">{post.author}</p>
                  <p className="text-xs text-stone-400">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl bg-brand-50 border border-brand-100 px-8 py-10 text-center">
          <h3 className="text-xl font-bold text-stone-900">Get new posts in your inbox</h3>
          <p className="mt-2 text-sm text-stone-600">No spam. Thoughtful writing, twice a month.</p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:max-w-md sm:mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary flex-shrink-0">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}
