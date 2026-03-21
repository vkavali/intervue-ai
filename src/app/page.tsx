"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import { detectRegion, type Region } from "@/lib/payment";

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
    title: "Live Interview Environment",
    description: "Code editor for engineering roles, scenario workspace for sales, marketing, and product roles. Real-time collaboration with interviewer observation.",
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
    description: "Every AI interaction is logged and audited. Get role-specific scorecards \u2014 code quality for engineers, persuasion for sales, strategy for PMs \u2014 with hire/no-hire recommendations.",
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
    description: "4,000+ coding problems plus role-specific scenarios for sales, marketing, product, and more. AI coaching included.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    title: "Open Positions & Job Board",
    description: "Track active requisitions across all departments. Public job board with AI-generated job descriptions.",
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

const comparisonFeaturesGlobal = [
  { feature: "Multi-Role Hiring (Sales, Marketing, Product...)", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Role-Specific AI Scoring", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "5-Level AI Control", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Company-Controlled AI", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "AI Audit Engine", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Public Job Board + AI JD Generator", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Live Code + Video", intervue: true, c2: true, c3: true, c4: true, c5: false },
  { feature: "Candidate Pipeline", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Calendar Scheduling", intervue: true, c2: true, c3: false, c4: true, c5: false },
  { feature: "Practice Mode", intervue: true, c2: true, c3: false, c4: false, c5: true },
  { feature: "AI Interaction Logging", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Hire/No-Hire AI", intervue: true, c2: false, c3: false, c4: true, c5: false },
  { feature: "Anti-Cheat System", intervue: true, c2: true, c3: false, c4: false, c5: false },
  { feature: "Code Execution (7 Languages)", intervue: true, c2: true, c3: true, c4: false, c5: true },
  { feature: "Pattern-Based Study Plans", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "XP & Leveling", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Achievement Badges", intervue: true, c2: true, c3: false, c4: false, c5: false },
  { feature: "Daily Challenges", intervue: true, c2: true, c3: false, c4: false, c5: true },
  { feature: "Leaderboard", intervue: true, c2: true, c3: false, c4: false, c5: true },
  { feature: "Activity Heatmap", intervue: true, c2: false, c3: false, c4: false, c5: true },
  { feature: "School/University Mode", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Enrollment Codes", intervue: true, c2: false, c3: false, c4: false, c5: false },
];

const comparisonFeaturesIndia = [
  { feature: "Multi-Role Hiring (Sales, Marketing, Product...)", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Role-Specific AI Scoring", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "5-Level AI Control", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Company-Controlled AI", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "AI Audit Engine", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Public Job Board + AI JD Generator", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Live Code + Video", intervue: true, c2: true, c3: true, c4: true, c5: false },
  { feature: "UPI / Razorpay Payments", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "INR Pricing", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Campus Hiring Support", intervue: true, c2: false, c3: false, c4: true, c5: false },
  { feature: "Practice Mode", intervue: true, c2: true, c3: true, c4: false, c5: true },
  { feature: "Hire/No-Hire AI", intervue: true, c2: false, c3: false, c4: true, c5: false },
  { feature: "Anti-Cheat System", intervue: true, c2: true, c3: false, c4: false, c5: false },
  { feature: "Code Execution (7 Languages)", intervue: true, c2: true, c3: true, c4: false, c5: true },
  { feature: "XP & Gamification", intervue: true, c2: false, c3: true, c4: false, c5: false },
  { feature: "Pattern-Based Study Plans", intervue: true, c2: false, c3: true, c4: false, c5: false },
  { feature: "IIT/NIT University Mode", intervue: true, c2: false, c3: false, c4: false, c5: false },
  { feature: "Enrollment Codes", intervue: true, c2: false, c3: false, c4: false, c5: false },
];

const faangCompanies = [
  { name: "Google", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { name: "Amazon", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { name: "Meta", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  { name: "Apple", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  { name: "Netflix", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

const indianCompanies = [
  { name: "Flipkart", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { name: "Razorpay", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  { name: "Swiggy", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { name: "Zerodha", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { name: "PhonePe", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { name: "CRED", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  { name: "Meesho", color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  { name: "Google India", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
];

export default function Home() {
  const [region, setRegion] = useState<Region>("US");
  const [launchOffer, setLaunchOffer] = useState({ claimed: 0, remaining: 100, isActive: true });

  useEffect(() => {
    const detected = detectRegion();
    setRegion(detected);

    fetch("/api/launch-offer/status")
      .then((res) => res.json())
      .then((data) => setLaunchOffer(data))
      .catch(() => {});
  }, []);

  const isIndia = region === "IN";

  const pricingPlans = isIndia
    ? [
        {
          name: "Pro",
          price: "Rs.1,999",
          period: "/month",
          description: "For growing teams",
          features: [
            "Up to 50 interviews/month",
            "All AI levels (L0-L4)",
            "Full audit reports",
            "Priority support",
            "Custom question library",
            "Calendar & scheduling",
          ],
          cta: "Get Started",
          highlighted: true,
          accent: "saffron",
          href: "/auth/signup?role=company",
          launchBadge: "LAUNCH PRICE" as const,
        },
        {
          name: "Enterprise",
          price: "Rs.7,999",
          period: "/month",
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
          cta: "Get Started",
          highlighted: false,
          accent: "saffron",
          href: "/auth/signup?role=company",
          launchBadge: "LAUNCH PRICE" as const,
        },
        {
          name: "Pay Per Interview",
          price: "Rs.999",
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
          launchBadge: null,
        },
        {
          name: "Candidate Free",
          price: "Free",
          period: "",
          description: "Start practicing today",
          features: [
            "Easy difficulty problems",
            "Basic code execution",
            "XP & streaks",
            "Global leaderboard",
            "Fresh grads: 6 months Pro free",
            "Laid off? 1 month Pro free",
          ],
          cta: "Start Practicing",
          highlighted: false,
          accent: "india-green",
          href: "/auth/signup?role=candidate",
          launchBadge: null,
        },
        {
          name: "Candidate Pro",
          price: "Rs.199",
          period: "/month",
          description: "Unlock all problems & AI coaching",
          features: [
            "All difficulties (Easy + Medium + Hard)",
            "AI coaching & editorials",
            "Company-specific problems",
            "Weakness profiling",
            "15 study patterns",
            "Priority support",
          ],
          cta: "Upgrade to Pro",
          highlighted: false,
          accent: "india-green",
          href: "/auth/signup?role=candidate",
          launchBadge: null,
        },
        {
          name: "Education",
          price: "Rs.249",
          period: "/student/month",
          description: "For IITs, NITs & colleges",
          features: [
            "3 months free trial",
            "Enrollment codes for batches",
            "Student assignments",
            "Placement readiness analytics",
            "XP & badge tracking",
            "Leaderboard per college",
          ],
          cta: "Start Free Trial",
          highlighted: false,
          accent: "pink",
          href: "/auth/signup?role=school",
          launchBadge: "3 MONTHS FREE" as const,
        },
      ]
    : [
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
          launchBadge: null,
        },
        {
          name: "Growth",
          price: "$99",
          period: "/month",
          description: "For growing teams",
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
          launchBadge: null,
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
          launchBadge: null,
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
          launchBadge: null,
        },
        {
          name: "Candidate Free",
          price: "$0",
          period: "",
          description: "Start practicing today",
          features: [
            "Easy difficulty problems",
            "Basic code execution",
            "XP & streaks",
            "Global leaderboard",
            "Fresh grads: 6 months Pro free",
            "Laid off? 1 month Pro free",
          ],
          cta: "Start Practicing",
          highlighted: false,
          accent: "india-green",
          href: "/auth/signup?role=candidate",
          launchBadge: null,
        },
        {
          name: "Candidate Pro",
          price: "$5",
          period: "/month",
          description: "Unlock all problems & AI coaching",
          features: [
            "All difficulties (Easy + Medium + Hard)",
            "AI coaching & editorials",
            "Company-specific problems",
            "Weakness profiling",
            "15 study patterns",
            "Priority support",
          ],
          cta: "Upgrade to Pro",
          highlighted: false,
          accent: "india-green",
          href: "/auth/signup?role=candidate",
          launchBadge: null,
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
          launchBadge: null,
        },
      ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="gradient-orb w-[800px] h-[800px] bg-saffron/25 -top-60 -right-40 opacity-30" />
        <div className="gradient-orb w-[600px] h-[600px] bg-india-green/25 bottom-0 -left-40 opacity-30" />
        <div className="gradient-orb w-[400px] h-[400px] bg-pink-300/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <ScrollReveal className="text-center max-w-4xl mx-auto">
            <div className="floating-chip mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-india-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-india-green" />
              </span>
              Now hiring across Engineering, Sales, Marketing, Product & more
            </div>

            {/* Region Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setRegion("US")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    region === "US"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Global (USD)
                </button>
                <button
                  onClick={() => setRegion("IN")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    region === "IN"
                      ? "bg-gradient-to-r from-saffron to-india-green text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  India (INR)
                </button>
              </div>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-semibold tracking-tight leading-[1.05]">
              <span className="text-gray-900">{isIndia ? "India\u2019s smartest" : "One platform."}</span>
              <br />
              <span className="bg-gradient-to-r from-saffron via-orange-500 to-india-green bg-clip-text text-transparent">
                {isIndia ? "all-role hiring platform" : "Every role. AI-powered."}
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              {isIndia
                ? "Hire engineers, salespeople, marketers, PMs, and executives \u2014 all on one platform. AI-controlled interviews, auto-audited scorecards, and UPI payments."
                : "Hire across every department \u2014 Engineering, Sales, Marketing, Product, and more. AI-controlled interviews with role-specific scoring and auto-generated scorecards."}
            </p>

            {/* India Launch Offer Chip */}
            {isIndia && launchOffer.isActive && (
              <div className="mt-6 flex justify-center">
                <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/10 to-india-green/10 border border-saffron/20 px-5 py-2 text-sm font-semibold text-saffron hover:shadow-lg transition-all">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
                  </span>
                  Launch Offer: First 100 candidates get 6 months Pro free &mdash; {launchOffer.remaining} spots left
                </a>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link href="/auth/signup?role=company" className="pill-cta-primary group">
                {isIndia ? "Start Free Trial" : "Start Hiring Smarter"}
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/auth/signup?role=candidate" className="pill-cta-secondary group">
                Practice for Free
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/auth/signup?role=school" className="pill-cta-secondary group">
                {isIndia ? "For IITs & Universities" : "For Schools"}
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </ScrollReveal>

          {/* Trust bar -- neutral colors */}
          <ScrollReveal delay={0.2} className="mt-20 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              {(isIndia ? [
                { value: "5M+", label: "Indian Developers" },
                { value: "Rs.0", label: "UPI Fees" },
                { value: "4,000+", label: "Problems" },
                { value: "7", label: "Languages" },
              ] : [
                { value: "4,000+", label: "Problems" },
                { value: "7", label: "Languages" },
                { value: "17", label: "Badges" },
                { value: "15", label: "Study Patterns" },
              ]).map((stat) => (
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
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">{isIndia ? "Built For India" : "Built For Everyone"}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">{isIndia ? "One platform for companies, candidates & colleges" : "Three platforms, one product"}</h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {[
              {
                title: "Companies",
                desc: isIndia
                  ? "From TCS to startups like Razorpay \u2014 hire across engineering, sales, marketing, and product with AI-controlled interviews and auto-audited scorecards."
                  : "Hire across every department \u2014 engineering, sales, marketing, product, and more. AI-controlled interviews with role-specific audit trails.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                ),
                features: isIndia
                  ? ["9 interview types across all departments", "Role-specific AI scoring", "Campus & bulk hiring support", "UPI & Razorpay payments"]
                  : ["9 interview types across all departments", "Role-specific AI scoring & audit", "Public job board with AI JD generator", "Calendar scheduling & video"],
                href: "/auth/signup?role=company",
                cta: "Start Hiring",
              },
              {
                title: "Candidates",
                desc: isIndia
                  ? "Crack interviews at Flipkart, Swiggy, Google India, and more. 4,000+ problems with XP, badges, and leaderboards."
                  : "Practice with 4,000+ problems, earn XP, unlock 17 badges, and climb the leaderboard.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
                  </svg>
                ),
                features: isIndia
                  ? ["XP, levels, and streaks", "17 achievement badges", "India leaderboard", "DSA patterns for placements"]
                  : ["XP, levels, and streaks", "17 achievement badges", "Global leaderboard", "7-language code execution"],
                href: "/auth/signup?role=candidate",
                cta: "Start Practicing",
              },
              {
                title: isIndia ? "IITs & Universities" : "Schools",
                desc: isIndia
                  ? "Designed for IITs, NITs, BITS, and engineering colleges. Enroll entire batches, assign problems, track placement readiness."
                  : "Enroll entire classrooms with one code. Assign problems, track student progress.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
                features: isIndia
                  ? ["Enrollment codes for batches", "Assignment & lab creation", "Placement readiness analytics", "Rs.249/student/month"]
                  : ["Enrollment codes for classes", "Assignment creation", "Class-wide analytics dashboard", "$5/student/month pricing"],
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

      {/* ===== 2B. ROLES WE SUPPORT ===== */}
      <section className="relative py-32 lg:py-40 bg-white">
        <div className="gradient-orb w-[600px] h-[600px] bg-india-green/10 -top-40 -left-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">Beyond Engineering</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              Roles we{" "}
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">support</span>
            </h2>
            <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
              One platform for every department. Role-specific AI scoring, tailored interview formats, and department-aware pipeline stages.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" staggerDelay={0.05}>
            {[
              { dept: "Engineering", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              ), color: "bg-blue-50 text-blue-600 border-blue-200", desc: "Coding, system design, DSA" },
              { dept: "Sales", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              ), color: "bg-orange-50 text-orange-600 border-orange-200", desc: "Discovery, pitch, objections" },
              { dept: "Marketing", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              ), color: "bg-pink-50 text-pink-600 border-pink-200", desc: "Strategy, analytics, campaigns" },
              { dept: "Product", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              ), color: "bg-indigo-50 text-indigo-600 border-indigo-200", desc: "PRDs, prioritization, metrics" },
              { dept: "Executive", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ), color: "bg-purple-50 text-purple-600 border-purple-200", desc: "Leadership, vision, P&L" },
              { dept: "Customer Success", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              ), color: "bg-teal-50 text-teal-600 border-teal-200", desc: "Escalations, QBRs, retention" },
              { dept: "HR", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              ), color: "bg-emerald-50 text-emerald-600 border-emerald-200", desc: "Policy, conflict, compensation" },
              { dept: "Finance", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ), color: "bg-cyan-50 text-cyan-600 border-cyan-200", desc: "Modeling, budgets, audits" },
              { dept: "Legal", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
              ), color: "bg-slate-50 text-slate-600 border-slate-200", desc: "Contracts, compliance, regulatory" },
              { dept: "General", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              ), color: "bg-gray-50 text-gray-600 border-gray-200", desc: "Behavioral, culture fit" },
            ].map((role) => (
              <StaggerItem key={role.dept}>
                <div className={`rounded-2xl border p-5 text-center transition-all hover:shadow-lg h-full ${role.color}`}>
                  <div className="mb-3 mx-auto w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
                    {role.icon}
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{role.dept}</h3>
                  <p className="text-xs opacity-70">{role.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== 2C. WHY INTERVUE.AI ===== */}
      <section className="relative py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="gradient-orb w-[500px] h-[500px] bg-saffron/10 top-20 -right-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20 lg:mb-24">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">The Advantage</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              Why{" "}
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">Intervue.AI</span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.08}>
            {[
              {
                title: "One Platform, Every Role",
                desc: "No more 5 disconnected tools. Hire engineers, salespeople, marketers, PMs, and executives from a single dashboard.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                ),
              },
              {
                title: "5-Level AI Adapts Per Role",
                desc: "Socratic questions for executives, frameworks for PMs, code scaffolding for engineers. AI adjusts to each role automatically.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
              },
              {
                title: "Automated, Unbiased Scoring",
                desc: "Role-specific rubrics remove gut-feel decisions. Structured interviews predict 65%+ of job performance vs 14% for unstructured.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: "Kills the Middleman",
                desc: "Replace $4k-$8k recruiter fees with AI-powered scheduling, evaluation, and scorecards. Cut your cost-per-hire by 80%.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Candidates Love It",
                desc: "Practice with AI coaching before real interviews. XP, badges, and leaderboards make prep engaging instead of stressful.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
              {
                title: "45-Day Hire to 15-Day Hire",
                desc: "AI generates interview questions, auto-audits sessions, and produces instant scorecards. 3x faster time-to-hire.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
              },
              {
                title: "Structured Beats Unstructured",
                desc: "78% of first-round interviews are now virtual. Without a platform: inconsistent evaluation, no audit trail, and legal liability.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full">
                  <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-saffron/10 to-india-green/10 flex items-center justify-center text-gray-600">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
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
            <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">{isIndia ? "Hire at India\u2019s Scale" : "The Complete Flow"}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
              Six steps to your next
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> great hire</span>
            </h2>
          </ScrollReveal>

          {/* Asymmetric bento grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-6 gap-4" staggerDelay={0.08}>
            {[
              { step: "01", title: "Create Position", desc: "Define any role \u2014 engineering, sales, marketing, or executive. Configure interview type, questions, and AI levels.", span: "md:col-span-2" },
              { step: "02", title: "Schedule & Invite", desc: "Find available slots, schedule sessions, and send candidates their unique links.", span: "md:col-span-2" },
              { step: "03", title: "Live Interview", desc: "Candidates work in a role-appropriate environment \u2014 code editor, scenario workspace, or case study. Interviewer watches and adjusts AI on the fly.", span: "md:col-span-2" },
              { step: "04", title: "AI Audits Everything", desc: "Every interaction logged. Role-specific scorecards generated automatically \u2014 code quality for engineers, persuasion for sales, strategy for PMs.", span: "md:col-span-3" },
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
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">{isIndia ? "For IITs, NITs & Colleges" : "For Educators"}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
              {isIndia ? "Placement-ready" : "Your classroom,"}<br /><span className="text-pink-500">{isIndia ? "students" : "supercharged"}</span>
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
                <span className="text-sm font-medium text-gray-900">{isIndia ? "IIT Bombay CSE" : "Stanford CS Department"}</span>
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
                {isIndia ? "Crack your next interview at" : "Land your dream job at"}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(isIndia ? indianCompanies : faangCompanies).map((c) => (
                  <span key={c.name} className="inline-flex items-center rounded-full border border-gray-100 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-600">
                    {c.name}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {(isIndia ? [
                  { title: "4,000+ Problems", desc: "All patterns asked by TCS, Infosys, Flipkart, and more" },
                  { title: "7-Language Execution", desc: "Python, Java, C++, JS, TS, Go, and Rust" },
                  { title: "15 DSA Patterns", desc: "Two Pointers, Sliding Window, DP \u2014 aligned to placement rounds" },
                  { title: "AI Coaching", desc: "Weakness profiling and mock interview prep" },
                ] : [
                  { title: "4,000+ Problems", desc: "Comprehensive bank covering all difficulty levels" },
                  { title: "7-Language Execution", desc: "JS, TS, Python, Java, C++, Go, and Rust" },
                  { title: "15 Study Patterns", desc: "Two Pointers, Sliding Window, DP, and more" },
                  { title: "AI Coaching", desc: "Get AI feedback, editorials, and weakness profiling" },
                ]).map((item) => (
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
            <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">{isIndia ? "vs Indian Assessment Tools" : "The Honest Comparison"}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white">
              {isIndia ? "More than just coding tests" : "Why teams switch to"}{" "}
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">{isIndia ? "" : "Intervue"}</span>
            </h2>
            {isIndia && (
              <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto">
                Every competitor is assessment-only. Intervue.AI is the only platform with AI-controlled interviews, tiered assistance, and auto-generated scorecards.
              </p>
            )}
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
                    {(isIndia
                      ? ["HackerRank", "HackerEarth", "Mettl", "LeetCode"]
                      : ["HackerRank", "CoderPad", "Karat", "LeetCode"]
                    ).map((name) => (
                      <th key={name} className="px-6 py-5 text-center text-sm font-semibold text-gray-600">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(isIndia ? comparisonFeaturesIndia : comparisonFeaturesGlobal).map((row) => (
                    <tr key={row.feature} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-300 font-medium">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center">
                        {row.intervue ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-saffron to-india-green">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : <span className="text-gray-700">&#10007;</span>}
                      </td>
                      {[row.c2, row.c3, row.c4, row.c5].map((val, j) => (
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
          <ScrollReveal className="text-center mb-6">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400 mb-4">{isIndia ? "Company & School Pricing" : "Pricing"}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900">
              {isIndia ? "Launch pricing for India" : "Start free. Scale as you grow."}
            </h2>
            <p className="mt-4 text-base text-gray-400">
              {isIndia
                ? "All prices in INR. First 100 candidates get 6 months Pro free. Schools get 3 months free trial."
                : "Plans for companies, candidates, and schools. Start with free tiers and upgrade as you grow."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/20 px-3 py-1 text-xs font-medium text-saffron">Fresh graduates: 6 months free</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600">Laid off? 1 month free</span>
            </div>
          </ScrollReveal>

          <div className="mb-12" />

          {/* Launch Offer Banner — India only */}
          {isIndia && launchOffer.isActive && (
            <ScrollReveal className="mb-16 max-w-3xl mx-auto">
              <div className="rounded-2xl p-px bg-gradient-to-r from-saffron via-orange-400 to-india-green">
                <div className="rounded-[15px] bg-white p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/20 px-3 py-1 text-xs font-semibold text-saffron">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
                      </span>
                      India Launch Offer
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    First 100 candidates get 6 months Pro free
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{launchOffer.remaining}</p>
                      <p className="text-xs text-gray-400 mt-1">Spots Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">6</p>
                      <p className="text-xs text-gray-400 mt-1">Months Pro Free</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">Rs.199</p>
                      <p className="text-xs text-gray-400 mt-1">After Trial</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-saffron to-india-green transition-all duration-500"
                      style={{ width: `${(launchOffer.claimed / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">{launchOffer.claimed}/100 claimed</p>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* All plans in a responsive grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto" staggerDelay={0.06}>
            {pricingPlans.map((plan) => (
              <StaggerItem key={plan.name}>
                {plan.highlighted ? (
                  <div className="rounded-2xl p-px bg-gradient-to-b from-saffron via-orange-400 to-india-green h-full shadow-[0_20px_60px_-15px_rgba(255,153,0,0.2)]">
                    <div className="relative rounded-[15px] bg-white p-6 h-full flex flex-col">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`rounded-full px-4 py-1 text-xs font-semibold text-white ${isIndia ? "bg-gradient-to-r from-saffron to-india-green" : "bg-gray-900"}`}>
                          Most Popular
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      {plan.launchBadge && (
                        <span className="inline-block mt-1 rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron">
                          {plan.launchBadge}
                        </span>
                      )}
                      <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-3xl font-semibold text-gray-900">{plan.price}</span>
                        <span className="ml-1 text-gray-400 text-sm">{plan.period}</span>
                      </div>
                      <ul className="mt-5 space-y-2 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="h-4 w-4 shrink-0 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.href} className="mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all">{plan.cta}</Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-gray-200/50 h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.launchBadge && (
                      <span className="inline-block mt-1 rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron">
                        {plan.launchBadge}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-semibold text-gray-900">{plan.price}</span>
                      <span className="ml-1 text-gray-400 text-sm">{plan.period}</span>
                    </div>
                    <ul className="mt-5 space-y-2 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className={`h-4 w-4 shrink-0 ${plan.accent === "pink" ? "text-pink-500" : plan.accent === "india-green" ? "text-india-green" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href} className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${plan.accent === "india-green" ? "border border-india-green/30 text-india-green hover:bg-india-green/5" : plan.accent === "pink" ? "border border-pink-200 text-pink-600 hover:bg-pink-50" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>{plan.cta}</Link>
                  </div>
                )}
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
                  {isIndia ? "India\u2019s hiring" : "Every department."}
                  <br />
                  <span className="bg-gradient-to-r from-saffron via-orange-400 to-india-green bg-clip-text text-transparent">{isIndia ? "revolution starts here" : "One platform."}</span>
                </h2>
                <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
                  {isIndia
                    ? "First 100 candidates get 6 months Pro free. Companies and schools pay in INR via UPI. Built for India\u2019s scale."
                    : "Join the companies using AI-controlled interviews to hire the best talent across engineering, sales, marketing, product, and every other role."}
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
                  {isIndia ? "For IITs & Universities" : "For Schools"} &rarr;
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
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">The AI-controlled interview platform for hiring across every department.</p>
            </div>
            {[
              { title: "For Companies", links: [{ label: "Sign Up", href: "/auth/signup?role=company" }, { label: "Pricing", href: "/#pricing" }, { label: "Features", href: "/#features" }] },
              { title: "For Candidates", links: [{ label: "Sign Up", href: "/auth/signup?role=candidate" }, { label: "Practice Mode", href: "/practice" }, { label: "Study Plans", href: "/practice?tab=patterns" }, { label: "Leaderboard", href: "/leaderboard" }, { label: "Badges", href: "/candidate/badges" }] },
              { title: isIndia ? "For Colleges" : "For Schools", links: [{ label: "Sign Up", href: "/auth/signup?role=school" }, { label: "Enrollment", href: "/school/enrollment" }, { label: "Assignments", href: "/school/assignments" }, { label: "Analytics", href: "/school/analytics" }] },
              { title: "Platform", links: [{ label: "Sign In", href: "/auth/signin" }, { label: "Job Board", href: "/jobs" }, { label: "Templates", href: "/dashboard/interviews/templates" }] },
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
