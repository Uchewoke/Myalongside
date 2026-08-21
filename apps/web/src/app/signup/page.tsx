"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Heart,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE, LIFE_EVENTS } from "@/lib/constants";
import type { LifeEventId } from "@/lib/constants";
import { useAuthStore, toAuthUser } from "@/store/useAuthStore";

type Role = "SEEKER" | "MENTOR";
type Step = 1 | 2 | 3 | 4;

const GROUP_RULES = [
  {
    title: "Be Kind and Courteous",
    body: "We're in this together to create a welcoming environment. Let's treat everyone with respect. Healthy debates are natural, but kindness is required. You are not allowed to put yourself or others down.",
  },
  {
    title: "No hate speech or bullying",
    body: "Make sure that everyone feels safe. Bullying of any kind isn't allowed, and degrading comments about things such as race, religion, culture, sexual orientation, gender or identity will not be tolerated.",
  },
  {
    title: "Respect everyone's privacy",
    body: "Being part of this group requires mutual trust. Authentic, expressive discussions make groups great, but may also be sensitive and private. What's shared in the group should stay in the group.",
  },
  {
    title: "Religion",
    body: "Everyone walks different paths, don't push what you believe on others. Let them find a God of their own understanding. It is ok to talk about your god, but not ok to shove your god into others faces.",
  },
  {
    title: "No Politics",
    body: "We do not discuss politics of any kind for any reason. We do not need people yelling at people over politics that is why we are not here.",
  },
  {
    title: "No Drama",
    body: "If you want to do drama, you are in the wrong group. Gossip and drama is cause for immediate dismissal. There is no tolerance.",
  },
  {
    title: "This is not a dating site",
    body: "We do not allow people to go date hunting in our groups nor do we allow co workers to date each other, for the sake of it affecting the work place.",
  },
  {
    title: "No promotions or spam",
    body: "Give more to this group than you take. Self-promotion, spam and irrelevant links aren't allowed. No links without owner's permission — ask Marie Coulthard if you want to post links.",
  },
  {
    title: "Contact an admin",
    body: "If you are being bullied in the group or you see something that shouldn't be happening, please contact head admins right away.",
  },
  {
    title: "Do not give out personal information",
    body: "For your safety and the safety of the group, we ask that you do not share your personal information online unless you are friends with them.",
  },
] as const;

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const messages = Object.values(error as Record<string, unknown>)
      .flat()
      .filter((m): m is string => typeof m === "string");
    if (messages.length > 0) return messages.join(" ");
  }
  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as Role | "",
    lifeEvents: [] as LifeEventId[],
    agreedToRules: false,
  });

  const [error, setError] = useState("");

  const toggleEvent = (id: LifeEventId) => {
    setForm((prev) => ({
      ...prev,
      lifeEvents: prev.lifeEvents.includes(id)
        ? prev.lifeEvents.filter((e) => e !== id)
        : [...prev.lifeEvents, id],
    }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Please fill in all fields.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    if (step === 2 && !form.role) {
      setError("Please choose your role to continue.");
      return;
    }
    if (step === 3 && form.lifeEvents.length === 0) {
      setError("Please select at least one life event.");
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.agreedToRules) {
      setError("Please agree to the group rules to continue.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role || "SEEKER",
          lifeEventSlugs: form.lifeEvents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(extractErrorMessage(data.error));
        setIsLoading(false);
        return;
      }

      login(toAuthUser(data.user), data.accessToken, data.refreshToken);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const progressPct = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900">
          {step === 1 && "Create your account"}
          {step === 2 && "How will you use MyAlongside?"}
          {step === 3 && "What are you navigating?"}
          {step === 4 && "Group rules"}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {step === 1 && "Free to join. No credit card needed."}
          {step === 2 && "You can always change this later."}
          {step === 3 && "We'll match you with mentors who've been here."}
          {step === 4 && "Please read and agree before you join."}
        </p>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs text-stone-400">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Alex Rivera"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="button" onClick={handleNext} className="btn-primary w-full justify-center !py-3.5 text-base">
            Continue <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {([
              {
                role: "SEEKER" as Role,
                icon: Heart,
                title: "I need support",
                description: "I'm going through something and want to connect with a mentor who has been there.",
                color: "brand",
              },
              {
                role: "MENTOR" as Role,
                icon: Briefcase,
                title: "I want to give back",
                description: "I've lived through a challenging life event and want to help others navigate it.",
                color: "teal",
              },
            ] as const).map(({ role, icon: Icon, title, description }) => {
              const isSelected = form.role === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                    isSelected
                      ? role === "SEEKER"
                        ? "border-brand-400 bg-brand-50"
                        : "border-teal-500 bg-teal-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle className={`absolute right-4 top-4 h-5 w-5 ${role === "SEEKER" ? "text-brand-500" : "text-teal-500"}`} />
                  )}
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                    role === "SEEKER" ? "bg-brand-100" : "bg-teal-100"
                  }`}>
                    <Icon className={`h-5 w-5 ${role === "SEEKER" ? "text-brand-600" : "text-teal-600"}`} />
                  </div>
                  <h3 className="font-semibold text-stone-900">{title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
              Back
            </button>
            <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="text-xs text-stone-500">
            {form.role === "SEEKER"
              ? "Select the life events you're currently navigating (select all that apply):"
              : "Select the life events you have personally experienced and can mentor others through:"}
          </p>

          <div className="grid max-h-72 grid-cols-2 gap-2.5 overflow-y-auto pr-1 scrollbar-hide">
            {LIFE_EVENTS.map((event) => {
              const selected = form.lifeEvents.includes(event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                    selected
                      ? `${event.color} font-medium`
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base">{event.emoji}</span>
                  <span className="leading-tight">{event.label}</span>
                  {selected && <CheckCircle className="ml-auto h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-stone-400">{form.lifeEvents.length} selected</p>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">
              Back
            </button>
            <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="text-sm font-medium text-stone-700">I agree to the group rules</p>

          <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-4 pr-3 scrollbar-hide">
            {GROUP_RULES.map((rule, i) => (
              <div key={rule.title} className="text-sm">
                <p className="font-semibold text-stone-800">
                  {i + 1}. {rule.title}
                </p>
                <p className="mt-0.5 leading-relaxed text-stone-500">{rule.body}</p>
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={form.agreedToRules}
              onChange={(e) => setForm({ ...form, agreedToRules: e.target.checked })}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
            />
            <span>I have read and agree to the group rules above.</span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center">
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.agreedToRules}
              className="btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Complete Setup <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-xs text-stone-400">
        By continuing you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:text-stone-600">Terms</Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline hover:text-stone-600">Privacy Policy</Link>.
      </p>
    </div>
  );
}