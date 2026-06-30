"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const roleConfig: Record<string, { label: string; accent: string; btn: string; tagColor: string; canRegister: boolean }> = {
  "super-admin": {
    label: "Super Admin",
    accent: "from-violet-600 to-indigo-600",
    btn: "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500",
    tagColor: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    canRegister: false,
  },
  admin: {
    label: "Admin",
    accent: "from-emerald-500 to-teal-500",
    btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    canRegister: true,
  },
  client: {
    label: "Client",
    accent: "from-sky-500 to-blue-500",
    btn: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500",
    tagColor: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    canRegister: true,
  },
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "client";
  const config = roleConfig[roleParam] ?? roleConfig.client;

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName(""); setEmail(""); setPassword(""); setError(""); setSuccess(""); setShowPassword(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password, expectedRole: roleParam }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("not verified")) {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=register&role=${roleParam}`);
          return;
        }
        setError(data.error ?? "Login failed");
        return;
      }
      const role: string = data.user?.role;
      console.log("LOGIN RESPONSE:", data); // debug
      if (role === "super-admin") window.location.href = "/super-admin/dashboard";
      else if (role === "admin") window.location.href = "/admin/dashboard";
      else if (role === "client") window.location.href = "/client/dashboard";
      else setError(`Unknown role: ${role}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", name, email, password, role: roleParam }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Signup failed"); return; }
      setSuccess("Account created! Check your email for OTP verification.");
      // redirect to verify-otp with email
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=register&role=${roleParam}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-indigo-400";
  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 dark:bg-zinc-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${config.accent} opacity-10 blur-3xl`} />
      </div>

      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to home
        </Link>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />

          <div className="p-8">
            {/* Role badge */}
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.tagColor}`}>
              {config.label}
            </span>

            {/* Tabs */}
            {config.canRegister && (
              <div className="mt-4 flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-700">
                {(["login", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); reset(); }}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                      tab === t
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>
            )}

            {!config.canRegister && (
              <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sign in</h1>
            )}

            {/* LOGIN FORM */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                    <Link href="/forgot-password" className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls + " pr-10"} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}

                <button type="submit" disabled={loading} className={`mt-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${config.btn}`}>
                  {loading ? "Signing in…" : `Sign in as ${config.label}`}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {tab === "signup" && config.canRegister && (
              <form onSubmit={handleSignup} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputCls + " pr-10"} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}
                {success && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    {success}
                  </div>
                )}

                <button type="submit" disabled={loading} className={`mt-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${config.btn}`}>
                  {loading ? "Creating account…" : `Create ${config.label} Account`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {msg}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
