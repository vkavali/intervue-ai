"use client"

import { useState, useEffect } from "react"
import { PLANS, PlanKey } from "@/lib/stripe"
import { RAZORPAY_LAUNCH_PLANS, RazorpayLaunchPlanKey } from "@/lib/razorpay"
import { detectRegion, type Region } from "@/lib/payment"

const planOrder: PlanKey[] = ["FREE", "PRO", "ENTERPRISE"]

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [region, setRegion] = useState<Region>("US")

  const [currentPlan] = useState<PlanKey>("FREE")

  const isIndia = region === "IN"

  useEffect(() => {
    const detected = detectRegion()
    setRegion(detected)

    // Load Razorpay checkout script for Indian users
    if (detected === "IN") {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleCheckout = async (planKey: PlanKey) => {
    const plan = PLANS[planKey]
    if (!plan.priceId) return

    setLoading(planKey)
    setError(null)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          planKey,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create checkout session")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleRazorpayCheckout = async (planKey: RazorpayLaunchPlanKey) => {
    setLoading(planKey)
    setError(null)

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, isLaunchOffer: true }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create Razorpay subscription")
        return
      }

      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: "Intervue.AI",
        description: `${data.planName} Plan - Launch Offer`,
        currency: data.currency,
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              planKey,
            }),
          })

          if (verifyRes.ok) {
            window.location.href = "/dashboard/billing?success=true"
          } else {
            setError("Payment verification failed. Please contact support.")
          }
        },
        theme: { color: "#FF9933" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to open billing portal")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPortalLoading(false)
    }
  }

  const isCurrentPlan = (planKey: PlanKey) => currentPlan === planKey
  const isUpgrade = (planKey: PlanKey) =>
    planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan)
  const hasSubscription = currentPlan !== "FREE"

  // Build display plans based on region
  const razorpayPlanMap: Record<string, RazorpayLaunchPlanKey> = {
    PRO: "PRO",
    ENTERPRISE: "ENTERPRISE",
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription and billing details
            {isIndia && " - India Launch Pricing (INR)"}
          </p>
        </div>
        {/* Region Selector */}
        <div className="relative shrink-0">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron"
          >
            <option value="US">USD ($)</option>
            <option value="IN">INR (Rs.)</option>
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Success / Cancel banners */}
      {typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("success") && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
            <p className="text-sm font-medium text-green-400">
              Payment successful! Your plan has been upgraded.
            </p>
          </div>
        )}

      {typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("canceled") && (
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <p className="text-sm font-medium text-yellow-400">
              Checkout was canceled. No changes were made to your plan.
            </p>
          </div>
        )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3">
          <p className="text-sm font-medium text-accent-red">{error}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {PLANS[currentPlan].name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {currentPlan === "FREE"
                ? "You are on the free plan"
                : `$${PLANS[currentPlan].price}/month`}
            </p>
          </div>
          {hasSubscription && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Plans</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the plan that fits your hiring needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey]
          const current = isCurrentPlan(planKey)
          const upgrade = isUpgrade(planKey)
          const recommended = planKey === "PRO"

          // Get INR pricing if India
          const rzpKey = razorpayPlanMap[planKey]
          const rzpPlan = rzpKey ? RAZORPAY_LAUNCH_PLANS[rzpKey] : null
          const displayPrice = isIndia && rzpPlan
            ? `Rs.${rzpPlan.priceMonthly.toLocaleString("en-IN")}`
            : plan.price === 0
              ? "Free"
              : `$${plan.price}`
          const displayPeriod = plan.price === 0 ? "" : "/month"

          return (
            <div
              key={planKey}
              className={`relative rounded-xl border bg-white p-6 transition-all ${
                current
                  ? "border-saffron ring-1 ring-saffron/20"
                  : recommended
                  ? "border-saffron/50"
                  : "border-gray-200 hover:border-gray-200"
              }`}
            >
              {/* Recommended badge */}
              {recommended && !current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full border border-saffron bg-transparent px-3 py-1 text-xs font-semibold text-saffron">
                    {isIndia ? "3 Months Free" : "Recommended"}
                  </span>
                </div>
              )}

              {/* Current badge */}
              {current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full border border-india-green bg-transparent px-3 py-1 text-xs font-semibold text-gray-900">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6 mt-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                {isIndia && rzpPlan && (
                  <span className="inline-block mt-1 rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron">
                    LAUNCH PRICE
                  </span>
                )}
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {displayPrice}
                  </span>
                  {displayPrice !== "Free" && (
                    <span className="text-sm text-gray-500">{displayPeriod}</span>
                  )}
                </div>
              </div>

              {/* Features list */}
              <ul className="mb-8 space-y-3">
                {(isIndia && rzpPlan ? rzpPlan.features : plan.features).map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-saffron"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {current ? (
                <button
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : upgrade ? (
                <button
                  onClick={() =>
                    isIndia && rzpKey
                      ? handleRazorpayCheckout(rzpKey)
                      : handleCheckout(planKey)
                  }
                  disabled={loading === planKey || loading === rzpKey}
                  className="w-full rounded-lg border border-saffron bg-transparent px-4 py-2.5 text-sm font-medium text-saffron transition-colors hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === planKey || loading === rzpKey ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Downgrade via Manage Billing
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ / Info section */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Frequently Asked Questions
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Can I change plans at any time?
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Yes, you can upgrade or downgrade your plan at any time. When
              upgrading, you will be charged a prorated amount for the remainder
              of your billing cycle. Downgrades take effect at the end of the
              current billing period.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              What happens if I cancel?
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              If you cancel your subscription, you will retain access to your
              current plan until the end of your billing period. After that, your
              account will revert to the Free plan.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Do you offer annual billing?
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              {isIndia
                ? "India launch offer includes annual billing with 3 months free. All plans are billed annually after the trial period."
                : "Annual billing with a discount is coming soon. Contact us at billing@intervue.ai for early access."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
