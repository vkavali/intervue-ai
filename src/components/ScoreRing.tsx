interface ScoreRingProps {
  score: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, className = "", showLabel = true }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference

  const color =
    score >= 80 ? "text-green-400" :
    score >= 60 ? "text-yellow-400" :
    score >= 40 ? "text-orange-400" : "text-red-400"

  const glowColor =
    score >= 80 ? "drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" :
    score >= 60 ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" :
    score >= 40 ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]" : "drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]"

  const trackColor =
    score >= 80 ? "text-green-400/10" :
    score >= 60 ? "text-yellow-400/10" :
    score >= 40 ? "text-orange-400/10" : "text-red-400/10"

  // Scale font sizes proportionally
  const scoreFontSize = size >= 100 ? "text-3xl" : size >= 70 ? "text-lg" : "text-sm"
  const labelFontSize = size >= 100 ? "text-[10px]" : "text-[8px]"

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={`-rotate-90 ${glowColor}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${scoreFontSize} font-bold ${color}`}>{score.toFixed(1)}</span>
        {showLabel && <span className={`${labelFontSize} text-gray-500 uppercase tracking-wider`}>Overall</span>}
      </div>
    </div>
  )
}
