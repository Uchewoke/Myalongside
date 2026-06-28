"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Lock,
  Bell,
  Briefcase,
  Heart,
  Check,
  ChevronRight,
  LogOut,
  FileText,
} from "lucide-react";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { LIFE_EVENTS } from "@/lib/constants";
import { clsx } from "clsx";
import type { DisplayNameMode } from "@/lib/public-profile";

// ─── Primitives ────────────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card divide-y divide-stone-100 overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="font-semibold text-stone-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-stone-400">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        value ? "bg-brand-600" : "bg-stone-200"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          value ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
      className="w-20 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 text-center focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
    />
  );
}

// ─── Tab definitions ───────────────────────────────────────────────────────────

const SEEKER_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "seeker", label: "Seeker Settings", icon: Heart },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

const MENTOR_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "mentor", label: "Mentor Settings", icon: Briefcase },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type SeekerTab = (typeof SEEKER_TABS)[number]["id"];
type MentorTab = (typeof MENTOR_TABS)[number]["id"];
type ActiveTab = SeekerTab | MentorTab;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const user = authUser ?? MOCK_CURRENT_USER;
  const isSeeker = user.role === "SEEKER";
  const tabs = isSeeker ? SEEKER_TABS : MENTOR_TABS;

  const [activeTab, setActiveTab] = useState<ActiveTab>("account");
  const [saved, setSaved] = useState(false);

  // Local editable state (account fields)
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [location, setLocation] = useState(user.location ?? "");
  const [languages, setLanguages] = useState((user.languages ?? []).join(", "));

  // Life events (seeker only)
  const [lifeEvents, setLifeEvents] = useState<string[]>(user.lifeEvents ?? []);

  function toggleLifeEvent(id: string) {
    setLifeEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function saveAccount() {
    updateUser({
      name: name.trim() || user.name,
      bio: bio.trim() || undefined,
      location: location.trim() || undefined,
      languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      lifeEvents,
    });
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const g = user.settings?.general;
  const sk = user.settings?.seeker;
  const mt = user.settings?.mentor;

  return (
    <div className="mx-auto flex max-w-4xl gap-6">
      {/* Sidebar nav */}
      <aside className="w-52 flex-shrink-0">
        <div className="card overflow-hidden">
          <nav className="divide-y divide-stone-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-brand-50 text-brand-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {activeTab === id && <ChevronRight className="h-3.5 w-3.5 text-brand-400" />}
              </button>
            ))}
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign out
            </button>
          </nav>
          {/* Legal links */}
          <div className="border-t border-stone-100 px-4 py-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Legal</p>
            {[
              { href: "/legal/privacy", label: "Privacy Policy" },
              { href: "/legal/terms", label: "Terms of Service" },
              { href: "/legal/community-guidelines", label: "Community Guidelines" },
              { href: "/legal/safety", label: "Safety" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-stone-500 hover:bg-stone-50 hover:text-brand-600 transition-colors"
              >
                <FileText className="h-3 w-3 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Save banner */}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-700">
            <Check className="h-4 w-4" /> Settings saved
          </div>
        )}

        {/* ── Account tab ─────────────────────────────────────────────────── */}
        {activeTab === "account" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Account</h1>
              <p className="mt-1 text-stone-500 text-sm">Manage your personal information.</p>
            </div>

            <Section title="Profile Information">
              <div className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Full name</label>
                  <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Bio</label>
                  <textarea className="input-field min-h-[80px] resize-none" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short introduction about yourself…" maxLength={400} />
                  <p className="mt-1 text-right text-xs text-stone-400">{bio.length}/400</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Location</label>
                    <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Languages</label>
                    <input className="input-field" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Spanish" />
                    <p className="mt-1 text-xs text-stone-400">Comma-separated</p>
                  </div>
                </div>
              </div>
            </Section>

            {isSeeker && (
              <Section title="Life Experiences" description="The events that shape who you are and who you'll connect with.">
                <div className="flex flex-wrap gap-2 px-6 py-5">
                  {LIFE_EVENTS.map((event) => {
                    const selected = lifeEvents.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => toggleLifeEvent(event.id)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          selected ? event.color : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                        )}
                      >
                        {event.emoji} {event.label}
                        {selected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            <div className="flex justify-end">
              <button onClick={saveAccount} className="btn-primary">Save changes</button>
            </div>
          </div>
        )}

        {/* ── Privacy tab ──────────────────────────────────────────────────── */}
        {activeTab === "privacy" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Privacy</h1>
              <p className="mt-1 text-stone-500 text-sm">Control how you appear to others.</p>
            </div>

            <Section title="Display Name" description="Choose how your name appears across the platform.">
              <Row label="Display name style" hint="How others see your name in conversations and the community.">
                <Select<DisplayNameMode>
                  value={(g?.displayNameMode as DisplayNameMode) ?? "full-name"}
                  onChange={(v) => { updateUser({ settings: { general: { displayNameMode: v, anonymousMode: v === "anonymous" } } }); flash(); }}
                  options={[
                    { value: "full-name", label: "Full name" },
                    { value: "first-name-only", label: "First name only" },
                    { value: "anonymous", label: "Anonymous" },
                  ]}
                />
              </Row>
            </Section>

            <Section title="Community Visibility">
              <Row label="Show profile in community" hint="Let other members see your profile card in the community tab.">
                <Toggle
                  value={g?.allowCommunityProfile ?? true}
                  onChange={(v) => { updateUser({ settings: { general: { allowCommunityProfile: v } } }); flash(); }}
                />
              </Row>
            </Section>

            <Section title="Account">
              <Row label="Email address" hint={user.email ?? "No email set"}>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">Cannot change here</span>
              </Row>
            </Section>
          </div>
        )}

        {/* ── Seeker Settings tab ──────────────────────────────────────────── */}
        {activeTab === "seeker" && isSeeker && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Seeker Settings</h1>
              <p className="mt-1 text-stone-500 text-sm">Personalise your experience as someone seeking support.</p>
            </div>

            <Section title="Mentor Matching" description="Control who can see your profile and reach out.">
              <Row label="Profile visible to" hint="Which mentors can view your seeker profile before a match.">
                <Select
                  value={(sk?.introVisibility as string) ?? "matched-only"}
                  onChange={(v) => { updateUser({ settings: { seeker: { introVisibility: v as "matched-only" | "all-verified-mentors" } } }); flash(); }}
                  options={[
                    { value: "matched-only", label: "Matched mentors only" },
                    { value: "all-verified-mentors", label: "All verified mentors" },
                  ]}
                />
              </Row>
              <Row label="Allow mentor suggestions" hint="Let the platform suggest mentors based on your life events.">
                <Toggle
                  value={sk?.allowMentorSuggestions ?? true}
                  onChange={(v) => { updateUser({ settings: { seeker: { allowMentorSuggestions: v } } }); flash(); }}
                />
              </Row>
            </Section>

            <Section title="Wellbeing" description="Support features designed to look out for you.">
              <Row label="Weekly progress digest" hint="A short email every week summarising your conversations and actions.">
                <Toggle
                  value={sk?.weeklyDigest ?? true}
                  onChange={(v) => { updateUser({ settings: { seeker: { weeklyDigest: v } } }); flash(); }}
                />
              </Row>
              <Row label="Crisis check-ins" hint="Gentle nudges if you haven't been active for a while.">
                <Toggle
                  value={sk?.crisisCheckins ?? true}
                  onChange={(v) => { updateUser({ settings: { seeker: { crisisCheckins: v } } }); flash(); }}
                />
              </Row>
            </Section>
          </div>
        )}

        {/* ── Mentor Settings tab ──────────────────────────────────────────── */}
        {activeTab === "mentor" && !isSeeker && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Mentor Settings</h1>
              <p className="mt-1 text-stone-500 text-sm">Manage your capacity and how you support seekers.</p>
            </div>

            <Section title="Availability" description="Control whether seekers can send you new match requests.">
              <Row label="Open to new seekers" hint="Turn off to pause incoming requests while keeping existing conversations active.">
                <Toggle
                  value={mt?.availableForNewSeekers ?? true}
                  onChange={(v) => { updateUser({ settings: { mentor: { availableForNewSeekers: v } } }); flash(); }}
                />
              </Row>
              <Row label="Maximum active seekers" hint="How many seekers you're willing to support at one time (1–20).">
                <NumberInput
                  value={mt?.maxActiveSeekers ?? 5}
                  onChange={(v) => { updateUser({ settings: { mentor: { maxActiveSeekers: v } } }); flash(); }}
                  min={1}
                  max={20}
                />
              </Row>
            </Section>

            <Section title="Mentoring Style">
              <div className="px-6 py-5">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Mentoring focus</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Describe your mentoring approach, what you're best at, and what seekers can expect from working with you…"
                  maxLength={500}
                  defaultValue={mt?.mentoringFocus as string ?? ""}
                  onBlur={(e) => { updateUser({ settings: { mentor: { mentoringFocus: e.target.value.trim() } } }); flash(); }}
                />
                <p className="mt-1 text-xs text-stone-400">Shown on your mentor profile card.</p>
              </div>
            </Section>

            <Section title="Tools">
              <Row label="Response templates" hint="Show AI-suggested reply starters during conversations.">
                <Toggle
                  value={mt?.showResponseTemplates ?? true}
                  onChange={(v) => { updateUser({ settings: { mentor: { showResponseTemplates: v } } }); flash(); }}
                />
              </Row>
              <Row label="Weekly insights digest" hint="A weekly email summarising your impact: conversations, action items completed, seeker progress.">
                <Toggle
                  value={mt?.weeklyInsights ?? true}
                  onChange={(v) => { updateUser({ settings: { mentor: { weeklyInsights: v } } }); flash(); }}
                />
              </Row>
            </Section>
          </div>
        )}

        {/* ── Notifications tab ────────────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
              <p className="mt-1 text-stone-500 text-sm">Choose what you hear about and how.</p>
            </div>

            <Section title="In-App">
              <Row label="New messages" hint="Notify you when a mentor or seeker sends a message.">
                <Toggle value={true} onChange={() => flash()} />
              </Row>
              <Row label="Match requests" hint="Alert when someone wants to connect with you.">
                <Toggle value={true} onChange={() => flash()} />
              </Row>
              <Row label="Community replies" hint="When someone replies to your community post.">
                <Toggle value={false} onChange={() => flash()} />
              </Row>
            </Section>

            <Section title="Email">
              <Row label="Message summaries" hint="Daily digest of unread messages (only if you haven't logged in).">
                <Toggle value={true} onChange={() => flash()} />
              </Row>
              <Row label="Platform updates" hint="New features and important announcements.">
                <Toggle value={false} onChange={() => flash()} />
              </Row>
              <Row label="Marketing emails" hint="Tips, guides, and community spotlights.">
                <Toggle value={false} onChange={() => flash()} />
              </Row>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
