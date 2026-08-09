"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Stage = "credentials" | "need-code" | "enroll" | "backup-codes";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("credentials");
  const [error, setError] = useState<string | null>(null);

  // Carried across stages so the final login retry doesn't need the user to retype anything.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");

  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [enrollOtpauthUrl, setEnrollOtpauthUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  async function beginEnrollment(token: string) {
    setSetupToken(token);
    const response = await fetch("/api/auth/mfa/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupToken: token }),
    });
    const payload = await response.json().catch(() => ({ error: "Unable to start MFA enrollment." }));

    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : "Unable to start MFA enrollment.");
      return;
    }

    setEnrollSecret(payload.secret);
    setEnrollOtpauthUrl(payload.otpauthUrl);
    setStage("enroll");
  }

  async function submitLogin(emailValue: string, passwordValue: string, extra: { totp?: string; backupCode?: string } = {}) {
    const retryingCode = stage === "need-code";
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue, password: passwordValue, ...extra }),
    });
    const payload = await response.json().catch(() => ({ error: "Unable to sign in." }));

    if (response.ok) {
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
      return;
    }

    if (response.status === 403 && payload?.mfaSetupRequired && typeof payload.setupToken === "string") {
      await beginEnrollment(payload.setupToken);
      return;
    }

    if (response.status === 401 && payload?.error === "Invalid or missing MFA code.") {
      setStage("need-code");
      if (retryingCode) {
        setError(extra.backupCode ? "Invalid backup code." : "Invalid code. Please try again.");
        setCode("");
      }
      return;
    }

    setError(typeof payload.error === "string" ? payload.error : "Unable to sign in.");
  }

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin(email.trim(), password);
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin(email, password, useBackupCode ? { backupCode: code } : { totp: code });
  }

  async function handleActivateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setupToken) return;
    setError(null);

    const response = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupToken, code }),
    });
    const payload = await response.json().catch(() => ({ error: "Unable to verify code." }));

    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : "Unable to verify code.");
      return;
    }

    setBackupCodes(payload.backupCodes ?? []);
    setCode("");
    setStage("backup-codes");
  }

  if (stage === "enroll") {
    return (
      <form onSubmit={handleActivateSubmit} className="space-y-5">
        <p className="text-sm text-slate-600">
          Admin accounts require an authenticator app. Add this key manually (you have 10 minutes before it expires):
        </p>
        <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Setup key</p>
          <p className="mt-1 break-all font-mono text-sm text-slate-900">{enrollSecret}</p>
        </div>
        {enrollOtpauthUrl ? (
          <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">otpauth URL</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700">{enrollOtpauthUrl}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="activate-code" className="mb-2 block text-sm font-medium text-slate-700">
            Enter the 6-digit code from your authenticator app
          </label>
          <input
            id="activate-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            placeholder="123456"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Activate MFA
        </button>
      </form>
    );
  }

  if (stage === "backup-codes") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          MFA is now active. Save these one-time backup codes somewhere safe — each can replace a 6-digit code if you
          lose access to your authenticator app. They will not be shown again.
        </div>
        <ul className="grid grid-cols-2 gap-2 font-mono text-sm text-slate-900">
          {(backupCodes ?? []).map((backupCodeValue) => (
            <li key={backupCodeValue} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              {backupCodeValue}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setCode("");
            setStage("need-code");
          }}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Continue to sign in
        </button>
      </div>
    );
  }

  if (stage === "need-code") {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-5">
        <p className="text-sm text-slate-600">
          Enter {useBackupCode ? "one of your backup codes" : "the 6-digit code from your authenticator app"} to finish
          signing in.
        </p>
        <div>
          <label htmlFor="mfa-code" className="mb-2 block text-sm font-medium text-slate-700">
            {useBackupCode ? "Backup code" : "Authenticator code"}
          </label>
          <input
            id="mfa-code"
            name="mfa-code"
            inputMode={useBackupCode ? "text" : "numeric"}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            placeholder={useBackupCode ? "xxxx-xxxx" : "123456"}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in to admin"}
        </button>

        <button
          type="button"
          onClick={() => {
            setUseBackupCode((prev) => !prev);
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          {useBackupCode ? "Use an authenticator code instead" : "Use a backup code instead"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-5" suppressHydrationWarning>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Admin email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          data-lpignore="true"
          data-1p-ignore="true"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          placeholder="admin@myalongside.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          data-lpignore="true"
          data-1p-ignore="true"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          placeholder="Enter your password"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in to admin"}
      </button>
    </form>
  );
}