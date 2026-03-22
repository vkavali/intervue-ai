import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function CompanyJobsPage({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, logo: true },
  })

  if (!company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Company Not Found</h1>
        <Link href="/jobs" className="mt-4 text-saffron hover:text-saffron-dark">Back to job board</Link>
      </div>
    )
  }

  const positions = await prisma.openPosition.findMany({
    where: { companyId: company.id, status: "OPEN", isPublic: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-lg font-bold text-gray-900 font-mono">printf<span className="text-saffron">(</span><span className="text-india-green">)</span></Link>
            <span className="text-gray-300">|</span>
            <Link href="/jobs" className="text-sm text-gray-500 hover:text-saffron">Job Board</Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="mt-2 text-gray-500">{positions.length} open position{positions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {positions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <h3 className="text-lg font-medium text-gray-900">No open positions</h3>
            <p className="mt-2 text-sm text-gray-500">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((p) => (
              <Link
                key={p.id}
                href={`/jobs/${p.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-saffron/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{p.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {p.role}
                      {p.location && ` \u00B7 ${p.location}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-medium text-saffron-dark">
                    {p.seniority}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.department && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{p.department}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
