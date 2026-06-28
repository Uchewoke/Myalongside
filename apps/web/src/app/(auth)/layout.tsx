import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — decorative */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-hero-gradient p-12 lg:flex lg:w-5/12">
        {/* Background orbs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-teal-600/20 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Heart className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-white">MyAlongside</span>
        </Link>

        {/* Middle quote */}
        <div className="relative space-y-6">
          <div className="text-6xl text-white/20 leading-none select-none">&ldquo;</div>
          <blockquote className="text-xl font-medium leading-relaxed text-white/90">
            The moment I connected with my mentor, I realised I wasn&apos;t broken —
            I was just going through something that needed to be witnessed by
            someone who&apos;d been there.
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-teal-400" />
            <div>
              <p className="text-sm font-semibold text-white">Leah T.</p>
              <p className="text-xs text-stone-400">Divorce · Matched 2025</p>
            </div>
          </div>
        </div>

        {/* Bottom trust pills */}
        <div className="relative flex flex-wrap gap-3">
          {["🔒 Private & Confidential", "✅ Verified Mentors", "🆓 Free to start"].map((t) => (
            <span key={t} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-stone-300 backdrop-blur-sm">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-4 py-12 sm:px-8">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Heart className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-stone-900">MyAlongside</span>
        </Link>
        {children}

        {/* Legal footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {[
            { label: "Privacy Policy", href: "/legal/privacy" },
            { label: "Terms of Service", href: "/legal/terms" },
            { label: "Community Guidelines", href: "/legal/community-guidelines" },
            { label: "Safety", href: "/legal/safety" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-stone-400 hover:text-brand-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-stone-400">
          © 2026 MyAlongside · Peer support, not a substitute for professional care.{" "}
          <Link href="/legal/safety" className="underline hover:text-brand-600 transition-colors">
            Crisis resources →
          </Link>
        </p>
      </div>
    </div>
  );
}
