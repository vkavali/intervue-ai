import Razorpay from 'razorpay'

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null

export const RAZORPAY_LAUNCH_PLANS = {
  PRO: {
    name: 'Pro',
    priceMonthly: 1999,
    priceAnnual: 23988,
    currency: 'INR' as const,
    trialDays: 90,
    razorpayPlanId: process.env.RAZORPAY_LAUNCH_PRO_PLAN_ID || '',
    features: [
      'Up to 50 interviews/month',
      'All AI levels (L0-L4)',
      'Full audit reports',
      'Priority support',
      'Custom question library',
      'Calendar & scheduling',
      '4,000+ practice problems',
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
    priceMonthly: 7999,
    priceAnnual: 95988,
    currency: 'INR' as const,
    trialDays: 90,
    razorpayPlanId: process.env.RAZORPAY_LAUNCH_ENTERPRISE_PLAN_ID || '',
    features: [
      'Unlimited interviews',
      'All AI levels (L0-L4)',
      'Advanced analytics',
      'Dedicated support',
      'SSO & SAML',
      'Custom integrations',
      'On-prem deployment',
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
    priceMonthly: 249,
    priceAnnual: 2988,
    currency: 'INR' as const,
    trialDays: 90,
    razorpayPlanId: process.env.RAZORPAY_LAUNCH_EDUCATION_PLAN_ID || '',
    features: [
      'Per-student pricing (Rs.249/student/month)',
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

export type RazorpayLaunchPlanKey = keyof typeof RAZORPAY_LAUNCH_PLANS
