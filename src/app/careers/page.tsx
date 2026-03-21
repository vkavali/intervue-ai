import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { fetchExternalJobs, ExternalJob } from "@/lib/external-jobs"

export const dynamic = "force-dynamic" // Always fetch fresh data, never pre-render

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const search = searchParams.search || ""
  const source = searchParams.source || "all" // all | intervue | external
  const department = searchParams.department || ""
  const location = searchParams.location || ""

  // Fetch internal positions from companies on Intervue.AI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalWhere: any = { status: "OPEN", isPublic: true }
  if (search) {
    internalWhere.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { role: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }
  if (department) internalWhere.department = department
  if (location) internalWhere.location = { contains: location, mode: "insensitive" }

  // Fetch both sources independently — if one fails, the other still works
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let internalPositions: any[] = []
  let externalJobs: ExternalJob[] = []

  try {
    if (source !== "external") {
      internalPositions = await prisma.openPosition.findMany({
        where: internalWhere,
        include: { company: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    }
  } catch { /* DB unavailable */ }

  try {
    if (source !== "intervue") {
      externalJobs = await fetchExternalJobs(search || undefined, 30)
    }
  } catch { /* External API unavailable */ }

  // Normalize internal positions to common format
  const internalJobs: ExternalJob[] = internalPositions.map((p) => ({
    id: `intervue-${p.id}`,
    title: p.title,
    company: p.company.name,
    companyLogo: p.company.logo,
    location: p.location || "Remote",
    type: "Full-time",
    category: p.department,
    salary:
      p.salaryMin && p.salaryMax
        ? `${p.salaryCurrency || "USD"} ${p.salaryMin.toLocaleString()}–${p.salaryMax.toLocaleString()}`
        : null,
    description: p.description?.slice(0, 300) || null,
    url: `/jobs/${p.id}`,
    source: "intervue" as const,
    postedAt: p.createdAt.toISOString(),
  }))

  // Filter external jobs by location if specified
  let filteredExternal = externalJobs
  if (location) {
    filteredExternal = externalJobs.filter((j) =>
      j.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  // Combine and sort
  const allJobs = [...internalJobs, ...filteredExternal].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  )

  // Get filter values from internal positions (graceful fallback)
  let filterPositions: { department: string | null; location: string | null }[] = []
  try {
    filterPositions = await prisma.openPosition.findMany({
      where: { status: "OPEN", isPublic: true },
      select: { department: true, location: true },
    })
  } catch { /* DB unavailable, skip filters */ }
  const departments = Array.from(
    new Set(filterPositions.map((p) => p.department).filter(Boolean))
  ) as string[]

  const sourceLabel: Record<string, string> = {
    all: "All Sources",
    intervue: "Intervue.AI Companies",
    external: "External Job Boards",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Intervue<span className="text-saffron">.AI</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-500">Careers</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Find Your Next Role
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Browse jobs from companies on Intervue.AI and top remote job boards — all in one place.
          </p>

          {/* Search + Filters */}
          <form className="mt-8">
            <div className="flex gap-3">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by title, company, or keyword..."
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <button
                type="submit"
                className="rounded-lg bg-saffron px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark"
              >
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {/* Source filter */}
              <select
                name="source"
                defaultValue={source}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
              >
                <option value="all">All Sources</option>
                <option value="intervue">Intervue.AI Companies</option>
                <option value="external">External Job Boards</option>
              </select>

              {/* Department filter */}
              {departments.length > 0 && (
                <select
                  name="department"
                  defaultValue={department}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              {/* Location filter */}
              <input
                type="text"
                name="location"
                defaultValue={location}
                placeholder="Location..."
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-saffron focus:outline-none w-40"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {allJobs.length} job{allJobs.length !== 1 ? "s" : ""} found
            {source !== "all" && ` from ${sourceLabel[source]}`}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron/10 border border-saffron/30 px-2 py-0.5 text-saffron">
              Intervue.AI
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-blue-500">
              Remotive
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-green-500">
              Arbeitnow
            </span>
          </div>
        </div>

        {allJobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No jobs found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allJobs.map((job) => {
              const sourceConfig = {
                intervue: {
                  badge: "Intervue.AI",
                  color: "bg-saffron/10 text-saffron border-saffron/30",
                },
                remotive: {
                  badge: "Remotive",
                  color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
                },
                arbeitnow: {
                  badge: "Arbeitnow",
                  color: "bg-green-500/10 text-green-500 border-green-500/30",
                },
              }[job.source]

              const isInternal = job.source === "intervue"
              const href = isInternal ? job.url : job.url

              return (
                <a
                  key={job.id}
                  href={href}
                  target={isInternal ? undefined : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-saffron/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Company logo or initial */}
                      {job.companyLogo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="h-10 w-10 shrink-0 rounded-lg object-contain bg-gray-50 border border-gray-100"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-500">
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-900 truncate">
                          {job.title}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {job.company}
                          {job.location && ` · ${job.location}`}
                        </p>
                        {job.description && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sourceConfig.color}`}
                      >
                        {sourceConfig.badge}
                      </span>
                      {job.salary && (
                        <span className="text-xs font-medium text-india-green">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {job.type}
                    </span>
                    {job.category && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {job.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(job.postedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {!isInternal && (
                      <svg
                        className="ml-auto h-4 w-4 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {/* Attribution */}
        <div className="mt-12 text-center text-xs text-gray-400">
          <p>
            External jobs sourced from{" "}
            <a
              href="https://remotive.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Remotive
            </a>{" "}
            and{" "}
            <a
              href="https://arbeitnow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:underline"
            >
              Arbeitnow
            </a>
            . Company-posted positions are managed through Intervue.AI.
          </p>
        </div>
      </div>
    </div>
  )
}
