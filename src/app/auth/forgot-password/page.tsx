"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSent(true);
      // In non-production, the API returns the reset URL directly
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-india-green/10">
              <svg className="h-6 w-6 text-india-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Check Your Email</h1>
            <p className="mt-2 text-sm text-gray-500">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
            </p>

            {resetUrl && (
              <div className="mt-4 rounded-lg border border-saffron/30 bg-saffron/5 p-4">
                <p className="text-xs text-gray-500 mb-2">Dev mode — reset link:</p>
                <Link
                  href={resetUrl.replace(/^https?:\/\/[^/]+/, "")}
                  className="text-sm text-saffron hover:text-saffron-dark break-all"
                >
                  Click here to reset your password
                </Link>
              </div>
            )}

            <Link
              href="/auth/signin"
              className="mt-6 inline-block text-sm font-medium text-saffron hover:text-saffron-dark transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email address and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm text-accent-red-dark">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-saffron bg-transparent py-2.5 text-sm font-semibold text-saffron-dark transition-all hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-saffron hover:text-saffron-dark transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
