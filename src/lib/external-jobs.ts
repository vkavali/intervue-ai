export interface ExternalJob {
  id: string
  title: string
  company: string
  companyLogo: string | null
  location: string
  type: string // Full-time, Contract, etc.
  category: string | null
  salary: string | null
  description: string | null
  url: string
  source: "remotive" | "arbeitnow" | "printf"
  postedAt: string
}

// ─── Remotive API (remote tech jobs, no auth) ──────────────────────────────

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  company_logo: string | null
  category: string
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
}

async function fetchRemotiveJobs(search?: string, category?: string, limit = 20): Promise<ExternalJob[]> {
  try {
    console.log("[external-jobs] Fetching Remotive...")
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (limit) params.set("limit", String(limit))

    const res = await fetch(
      `https://remotive.com/api/remote-jobs?${params}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.log("[external-jobs] Remotive returned", res.status)
      return []
    }

    const data = await res.json()
    const jobs: RemotiveJob[] = data.jobs || []
    console.log("[external-jobs] Remotive returned", jobs.length, "jobs")

    return jobs.map((j) => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name,
      companyLogo: j.company_logo || null,
      location: j.candidate_required_location || "Remote",
      type: j.job_type || "Full-time",
      category: j.category || null,
      salary: j.salary || null,
      description: j.description ? stripHtml(j.description).slice(0, 300) : null,
      url: j.url,
      source: "remotive" as const,
      postedAt: j.publication_date,
    }))
  } catch (err) {
    console.error("[external-jobs] Remotive error:", err)
    return []
  }
}

// ─── Arbeitnow API (tech jobs, no auth) ─────────────────────────────────────

interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number
}

async function fetchArbeitnowJobs(limit = 20): Promise<ExternalJob[]> {
  try {
    console.log("[external-jobs] Fetching Arbeitnow...")
    const res = await fetch(
      "https://www.arbeitnow.com/api/job-board-api",
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.log("[external-jobs] Arbeitnow returned", res.status)
      return []
    }

    const data = await res.json()
    const jobs: ArbeitnowJob[] = (data.data || []).slice(0, limit)
    console.log("[external-jobs] Arbeitnow returned", jobs.length, "jobs")

    return jobs.map((j) => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title,
      company: j.company_name,
      companyLogo: null,
      location: j.remote ? "Remote" : (j.location || "Europe"),
      type: j.job_types?.[0] || "Full-time",
      category: j.tags?.[0] || null,
      salary: null,
      description: j.description ? stripHtml(j.description).slice(0, 300) : null,
      url: j.url,
      source: "arbeitnow" as const,
      postedAt: new Date(j.created_at * 1000).toISOString(),
    }))
  } catch (err) {
    console.error("[external-jobs] Arbeitnow error:", err)
    return []
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function fetchExternalJobs(
  search?: string,
  limit = 20
): Promise<ExternalJob[]> {
  const [remotiveJobs, arbeitnowJobs] = await Promise.all([
    fetchRemotiveJobs(search, undefined, limit),
    fetchArbeitnowJobs(limit),
  ])

  // Merge and sort by date (newest first)
  const all = [...remotiveJobs, ...arbeitnowJobs]
  all.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

  return all
}

export const REMOTIVE_CATEGORIES = [
  "software-dev",
  "customer-support",
  "design",
  "marketing",
  "sales",
  "product",
  "business",
  "data",
  "devops",
  "finance",
  "human-resources",
  "qa",
  "writing",
]
