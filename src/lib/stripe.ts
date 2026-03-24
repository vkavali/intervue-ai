import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export const PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: null,
    price: 0,
    currency: 'usd',
    interval: 'month' as const,
    mode: 'none' as const,
    features: [
      '5 interviews per month',
      'Basic AI assist (L0-L2)',
      'Standard code editor',
      '1 team member',
      'Email support',
    ],
    limits: {
      interviewsPerMonth: 5,
      maxAILevel: 2,
      customQuestions: false,
      auditReports: false,
      teamMembers: 1,
      apiAccess: false,
    },
  },
  GROWTH: {
    name: 'Growth',
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
    price: 99,
    currency: 'usd',
    interval: 'month' as const,
    mode: 'subscription' as const,
    features: [
      '50 interviews per month',
      'Full AI assist (L0-L4)',
      'Advanced code editor with themes',
      'AI audit reports',
      'Custom question bank',
      '5 team members',
      'Priority support',
    ],
    limits: {
      interviewsPerMonth: 50,
      maxAILevel: 4,
      customQuestions: true,
      auditReports: true,
      teamMembers: 5,
      apiAccess: false,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: null,
    price: 0,
    currency: 'usd',
    interval: 'month' as const,
    mode: 'contact_sales' as const,
    features: [
      'Unlimited interviews',
      'Full AI assist (L0-L4)',
      'AI audit reports with deep analytics',
      'Custom question bank',
      'Custom branding',
      'API access',
      'Unlimited team members',
      'SSO / SAML integration',
      'Dedicated account manager',
      'Priority support with SLA',
    ],
    limits: {
      interviewsPerMonth: Infinity,
      maxAILevel: 4,
      customQuestions: true,
      auditReports: true,
      teamMembers: Infinity,
      apiAccess: true,
    },
  },
  PAY_PER_INTERVIEW: {
    name: 'Pay Per Interview',
    priceId: process.env.STRIPE_PPI_PRICE_ID || '',
    price: 15,
    currency: 'usd',
    interval: 'session' as const,
    mode: 'payment' as const,
    features: [
      '$15 per interview session',
      'Full AI assist (L0-L4)',
      'AI audit report included',
      'No monthly commitment',
      'Pay only when you interview',
    ],
    limits: {
      interviewsPerMonth: Infinity,
      maxAILevel: 4,
      customQuestions: true,
      auditReports: true,
      teamMembers: 1,
      apiAccess: false,
    },
  },
  CANDIDATE_PRO: {
    name: 'Candidate Pro',
    priceId: process.env.STRIPE_CANDIDATE_PRO_PRICE_ID || '',
    price: 5,
    currency: 'usd',
    interval: 'month' as const,
    mode: 'subscription' as const,
    features: [
      'Full practice platform access',
      '4,000+ problems in 7 languages',
      'AI-powered hints and guidance',
      'Progress tracking & analytics',
      'Daily challenges & streaks',
    ],
    limits: {
      interviewsPerMonth: 0,
      maxAILevel: 4,
      customQuestions: false,
      auditReports: false,
      teamMembers: 1,
      apiAccess: false,
    },
  },
  EDUCATION: {
    name: 'Education',
    priceId: process.env.STRIPE_EDUCATION_PRICE_ID || '',
    price: 5,
    currency: 'usd',
    interval: 'month' as const,
    mode: 'subscription' as const,
    features: [
      'Per-student pricing ($5/student/month)',
      'Full problem bank access',
      'AI assist (L0-L4)',
      'Student progress tracking',
      'Assignment management',
      'Class analytics',
      'Enrollment codes',
      'CSV export',
    ],
    limits: {
      interviewsPerMonth: 0,
      maxAILevel: 4,
      customQuestions: true,
      auditReports: false,
      teamMembers: 1,
      apiAccess: false,
    },
  },
} as const

export type PlanKey = keyof typeof PLANS
export type Plan = (typeof PLANS)[PlanKey]

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanKey
    }
  }
  return null
}

export function getPlanLimits(planKey: PlanKey) {
  return PLANS[planKey].limits
}
