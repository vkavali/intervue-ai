"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  title: string;
  description: string;
  constraints: string;
  examples: string;
  difficulty: string;
  aiLevel: number;
  timeLimit: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyQuestion = (): Question => ({
  id: generateId(),
  title: "",
  description: "",
  constraints: "",
  examples: "",
  difficulty: "MEDIUM",
  aiLevel: -1, // -1 means inherit from template default
  timeLimit: 30,
});

const aiLevelLabels: Record<number, string> = {
  0: "L0 - No AI",
  1: "L1 - Hint Only",
  2: "L2 - Scaffold",
  3: "L3 - Guide",
  4: "L4 - Full Copilot",
};

export default function NewInterviewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("MID");
  const [roundType, setRoundType] = useState("Technical");
  const [defaultAiLevel, setDefaultAiLevel] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(id: string) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title,
        role,
        seniority,
        roundType,
        defaultAiLevel,
        questions: questions.map((q) => ({
          title: q.title,
          description: q.description,
          constraints: q.constraints || undefined,
          examples: q.examples || undefined,
          difficulty: q.difficulty,
          aiLevel: q.aiLevel === -1 ? undefined : q.aiLevel,
          timeLimit: q.timeLimit,
        })),
      };

      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create template");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/interviews/${data.id}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Create Interview Template
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure the interview structure and add questions
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Template Details */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Template Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., Senior Backend Engineer - System Design"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Role
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., Backend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="STAFF">Staff</option>
                <option value="PRINCIPAL">Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Round Type
              </label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Take Home">Take Home</option>
                <option value="Live Coding">Live Coding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Default AI Level
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={defaultAiLevel}
                  onChange={(e) =>
                    setDefaultAiLevel(parseInt(e.target.value))
                  }
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>L0</span>
                  <span>L1</span>
                  <span>L2</span>
                  <span>L3</span>
                  <span>L4</span>
                </div>
                <p className="text-sm font-medium text-purple-400">
                  {aiLevelLabels[defaultAiLevel]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-300">
                  Question {index + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(question.id, { title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., Two Sum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={question.description}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Describe the problem statement..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Constraints
                    </label>
                    <textarea
                      rows={3}
                      value={question.constraints}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          constraints: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      placeholder="e.g., 1 <= nums.length <= 10^4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Examples
                    </label>
                    <textarea
                      rows={3}
                      value={question.examples}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          examples: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      placeholder="Input: nums = [2,7,11,15], target = 9&#10;Output: [0,1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={question.difficulty}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      AI Level Override
                    </label>
                    <select
                      value={question.aiLevel}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          aiLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value={-1}>Use template default (L{defaultAiLevel})</option>
                      <option value={0}>L0 - No AI</option>
                      <option value={1}>L1 - Hint Only</option>
                      <option value={2}>L2 - Scaffold</option>
                      <option value={3}>L3 - Guide</option>
                      <option value={4}>L4 - Full Copilot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={120}
                      value={question.timeLimit}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          timeLimit: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-gray-700 py-6 text-sm font-medium text-gray-400 transition-colors hover:border-purple-500/50 hover:text-purple-400"
          >
            + Add Another Question
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Template"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
