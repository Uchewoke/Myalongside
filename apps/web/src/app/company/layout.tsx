import Link from "next/link";
import { Heart } from "lucide-react";

const NAV_LINKS = [
  { href: "/company/about", label: "About" },
  { href: "/company/blog", label: "Blog" },
  { href: "/company/careers", label: "Careers" },
  { href: "/company/press", label: "Press" },
];

const FOOTER_LEGAL = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/community-guidelines", label: "Guidelines" },
  { href: "/legal/safety", label: "Safety" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-stone-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-base font-bold text-stone-900">
              My<span className="text-brand-600">Alongside</span>
            </span>
          </Link>

          {/* Company nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors sm:block">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary !px-4 !py-2 !text-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Page */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-stone-100 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-gradient">
                <Heart className="h-3 w-3 text-white" fill="currentColor" />
              </div>
              <span className="text-sm font-bold text-stone-700">MyAlongside</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {FOOTER_LEGAL.map(({ href, label }) => (
                <Link key={href} href={href} className="text-xs text-stone-400 hover:text-brand-600 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-stone-400">© 2026 MyAlongside Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
