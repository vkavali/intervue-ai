"use client"

import { useState } from "react"
import { PLANS, PlanKey } from "@/lib/stripe"

const planOrder: PlanKey[] = ["FREE", "PRO", "ENTERPRISE"]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For now, we read the plan from URL search params or default to FREE
  // In a real scenario this would come from the server or session
  const [currentPlan] = useState<PlanKey>("FREE")

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your subscription and billing details
        </p>
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
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-400">{error}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Plan</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {PLANS[currentPlan].name}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {currentPlan === "FREE"
                ? "You are on the free plan"
                : `$${PLANS[currentPlan].price}/month`}
            </p>
          </div>
          {hasSubscription && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
        <h2 className="text-lg font-semibold text-white">Plans</h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose the plan that fits your hiring needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey]
          const current = isCurrentPlan(planKey)
          const upgrade = isUpgrade(planKey)
          const recommended = planKey === "PRO"

          return (
            <div
              key={planKey}
              className={`relative rounded-xl border bg-gray-900 p-6 transition-all ${
                current
                  ? "border-saffron ring-1 ring-saffron/20"
                  : recommended
                  ? "border-saffron/50"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              {/* Recommended badge */}
              {recommended && !current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full border border-saffron bg-transparent px-3 py-1 text-xs font-semibold text-saffron">
                    Recommended
                  </span>
                </div>
              )}

              {/* Current badge */}
              {current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6 mt-2">
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-400">/month</span>
                  )}
                </div>
              </div>

              {/* Features list */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
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
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {current ? (
                <button
                  disabled
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : upgrade ? (
                <button
                  onClick={() => handleCheckout(planKey)}
                  disabled={loading === planKey || !plan.priceId}
                  className="w-full rounded-lg border border-saffron bg-transparent px-4 py-2.5 text-sm font-medium text-saffron transition-colors hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === planKey ? (
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
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Downgrade via Manage Billing
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ / Info section */}
      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white">
          Frequently Asked Questions
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300">
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
            <h4 className="text-sm font-medium text-gray-300">
              What happens if I cancel?
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              If you cancel your subscription, you will retain access to your
              current plan until the end of your billing period. After that, your
              account will revert to the Free plan.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300">
              Do you offer annual billing?
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Annual billing with a discount is coming soon. Contact us at
              billing@intervue.ai for early access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
