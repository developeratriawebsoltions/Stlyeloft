"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import SuperAdminLayout from "@/components/shared/SuperAdminLayout";

export default function AddClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setVerifyError("");
    setVerifySuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          name,
          email,
          password,
          role: "client",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create client");
        return;
      }

      setSuccess("Client account created successfully! A verification OTP has been sent to the client's email.");
      setCreatedEmail(email);
      setName("");
      setEmail("");
      setPassword("");
      setOtp("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError("");
    setVerifySuccess("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          email: createdEmail,
          code: otp,
          type: "register",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Invalid OTP");
        return;
      }

      setVerifySuccess("OTP verified successfully. Redirecting to client login...");
      setOtp("");
      router.push("/super-admin/clients");
    } catch {
      setVerifyError("Something went wrong while verifying the OTP.");
    } finally {
      setVerifying(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-indigo-400";

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
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
    <SuperAdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div>
              <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                Super Admin
              </span>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                Add New Client
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Create a new client account and send a verification OTP to the client's email. The client must verify before logging in.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-8">
              <form onSubmit={handleAddClient} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Client Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter client name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    {success}
                  </div>
                )}

                {createdEmail && (
                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Verify OTP for {createdEmail}</h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Enter the 6-digit OTP that was sent to the client&apos;s email to complete verification.
                    </p>

                    <div className="mt-4 flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="otp" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          OTP Code
                        </label>
                        <input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className={inputCls}
                          required
                        />
                      </div>

                      {verifyError && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                          {verifyError}
                        </div>
                      )}

                      {verifySuccess && (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                          {verifySuccess}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifying}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verifying ? "Verifying OTP..." : "Verify OTP"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Client"}
                  </button>
                  <Link
                    href="/super-admin/clients"
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
}
