"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const code = params.code as string;

  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Validate enrollment code
  useEffect(() => {
    fetch(`/api/join/${code}`)
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d.error))))
      .then((data) => {
        setSchoolName(data.schoolName);
        setLoading(false);
      })
      .catch((err) => {
        setError(typeof err === "string" ? err : "Invalid enrollment code");
        setLoading(false);
      });
  }, [code]);

  // If already logged in as candidate, auto-join
  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "CANDIDATE" && schoolName) {
      fetch(`/api/join/${code}`, { method: "POST" })
        .then((r) => {
          if (r.ok) router.push("/candidate");
        });
    }
  }, [authStatus, session, schoolName, code, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Register as candidate
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "CANDIDATE" }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      // Sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        setSubmitting(false);
        return;
      }

      // Join school
      await fetch(`/api/join/${code}`, { method: "POST" });

      router.push("/candidate");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!schoolName) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Enrollment Code</h1>
          <p className="text-sm text-gray-500 mb-4">{error || "This enrollment code is not valid."}</p>
          <Link href="/auth/signup" className="text-sm text-saffron hover:text-saffron-dark">
            Sign up normally &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // If logged in as non-candidate
  if (authStatus === "authenticated" && session?.user?.role !== "CANDIDATE") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-gray-500">Only candidates can join a school. You are signed in as {session?.user?.role}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="text-3xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-gray-900">Join {schoolName}</h1>
            <p className="mt-2 text-sm text-gray-500">
              Create your student account to join this school on Intervue.AI
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                placeholder="Minimum 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg border border-pink-400 bg-pink-50 py-2.5 text-sm font-semibold text-pink-600 transition-all hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Joining..." : `Join ${schoolName}`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-pink-500 hover:text-pink-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
