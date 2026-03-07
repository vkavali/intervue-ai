interface Example {
  input: string
  output: string
  explanation?: string
}

interface Question {
  title: string
  description: string
  constraints?: string[]
  examples?: Example[]
  difficulty?: "Easy" | "Medium" | "Hard"
  tags?: string[]
}

interface QuestionPanelProps {
  question: Question
  questionNumber: number
  totalQuestions: number
}

const difficultyColors: Record<string, string> = {
  Easy: "text-green-400 bg-green-900/30 border-green-700",
  Medium: "text-yellow-400 bg-yellow-900/30 border-yellow-700",
  Hard: "text-red-400 bg-red-900/30 border-red-700",
}

export default function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
}: QuestionPanelProps) {
  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-white">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>

          {question.difficulty && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                difficultyColors[question.difficulty] ?? "text-gray-400 bg-gray-800 border-gray-700"
              }`}
            >
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="mb-4 text-xl font-bold text-white">
          {questionNumber}. {question.title}
        </h2>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {question.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {question.description}
          </p>
        </div>

        {/* Examples */}
        {question.examples && question.examples.length > 0 && (
          <div className="mb-6 space-y-4">
            {question.examples.map((example, idx) => (
              <div key={idx}>
                <h4 className="mb-2 text-sm font-semibold text-gray-300">
                  Example {idx + 1}:
                </h4>
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Input: </span>
                    <code className="font-mono text-sm text-blue-300">
                      {example.input}
                    </code>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Output: </span>
                    <code className="font-mono text-sm text-green-300">
                      {example.output}
                    </code>
                  </div>
                  {example.explanation && (
                    <div className="mt-2 border-t border-gray-700 pt-2">
                      <span className="text-xs font-semibold text-gray-500">
                        Explanation:{" "}
                      </span>
                      <span className="text-sm text-gray-400">
                        {example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {question.constraints && question.constraints.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-300">
              Constraints:
            </h4>
            <ul className="space-y-1">
              {question.constraints.map((constraint, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-1 text-gray-600">&bull;</span>
                  <code className="font-mono text-xs text-gray-300">{constraint}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
