"use client";

import { useState } from "react";

type CareerKitOutput = {
  headline: string;
  about: string;
  resumeBullets: string[];
  keywordGaps: string[];
  recruiterMessage: string;
  interviewPitch: string;
  actionPlan: string[];
};

const initialForm = {
  targetRole: "",
  yearsExperience: "",
  backgroundSummary: "",
  achievements: "",
  currentHeadline: "",
  currentAbout: "",
  existingBullets: "",
  jobDescription: "",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function CandidateCareerKitPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kit, setKit] = useState<CareerKitOutput | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/candidate/career-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate career kit");
      }
      setKit(data.kit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate career kit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-400">AI Career Kit</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Generate recruiter-ready career assets</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          Build LinkedIn copy, stronger resume bullets, recruiter outreach, and a sharper interview pitch
          using your own background plus verified Intervue performance when available.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Target Role</label>
              <input
                value={form.targetRole}
                onChange={(e) => setForm((current) => ({ ...current, targetRole: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="e.g. Frontend Engineer, Data Analyst, Product Manager"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Years of Experience</label>
              <input
                value={form.yearsExperience}
                onChange={(e) => setForm((current) => ({ ...current, yearsExperience: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="e.g. 0-1, 2, 5+"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Background Summary</label>
              <textarea
                value={form.backgroundSummary}
                onChange={(e) => setForm((current) => ({ ...current, backgroundSummary: e.target.value }))}
                className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="Summarize your current background, strengths, domain knowledge, and what kind of work you have done."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Achievements / Proof</label>
              <textarea
                value={form.achievements}
                onChange={(e) => setForm((current) => ({ ...current, achievements: e.target.value }))}
                className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="List outcomes, projects, wins, measurable impact, certifications, or portfolio proof."
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Current LinkedIn Headline</label>
                <textarea
                  value={form.currentHeadline}
                  onChange={(e) => setForm((current) => ({ ...current, currentHeadline: e.target.value }))}
                  className="mt-2 min-h-[90px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                  placeholder="Paste your current headline if you have one."
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Current About / Summary</label>
                <textarea
                  value={form.currentAbout}
                  onChange={(e) => setForm((current) => ({ ...current, currentAbout: e.target.value }))}
                  className="mt-2 min-h-[90px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                  placeholder="Paste your LinkedIn about section or personal summary."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Existing Resume Bullets</label>
              <textarea
                value={form.existingBullets}
                onChange={(e) => setForm((current) => ({ ...current, existingBullets: e.target.value }))}
                className="mt-2 min-h-[110px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="Paste any existing bullet points you want rewritten."
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Target Job Description</label>
              <textarea
                value={form.jobDescription}
                onChange={(e) => setForm((current) => ({ ...current, jobDescription: e.target.value }))}
                className="mt-2 min-h-[110px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
                placeholder="Optional. Paste a role description to tailor keyword and positioning advice."
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate career kit"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {!kit && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">What you get</h2>
              <ul className="mt-4 space-y-3">
                {[
                  "A tighter LinkedIn headline and About section",
                  "Achievement-focused resume bullets",
                  "Keyword gaps to close before you apply",
                  "A recruiter outreach note and interview pitch",
                  "A practical action plan grounded in your Intervue history",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {kit && (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">LinkedIn headline</p>
                    <p className="mt-3 text-lg font-semibold text-gray-900">{kit.headline}</p>
                  </div>
                  <CopyButton value={kit.headline} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">About section</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{kit.about}</p>
                  </div>
                  <CopyButton value={kit.about} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-full">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Resume bullets</p>
                    <ul className="mt-3 space-y-3">
                      {kit.resumeBullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm leading-6 text-gray-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <CopyButton value={kit.resumeBullets.map((bullet) => `- ${bullet}`).join("\n")} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Keyword gaps</p>
                      <ul className="mt-3 space-y-2">
                        {kit.keywordGaps.map((item) => (
                          <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <CopyButton value={kit.keywordGaps.join("\n")} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Recruiter message</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{kit.recruiterMessage}</p>
                    </div>
                    <CopyButton value={kit.recruiterMessage} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Interview pitch</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{kit.interviewPitch}</p>
                    </div>
                    <CopyButton value={kit.interviewPitch} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Action plan</p>
                      <ul className="mt-3 space-y-2">
                        {kit.actionPlan.map((item) => (
                          <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <CopyButton value={kit.actionPlan.join("\n")} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
