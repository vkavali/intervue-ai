import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SchoolBillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
    redirect("/auth/redirect");
  }

  const school = await prisma.school.findFirst({
    where: { adminId: session.user.id },
    include: { _count: { select: { students: true } } },
  });

  if (!school) {
    return <div className="text-center py-16"><p className="text-gray-500">School not found.</p></div>;
  }

  const plans = [
    {
      name: "Education Free",
      price: "$0",
      period: "/month",
      features: [
        "Up to 25 students",
        "Basic practice problems",
        "Student progress tracking",
        "Enrollment codes",
      ],
      current: school.plan === "EDUCATION" && school.maxStudents <= 25,
    },
    {
      name: "Education Pro",
      price: "$5",
      period: "/student/month",
      features: [
        "Up to 500 students",
        "Full problem bank access",
        "AI-powered practice (L0-L4)",
        "Advanced analytics",
        "Assignment management",
        "CSV export",
        "Priority support",
      ],
      current: school.plan === "EDUCATION_PRO",
      recommended: true,
    },
    {
      name: "Education Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Unlimited students",
        "Everything in Pro",
        "Custom branding",
        "SSO integration",
        "API access",
        "Dedicated account manager",
        "Custom problem creation",
      ],
      current: school.plan === "EDUCATION_ENTERPRISE",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-gray-500">Manage your education plan and billing.</p>
      </div>

      {/* Current Usage */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Plan</p>
            <p className="text-lg font-bold text-gray-900">{school.plan}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Students</p>
            <p className="text-lg font-bold text-gray-900">
              {school._count.students} / {school.maxStudents}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Enrollment Code</p>
            <p className="text-lg font-mono font-bold text-pink-500">{school.enrollmentCode}</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 ${
              plan.current
                ? "border-pink-300 bg-pink-50"
                : plan.recommended
                  ? "border-saffron/30 bg-saffron/5"
                  : "border-gray-200 bg-white"
            }`}
          >
            {plan.recommended && !plan.current && (
              <span className="inline-block rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron mb-3">
                Recommended
              </span>
            )}
            {plan.current && (
              <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-600 mb-3">
                Current Plan
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                {plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
