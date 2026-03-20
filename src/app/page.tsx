"use client";

import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const aiLevels = [
  {
    level: "L0",
    label: "No AI",
    description: "Pure unassisted coding assessment.",
    color: "bg-red-50 border-red-200 text-red-600",
    badge: "bg-red-100 text-red-700",
  },
  {
    level: "L1",
    label: "Hint Only",
    description: "Socratic nudges without revealing answers.",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    level: "L2",
    label: "Scaffold",
    description: "Solution skeletons with TODO comments.",
    color: "bg-blue-50 border-blue-200 text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    level: "L3",
    label: "Guide",
    description: "Detailed explanations and approaches.",
    color: "bg-purple-50 border-purple-200 text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    level: "L4",
    label: "Full Copilot",
    description: "Unrestricted AI -- code, debug, optimize.",
    color: "bg-green-50 border-green-200 text-green-600",
    badge: "bg-green-100 text-green-700",
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
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "AI Audit Engine",
    description: "Every AI interaction is logged and audited. Get structured scorecards with problem comprehension, code quality, communication, and hire/no-hire recommendations.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "Video & Chat",
    description: "Built-in video conferencing and real-time chat. No external tools needed.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    title: "Candidate Pipeline",
    description: "Track candidates through screening, technical, behavioral, and final rounds.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Calendar & Scheduling",
    description: "Visual calendar with availability management and automated scheduling.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Practice Mode",
    description: "4,000+ problems with code execution in 7 languages and AI coaching.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    title: "Open Positions",
    description: "Track active requisitions with headcount and pipeline per position.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Anti-Cheat Monitoring",
    description: "Tab switch detection, copy/paste tracking, and suspicious behavior flagging.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    title: "Code Execution",
    description: "Run and judge code in 7 languages with real-time test case validation.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Pattern-Based Learning",
    description: "15 curated study patterns with 73 essential problems across all topics.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
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
  { feature: "Code Execution (7 Languages)", intervue: true, hackerrank: true, coderpad: true, karat: false, leetcode: true },
  { feature: "Pattern-Based Study Plans", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "XP & Leveling", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Achievement Badges", intervue: true, hackerrank: true, coderpad: false, karat: false, leetcode: false },
  { feature: "Daily Challenges", intervue: true, hackerrank: true, coderpad: false, karat: false, leetcode: true },
  { feature: "Leaderboard", intervue: true, hackerrank: true, coderpad: false, karat: false, leetcode: true },
  { feature: "Activity Heatmap", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: true },
  { feature: "School/University Mode", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
  { feature: "Enrollment Codes", intervue: true, hackerrank: false, coderpad: false, karat: false, leetcode: false },
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
    accent: "saffron",
    href: "/auth/signup?role=company",
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
      "4,000+ practice problems",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    accent: "saffron",
    href: "/auth/signup?role=company",
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
    accent: "saffron",
    href: "/auth/signup?role=company",
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
    accent: "saffron",
    href: "/auth/signup?role=company",
  },
  {
    name: "Education",
    price: "$5",
    period: "/student/month",
    description: "For schools and universities",
    features: [
      "Enrollment codes",
      "Student assignments",
      "Class-wide analytics",
      "XP & badge tracking",
      "Leaderboard per school",
      "Priority support",
    ],
    cta: "Set Up Your School",
    highlighted: false,
    accent: "pink",
    href: "/auth/signup?role=school",
  },
];

const faangCompanies = [
  { name: "Google", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { name: "Amazon", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { name: "Meta", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  { name: "Apple", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  { name: "Netflix", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="gradient-orb w-[800px] h-[800px] bg-saffron/25 -top-60 -right-40 opacity-30" />
        <div className="gradient-orb w-[600px] h-[600px] bg-india-green/25 bottom-0 -left-40 opacity-30" />
        <div className="gradient-orb w-[400px] h-[400px] bg-pink-300/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <ScrollReveal className="text-center max-w-4xl mx-auto">
            <div className="floating-chip mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-india-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-india-green" />
              </span>
              Now with 5-level AI control & audit engine
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-semibold tracking-tight leading-[1.05]">
              <span className="text-gray-900">The future of</span>
              <br />
              <span className="bg-gradient-to-r from-saffron via-orange-500 to-india-green bg-clip-text text-transparent">
                technical hiring
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Company-controlled AI assistance. Auto-audited sessions. Candidate gamification with XP, badges, and leaderboards. Everything in one platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link href="/auth/signup?role=company" className="pill-cta-primary group">
                Start Hiring Smarter
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/auth/signup?role=candidate" className="pill-cta-secondary group">
                Practice for Free
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/auth/signup?role=school" className="pill-cta-secondary group">
                For Schools
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </ScrollReveal>

          {/* Trust bar -- neutral colors */}
          <ScrollReveal delay={0.2} className="mt-20 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: "4,000+", label: "Problems" },
                { value: "7", label: "Languages" },
                { value: "17", label: "Badges" },
                { value: "15", label: "Study Patterns" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Browser mockup */}
          <ScrollReveal delay={0.4} className="mt-16 max-w-5xl mx-auto relative">
            <div className="rounded-2xl border border-gray-200/60 bg-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-400 font-mono">intervue.ai/session/live</div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-5 gap-3" style={{ minHeight: "300px" }}>
                <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-mono text-blue-600">JavaScript</div>
                    <div className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-mono text-yellow-600">Medium</div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <p><span className="text-purple-600">function</span> <span className="text-blue-600">twoSum</span><span className="text-gray-400">(nums, target)</span> <span className="text-gray-400">&#123;</span></p>
                    <p className="pl-4"><span className="text-purple-600">const</span> <span className="text-blue-600">map</span> = <span className="text-purple-600">new</span> <span className="text-yellow-600">Map</span><span className="text-gray-400">();</span></p>
                    <p className="pl-4"><span className="text-purple-600">for</span> <span className="text-gray-400">(let i = 0; i &lt; nums.length; i++)</span> <span className="text-gray-400">&#123;</span></p>
                    <p className="pl-8"><span className="text-purple-600">const</span> <span className="text-blue-600">comp</span> = target - nums[i];</p>
                    <p className="pl-8"><span className="text-purple-600">if</span> (map.has(comp)) <span className="text-purple-600">return</span> [map.get(comp), i];</p>
                    <p className="pl-8">map.set(nums[i], i);</p>
                    <p className="pl-4"><span className="text-gray-400">&#125;</span></p>
                    <p><span className="text-gray-400">&#125;</span><span className="animate-pulse text-gray-900">|</span></p>
                  </div>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="rounded-lg border border-gray-100 bg-white p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center"><span className="text-[8px] font-bold text-white">AI</span></div>
                      <span className="text-[10px] font-medium text-gray-500">AI Assist (L2)</span>
                    </div>
                    <div className="rounded-lg bg-saffron/5 border border-saffron/10 p-2">
                      <p className="text-[10px] text-saffron/80 leading-relaxed">Consider using a HashMap for O(n) time complexity...</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-white p-3">
                    <p className="text-[10px] font-medium text-gray-500 mb-2">Live Assessment</p>
                    {[
                      { label: "Comprehension", w: "w-[85%]", c: "bg-emerald-500" },
                      { label: "Code Quality", w: "w-[72%]", c: "bg-blue-500" },
                      { label: "AI Usage", w: "w-[60%]", c: "bg-saffron" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] text-gray-400 w-20">{s.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100"><div className={`${s.w} h-full rounded-full ${s.c}`} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-4 sm:left-8 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] p-4 w-52">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Audit Complete</p>
                  <p className="text-[10px] text-gray-400">Score: 87/100</p>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 px-3 py-1.5">
                <p className="text-[10px] text-emerald-700 font-semibold">RECOMMEND: HIRE</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 sm:right-8 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] p-3 w-44">
              <p className="text-[10px] font-medium text-gray-500 mb-2">AI Level Control</p>
              <div className="flex gap-1">
                {["L0", "L1", "L2", "L3", "L4"].map((l, i) => (
                  <div key={l} className={`flex-1 rounded-full py-1 text-center text-[9px] font-bold transition-all ${i === 2 ? "bg-gradient-to-r from-saffron to-india-green text-white shadow-sm" : "bg-gray-100 text-gray-400"}`}>{l}</div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 2. WHO IT'S FOR -- Glass Cards ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="gradient-orb w-[600px] h-[600px] bg-saffron/10 -top-40 right-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Built For Everyone</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">Three platforms, one product</h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {[
              {
                title: "Companies",
                desc: "Run AI-controlled technical interviews with full audit trails and data-driven hiring decisions.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                ),
                features: ["5-level AI control per interview", "Auto-generated scorecards", "Candidate pipeline & comparisons", "Calendar scheduling & video"],
                href: "/auth/signup?role=company",
                cta: "Start Hiring",
              },
              {
                title: "Candidates",
                desc: "Practice with 4,000+ problems, earn XP, unlock 17 badges, and climb the leaderboard.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
                  </svg>
                ),
                features: ["XP, levels, and streaks", "17 achievement badges", "Global leaderboard", "7-language code execution"],
                href: "/auth/signup?role=candidate",
                cta: "Start Practicing",
              },
              {
                title: "Schools",
                desc: "Enroll entire classrooms with one code. Assign problems, track student progress.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
                features: ["Enrollment codes for classes", "Assignment creation", "Class-wide analytics dashboard", "$5/student/month pricing"],
                href: "#schools",
                cta: "Learn More",
              },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <div className="group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-8 h-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-400 mb-5">{card.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={card.href} className="text-sm font-semibold text-gray-900 hover:opacity-70 transition-opacity">
                    {card.cta} &rarr;
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 3. HOW IT WORKS (DARK) ===== */}
      <section className="relative py-32 lg:py-40 bg-gray-950">
        <div className="gradient-orb w-[800px] h-[800px] bg-saffron/20 -top-60 -left-40 opacity-40" />
        <div className="gradient-orb w-[600px] h-[600px] bg-india-green/15 bottom-0 right-0 opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">The Complete Flow</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
              Six steps to your next
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> great hire</span>
            </h2>
          </ScrollReveal>

          {/* Asymmetric bento grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-6 gap-4" staggerDelay={0.08}>
            {[
              { step: "01", title: "Create Position", desc: "Define your open role, configure interview questions, set AI levels per question.", span: "md:col-span-2" },
              { step: "02", title: "Schedule & Invite", desc: "Find available slots, schedule sessions, and send candidates their unique links.", span: "md:col-span-2" },
              { step: "03", title: "Live Interview", desc: "Candidate codes in real-time. Interviewer watches, adjusts AI levels on the fly, communicates via video + chat.", span: "md:col-span-2" },
              { step: "04", title: "AI Audits Everything", desc: "Every keystroke, AI interaction, and behavior logged. Structured scorecards generated automatically.", span: "md:col-span-3" },
              { step: "05", title: "Pipeline & Compare", desc: "Move candidates through stages. Generate AI comparisons between candidates for the same role.", span: "md:col-span-3" },
              { step: "06", title: "Hire with Confidence", desc: "Make data-backed decisions with AI recommendations, scorecards, risk flags, and comparisons.", span: "md:col-span-6 md:max-w-2xl md:mx-auto" },
            ].map((card) => (
              <StaggerItem key={card.step} className={card.span}>
                <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 transition-all hover:bg-white/[0.06] hover:border-white/[0.12] h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-india-green text-xs font-bold text-white shadow-lg shadow-saffron/20">
                      {card.step}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 4. FEATURES GRID -- Bento ===== */}
      <section id="features" className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Everything You Need</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              One platform,<br /><span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">zero gaps</span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
            {platformFeatures.map((f, idx) => (
              <StaggerItem key={f.title} className={idx < 2 ? "sm:col-span-2 lg:col-span-2" : ""}>
                <div className="group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                  <div className="mb-4 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 5. SCHOOLS -- Simplified ===== */}
      <section id="schools" className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="gradient-orb w-[600px] h-[600px] bg-pink-200/15 top-20 -right-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">For Educators</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
              Your classroom,<br /><span className="text-pink-500">supercharged</span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" staggerDelay={0.1}>
            {[
              { step: "1", title: "Sign Up", desc: "Create your school admin account.", icon: "🏫" },
              { step: "2", title: "Share Code", desc: "One enrollment code for the class.", icon: "🔗" },
              { step: "3", title: "Assign", desc: "Set problems, difficulty, due dates.", icon: "📋" },
              { step: "4", title: "Monitor", desc: "Track class-wide progress & XP.", icon: "📊" },
            ].map((s) => (
              <StaggerItem key={s.step}>
                <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 text-center transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                  <span className="text-3xl mb-3 block">{s.icon}</span>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 mb-3">{s.step}</div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal>
            <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden max-w-4xl mx-auto">
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-pink-50 border border-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-600">School Admin</span>
                <span className="text-sm font-medium text-gray-900">Stanford CS Department</span>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Students", value: "142", color: "text-gray-900" },
                  { label: "Active", value: "89", color: "text-emerald-500" },
                  { label: "Avg Solved", value: "37", color: "text-saffron" },
                  { label: "Avg Level", value: "8.4", color: "text-india-green" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-12 text-center">
            <Link href="/auth/signup?role=school" className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40 hover:shadow-xl">
              Set Up Your School
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 6. AI LEVELS (DARK) ===== */}
      <section className="relative py-32 lg:py-40 bg-gray-950">
        <div className="gradient-orb w-[500px] h-[500px] bg-saffron/25 top-0 right-0 opacity-40" />
        <div className="gradient-orb w-[400px] h-[400px] bg-india-green/20 bottom-20 -left-20 opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">The Core Differentiator</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
              You control the AI.<br />
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">Not the other way around.</span>
            </h2>
          </ScrollReveal>

          {/* Level selector as horizontal strip */}
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {aiLevels.map((ai, i) => (
                <div key={ai.level} className={`group rounded-2xl border p-5 text-center transition-all ${
                  i === 2
                    ? "border-saffron/30 bg-gradient-to-b from-saffron/10 to-transparent shadow-[0_0_40px_-10px_rgba(255,153,0,0.3)]"
                    : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]"
                }`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                    i === 2 ? "bg-gradient-to-br from-saffron to-india-green shadow-lg" : "bg-white/[0.06] border border-white/10"
                  }`}>
                    <span className={`text-sm font-bold ${i === 2 ? "text-white" : "text-gray-400"}`}>{ai.level}</span>
                  </div>
                  <h3 className={`text-base font-semibold mb-1 ${i === 2 ? "text-white" : "text-gray-300"}`}>{ai.label}</h3>
                  <p className="text-xs text-gray-500">{ai.description}</p>
                  {i === 2 && <span className="mt-3 inline-block text-[10px] font-medium text-saffron bg-saffron/10 rounded-full px-3 py-0.5">Selected</span>}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="mt-12 text-center">
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Every AI interaction is logged, timestamped, and factored into the audit score. Interviewers can adjust levels mid-session with a single click.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 7. GAMIFICATION -- Glass Mockup ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="gradient-orb w-[600px] h-[600px] bg-saffron/10 top-20 -left-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-india-green text-xs font-bold text-white">12</span>
                      <span className="text-sm font-semibold text-gray-900">Level 12</span>
                    </div>
                    <span className="text-xs text-gray-400">2,450 / 3,000 XP</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="w-[82%] h-full rounded-full bg-gradient-to-r from-saffron to-india-green" />
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-saffron/5 to-orange-50 border border-saffron/10 p-4">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">14-Day Streak</p>
                    <p className="text-xs text-gray-400">Personal best: 23 days</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Activity Heatmap</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 28 }, (_, i) => {
                      const intensity = [0,1,0,2,3,1,0,0,2,3,3,2,1,0,1,2,3,3,2,1,0,1,3,3,2,3,3,2][i];
                      const colors = ["bg-gray-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"];
                      return <div key={i} className={`w-3 h-3 rounded-sm ${colors[intensity]}`} />;
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Recent Badges</p>
                  <div className="flex gap-2">
                    {[
                      { emoji: "🏆", name: "First Solve" },
                      { emoji: "🔥", name: "7-Day Streak" },
                      { emoji: "⚡", name: "Speed Demon" },
                      { emoji: "🧠", name: "DP Master" },
                      { emoji: "🎯", name: "Perfectionist" },
                    ].map((b) => (
                      <div key={b.name} className="flex flex-col items-center gap-1">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-lg cursor-default">{b.emoji}</span>
                        <span className="text-[9px] text-gray-400">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="right">
              <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Gamification</p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
                Practice shouldn&apos;t<br />feel like a{" "}
                <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">chore</span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Every solve earns XP, maintains your streak, and pushes you up the leaderboard. Unlock 17 badges and celebrate with confetti.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  "XP & Leveling", "17 Badges", "Global Leaderboard", "Daily Challenges", "Activity Heatmap", "Confetti Celebrations",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-saffron to-india-green shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/auth/signup?role=candidate" className="mt-10 inline-flex items-center gap-2 rounded-full bg-india-green px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-india-green/25 transition-all hover:shadow-india-green/40 hover:shadow-xl">
                Start Earning XP
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 8. FOR CANDIDATES -- Neutral Badges ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="gradient-orb w-[500px] h-[500px] bg-india-green/10 top-20 -right-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">For Candidates</p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
                Land your dream job at
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {faangCompanies.map((c) => (
                  <span key={c.name} className="inline-flex items-center rounded-full border border-gray-100 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-600">
                    {c.name}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {[
                  { title: "4,000+ Problems", desc: "Comprehensive bank covering all difficulty levels" },
                  { title: "7-Language Execution", desc: "JS, TS, Python, Java, C++, Go, and Rust" },
                  { title: "15 Study Patterns", desc: "Two Pointers, Sliding Window, DP, and more" },
                  { title: "AI Coaching", desc: "Get AI feedback, editorials, and weakness profiling" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/auth/signup?role=candidate" className="mt-10 inline-flex items-center gap-2 rounded-full bg-india-green px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-india-green/25 transition-all hover:shadow-india-green/40 hover:shadow-xl">
                Start Practicing Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="right">
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-2">intervue.ai/practice</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">Medium</span>
                      <h4 className="text-sm font-semibold text-gray-900 mt-1">Two Sum</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">+25 XP</p>
                      <p className="text-xs text-india-green font-medium">Arrays</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 font-mono text-[10px] text-gray-600 space-y-0.5">
                    <p><span className="text-purple-600">function</span> <span className="text-blue-600">twoSum</span>(nums, target) &#123;</p>
                    <p className="pl-3"><span className="text-purple-600">const</span> map = <span className="text-purple-600">new</span> Map();</p>
                    <p className="pl-3 text-gray-400">{"// Your code here..."}</p>
                    <p>&#125;</p>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Test 1: [2,7,11,15], target=9", pass: true },
                      { label: "Test 2: [3,2,4], target=6", pass: true },
                      { label: "Test 3: [3,3], target=6", pass: false },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-2 text-[10px]">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${t.pass ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                          {t.pass ? "✓" : "✗"}
                        </span>
                        <span className="text-gray-500">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 9. COMPARISON TABLE (DARK) ===== */}
      <section className="relative py-32 lg:py-40 bg-gray-950">
        <div className="gradient-orb w-[500px] h-[500px] bg-india-green/15 -top-20 -left-40 opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">The Honest Comparison</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white">
              Why teams switch to{" "}
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">Intervue</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Feature</th>
                    <th className="px-6 py-5 text-center">
                      <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent text-sm font-bold">Intervue.AI</span>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-600">HackerRank</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-600">CoderPad</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-600">Karat</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-600">LeetCode</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.feature} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-300 font-medium">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center">
                        {row.intervue ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : <span className="text-gray-700">&#10007;</span>}
                      </td>
                      {[row.hackerrank, row.coderpad, row.karat, row.leetcode].map((val, j) => (
                        <td key={j} className="px-6 py-3.5 text-center">
                          {val ? <span className="text-gray-500">&#10003;</span> : <span className="text-gray-700">&#10007;</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 10. PRICING -- Gradient Border ===== */}
      <section id="pricing" className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              Start free. Scale as you grow.
            </h2>
          </ScrollReveal>

          {/* Top row: first 3 plans */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.1}>
            {pricingPlans.slice(0, 3).map((plan) => (
              <StaggerItem key={plan.name}>
                {plan.highlighted ? (
                  <div className="rounded-2xl p-px bg-gradient-to-b from-saffron via-orange-400 to-india-green h-full shadow-[0_20px_60px_-15px_rgba(255,153,0,0.2)]">
                    <div className="relative rounded-[15px] bg-white p-7 h-full">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">Most Popular</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                      <div className="mt-5 flex items-baseline">
                        <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                        <span className="ml-1 text-gray-400">{plan.period}</span>
                      </div>
                      <ul className="mt-6 space-y-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg className="h-4 w-4 shrink-0 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.href} className="mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all">{plan.cta}</Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-7 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                    <div className="mt-5 flex items-baseline">
                      <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                      <span className="ml-1 text-gray-400">{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <svg className={`h-4 w-4 shrink-0 ${plan.accent === "pink" ? "text-pink-500" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href} className="mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">{plan.cta}</Link>
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Bottom row: last 2 plans, centered */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-6" staggerDelay={0.1}>
            {pricingPlans.slice(3).map((plan) => (
              <StaggerItem key={plan.name}>
                <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-7 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                  <div className="mt-5 flex items-baseline">
                    <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                    <span className="ml-1 text-gray-400">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg className={`h-4 w-4 shrink-0 ${plan.accent === "pink" ? "text-pink-500" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">{plan.cta}</Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 11. CTA BANNER -- Dark Inversion ===== */}
      <section className="py-24 bg-[#FAFAF8]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative rounded-3xl bg-gray-900 p-12 sm:p-20 text-center overflow-hidden">
              <div className="gradient-orb w-[500px] h-[500px] bg-saffron/30 -top-40 -right-40 opacity-50" />
              <div className="gradient-orb w-[400px] h-[400px] bg-india-green/30 -bottom-40 -left-40 opacity-50" />

              <div className="relative">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight">
                  Ready to hire
                  <br />
                  <span className="bg-gradient-to-r from-saffron via-orange-400 to-india-green bg-clip-text text-transparent">smarter?</span>
                </h2>
                <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
                  Join the companies using AI-controlled interviews to find the best engineers.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup?role=company" className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                    Start Hiring
                  </Link>
                  <Link href="/auth/signup?role=candidate" className="inline-flex items-center justify-center rounded-full border border-gray-600 px-10 py-4 text-lg font-semibold text-white hover:bg-white/[0.05] hover:border-gray-500 transition-all">
                    I&apos;m a Candidate
                  </Link>
                </div>
                <Link href="/auth/signup?role=school" className="mt-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors">
                  For Schools &rarr;
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 12. FOOTER -- Subtle ===== */}
      <footer className="border-t border-gray-100 py-20 lg:py-24 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div>
              <span className="text-2xl font-semibold tracking-tight text-gray-900">Intervue<span className="text-india-green">.AI</span></span>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">The AI-controlled interview platform for modern engineering teams.</p>
            </div>
            {[
              { title: "For Companies", links: [{ label: "Sign Up", href: "/auth/signup?role=company" }, { label: "Pricing", href: "/#pricing" }, { label: "Features", href: "/#features" }] },
              { title: "For Candidates", links: [{ label: "Sign Up", href: "/auth/signup?role=candidate" }, { label: "Practice Mode", href: "/practice" }, { label: "Study Plans", href: "/practice?tab=patterns" }, { label: "Leaderboard", href: "/leaderboard" }, { label: "Badges", href: "/candidate/badges" }] },
              { title: "For Schools", links: [{ label: "Sign Up", href: "/auth/signup?role=school" }, { label: "Enrollment", href: "/school/enrollment" }, { label: "Assignments", href: "/school/assignments" }, { label: "Analytics", href: "/school/analytics" }] },
              { title: "Platform", links: [{ label: "Sign In", href: "/auth/signin" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">{col.title}</h4>
                <div className="space-y-2.5">
                  {col.links.map((link) => (
                    <Link key={link.label} href={link.href} className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">{link.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Intervue.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
