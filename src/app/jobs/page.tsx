import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function JobsPage({ searchParams }: { searchParams: Record<string, string> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "OPEN",
    isPublic: true,
  }

  if (searchParams.company) where.companyId = searchParams.company
  if (searchParams.department) where.department = searchParams.department
  if (searchParams.seniority) where.seniority = searchParams.seniority
  if (searchParams.location) where.location = { contains: searchParams.location, mode: "insensitive" }
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { role: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const positions = await prisma.openPosition.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, logo: true, slug: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // If filtered by company, fetch the company name for the heading
  let companyName: string | null = null
  if (searchParams.company) {
    const company = await prisma.company.findUnique({
      where: { id: searchParams.company },
      select: { name: true },
    })
    companyName = company?.name || null
  }

  // Get distinct filter values (scoped to company if filtered)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterWhere: any = { status: "OPEN", isPublic: true }
  if (searchParams.company) filterWhere.companyId = searchParams.company

  const allPositions = await prisma.openPosition.findMany({
    where: filterWhere,
    select: { department: true, seniority: true, location: true },
  })

  const departments = Array.from(new Set(allPositions.map(p => p.department).filter(Boolean)))
  const seniorities = Array.from(new Set(allPositions.map(p => p.seniority)))
  const locations = Array.from(new Set(allPositions.map(p => p.location).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Intervue<span className="text-saffron">.AI</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Job Board</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {companyName ? `${companyName} — Open Positions` : "Careers"}
          </h1>
          <p className="mt-2 text-gray-500">
            {companyName
              ? `${positions.length} open position${positions.length !== 1 ? "s" : ""}`
              : "Find your next opportunity across top companies"}
          </p>

          {/* Search */}
          <form className="mt-6">
            <div className="flex gap-3">
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search || ""}
                placeholder="Search by role, title, or keyword..."
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <button
                type="submit"
                className="rounded-lg border border-saffron bg-saffron px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-saffron-dark"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="mt-3 flex flex-wrap gap-3">
              {departments.length > 0 && (
                <select
                  name="department"
                  defaultValue={searchParams.department || ""}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d!}>{d}</option>
                  ))}
                </select>
              )}
              {seniorities.length > 0 && (
                <select
                  name="seniority"
                  defaultValue={searchParams.seniority || ""}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
                >
                  <option value="">All Levels</option>
                  {seniorities.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              {locations.length > 0 && (
                <select
                  name="location"
                  defaultValue={searchParams.location || ""}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
                >
                  <option value="">All Locations</option>
                  {locations.map((l) => (
                    <option key={l} value={l!}>{l}</option>
                  ))}
                </select>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-gray-500">{positions.length} position{positions.length !== 1 ? "s" : ""} found</p>

        {positions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <h3 className="text-lg font-medium text-gray-900">No positions found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters</p>
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
                      {p.company.name}
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

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {p.department && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium">{p.department}</span>
                  )}
                  {p.salaryMin && p.salaryMax && (
                    <span>
                      {p.salaryCurrency || "USD"} {p.salaryMin.toLocaleString()}{"\u2013"}{p.salaryMax.toLocaleString()}
                    </span>
                  )}
                  <span>{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
