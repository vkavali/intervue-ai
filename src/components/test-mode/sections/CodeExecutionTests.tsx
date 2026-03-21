'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'code-execution';

const LANGUAGES: { lang: string; code: string }[] = [
  { lang: 'javascript', code: 'console.log("hello")' },
  { lang: 'typescript', code: 'const msg: string = "hello"; console.log(msg)' },
  { lang: 'python', code: 'print("hello")' },
  { lang: 'java', code: 'public class Main { public static void main(String[] args) { System.out.println("hello"); } }' },
  { lang: 'cpp', code: '#include <iostream>\nint main() { std::cout << "hello"; return 0; }' },
  { lang: 'go', code: 'package main\nimport "fmt"\nfunc main() { fmt.Println("hello") }' },
  { lang: 'rust', code: 'fn main() { println!("hello"); }' },
];

const TEST_DEFS = [
  ...LANGUAGES.map((l) => ({ id: `exec-${l.lang}`, name: `Execute ${l.lang}` })),
  { id: 'exec-stream', name: 'SSE streaming (/api/execute/run-tests-stream)' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getCodeExecutionTests(_runner: ReturnType<typeof useTestRunner>) {
  return [
    ...LANGUAGES.map((l) => ({
      id: `exec-${l.lang}`,
      fn: async (signal: AbortSignal) => {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: l.lang, code: l.code }),
          signal,
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.error && data.exitCode !== 0) throw new Error(data.error);
      },
    })),
    {
      id: 'exec-stream',
      fn: async (signal: AbortSignal) => {
        const res = await fetch('/api/execute/run-tests-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: 'javascript', code: 'console.log("test")', testCases: '// test' }),
          signal,
        });
        if (res.status === 404) throw new Error('Stream endpoint not found');
        // Any non-404 means it exists and responds
      },
    },
  ];
}

export default function CodeExecutionTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Code Execution"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getCodeExecutionTests(runner))}
      onRunTest={(id) => {
        const def = getCodeExecutionTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
