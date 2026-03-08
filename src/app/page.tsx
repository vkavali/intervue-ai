import Link from "next/link";

const aiLevels = [
  {
    level: "L0",
    label: "No AI",
    description: "Pure unassisted coding assessment.",
    color: "from-red-500 to-red-600",
    glow: "shadow-red-500/20",
  },
  {
    level: "L1",
    label: "Hint Only",
    description: "Socratic nudges without revealing answers.",
    color: "from-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/20",
  },
  {
    level: "L2",
    label: "Scaffold",
    description: "Solution skeletons with TODO comments.",
    color: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    level: "L3",
    label: "Guide",
    description: "Detailed explanations and approaches.",
    color: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/20",
  },
  {
    level: "L4",
    label: "Full Copilot",
    description: "Unrestricted AI -- code, debug, optimize.",
    color: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/20",
  },
];

const platformFeatures = [
  {
    title: "Live Code Editor",
    description: "Monaco-powered editor with syntax highlighting, autocomplete, and multi-language support. Candidates code in real-time while interviewers watch every keystroke.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "AI Audit Engine",
    description: "Every AI interaction is logged and audited. Get structured scorecards with problem comprehension, code quality, communication, and hire/no-hire recommendations.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    gradient: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "Video & Chat",
    description: "Built-in video conferencing and real-time chat between interviewer and candidate. No need for external tools -- everything in one place.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    gradient: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    title: "Candidate Pipeline",
    description: "Track candidates through screening, technical, behavioral, and final rounds. Manage stages, compare candidates with AI, and make data-driven decisions.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Calendar & Scheduling",
    description: "Visual calendar dashboard with monthly interview views, interviewer availability management, and automated scheduling with recurring slots.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    gradient: "from-cyan-500/20 to-teal-500/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    title: "Practice Mode",
    description: "AI-generated practice problems with custom difficulty, test cases, and starter code. Candidates prepare with the same tools they will use in real interviews.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    gradient: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    title: "Open Positions",
    description: "Track active job requisitions with headcount, department, and seniority. See pipeline candidates per position and manage hiring needs in one view.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: "from-indigo-500/20 to-blue-500/10",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    title: "Anti-Cheat Monitoring",
    description: "Tab switch detection, copy/paste tracking, window blur events, and suspicious behavior flagging -- all logged in real-time for complete integrity.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/20",
    iconColor: "text-red-400",
  },
];

const comparisonFeatures = [
  { feature: "5-Level AI Control", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Company-Controlled AI", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "AI Audit Engine", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Live Code + Video", intervue: true, hackerrank: true, coderpad: true, karat: true, leetcode: false },
  { feature: "Candidate Pipeline", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Calendar Scheduling", intervue: true, hackerrank: true, coderpad: false, karat: true, leetcode: false },
  { feature: "Practice Mode", intervue: true, hackerrank: true, coderpad: false, karat: false, leetcode: true },
  { feature: "AI Interaction Logging", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Hire/No-Hire AI", intervue: true, hackerrank: false, coderpad: false, karat: true, leetcode: false },
  { feature: "Anti-Cheat System", intervue: true, hackerrank: true, coderpad: false, karat: false, leetcode: false },
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
      "Calendar & scheduling",
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
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* ===== HERO SECTION with 3D floating mockups ===== */}
      <section className="relative min-h-[100vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-950 to-blue-900/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-purple-600/15 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                AI-Powered Interview Platform
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Interview
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Reimagined.
                </span>
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
                The platform where AI assistance is company-controlled, every session is
                auto-audited, and hiring decisions are backed by data -- not gut feelings.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup?role=company"
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-purple-600/25 transition-all hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Hiring Smarter
                  <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/auth/signup?role=candidate"
                  className="group inline-flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-gray-200 transition-all hover:bg-gray-800 hover:border-gray-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Practice for Free
                  <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Trust bar */}
              <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  5 free interviews
                </div>
              </div>
            </div>

            {/* Right: 3D Floating Mockup */}
            <div className="relative hidden lg:block" style={{ perspective: "1200px" }}>
              {/* Main dashboard mockup - rotated in 3D */}
              <div
                className="relative rounded-2xl border border-gray-700/50 bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden"
                style={{ transform: "rotateY(-8deg) rotateX(4deg) rotateZ(1deg)" }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-950/80 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-lg bg-gray-800/80 px-4 py-1 text-xs text-gray-500 font-mono">
                      intervue.ai/session/live
                    </div>
                  </div>
                </div>

                {/* Mock interview UI */}
                <div className="p-4 grid grid-cols-5 gap-3" style={{ minHeight: "320px" }}>
                  {/* Code editor area */}
                  <div className="col-span-3 rounded-lg border border-gray-800 bg-gray-950 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-400">JavaScript</div>
                      <div className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono text-yellow-400">Medium</div>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <p><span className="text-purple-400">function</span> <span className="text-blue-300">twoSum</span><span className="text-gray-500">(</span><span className="text-orange-300">nums</span><span className="text-gray-500">,</span> <span className="text-orange-300">target</span><span className="text-gray-500">)</span> <span className="text-gray-500">&#123;</span></p>
                      <p className="pl-4"><span className="text-purple-400">const</span> <span className="text-blue-300">map</span> <span className="text-gray-500">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-300">Map</span><span className="text-gray-500">();</span></p>
                      <p className="pl-4"><span className="text-purple-400">for</span> <span className="text-gray-500">(</span><span className="text-purple-400">let</span> <span className="text-blue-300">i</span> <span className="text-gray-500">=</span> <span className="text-green-300">0</span><span className="text-gray-500">;</span> <span className="text-blue-300">i</span> <span className="text-gray-500">&lt;</span> <span className="text-orange-300">nums</span><span className="text-gray-500">.</span><span className="text-blue-300">length</span><span className="text-gray-500">;</span> <span className="text-blue-300">i</span><span className="text-gray-500">++)</span> <span className="text-gray-500">&#123;</span></p>
                      <p className="pl-8"><span className="text-purple-400">const</span> <span className="text-blue-300">comp</span> <span className="text-gray-500">=</span> <span className="text-orange-300">target</span> <span className="text-gray-500">-</span> <span className="text-orange-300">nums</span><span className="text-gray-500">[</span><span className="text-blue-300">i</span><span className="text-gray-500">];</span></p>
                      <p className="pl-8"><span className="text-purple-400">if</span> <span className="text-gray-500">(</span><span className="text-blue-300">map</span><span className="text-gray-500">.</span><span className="text-yellow-300">has</span><span className="text-gray-500">(</span><span className="text-blue-300">comp</span><span className="text-gray-500">))</span></p>
                      <p className="pl-12"><span className="text-purple-400">return</span> <span className="text-gray-500">[</span><span className="text-blue-300">map</span><span className="text-gray-500">.</span><span className="text-yellow-300">get</span><span className="text-gray-500">(</span><span className="text-blue-300">comp</span><span className="text-gray-500">),</span> <span className="text-blue-300">i</span><span className="text-gray-500">];</span></p>
                      <p className="pl-8"><span className="text-blue-300">map</span><span className="text-gray-500">.</span><span className="text-yellow-300">set</span><span className="text-gray-500">(</span><span className="text-orange-300">nums</span><span className="text-gray-500">[</span><span className="text-blue-300">i</span><span className="text-gray-500">],</span> <span className="text-blue-300">i</span><span className="text-gray-500">);</span></p>
                      <p className="pl-4"><span className="text-gray-500">&#125;</span></p>
                      <p><span className="text-gray-500">&#125;</span><span className="animate-pulse text-white">|</span></p>
                    </div>
                  </div>

                  {/* Side panel */}
                  <div className="col-span-2 space-y-3">
                    {/* AI Chat */}
                    <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">AI</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">AI Assist (L2)</span>
                      </div>
                      <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2">
                        <p className="text-[10px] text-purple-300 leading-relaxed">
                          Consider using a HashMap to achieve O(n) time complexity. Think about what complement you need for each element...
                        </p>
                      </div>
                    </div>

                    {/* Video call mini */}
                    <div className="rounded-lg border border-gray-800 bg-gray-950 p-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="aspect-video rounded bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-[10px] text-purple-300 font-semibold">JD</div>
                        </div>
                        <div className="aspect-video rounded bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] text-blue-300 font-semibold">MK</div>
                        </div>
                      </div>
                    </div>

                    {/* Score preview */}
                    <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                      <p className="text-[10px] font-medium text-gray-400 mb-2">Live Assessment</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500">Problem Comprehension</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="w-[85%] h-full rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500">Code Quality</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="w-[72%] h-full rounded-full bg-blue-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500">AI Usage</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="w-[60%] h-full rounded-full bg-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card: Audit result (3D positioned) */}
              <div
                className="absolute -bottom-8 -left-12 w-56 rounded-xl border border-green-500/30 bg-gray-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-green-900/20"
                style={{ transform: "rotateY(8deg) rotateX(-2deg) translateZ(40px)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Audit Complete</p>
                    <p className="text-[10px] text-gray-400">Score: 87/100</p>
                  </div>
                </div>
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5">
                  <p className="text-[10px] text-green-400 font-medium">Recommendation: HIRE</p>
                </div>
              </div>

              {/* Floating card: AI Level indicator */}
              <div
                className="absolute -top-4 -right-8 w-44 rounded-xl border border-purple-500/30 bg-gray-900/95 backdrop-blur-xl p-3 shadow-2xl shadow-purple-900/20"
                style={{ transform: "rotateY(-12deg) rotateX(6deg) translateZ(60px)" }}
              >
                <p className="text-[10px] font-medium text-gray-400 mb-2">AI Level Control</p>
                <div className="flex gap-1">
                  {["L0", "L1", "L2", "L3", "L4"].map((l, i) => (
                    <div
                      key={l}
                      className={`flex-1 rounded py-1 text-center text-[9px] font-bold ${
                        i === 2
                          ? "bg-blue-500 text-white"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs tracking-wider uppercase">Explore</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== VISUAL INTERVIEW FLOW - 3D Perspective Section ===== */}
      <section className="relative py-32 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-blue-900/5" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">The Complete Flow</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              From Job Posting to
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Hire Decision</span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              Watch how Intervue.AI transforms every step of the hiring process with intelligent automation and transparent AI auditing.
            </p>
          </div>

          {/* 3D Flow Cards */}
          <div className="relative" style={{ perspective: "1500px" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Create Position & Template",
                  desc: "Define your open role, configure interview questions, set AI levels per question, and customize difficulty.",
                  color: "from-purple-600 to-purple-800",
                  borderColor: "border-purple-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white font-medium">Senior Frontend Engineer</span>
                        <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">OPEN</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-800 overflow-hidden"><div className="w-2/3 h-full bg-purple-500 rounded-full" /></div>
                      <div className="flex gap-1">
                        <span className="text-[8px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">React</span>
                        <span className="text-[8px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">TypeScript</span>
                        <span className="text-[8px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">3 rounds</span>
                      </div>
                    </div>
                  ),
                },
                {
                  step: "02",
                  title: "Schedule & Invite",
                  desc: "Use the calendar to find available interviewer slots, schedule sessions, and send candidates their unique interview links.",
                  color: "from-blue-600 to-blue-800",
                  borderColor: "border-blue-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5">
                      <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {["S","M","T","W","T","F","S"].map((d,i) => (
                          <div key={i} className="text-center text-[7px] text-gray-500 font-medium">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({length: 14}, (_, i) => (
                          <div key={i} className={`text-center text-[8px] py-0.5 rounded ${
                            i === 5 ? "bg-purple-500 text-white font-bold" :
                            i === 8 ? "bg-blue-500/30 text-blue-300" :
                            "text-gray-500"
                          }`}>{i + 10}</div>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  step: "03",
                  title: "Live Interview",
                  desc: "Candidate codes in real-time with controlled AI. Interviewer watches, adjusts AI levels on the fly, and communicates via video + chat.",
                  color: "from-cyan-600 to-cyan-800",
                  borderColor: "border-cyan-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5">
                      <div className="flex gap-1.5">
                        <div className="flex-1 rounded bg-gray-900 p-1.5">
                          <div className="space-y-0.5 font-mono text-[7px] text-gray-400">
                            <p><span className="text-purple-400">fn</span> solve() &#123;</p>
                            <p className="pl-2"><span className="text-blue-300">let</span> result = <span className="text-green-300">vec!</span>[];</p>
                            <p className="pl-2 text-gray-600">// optimizing...</p>
                            <p>&#125;<span className="animate-pulse text-white">|</span></p>
                          </div>
                        </div>
                        <div className="w-12 space-y-1">
                          <div className="aspect-square rounded bg-purple-500/20 flex items-center justify-center text-[7px] text-purple-300">AI</div>
                          <div className="aspect-square rounded bg-green-500/20 flex items-center justify-center text-[7px] text-green-300">HD</div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  step: "04",
                  title: "AI Audits Everything",
                  desc: "Every keystroke, AI interaction, and behavior is logged. The audit engine generates structured scorecards automatically.",
                  color: "from-green-600 to-green-800",
                  borderColor: "border-green-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5 space-y-1">
                      {[
                        { label: "Problem Solving", pct: "88%", w: "w-[88%]", c: "bg-green-500" },
                        { label: "Code Quality", pct: "76%", w: "w-[76%]", c: "bg-blue-500" },
                        { label: "Communication", pct: "92%", w: "w-[92%]", c: "bg-purple-500" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-[8px] text-gray-400 w-20 truncate">{s.label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-gray-800"><div className={`h-full rounded-full ${s.c} ${s.w}`} /></div>
                          <span className="text-[8px] text-white font-medium w-6 text-right">{s.pct}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  step: "05",
                  title: "Pipeline & Compare",
                  desc: "Move candidates through pipeline stages. Generate AI comparisons between candidates competing for the same role.",
                  color: "from-amber-600 to-amber-800",
                  borderColor: "border-amber-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5">
                      <div className="space-y-1">
                        {[
                          { name: "Alex K.", stage: "TECHNICAL", score: "87", sc: "text-green-400" },
                          { name: "Sara M.", stage: "BEHAVIORAL", score: "82", sc: "text-blue-400" },
                          { name: "Jay P.", stage: "SCREENING", score: "--", sc: "text-gray-500" },
                        ].map((c) => (
                          <div key={c.name} className="flex items-center justify-between">
                            <span className="text-[9px] text-white">{c.name}</span>
                            <span className="text-[7px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{c.stage}</span>
                            <span className={`text-[9px] font-bold ${c.sc}`}>{c.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  step: "06",
                  title: "Hire with Confidence",
                  desc: "Make data-backed decisions with AI recommendations, detailed scorecards, risk flags, and candidate comparisons.",
                  color: "from-rose-600 to-rose-800",
                  borderColor: "border-rose-500/30",
                  mockup: (
                    <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1">
                        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[10px] font-bold text-green-400">RECOMMEND: HIRE</span>
                      </div>
                      <p className="mt-1.5 text-[8px] text-gray-500">Confidence: 94% | Score: 87/100</p>
                    </div>
                  ),
                },
              ].map((card, idx) => (
                <div
                  key={card.step}
                  className={`group rounded-2xl border ${card.borderColor} bg-gray-900/80 backdrop-blur-sm p-6 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1`}
                  style={{
                    transform: `rotateX(${idx % 2 === 0 ? 2 : -2}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-xs font-bold text-white shadow-lg`}>
                      {card.step}
                    </span>
                    <h3 className="text-base font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                  {card.mockup}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="relative py-32 bg-gray-900/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-4">Everything You Need</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              One Platform, Zero Gaps
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              Code editor, video calls, AI assistance, audit engine, pipeline tracking, scheduling, and practice mode -- all built in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformFeatures.map((f) => (
              <div
                key={f.title}
                className={`group rounded-xl border ${f.border} bg-gradient-to-b ${f.gradient} p-6 transition-all hover:scale-[1.03] hover:-translate-y-1`}
              >
                <div className={`mb-4 ${f.iconColor}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI LEVELS ===== */}
      <section className="py-32 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">The Core Differentiator</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              5 Levels of AI Control
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              You decide exactly how much help candidates get. Every level is logged, audited, and scored differently.
              Interviewers can even adjust levels mid-session.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-center">
            {aiLevels.map((ai) => (
              <div
                key={ai.level}
                className={`group relative flex-1 max-w-xs rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl ${ai.glow}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${ai.color} mb-4 shadow-lg`}>
                  <span className="text-sm font-bold text-white">{ai.level}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{ai.label}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{ai.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR CANDIDATES ===== */}
      <section className="relative py-32 bg-gray-900/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-4">For Candidates</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Practice, Prepare,
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Perform</span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Get access to AI-generated practice problems, a professional code editor, and the exact same environment
                you will use in your real interview. Build confidence before the big day.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: "AI Practice Problems", desc: "Custom-generated problems by difficulty, topic, and role" },
                  { title: "Real Interview Environment", desc: "Same Monaco editor, same AI levels, same experience" },
                  { title: "Schedule Interviews", desc: "Browse available slots and book your interview directly" },
                  { title: "Track Your Progress", desc: "View scores, audit feedback, and improvement areas" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup?role=candidate"
                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-600/20 transition-all hover:shadow-cyan-600/40 hover:scale-[1.02]"
              >
                Start Practicing Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* 3D Practice Mode Mockup */}
            <div className="hidden lg:block" style={{ perspective: "1200px" }}>
              <div
                className="rounded-2xl border border-gray-700/50 bg-gray-900/90 backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{ transform: "rotateY(6deg) rotateX(-3deg)" }}
              >
                <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-950/80 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 text-center text-[10px] text-gray-500 font-mono">Practice Mode</div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Two Sum</h4>
                    <div className="mt-1 flex gap-2">
                      <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">Easy</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">Arrays</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-medium">Hash Map</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-950 border border-gray-800 p-3 font-mono text-[10px] text-gray-400">
                    <p className="text-gray-500">// Given an array of integers nums and an integer</p>
                    <p className="text-gray-500">// target, return indices of the two numbers</p>
                    <p className="text-gray-500">// such that they add up to target.</p>
                    <p className="mt-2"><span className="text-purple-400">function</span> <span className="text-blue-300">twoSum</span>(nums, target) &#123;</p>
                    <p className="pl-3 text-gray-600">// Your code here<span className="animate-pulse text-white">|</span></p>
                    <p>&#125;</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 p-2.5 text-center">
                      <p className="text-[9px] text-gray-500 mb-0.5">Test Cases</p>
                      <p className="text-sm font-bold text-green-400">3/5</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 p-2.5 text-center">
                      <p className="text-[9px] text-gray-500 mb-0.5">Time</p>
                      <p className="text-sm font-bold text-white">12:34</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 p-2.5 text-center">
                      <p className="text-[9px] text-gray-500 mb-0.5">AI Level</p>
                      <p className="text-sm font-bold text-purple-400">L2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON TABLE ===== */}
      <section className="py-32 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400 mb-4">The Honest Comparison</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Why Intervue.AI?
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              The only platform built from scratch for the AI era of technical hiring.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800 shadow-2xl shadow-purple-900/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900">
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Feature</th>
                  <th className="px-6 py-5 text-center">
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-sm font-bold">Intervue.AI</span>
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-500">HackerRank</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-500">CoderPad</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-500">Karat</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-500">LeetCode</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-gray-800/50 ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"}`}>
                    <td className="px-6 py-4 text-sm text-gray-300 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.intervue ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-gray-600">&#10007;</span>
                      )}
                    </td>
                    {[row.hackerrank, row.coderpad, row.karat, row.leetcode].map((val, j) => (
                      <td key={j} className="px-6 py-4 text-center">
                        {val ? (
                          <span className="text-gray-400">&#10003;</span>
                        ) : (
                          <span className="text-gray-700">&#10007;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-32 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-4">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-purple-500 bg-gradient-to-b from-purple-900/30 to-gray-900 shadow-2xl shadow-purple-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
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
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/20"
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

      {/* ===== CTA BANNER ===== */}
      <section className="relative py-32 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Hiring?
            </span>
          </h2>
          <p className="mt-8 text-xl text-gray-400 max-w-2xl mx-auto">
            Join the companies using AI-controlled interviews to find the best engineers -- faster and more fairly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-2xl shadow-purple-600/25 transition-all hover:shadow-purple-600/40 hover:scale-[1.02]"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signup?role=candidate"
              className="inline-flex items-center justify-center rounded-xl border border-gray-600 bg-gray-900/80 backdrop-blur-sm px-10 py-4 text-lg font-semibold text-gray-200 transition-all hover:bg-gray-800 hover:border-gray-500 hover:scale-[1.02]"
            >
              I&apos;m a Candidate
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-gray-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Intervue<span className="text-blue-400">.AI</span>
              </span>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                The AI-controlled interview platform for modern engineering teams.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">For Companies</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signup?role=company" className="block text-sm text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link href="/#pricing" className="block text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/#features" className="block text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">For Candidates</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signup?role=candidate" className="block text-sm text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link href="/practice" className="block text-sm text-gray-400 hover:text-white transition-colors">Practice Mode</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signin" className="block text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Intervue.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
