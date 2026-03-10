interface MetricBarProps {
  label: string
  value: number // 0-10
  maxValue?: number
}

export function MetricBar({ label, value, maxValue = 10 }: MetricBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  const barGradient =
    value >= 8 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
    value >= 6 ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
    value >= 4 ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-red-500 to-rose-400"

  const textColor =
    value >= 8 ? "text-green-400" :
    value >= 6 ? "text-yellow-400" :
    value >= 4 ? "text-orange-400" : "text-red-400"

  const glowShadow =
    value >= 8 ? "shadow-green-500/20" :
    value >= 6 ? "shadow-yellow-500/20" :
    value >= 4 ? "shadow-orange-500/20" : "shadow-red-500/20"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100/80 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${barGradient} shadow-lg ${glowShadow} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
