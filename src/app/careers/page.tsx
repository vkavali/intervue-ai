import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic" // Always fetch fresh data, never pre-render

interface Job {
  id: string
  title: string
  company: string
  companyLogo: string | null
  location: string
  type: string
  category: string | null
  salary: string | null
  description: string | null
  url: string
  postedAt: string
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const search = searchParams.search || ""
  const department = searchParams.department || ""
  const location = searchParams.location || ""
  const jobType = searchParams.jobType || ""
  const workMode = searchParams.workMode || "" // remote | onsite | hybrid
  const category = searchParams.category || ""

  // Fetch positions from printf companies only
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let internalPositions: any[] = []

  try {
    internalPositions = await prisma.openPosition.findMany({
      where: internalWhere,
      include: { company: { select: { id: true, name: true, logo: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  } catch { /* DB unavailable */ }

  // Normalize to common format
  const jobs: Job[] = internalPositions.map((p) => ({
    id: `printf-${p.id}`,
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
    postedAt: p.createdAt.toISOString(),
  }))

  // Apply filters
  let allJobs = [...jobs]
  if (location) {
    allJobs = allJobs.filter((j) =>
      j.location.toLowerCase().includes(location.toLowerCase())
    )
  }
  if (jobType) {
    allJobs = allJobs.filter((j) =>
      j.type.toLowerCase().includes(jobType.toLowerCase())
    )
  }
  if (workMode === "remote") {
    allJobs = allJobs.filter((j) =>
      j.location.toLowerCase().includes("remote") ||
      j.location.toLowerCase().includes("anywhere") ||
      j.location.toLowerCase().includes("worldwide")
    )
  } else if (workMode === "onsite") {
    allJobs = allJobs.filter((j) =>
      !j.location.toLowerCase().includes("remote") &&
      !j.location.toLowerCase().includes("anywhere") &&
      !j.location.toLowerCase().includes("worldwide")
    )
  } else if (workMode === "hybrid") {
    allJobs = allJobs.filter((j) =>
      j.location.toLowerCase().includes("hybrid")
    )
  }
  if (category) {
    allJobs = allJobs.filter((j) =>
      j.category?.toLowerCase().includes(category.toLowerCase())
    )
  }

  // Sort by date (newest first)
  allJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

  // Collect available filter values
  const jobTypes = Array.from(new Set(jobs.map((j) => j.type).filter(Boolean))).sort()
  const categories = Array.from(new Set(jobs.map((j) => j.category).filter(Boolean))).sort()

  // Get department filter values from internal positions (graceful fallback)
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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              printf
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-500">Careers</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Find Your Next Role
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Browse jobs from companies hiring on printf.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Take the pathfinder",
                description: "Map yourself to the fastest theprintf.com workflow before you start applying.",
                href: "/career-quiz",
                accent: "border-saffron/30 bg-saffron/5 text-saffron",
              },
              {
                title: "Practice before you apply",
                description: "Use guided problem-solving and AI feedback to tighten weak spots.",
                href: "/practice",
                accent: "border-india-green/30 bg-india-green/5 text-india-green",
              },
              {
                title: "Build a proof stack",
                description: "Turn strong sessions into reports, badges, and a public talent profile.",
                href: "/auth/signup?role=candidate",
                accent: "border-blue-500/20 bg-blue-500/5 text-blue-500",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
              >
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${item.accent}`}>
                  Launch tool
                </span>
                <h2 className="mt-3 text-base font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
              </Link>
            ))}
          </div>

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
              {/* Work mode filter */}
              <select
                name="workMode"
                defaultValue={workMode}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
              >
                <option value="">Remote / On-site</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>

              {/* Job type filter */}
              <select
                name="jobType"
                defaultValue={jobType}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
              >
                <option value="">All Job Types</option>
                {jobTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Category filter */}
              <select
                name="category"
                defaultValue={category}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-saffron focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c!}>{c}</option>
                ))}
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

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Practice</span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Live interview reports</span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Public talent profile</span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Job discovery</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {allJobs.length} job{allJobs.length !== 1 ? "s" : ""} found
          </p>
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
            {allJobs.map((job) => (
              <Link
                key={job.id}
                href={job.url}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-saffron/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
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
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-xs text-gray-400">
          <p>All positions are posted by companies hiring on printf.</p>
        </div>
      </div>
    </div>
  )
}
