import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Press — MyAlongside",
  description: "Media kit, press releases, and coverage for MyAlongside. Contact us at myalongside@gmail.com.",
};

export default function PressPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-b border-stone-100 bg-stone-50 px-6 py-16 text-center">
        <p className="section-label">Press Room</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">MyAlongside in the media</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          For press enquiries, interviews, or media kit requests, contact us at{" "}
          <a href="mailto:myalongside@gmail.com" className="text-brand-600 hover:underline font-medium">
            myalongside@gmail.com
          </a>
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">

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
                href="mailto:myalongside@gmail.com"
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Request interview
              </a>
            </div>
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
            href="mailto:myalongside@gmail.com"
            className="btn-primary whitespace-nowrap flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            myalongside@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
