import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: null,
    price: 0,
    currency: 'usd',
    interval: 'month' as const,
    features: [
      '5 interviews per month',
      'Basic AI assist (L0-L1)',
      'Standard code editor',
      'Email support',
    ],
    limits: {
      interviewsPerMonth: 5,
      maxAILevel: 1,
      customQuestions: false,
      auditReports: false,
      teamMembers: 1,
      apiAccess: false,
    },
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 49,
    currency: 'usd',
    interval: 'month' as const,
    features: [
      '50 interviews per month',
      'Full AI assist (L0-L4)',
      'Advanced code editor with themes',
      'AI audit reports',
      'Custom question bank',
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
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 199,
    currency: 'usd',
    interval: 'month' as const,
    features: [
      'Unlimited interviews',
      'Full AI assist (L0-L4)',
      'Advanced code editor with themes',
      'AI audit reports with deep analytics',
      'Custom question bank',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SSO / SAML integration',
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
  EDUCATION: {
    name: 'Education',
    priceId: process.env.STRIPE_EDUCATION_PRICE_ID || '',
    price: 5,
    currency: 'usd',
    interval: 'month' as const,
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
