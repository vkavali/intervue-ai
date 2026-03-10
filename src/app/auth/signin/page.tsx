"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/redirect";
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Show nothing while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to your Intervue.AI account
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-saffron to-india-green py-2.5 text-sm font-semibold text-white transition-all hover:from-saffron-light hover:to-india-green-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-saffron hover:text-saffron-light transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
