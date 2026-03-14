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
    description: "Built-in video conferencing and real-time chat between interviewer and candidate. No need for external tools -- everything in one place.",
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
    description: "Track candidates through screening, technical, behavioral, and final rounds. Manage stages, compare candidates with AI, and make data-driven decisions.",
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
    description: "Visual calendar dashboard with monthly interview views, interviewer availability management, and automated scheduling with recurring slots.",
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
    description: "4,000+ problems with code execution in 7 languages, AI coaching, editorial walkthroughs, and 15 structured study patterns.",
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
    description: "Track active job requisitions with headcount, department, and seniority. See pipeline candidates per position and manage hiring needs in one view.",
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
    description: "Tab switch detection, copy/paste tracking, window blur events, and suspicious behavior flagging -- all logged in real-time for complete integrity.",
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
    description: "Run and judge code in 7 languages with real-time test case validation, instant feedback, and detailed error output.",
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
    description: "15 curated study patterns with 73 essential problems. Master Arrays, Trees, Graphs, DP and more with structured learning paths.",
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

const flowCards = [
  {
    step: "01",
    title: "Create Position & Template",
    desc: "Define your open role, configure interview questions, set AI levels per question, and customize difficulty.",
    color: "bg-purple-600",
    borderColor: "border-purple-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-900 font-medium">Senior Frontend Engineer</span>
          <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">OPEN</span>
        </div>
        <div className="h-1 rounded-full bg-gray-200 overflow-hidden"><div className="w-2/3 h-full bg-purple-500 rounded-full" /></div>
        <div className="flex gap-1">
          <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">React</span>
          <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">TypeScript</span>
          <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">3 rounds</span>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Schedule & Invite",
    desc: "Use the calendar to find available interviewer slots, schedule sessions, and send candidates their unique interview links.",
    color: "bg-blue-600",
    borderColor: "border-blue-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S","M","T","W","T","F","S"].map((d,i) => (
            <div key={i} className="text-center text-[7px] text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({length: 14}, (_, i) => (
            <div key={i} className={`text-center text-[8px] py-0.5 rounded ${
              i === 5 ? "bg-purple-500 text-white font-bold" :
              i === 8 ? "bg-blue-100 text-blue-700" :
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
    color: "bg-cyan-600",
    borderColor: "border-cyan-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
        <div className="flex gap-1.5">
          <div className="flex-1 rounded bg-white border border-gray-100 p-1.5">
            <div className="space-y-0.5 font-mono text-[7px] text-gray-500">
              <p><span className="text-purple-600">fn</span> solve() &#123;</p>
              <p className="pl-2"><span className="text-blue-600">let</span> result = <span className="text-green-600">vec!</span>[];</p>
              <p className="pl-2 text-gray-400">{"// optimizing..."}</p>
              <p>&#125;<span className="animate-pulse text-gray-900">|</span></p>
            </div>
          </div>
          <div className="w-12 space-y-1">
            <div className="aspect-square rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-[7px] text-purple-600">AI</div>
            <div className="aspect-square rounded bg-green-50 border border-green-200 flex items-center justify-center text-[7px] text-green-600">HD</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "AI Audits Everything",
    desc: "Every keystroke, AI interaction, and behavior is logged. The audit engine generates structured scorecards automatically.",
    color: "bg-green-600",
    borderColor: "border-green-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5 space-y-1">
        {[
          { label: "Problem Solving", pct: "88%", w: "w-[88%]", c: "bg-green-500" },
          { label: "Code Quality", pct: "76%", w: "w-[76%]", c: "bg-blue-500" },
          { label: "Communication", pct: "92%", w: "w-[92%]", c: "bg-purple-500" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[8px] text-gray-500 w-20 truncate">{s.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200"><div className={`h-full rounded-full ${s.c} ${s.w}`} /></div>
            <span className="text-[8px] text-gray-700 font-medium w-6 text-right">{s.pct}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "05",
    title: "Pipeline & Compare",
    desc: "Move candidates through pipeline stages. Generate AI comparisons between candidates competing for the same role.",
    color: "bg-amber-600",
    borderColor: "border-amber-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
        <div className="space-y-1">
          {[
            { name: "Alex K.", stage: "TECHNICAL", score: "87", sc: "text-green-600" },
            { name: "Sara M.", stage: "BEHAVIORAL", score: "82", sc: "text-blue-600" },
            { name: "Jay P.", stage: "SCREENING", score: "--", sc: "text-gray-400" },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <span className="text-[9px] text-gray-700">{c.name}</span>
              <span className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{c.stage}</span>
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
    color: "bg-rose-600",
    borderColor: "border-rose-200",
    mockup: (
      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-2.5 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1">
          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] font-bold text-green-700">RECOMMEND: HIRE</span>
        </div>
        <p className="mt-1.5 text-[8px] text-gray-400">Confidence: 94% | Score: 87/100</p>
      </div>
    ),
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
    <div className="min-h-screen bg-[#FAFAF8] overflow-hidden">
      {/* ===== 1. HERO -- Centered Layout ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        {/* Gradient orbs */}
        <div className="gradient-orb w-[600px] h-[600px] bg-saffron/30 -top-40 right-0" />
        <div className="gradient-orb w-[500px] h-[500px] bg-india-green/30 -bottom-20 -left-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <ScrollReveal className="text-center max-w-4xl mx-auto">
            {/* Floating announcement chip */}
            <div className="inline-flex items-center gap-2 floating-chip mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-india-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-india-green" />
              </span>
              AI-Powered Interview + Practice Platform
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-semibold tracking-tight leading-[1.08]">
              <span className="text-gray-900">
                Interview
              </span>
              <br />
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">
                Reimagined.
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              The platform where AI assistance is company-controlled, every session is
              auto-audited, and candidates earn XP, unlock badges, and compete on leaderboards.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup?role=company"
                className="pill-cta-primary group"
              >
                Start Hiring Smarter
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/auth/signup?role=candidate"
                className="pill-cta-secondary group"
              >
                Practice for Free
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-lg">4,000+</span>
                <span>Problems</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-lg">7</span>
                <span>Languages</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-lg">17</span>
                <span>Badges</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-lg">15</span>
                <span>Patterns</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Browser mockup below text -- flat, no 3D transforms */}
          <ScrollReveal delay={0.3} className="mt-16 max-w-5xl mx-auto relative">
            <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-2xl shadow-gray-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-400 font-mono">
                    intervue.ai/session/live
                  </div>
                </div>
              </div>

              {/* Mock interview UI */}
              <div className="p-4 grid grid-cols-5 gap-3 bg-white/80" style={{ minHeight: "320px" }}>
                {/* Code editor area */}
                <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-mono text-gray-600">JavaScript</div>
                    <div className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-mono text-gray-500">Medium</div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <p><span className="text-purple-600">function</span> <span className="text-blue-600">twoSum</span><span className="text-gray-400">(</span><span className="text-orange-500">nums</span><span className="text-gray-400">,</span> <span className="text-orange-500">target</span><span className="text-gray-400">)</span> <span className="text-gray-400">&#123;</span></p>
                    <p className="pl-4"><span className="text-purple-600">const</span> <span className="text-blue-600">map</span> <span className="text-gray-400">=</span> <span className="text-purple-600">new</span> <span className="text-yellow-600">Map</span><span className="text-gray-400">();</span></p>
                    <p className="pl-4"><span className="text-purple-600">for</span> <span className="text-gray-400">(</span><span className="text-purple-600">let</span> <span className="text-blue-600">i</span> <span className="text-gray-400">=</span> <span className="text-green-600">0</span><span className="text-gray-400">;</span> <span className="text-blue-600">i</span> <span className="text-gray-400">&lt;</span> <span className="text-orange-500">nums</span><span className="text-gray-400">.</span><span className="text-blue-600">length</span><span className="text-gray-400">;</span> <span className="text-blue-600">i</span><span className="text-gray-400">++)</span> <span className="text-gray-400">&#123;</span></p>
                    <p className="pl-8"><span className="text-purple-600">const</span> <span className="text-blue-600">comp</span> <span className="text-gray-400">=</span> <span className="text-orange-500">target</span> <span className="text-gray-400">-</span> <span className="text-orange-500">nums</span><span className="text-gray-400">[</span><span className="text-blue-600">i</span><span className="text-gray-400">];</span></p>
                    <p className="pl-8"><span className="text-purple-600">if</span> <span className="text-gray-400">(</span><span className="text-blue-600">map</span><span className="text-gray-400">.</span><span className="text-yellow-600">has</span><span className="text-gray-400">(</span><span className="text-blue-600">comp</span><span className="text-gray-400">))</span></p>
                    <p className="pl-12"><span className="text-purple-600">return</span> <span className="text-gray-400">[</span><span className="text-blue-600">map</span><span className="text-gray-400">.</span><span className="text-yellow-600">get</span><span className="text-gray-400">(</span><span className="text-blue-600">comp</span><span className="text-gray-400">),</span> <span className="text-blue-600">i</span><span className="text-gray-400">];</span></p>
                    <p className="pl-8"><span className="text-blue-600">map</span><span className="text-gray-400">.</span><span className="text-yellow-600">set</span><span className="text-gray-400">(</span><span className="text-orange-500">nums</span><span className="text-gray-400">[</span><span className="text-blue-600">i</span><span className="text-gray-400">],</span> <span className="text-blue-600">i</span><span className="text-gray-400">);</span></p>
                    <p className="pl-4"><span className="text-gray-400">&#125;</span></p>
                    <p><span className="text-gray-400">&#125;</span><span className="animate-pulse text-gray-900">|</span></p>
                  </div>
                </div>

                {/* Side panel */}
                <div className="col-span-2 space-y-3">
                  <div className="rounded-lg border border-gray-100 bg-white/70 backdrop-blur-sm p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">AI</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">AI Assist (L2)</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Consider using a HashMap to achieve O(n) time complexity. Think about what complement you need...
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-white/70 p-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="aspect-video rounded bg-gray-50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-semibold">JD</div>
                      </div>
                      <div className="aspect-video rounded bg-gray-50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-semibold">MK</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-white/70 backdrop-blur-sm p-3">
                    <p className="text-[10px] font-medium text-gray-500 mb-2">Live Assessment</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Comprehension", w: "w-[85%]", c: "bg-gray-900" },
                        { label: "Code Quality", w: "w-[72%]", c: "bg-gray-700" },
                        { label: "AI Usage", w: "w-[60%]", c: "bg-gray-500" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400">{s.label}</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`${s.w} h-full rounded-full ${s.c}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating: Audit result -- glass-card, no 3D transforms */}
            <div className="absolute -bottom-6 -left-4 sm:left-4 w-52 rounded-2xl glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Audit Complete</p>
                  <p className="text-[10px] text-gray-400">Score: 87/100</p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Recommendation: HIRE</p>
              </div>
            </div>

            {/* Floating: AI Level indicator -- glass-card */}
            <div className="absolute -top-4 -right-4 sm:right-4 w-44 rounded-2xl glass-card p-3">
              <p className="text-[10px] font-medium text-gray-500 mb-2">AI Level Control</p>
              <div className="flex gap-1">
                {["L0", "L1", "L2", "L3", "L4"].map((l, i) => (
                  <div
                    key={l}
                    className={`flex-1 rounded-full py-1 text-center text-[9px] font-bold ${
                      i === 2
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
          <span className="text-xs tracking-wider uppercase">Explore</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== 2. WHO IT'S FOR -- Glass Cards ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        {/* Subtle gradient orb */}
        <div className="gradient-orb w-[500px] h-[500px] bg-saffron/20 top-20 -right-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Built For Everyone</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              Who It&apos;s For
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {/* Companies */}
            <StaggerItem>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-8 h-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Companies</h3>
                <p className="text-sm text-gray-400 mb-4">Run AI-controlled technical interviews with full audit trails and data-driven hiring decisions.</p>
                <ul className="space-y-2 mb-6">
                  {["5-level AI control per interview", "Auto-generated scorecards", "Candidate pipeline & comparisons", "Calendar scheduling & video"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup?role=company" className="text-sm font-semibold text-gray-900 hover:text-gray-600">
                  Start Hiring &rarr;
                </Link>
              </div>
            </StaggerItem>

            {/* Candidates */}
            <StaggerItem>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-8 h-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Candidates</h3>
                <p className="text-sm text-gray-400 mb-4">Practice with 4,000+ problems, earn XP, unlock 17 badges, and climb the leaderboard.</p>
                <ul className="space-y-2 mb-6">
                  {["XP, levels, and streaks", "17 achievement badges", "Global leaderboard", "7-language code execution"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup?role=candidate" className="text-sm font-semibold text-gray-900 hover:text-gray-600">
                  Start Practicing &rarr;
                </Link>
              </div>
            </StaggerItem>

            {/* Schools */}
            <StaggerItem>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-8 h-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Schools & Universities</h3>
                <p className="text-sm text-gray-400 mb-4">Enroll entire classrooms with one code. Assign problems, track student progress, and view class analytics.</p>
                <ul className="space-y-2 mb-6">
                  {["Enrollment codes for classes", "Assignment creation", "Class-wide analytics dashboard", "$5/student/month pricing"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="#schools" className="text-sm font-semibold text-gray-900 hover:text-gray-600">
                  Learn More &rarr;
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 3. HOW IT WORKS -- Bento Grid ===== */}
      <section className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">The Complete Flow</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
              From Job Posting to
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> Hire Decision</span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              Watch how Intervue.AI transforms every step of the hiring process with intelligent automation and transparent AI auditing.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {flowCards.map((card, idx) => (
              <StaggerItem key={card.step}>
                <div
                  className={`group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 h-full ${
                    idx === 2 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-xs font-bold text-gray-900">
                      {card.step}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                  {card.mockup}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 4. GAMIFICATION SHOWCASE -- Glass Mockup ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        {/* Gradient orb */}
        <div className="gradient-orb w-[600px] h-[600px] bg-saffron/10 top-20 -left-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Gamification Mockup -- glassmorphic */}
            <ScrollReveal>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl shadow-gray-200/50 p-6 space-y-5">
                {/* XP Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-gray-900">12</span>
                      <span className="text-sm font-semibold text-gray-900">Level 12</span>
                    </div>
                    <span className="text-xs text-gray-400">2,450 / 3,000 XP</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="w-[82%] h-full rounded-full bg-gradient-to-r from-saffron to-india-green" />
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">14-Day Streak</p>
                    <p className="text-xs text-gray-400">Personal best: 23 days</p>
                  </div>
                </div>

                {/* Heatmap mini */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Activity Heatmap</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 28 }, (_, i) => {
                      const intensity = [0,1,0,2,3,1,0,0,2,3,3,2,1,0,1,2,3,3,2,1,0,1,3,3,2,3,3,2][i];
                      const colors = ["bg-gray-100", "bg-green-200", "bg-green-400", "bg-green-600"];
                      return <div key={i} className={`w-3 h-3 rounded-sm ${colors[intensity]}`} />;
                    })}
                  </div>
                </div>

                {/* Badge row */}
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
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-lg">{b.emoji}</span>
                        <span className="text-[9px] text-gray-400">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Content */}
            <ScrollReveal delay={0.2} direction="right">
              <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Gamification</p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
                Earn XP. Level Up.
                <br />
                <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">Compete.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Practice isn&apos;t just about solving problems -- it&apos;s about building momentum. Every solve earns XP, maintains your streak, and pushes you up the leaderboard.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: "XP & Leveling System", desc: "Earn XP for every problem solved. Level up to unlock new milestones and show your progress." },
                  { title: "17 Achievement Badges", desc: "From First Solve to DP Master -- unlock badges that showcase your skills." },
                  { title: "Global Leaderboard", desc: "Compete with developers worldwide. See where you rank by XP, problems solved, and streaks." },
                  { title: "Daily Challenges", desc: "A new curated problem every day. Keep your streak alive and earn bonus XP." },
                  { title: "Activity Heatmap", desc: "Visualize your consistency over time, GitHub-style. See your coding patterns at a glance." },
                  { title: "Confetti Celebrations", desc: "Unlock a badge? Level up? Get a satisfying confetti burst to celebrate your wins." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup?role=candidate"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-india-green px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-india-green/20 transition-all hover:shadow-india-green/40 hover:shadow-xl"
              >
                Start Earning XP
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 5. SCHOOL/UNIVERSITY PARTNERSHIP -- Simplified ===== */}
      <section id="schools" className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        {/* Gradient orb */}
        <div className="gradient-orb w-[500px] h-[500px] bg-pink-200/15 top-40 right-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">For Educators</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
              Bring Coding Practice to
              <span className="text-pink-500"> Your Classroom</span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              Set up your school in minutes. Share an enrollment code with students and get a complete analytics dashboard to track class-wide progress.
            </p>
          </ScrollReveal>

          {/* 4-step flow -- glassmorphic cards */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" staggerDelay={0.1}>
            {[
              { step: "1", title: "Sign Up as School", desc: "Create a school admin account and set up your institution profile.", icon: "🏫" },
              { step: "2", title: "Share Enrollment Code", desc: "Get a unique enrollment code. Students enter it during signup to join your school.", icon: "🔗" },
              { step: "3", title: "Assign Problems", desc: "Create assignments with specific problems, difficulty levels, and due dates.", icon: "📋" },
              { step: "4", title: "Monitor Analytics", desc: "Track XP, streaks, problems solved, and time spent across your entire class.", icon: "📊" },
            ].map((s) => (
              <StaggerItem key={s.step}>
                <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 text-center transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                  <span className="text-3xl mb-3 block">{s.icon}</span>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white text-gray-900 text-sm font-bold mb-3">{s.step}</div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Feature deep dive */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Dashboard mockup */}
            <ScrollReveal>
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">School Admin</span>
                    <span className="text-sm font-medium text-gray-900">Stanford CS Department</span>
                  </div>
                </div>
                {/* Stats grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">142</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Active This Week</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">89</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Avg Problems Solved</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">37</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Avg Level</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">8.4</p>
                  </div>
                </div>
                {/* Student table */}
                <div className="px-6 pb-6">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-400 font-medium">Student</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Level</th>
                        <th className="text-left py-2 text-gray-400 font-medium">XP</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: "Alex K.", level: 14, xp: "3,200", streak: 21 },
                        { name: "Sara M.", level: 12, xp: "2,800", streak: 14 },
                        { name: "Jay P.", level: 10, xp: "2,100", streak: 7 },
                      ].map((s) => (
                        <tr key={s.name}>
                          <td className="py-2 text-gray-700 font-medium">{s.name}</td>
                          <td className="py-2"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-900">{s.level}</span></td>
                          <td className="py-2 text-gray-400">{s.xp}</td>
                          <td className="py-2 text-gray-400">🔥 {s.streak}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Feature bullets */}
            <ScrollReveal delay={0.2} direction="right">
              <div className="space-y-4">
                {[
                  { title: "One Enrollment Code", desc: "Share a single code with your entire class. Students enter it at signup and are automatically linked to your school." },
                  { title: "Custom Assignments", desc: "Pick specific problems, set difficulty levels and due dates. Track completion rates and scores." },
                  { title: "Class-Wide Analytics", desc: "See aggregated stats: total problems solved, average XP, time spent, and activity trends across all students." },
                  { title: "Individual Student Tracking", desc: "Drill down into any student to see their XP, level, streak, problems solved, and time spent." },
                  { title: "XP & Badge Leaderboard", desc: "Foster healthy competition with a school-specific leaderboard showing top performers." },
                  { title: "Affordable Pricing", desc: "Just $5 per student per month. No setup fees, no contracts. Cancel anytime." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup?role=school"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-pink-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/40 hover:shadow-xl"
              >
                Set Up Your School
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 6. AI LEVELS -- Neutral Cards ===== */}
      <section className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">The Core Differentiator</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              5 Levels of AI Control
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              You decide exactly how much help candidates get. Every level is logged, audited, and scored differently.
              Interviewers can even adjust levels mid-session.
            </p>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* AI Level Selector Mockup -- glassmorphic */}
            <ScrollReveal direction="left">
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl shadow-gray-200/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">AI Level Controller</span>
                </div>
                <div className="space-y-2">
                  {aiLevels.map((ai, i) => (
                    <div
                      key={ai.level}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        i === 2 ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900/10" : "border-gray-100 bg-white/70"
                      }`}
                    >
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold text-gray-900">
                        {ai.level}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${i === 2 ? "text-gray-900" : "text-gray-900"}`}>{ai.label}</p>
                        <p className="text-xs text-gray-400">{ai.description}</p>
                      </div>
                      {i === 2 && (
                        <span className="text-xs font-medium text-white bg-gray-900 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Level cards -- uniform neutral */}
            <StaggerContainer className="space-y-3" staggerDelay={0.1}>
              {aiLevels.map((ai) => (
                <StaggerItem key={ai.level}>
                  <div className="group relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                      <span className="text-sm font-bold text-gray-900">{ai.level}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{ai.label}</h3>
                      <p className="text-sm text-gray-400">{ai.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ===== 7. FEATURES GRID -- Bento Grid ===== */}
      <section id="features" className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Everything You Need</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              One Platform, Zero Gaps
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              Code editor, video calls, AI assistance, audit engine, pipeline tracking, scheduling, code execution in 7 languages, and 4,000+ practice problems -- all built in.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
            {platformFeatures.map((f, idx) => (
              <StaggerItem key={f.title}>
                <div
                  className={`group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full ${
                    idx < 2 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="mb-4 w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
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

      {/* ===== 8. FOR CANDIDATES -- Neutral Badges ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        {/* Gradient orb */}
        <div className="gradient-orb w-[500px] h-[500px] bg-india-green/10 top-40 -right-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">For Candidates</p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
                Practice, Prepare,
                <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> Perform</span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Get access to 4,000+ practice problems, 15 study patterns, code execution in 7 languages, AI coaching,
                and the exact same environment you will use in your real interview.
              </p>

              {/* FAANG badges -- neutral pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {faangCompanies.map((c) => (
                  <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    {c.name}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {[
                  { title: "4,000+ Problems", desc: "Comprehensive problem bank covering all difficulty levels and topics" },
                  { title: "7-Language Execution", desc: "Run and test code in JS, TS, Python, Java, C++, Go, and Rust" },
                  { title: "15 Study Patterns", desc: "Two Pointers, Sliding Window, BFS/DFS, Dynamic Programming, and more" },
                  { title: "AI Coaching & Editorial", desc: "Get AI-powered coaching feedback, editorials, and weakness profiling" },
                  { title: "XP, Badges & Leaderboard", desc: "Earn XP, unlock 17 achievement badges, and compete globally" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup?role=candidate"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-india-green px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-india-green/20 transition-all hover:shadow-india-green/40 hover:shadow-xl"
              >
                Start Practicing Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>

            {/* Right: Practice page mockup -- glassmorphic */}
            <ScrollReveal delay={0.2} direction="right">
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-2">intervue.ai/practice</span>
                </div>
                <div className="p-6 space-y-4">
                  {/* Problem header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full font-medium">Medium</span>
                      <h4 className="text-sm font-semibold text-gray-900 mt-1">Two Sum</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">+25 XP</p>
                      <p className="text-xs text-gray-600 font-medium">Arrays</p>
                    </div>
                  </div>
                  {/* Mini editor */}
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 font-mono text-[10px] text-gray-600 space-y-0.5">
                    <p><span className="text-purple-600">function</span> <span className="text-blue-600">twoSum</span>(nums, target) &#123;</p>
                    <p className="pl-3"><span className="text-purple-600">const</span> map = <span className="text-purple-600">new</span> Map();</p>
                    <p className="pl-3 text-gray-400">{"// Your code here..."}</p>
                    <p>&#125;</p>
                  </div>
                  {/* Test results */}
                  <div className="space-y-1.5">
                    {[
                      { label: "Test 1: [2,7,11,15], target=9", pass: true },
                      { label: "Test 2: [3,2,4], target=6", pass: true },
                      { label: "Test 3: [3,3], target=6", pass: false },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-2 text-[10px]">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${t.pass ? "bg-gray-50 text-gray-900" : "bg-gray-50 text-gray-400"}`}>
                          {t.pass ? "✓" : "✗"}
                        </span>
                        <span className="text-gray-400">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 9. COMPARISON TABLE -- Refined ===== */}
      <section className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">The Honest Comparison</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              Why Intervue.AI?
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              The only platform built from scratch for the AI era of technical hiring.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl shadow-gray-200/50">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Feature</th>
                    <th className="px-6 py-5 text-center">
                      <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent text-sm font-bold">Intervue.AI</span>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">HackerRank</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">CoderPad</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">Karat</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-400">LeetCode</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.intervue ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-200">&#10007;</span>
                        )}
                      </td>
                      {[row.hackerrank, row.coderpad, row.karat, row.leetcode].map((val, j) => (
                        <td key={j} className="px-6 py-4 text-center">
                          {val ? (
                            <span className="text-gray-400">&#10003;</span>
                          ) : (
                            <span className="text-gray-200">&#10007;</span>
                          )}
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
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {pricingPlans.map((plan) => (
              <StaggerItem key={plan.name}>
                {plan.highlighted ? (
                  /* Gradient border wrapper for highlighted card */
                  <div className="rounded-2xl bg-gradient-to-b from-saffron/40 to-india-green/40 p-px h-full">
                    <div className="relative rounded-2xl bg-white p-7 h-full">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                          Most Popular
                        </span>
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
                            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={plan.href}
                        className="mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold bg-gray-900 text-white transition-all hover:bg-gray-800 hover:shadow-xl"
                      >
                        {plan.cta}
                      </Link>
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
                          <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className="mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 hover:shadow-lg"
                    >
                      {plan.cta}
                    </Link>
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 11. CTA BANNER -- Dark Inversion ===== */}
      <section className="py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative rounded-3xl bg-gray-900 p-12 sm:p-16 text-center overflow-hidden">
              {/* Gradient orbs inside dark section */}
              <div className="gradient-orb w-[400px] h-[400px] bg-saffron/20 -top-20 -right-20" />
              <div className="gradient-orb w-[300px] h-[300px] bg-india-green/20 -bottom-20 -left-20" />

              <div className="relative">
                <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
                  Ready to Transform
                  <br />
                  <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">
                    Your Hiring?
                  </span>
                </h2>
                <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
                  Join the companies using AI-controlled interviews to find the best engineers -- faster and more fairly.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup?role=company"
                    className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-gray-900 transition-all hover:bg-gray-100 hover:shadow-xl"
                  >
                    Start Hiring
                  </Link>
                  <Link
                    href="/auth/signup?role=candidate"
                    className="inline-flex items-center justify-center rounded-full border border-gray-600 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-gray-800 hover:border-gray-500"
                  >
                    I&apos;m a Candidate
                  </Link>
                </div>
                <Link
                  href="/auth/signup?role=school"
                  className="mt-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  For Schools &rarr;
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 12. FOOTER -- Subtle ===== */}
      <footer className="bg-[#FAFAF8] border-t border-gray-100 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div>
              <span className="text-2xl font-semibold tracking-tight text-gray-900">
                Intervue<span className="text-india-green">.AI</span>
              </span>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                The AI-controlled interview platform for modern engineering teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">For Companies</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signup?role=company" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign Up</Link>
                <Link href="/#pricing" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="/#features" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">For Candidates</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signup?role=candidate" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign Up</Link>
                <Link href="/practice" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Practice Mode</Link>
                <Link href="/practice?tab=patterns" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Study Plans</Link>
                <Link href="/leaderboard" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Leaderboard</Link>
                <Link href="/candidate/badges" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Badges</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">For Schools</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signup?role=school" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign Up</Link>
                <Link href="/school/enrollment" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Enrollment</Link>
                <Link href="/school/assignments" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Assignments</Link>
                <Link href="/school/analytics" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Analytics</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">Platform</h4>
              <div className="space-y-2.5">
                <Link href="/auth/signin" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Intervue.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
