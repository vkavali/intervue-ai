"use client";

interface BadgeCardProps {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number; // 0-100 percentage for locked badges
}

export default function BadgeCard({
  name,
  description,
  icon,
  category,
  earned,
  earnedAt,
  progress,
}: BadgeCardProps) {
  const categoryColors: Record<string, string> = {
    STREAK: "border-orange-200 bg-orange-50",
    MILESTONE: "border-blue-200 bg-blue-50",
    SKILL: "border-green-200 bg-green-50",
    SPECIAL: "border-purple-200 bg-purple-50",
  };

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        earned
          ? `${categoryColors[category] || "border-gray-200 bg-white"} shadow-sm`
          : "border-gray-200 bg-gray-50 opacity-60"
      }`}
      title={description}
    >
      <div className="flex items-start gap-3">
        <span
          className={`text-2xl ${earned ? "" : "grayscale"}`}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${earned ? "text-gray-900" : "text-gray-500"}`}>
            {name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{description}</p>
          {earned && earnedAt && (
            <p className="text-[10px] text-gray-400 mt-1">
              Earned {new Date(earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
          {!earned && progress !== undefined && progress > 0 && (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-gray-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
