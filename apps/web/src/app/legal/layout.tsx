import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/community-guidelines", label: "Community Guidelines" },
  { href: "/legal/safety", label: "Safety" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <Heart className="h-3.5 w-3.5 text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-stone-900">
              My<span className="text-brand-600">Alongside</span>
            </span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-sm text-stone-500">Legal</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl gap-8 px-6 py-10 lg:flex">
        {/* Sidebar */}
        <aside className="mb-8 w-full flex-shrink-0 lg:mb-0 lg:w-52">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-stone-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Legal</p>
            </div>
            <nav className="py-1">
              {LEGAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-stone-100 px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-brand-600 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to app
              </Link>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1">
          <article className="prose prose-stone prose-sm max-w-none rounded-2xl border border-stone-200 bg-white px-8 py-8 shadow-sm lg:prose-base">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
