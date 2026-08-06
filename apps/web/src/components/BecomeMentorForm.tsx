"use client";
// Public "Become a Mentor" capture form. Posts directly to the backend, which
// persists the lead and runs AI qualification. Embed at /signup?role=mentor.

import { useState } from "react";
import { Heart, CheckCircle2, Loader2 } from "lucide-react";
import { API_BASE, LIFE_EVENTS } from "@/lib/constants";
import { Turnstile } from "@/components/Turnstile";

const CAPTCHA_ON = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function BecomeMentorForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    lifeEvent: LIFE_EVENTS[0].id as string,
    story: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { qualified: boolean; notes: string }>(null);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit() {
    setError("");
    if (!form.name || !form.email || !form.story) {
      setError("Please fill in your name, email, and a little of your story.");
      return;
    }
    if (CAPTCHA_ON && !captchaToken) {
      setError("Please complete the verification below.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/marketing/mentor-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: captchaToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");
      setDone({
        qualified: data.lead?.status === "QUALIFIED",
        notes: data.lead?.qualificationNotes ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-teal-700" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Thank you for stepping forward.</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {done.qualified
            ? "Your experience could be a lifeline for someone walking the road you've already traveled. Our team will reach out shortly with next steps."
            : "We've received your details and someone from our team will personally follow up. Everyone's story matters here — thank you for offering yours."}
        </p>
        <p className="mt-4 text-xs leading-5 text-gray-400">
          MyAlongside is peer support, not professional care. If you&apos;re in crisis, call 988 (US) or your local
          emergency services.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <div className="flex items-center gap-2">
        <Heart size={16} className="text-teal-700" />
        <span className="text-xs font-bold uppercase tracking-wide text-teal-700">Become a Mentor</span>
      </div>
      <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900">
        Turn your hardest chapter into someone&apos;s lifeline.
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        You don&apos;t need credentials — just lived experience and the willingness to walk beside someone. Tell us
        a little about you.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Your name
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="First and last name"
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@email.com"
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          What have you come through?
          <select
            value={form.lifeEvent}
            onChange={set("lifeEvent")}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
          >
            {LIFE_EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Your story
          <textarea
            value={form.story}
            onChange={set("story")}
            rows={4}
            placeholder="In a few sentences — what did you go through, and where are you now? There's no wrong answer."
            className="mt-1.5 block w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Availability (optional)
          <input
            value={form.availability}
            onChange={set("availability")}
            placeholder="e.g. a couple of hours a week"
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4">
        <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
      </div>

      <button
        onClick={submit}
        disabled={loading || (CAPTCHA_ON && !captchaToken)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending…
          </>
        ) : (
          "Offer to Mentor"
        )}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-gray-400">
        Safe & confidential. We&apos;ll never share your story without your permission.
      </p>
    </div>
  );
}
