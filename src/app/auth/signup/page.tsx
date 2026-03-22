"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TurnstileWidget from "@/components/TurnstileWidget";

type Role = "COMPANY_ADMIN" | "INTERVIEWER" | "CANDIDATE" | "SCHOOL_ADMIN";

const roleOptions: { value: Role; label: string; description: string }[] = [
  {
    value: "COMPANY_ADMIN",
    label: "Company Admin",
    description: "Create and manage interview templates, invite team members",
  },
  {
    value: "INTERVIEWER",
    label: "Interviewer",
    description: "Conduct interviews, monitor candidates, control AI levels",
  },
  {
    value: "CANDIDATE",
    label: "Candidate",
    description: "Take coding interviews with AI-assisted problem solving",
  },
  {
    value: "SCHOOL_ADMIN",
    label: "School / University",
    description: "Manage student accounts with education pricing",
  },
];

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const roleParam = searchParams.get("role");
  const defaultRole: Role =
    roleParam === "company"
      ? "COMPANY_ADMIN"
      : roleParam === "candidate"
        ? "CANDIDATE"
        : "CANDIDATE";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadTime] = useState(Date.now());

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const callbackUrl = searchParams.get("callbackUrl");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl || "/auth/redirect");
    }
  }, [status, session, router, callbackUrl]);

  // Show nothing while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Reject suspiciously fast submissions (< 2 seconds)
    if (Date.now() - formLoadTime < 2000) {
      setError("Please take a moment to fill out the form.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: role === "COMPANY_ADMIN" ? companyName : undefined,
          schoolName: role === "SCHOOL_ADMIN" ? companyName : undefined,
          turnstileToken: turnstileToken || undefined,
          website: honeypot || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Sign in after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign in failed. Please sign in manually.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl || "/auth/redirect");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-sm text-gray-500">
              {role === "CANDIDATE"
                ? "Join printf and ace your next coding interview"
                : role === "INTERVIEWER"
                  ? "Join printf and conduct smarter interviews"
                  : "Join printf and transform your hiring process"}
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
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                placeholder="John Doe"
              />
            </div>

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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                      role === option.value
                        ? "border-saffron bg-saffron/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={() => setRole(option.value)}
                      className="mt-1 accent-saffron"
                    />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {(role === "COMPANY_ADMIN" || role === "SCHOOL_ADMIN") && (
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {role === "SCHOOL_ADMIN" ? "Institution Name" : "Company Name"}
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                  placeholder={role === "SCHOOL_ADMIN" ? "Stanford University" : "Acme Inc."}
                />
              </div>
            )}

            {/* Honeypot — invisible to humans, bots fill it */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            <TurnstileWidget onVerify={handleTurnstileVerify} />

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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
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
