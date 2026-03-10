interface DimensionScore {
  name: string
  score: number
  maxScore: number
  comment?: string
}

interface RiskFlag {
  severity: "low" | "medium" | "high"
  message: string
}

interface QuoteHighlight {
  quote: string
  context?: string
  timestamp?: string
}

interface AuditReport {
  dimensions: DimensionScore[]
  thinkingTrace: string[]
  riskFlags: RiskFlag[]
  quoteHighlights: QuoteHighlight[]
  suggestedDecision: "strong_hire" | "hire" | "no_hire" | "strong_no_hire"
  confidence: number // 0 to 1
  summary?: string
}

interface ScorecardProps {
  report: AuditReport
}

const decisionLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  strong_hire: { label: "Strong Hire", color: "text-green-400", bgColor: "bg-green-900/30 border-green-700" },
  hire: { label: "Hire", color: "text-green-300", bgColor: "bg-green-900/20 border-green-800" },
  no_hire: { label: "No Hire", color: "text-red-300", bgColor: "bg-red-900/20 border-red-800" },
  strong_no_hire: { label: "Strong No Hire", color: "text-accent-red", bgColor: "bg-red-900/30 border-red-700" },
}

const riskSeverityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-yellow-900/20", text: "text-yellow-300", dot: "bg-yellow-400" },
  medium: { bg: "bg-orange-900/20", text: "text-orange-300", dot: "bg-orange-400" },
  high: { bg: "bg-red-900/20", text: "text-red-300", dot: "bg-red-400" },
}

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100))

  let barColor = "bg-red-500"
  if (pct >= 80) barColor = "bg-green-500"
  else if (pct >= 60) barColor = "bg-blue-500"
  else if (pct >= 40) barColor = "bg-yellow-500"
  else if (pct >= 20) barColor = "bg-orange-500"

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-right font-mono text-sm font-semibold text-gray-700">
        {score}/{maxScore}
      </span>
    </div>
  )
}

export default function Scorecard({ report }: ScorecardProps) {
  const decision = decisionLabels[report.suggestedDecision] ?? decisionLabels.no_hire
  const confidencePct = Math.round(report.confidence * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-gray-900">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
        <h2 className="mb-1 text-xl font-bold">AI Audit Report</h2>
        {report.summary && (
          <p className="text-sm text-gray-500">{report.summary}</p>
        )}
      </div>

      {/* Suggested Decision */}
      <div className={`rounded-lg border p-6 ${decision.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Suggested Decision
            </p>
            <p className={`mt-1 text-2xl font-bold ${decision.color}`}>
              {decision.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Confidence
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{confidencePct}%</p>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Scoring Dimensions
        </h3>
        <div className="space-y-4">
          {report.dimensions.map((dim, idx) => (
            <div key={idx}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-200">{dim.name}</span>
              </div>
              <ScoreBar score={dim.score} maxScore={dim.maxScore} />
              {dim.comment && (
                <p className="mt-1 text-xs text-gray-500">{dim.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      {report.riskFlags.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Risk Flags
          </h3>
          <div className="space-y-2">
            {report.riskFlags.map((flag, idx) => {
              const style = riskSeverityStyles[flag.severity] ?? riskSeverityStyles.low
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 rounded-md px-3 py-2 ${style.bg}`}
                >
                  <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
                  <div>
                    <span className={`text-xs font-semibold uppercase ${style.text}`}>
                      {flag.severity}
                    </span>
                    <p className="text-sm text-gray-700">{flag.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quote Highlights */}
      {report.quoteHighlights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Notable Quotes
          </h3>
          <div className="space-y-3">
            {report.quoteHighlights.map((highlight, idx) => (
              <blockquote
                key={idx}
                className="border-l-2 border-blue-500 pl-4"
              >
                <p className="text-sm italic text-gray-700">
                  &ldquo;{highlight.quote}&rdquo;
                </p>
                {(highlight.context || highlight.timestamp) && (
                  <p className="mt-1 text-xs text-gray-500">
                    {highlight.context}
                    {highlight.context && highlight.timestamp && " - "}
                    {highlight.timestamp}
                  </p>
                )}
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Thinking Trace */}
      {report.thinkingTrace.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Thinking Trace
          </h3>
          <ol className="space-y-2">
            {report.thinkingTrace.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-500">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
