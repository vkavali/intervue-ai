export type Region = 'IN' | 'US'
export type Gateway = 'razorpay' | 'stripe'

// India + South Asia timezones → IN region
const INDIA_SOUTH_ASIA_TIMEZONES = new Set([
  // India
  'Asia/Kolkata', 'Asia/Calcutta',
  // Sri Lanka
  'Asia/Colombo',
  // Bangladesh
  'Asia/Dhaka', 'Asia/Dacca',
  // Nepal
  'Asia/Kathmandu', 'Asia/Katmandu',
  // Pakistan
  'Asia/Karachi',
  // Bhutan
  'Asia/Thimphu', 'Asia/Thimbu',
  // Maldives
  'Indian/Maldives',
  // Myanmar
  'Asia/Yangon', 'Asia/Rangoon',
])

export function detectRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (INDIA_SOUTH_ASIA_TIMEZONES.has(tz)) {
      return 'IN'
    }
  } catch {
    // fallback to US
  }
  return 'US'
}

export function getGatewayForRegion(region: Region): Gateway {
  return region === 'IN' ? 'razorpay' : 'stripe'
}

export function formatPrice(amount: number, currency: string): string {
  if (currency.toLowerCase() === 'inr') {
    return `Rs.${amount.toLocaleString('en-IN')}`
  }
  return `$${amount.toLocaleString('en-US')}`
}
