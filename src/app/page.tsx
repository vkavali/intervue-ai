import Link from "next/link";

const aiLevels = [
  {
    level: "L0",
    label: "No AI",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    description: "AI completely disabled. Pure unassisted coding assessment.",
    color: "from-red-500/20 to-red-600/10 border-red-500/30",
    textColor: "text-red-400",
  },
  {
    level: "L1",
    label: "Hint Only",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    description: "Socratic questions only. AI nudges thinking without revealing answers.",
    color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
    textColor: "text-yellow-400",
  },
  {
    level: "L2",
    label: "Scaffold",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    description: "Solution skeletons with TODO comments. Structure without implementation.",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    level: "L3",
    label: "Guide",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    description: "Detailed concept explanations and approaches. No code output.",
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    textColor: "text-purple-400",
  },
  {
    level: "L4",
    label: "Full Copilot",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description: "Unrestricted AI assistance. Code, debugging, optimization -- everything.",
    color: "from-green-500/20 to-green-600/10 border-green-500/30",
    textColor: "text-green-400",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Create Interview Template",
    description: "Define questions, set difficulty levels, and configure AI assistance levels per question.",
  },
  {
    step: 2,
    title: "Invite Candidates",
    description: "Send interview links to candidates with scheduled times and session configurations.",
  },
  {
    step: 3,
    title: "Candidate Codes Live",
    description: "Candidates solve problems in a full-featured code editor with controlled AI assistance.",
  },
  {
    step: 4,
    title: "Interviewer Monitors",
    description: "Watch live coding, see AI interactions in real-time, and adjust AI levels on the fly.",
  },
  {
    step: 5,
    title: "AI Audits Everything",
    description: "Every AI interaction is logged and audited. The system scores candidate performance automatically.",
  },
  {
    step: 6,
    title: "Review & Decide",
    description: "Get a comprehensive audit report with scores, risk flags, and hire/no-hire recommendations.",
  },
];

const comparisonFeatures = [
  { feature: "AI Assistance Levels", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Company-Controlled AI", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Real-time AI Audit", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Live Code Monitoring", intervue: true, hackerrank: true, coderpad: true, karat: true, leetcode: false },
  { feature: "Automated Scoring", intervue: true, hackerrank: true, coderpad: false, karat: true, leetcode: true },
  { feature: "AI Interaction Logging", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Per-Question AI Config", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Hire/No-Hire Recommendation", intervue: true, hackerrank: false, coderpad: false, karat: true, leetcode: false },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For small teams getting started",
    features: [
      "Up to 5 interviews/month",
      "L0-L2 AI levels",
      "Basic audit reports",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For growing engineering teams",
    features: [
      "Up to 50 interviews/month",
      "All AI levels (L0-L4)",
      "Full audit reports",
      "Priority support",
      "Custom question library",
      "Team management",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited interviews",
      "All AI levels (L0-L4)",
      "Advanced analytics",
      "Dedicated support",
      "SSO & SAML",
      "Custom integrations",
      "On-prem deployment",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
  {
    name: "Pay Per Interview",
    price: "$15",
    period: "/session",
    description: "No commitment, pay as you go",
    features: [
      "No monthly fee",
      "All AI levels (L0-L4)",
      "Full audit reports",
      "Email support",
      "Volume discounts available",
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              Now in Public Beta
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Interview Smarter.
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Hire with Confidence.
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The AI-controlled interview platform where AI assistance is deliberately
              controlled by the company — and every session is automatically audited,
              scored, and summarized.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup?role=company"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:shadow-purple-600/40 hover:scale-105"
              >
                For Companies
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/auth/signup?role=candidate"
                className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 px-8 py-3.5 text-base font-semibold text-gray-200 transition-all hover:bg-gray-800 hover:border-gray-600 hover:scale-105"
              >
                For Candidates
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Levels Section */}
      <section className="py-24 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              5 Levels of AI Control
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              From zero AI to full copilot -- you decide exactly how much help candidates get.
              Every level is logged, audited, and scored differently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {aiLevels.map((ai) => (
              <div
                key={ai.level}
                className={`relative rounded-xl border bg-gradient-to-b p-6 transition-transform hover:scale-105 ${ai.color}`}
              >
                <div className={`mb-4 ${ai.textColor}`}>{ai.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-mono font-bold ${ai.textColor}`}>
                    {ai.level}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{ai.label}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {ai.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              From template creation to hire decision in 6 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative group">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 transition-all group-hover:border-purple-500/50 group-hover:bg-gray-900/80">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-bold text-white">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why Intervue.AI?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              See how we compare to existing interview platforms.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-400">
                    Intervue.AI
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                    HackerRank
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                    CoderPad
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                    Karat
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                    LeetCode
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-800/50 ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.intervue ? (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.hackerrank ? (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.coderpad ? (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.karat ? (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.leetcode ? (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your hiring needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 transition-all hover:scale-105 ${
                  plan.highlighted
                    ? "border-purple-500 bg-gradient-to-b from-purple-900/30 to-gray-900 shadow-lg shadow-purple-500/10"
                    : "border-gray-800 bg-gray-900"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{plan.description}</p>

                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="ml-1 text-gray-400">{plan.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg className="h-4 w-4 shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup?role=company"
                  className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
                      : "border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-xl font-bold tracking-tight text-white">
              Intervue<span className="text-blue-400">.AI</span>
            </span>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Intervue.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
