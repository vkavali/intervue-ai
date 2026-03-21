"use client";

import { useMemo } from "react";

interface Question {
  id: string;
  title: string;
  description: string;
  constraints: string | null;
  examples: string | null;
  difficulty: string;
  aiLevel: number;
  timeLimit: number;
  orderIndex: number;
}

interface QuestionPanelProps {
  question: Question | undefined;
  currentIndex: number;
  totalQuestions: number;
}

const difficultyBadge: Record<string, { bg: string; text: string }> = {
  EASY: { bg: "bg-green-500/15 border-green-500/30", text: "text-green-400" },
  MEDIUM: { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-400" },
  HARD: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400" },
};

export default function QuestionPanel({ question, currentIndex, totalQuestions }: QuestionPanelProps) {
  const constraintItems = useMemo(() => {
    if (!question?.constraints) return [];
    return question.constraints
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }, [question]);

  const parsedExamples = useMemo(() => {
    if (!question?.examples) return [];
    const raw = question.examples;
    const examples: { input?: string; output?: string; explanation?: string }[] = [];
    let current: { input?: string; output?: string; explanation?: string } = {};

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (/^(Example\s*\d)/i.test(trimmed)) {
        if (current.input || current.output) {
          examples.push(current);
          current = {};
        }
      } else if (/^Input\s*:/i.test(trimmed)) {
        if (current.input) {
          examples.push(current);
          current = {};
        }
        current.input = trimmed.replace(/^Input\s*:\s*/i, "");
      } else if (/^Output\s*:/i.test(trimmed)) {
        current.output = trimmed.replace(/^Output\s*:\s*/i, "");
      } else if (/^Explanation\s*:/i.test(trimmed)) {
        current.explanation = trimmed.replace(/^Explanation\s*:\s*/i, "");
      } else if (current.explanation !== undefined) {
        current.explanation += " " + trimmed;
      } else if (current.input !== undefined && current.output === undefined) {
        current.input += " " + trimmed;
      }
    }
    if (current.input || current.output) examples.push(current);

    if (examples.length === 0) {
      const blocks = raw.split(/(?=Example\s*\d|Input\s*:)/i).filter(b => b.trim());
      return blocks.map(b => ({ input: b.trim(), output: undefined, explanation: undefined }));
    }
    return examples;
  }, [question]);

  if (!question) {
    return (
      <div className="h-full overflow-y-auto border-r border-editor-border bg-editor-panel/80 p-5">
        <p className="text-gray-500">No question available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-r border-editor-border bg-editor-panel/80 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-gray-500">
          Q{currentIndex + 1}/{totalQuestions}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          difficultyBadge[question.difficulty]?.bg || ""
        } ${difficultyBadge[question.difficulty]?.text || "text-gray-400"}`}>
          {question.difficulty}
        </span>
        <span className="text-xs text-gray-500">{question.timeLimit} min</span>
      </div>

      <h2 className="text-lg font-bold text-white mb-4">{question.title}</h2>

      <div className="space-y-4 text-sm text-gray-300">
        <div>
          <p className="whitespace-pre-wrap leading-relaxed">{question.description}</p>
        </div>

        {parsedExamples.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
            <div className="space-y-3">
              {parsedExamples.map((ex, i) => (
                <div key={i} className="rounded-lg bg-editor-surface/70 border border-editor-border/50 p-3 space-y-1.5">
                  {ex.input && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500">Input: </span>
                      <code className="text-xs text-blue-300 font-mono">{ex.input}</code>
                    </div>
                  )}
                  {ex.output && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500">Output: </span>
                      <code className="text-xs text-green-300 font-mono">{ex.output}</code>
                    </div>
                  )}
                  {ex.explanation && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500">Explanation: </span>
                      <span className="text-xs text-gray-400">{ex.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedExamples.length === 0 && question.examples && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
            <pre className="whitespace-pre-wrap font-mono text-xs bg-editor-surface rounded-lg p-3 text-gray-300">
              {question.examples}
            </pre>
          </div>
        )}

        {constraintItems.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Constraints</h4>
            <ul className="space-y-1">
              {constraintItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="text-gray-600 mt-0.5 shrink-0">&bull;</span>
                  <code className="font-mono text-gray-300 bg-editor-surface/50 px-1 rounded">{item}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
