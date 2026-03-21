'use client';

import type { TestResultItem } from './useTestRunner';

function StatusIcon({ status }: { status: TestResultItem['status'] }) {
  switch (status) {
    case 'pass':
      return <span className="text-green-500 text-lg" title="Passed">&#10003;</span>;
    case 'fail':
      return <span className="text-red-500 text-lg" title="Failed">&#10007;</span>;
    case 'running':
      return (
        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      );
    case 'skip':
      return <span className="text-yellow-500 text-lg" title="Skipped">&#8212;</span>;
    default:
      return <span className="text-gray-400 text-lg" title="Idle">&#9675;</span>;
  }
}

interface TestResultProps {
  test: TestResultItem;
  onRun?: () => void;
}

export default function TestResult({ test, onRun }: TestResultProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 group">
      <StatusIcon status={test.status} />
      <span className="flex-1 text-sm text-gray-800">{test.name}</span>
      {test.durationMs > 0 && (
        <span className="text-xs text-gray-400">{test.durationMs}ms</span>
      )}
      {onRun && (
        <button
          onClick={onRun}
          disabled={test.status === 'running'}
          className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition disabled:opacity-50"
        >
          Run
        </button>
      )}
      {test.error && (
        <span className="text-xs text-red-500 max-w-xs truncate" title={test.error}>
          {test.error}
        </span>
      )}
    </div>
  );
}
