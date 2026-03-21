"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATE_LIBRARY, getAllDepartments, type TemplatePreset } from "@/data/template-library";

const aiLevelLabels: Record<number, string> = {
  0: "L0 No AI",
  1: "L1 Hint",
  2: "L2 Scaffold",
  3: "L3 Guide",
  4: "L4 Copilot",
};

const departmentColors: Record<string, string> = {
  Engineering: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  Sales: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  Marketing: "border-pink-500/30 bg-pink-500/10 text-pink-600",
  Executive: "border-purple-500/30 bg-purple-500/10 text-purple-600",
  Product: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600",
  "Customer Success": "border-teal-500/30 bg-teal-500/10 text-teal-600",
  HR: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  Finance: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600",
  Legal: "border-slate-500/30 bg-slate-500/10 text-slate-600",
  General: "border-gray-300 bg-gray-100 text-gray-600",
};

export default function TemplateLibraryPage() {
  const router = useRouter();
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);

  const departments = getAllDepartments();

  const filteredTemplates = selectedDept === "all"
    ? TEMPLATE_LIBRARY
    : TEMPLATE_LIBRARY.filter((t) => t.department === selectedDept);

  // Group by department
  const grouped: Record<string, TemplatePreset[]> = {};
  for (const t of filteredTemplates) {
    if (!grouped[t.department]) grouped[t.department] = [];
    grouped[t.department].push(t);
  }

  const handleUseTemplate = async (template: TemplatePreset) => {
    setLoading(template.id);
    // Navigate to new interview page with template params pre-filled
    const params = new URLSearchParams({
      role: template.role,
      seniority: template.seniority,
      interviewType: template.interviewType,
      roundType: template.roundType,
      aiLevel: String(template.aiLevel),
    });
    router.push(`/dashboard/interviews/new?${params}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pre-built interview templates across all departments. Pick one to auto-populate your interview.
        </p>
      </div>

      {/* Department filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDept("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedDept === "all"
              ? "border-saffron bg-saffron/10 text-saffron-dark"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          All ({TEMPLATE_LIBRARY.length})
        </button>
        {departments.map((dept) => {
          const count = TEMPLATE_LIBRARY.filter((t) => t.department === dept).length;
          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedDept === dept
                  ? "border-saffron bg-saffron/10 text-saffron-dark"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {dept} ({count})
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      {Object.entries(grouped).map(([dept, templates]) => (
        <div key={dept} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{dept}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => {
              const deptColor = departmentColors[t.department] || departmentColors.General;
              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-saffron/30 hover:shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">{t.role} &middot; {t.seniority}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${deptColor}`}>
                      {t.department}
                    </span>
                  </div>

                  <p className="mb-3 text-xs text-gray-600 line-clamp-2">{t.description}</p>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {t.tags.map((tag) => (
                      <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-[11px] text-gray-500">
                    <span>{t.questionCount} questions</span>
                    <span>{t.durationMinutes} min</span>
                    <span>{aiLevelLabels[t.aiLevel]}</span>
                  </div>

                  <button
                    onClick={() => handleUseTemplate(t)}
                    disabled={loading === t.id}
                    className="w-full rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron transition-colors hover:bg-saffron/10 disabled:opacity-50"
                  >
                    {loading === t.id ? "Loading..." : "Use Template"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredTemplates.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-medium text-gray-900">No templates in this category</h3>
          <p className="mt-2 text-sm text-gray-500">Try selecting a different department</p>
        </div>
      )}
    </div>
  );
}
