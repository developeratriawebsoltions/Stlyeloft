"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const roleConfig: Record<string, { accent: string; btn: string; ring: string; label: string }> = {
  "super-admin": {
    label: "Super Admin",
    accent: "from-violet-600 to-indigo-600",
    btn: "bg-violet-600 hover:bg-violet-700",
    ring: "focus:border-violet-500 focus:ring-violet-500/20",
  },
  admin: {
    label: "Admin",
    accent: "from-emerald-500 to-teal-500",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    ring: "focus:border-emerald-500 focus:ring-emerald-500/20",
  },
  client: {
    label: "Client",
    accent: "from-sky-500 to-blue-500",
    btn: "bg-sky-600 hover:bg-sky-700",
    ring: "focus:border-sky-500 focus:ring-sky-500/20",
  },
};

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "client";
  const cfg = roleConfig[role] ?? roleConfig.client;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to send reset OTP");
        return;
      }

      setSuccess("OTP sent to your email. Redirecting…");
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&type=forgot-password&role=${role}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 dark:bg-zinc-950">
      {/* Background gradient blob */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${cfg.accent} opacity-10 blur-3xl`}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <Link
          href={`/login?role=${role}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to {cfg.label} login
        </Link>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Top accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${cfg.accent}`} />

          <div className="p-8">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-5 w-5 text-zinc-600 dark:text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>

            <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Forgot password?
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enter your {cfg.label} email and we&apos;ll send a reset OTP.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 ${cfg.ring}`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${cfg.btn}`}
              >
                {loading ? "Sending OTP…" : "Send reset OTP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
