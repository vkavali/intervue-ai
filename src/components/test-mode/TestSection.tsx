'use client';

import { useState } from 'react';
import type { TestResultItem } from './useTestRunner';
import TestResult from './TestResult';

interface TestSectionProps {
  title: string;
  tests: TestResultItem[];
  onRunSection?: () => void;
  onRunTest?: (id: string) => void;
  defaultOpen?: boolean;
}

export default function TestSection({
  title,
  tests,
  onRunSection,
  onRunTest,
  defaultOpen = false,
}: TestSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const running = tests.filter((t) => t.status === 'running').length;
  const total = tests.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer select-none hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-500 text-sm">{open ? '\u25BC' : '\u25B6'}</span>
        <span className="font-medium text-gray-900 flex-1">{title}</span>
        <div className="flex items-center gap-2 text-xs">
          {passed > 0 && (
            <span className="text-green-600 font-medium">{passed} passed</span>
          )}
          {failed > 0 && (
            <span className="text-red-600 font-medium">{failed} failed</span>
          )}
          {running > 0 && (
            <span className="text-blue-600 font-medium">{running} running</span>
          )}
          <span className="text-gray-400">{total} tests</span>
        </div>
        {onRunSection && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunSection();
            }}
            disabled={running > 0}
            className="text-xs px-3 py-1 rounded bg-india-green/10 text-india-green hover:bg-india-green/20 font-medium transition disabled:opacity-50"
          >
            Run
          </button>
        )}
      </div>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 divide-y divide-gray-100">
          {tests.map((test) => (
            <TestResult
              key={test.id}
              test={test}
              onRun={onRunTest ? () => onRunTest(test.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
