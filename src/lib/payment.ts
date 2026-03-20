export type Region = 'IN' | 'US'
export type Gateway = 'razorpay' | 'stripe'

export function detectRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
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
