import { ImageResponse } from "@vercel/og"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const audit = await prisma.auditReport.findUnique({
    where: { shareToken: params.token },
    include: {
      session: {
        include: {
          candidate: { select: { name: true } },
          template: { select: { role: true, seniority: true } },
        },
      },
    },
  })

  if (!audit) {
    return new Response("Not found", { status: 404 })
  }

  const candidateName = audit.session.candidate.name
  const nameParts = candidateName.split(" ")
  const displayName = nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
    : nameParts[0]

  const role = audit.session.template.role
  const seniority = audit.session.template.seniority

  const metrics = [
    { label: "Problem Comprehension", value: audit.problemComprehension },
    { label: "Solution Correctness", value: audit.solutionCorrectness },
    { label: "Code Quality", value: audit.codeQuality },
    { label: "Communication", value: audit.communication },
    { label: "AI Usage", value: audit.aiUsageQuality },
    { label: "Time Management", value: audit.timeManagement },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const scoreColor =
    audit.overallScore >= 80 ? "#4ade80" :
    audit.overallScore >= 60 ? "#facc15" :
    audit.overallScore >= 40 ? "#fb923c" : "#f87171"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "42px", fontWeight: "bold", color: "#ffffff" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "22px", color: "#94a3b8" }}>
              {role} &middot; {seniority}
            </div>
          </div>

          {/* Score circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              border: `4px solid ${scoreColor}`,
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: "48px", fontWeight: "bold", color: scoreColor }}>
              {audit.overallScore.toFixed(1)}
            </div>
            <div style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px" }}>
              Score
            </div>
          </div>
        </div>

        {/* Metric bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {metrics.map((m) => {
            const barColor =
              m.value >= 8 ? "#4ade80" :
              m.value >= 6 ? "#facc15" :
              m.value >= 4 ? "#fb923c" : "#f87171"
            return (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                  <span style={{ color: "#cbd5e1" }}>{m.label}</span>
                  <span style={{ color: barColor, fontWeight: "bold" }}>{m.value.toFixed(1)}/10</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${(m.value / 10) * 100}%`,
                      height: "12px",
                      borderRadius: "6px",
                      background: barColor,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "16px", color: "#64748b" }}>
            Verified by printf
          </div>
          <div style={{ fontSize: "14px", color: "#475569" }}>
            theprintf.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  )
}
