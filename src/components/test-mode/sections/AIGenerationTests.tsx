'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'ai-generation';

const TEST_DEFS = [
  { id: 'aigen-questions', name: 'Generate questions endpoint' },
  { id: 'aigen-interview', name: 'Generate interview endpoint' },
  { id: 'aigen-practice-ai', name: 'Practice AI session endpoint' },
  { id: 'aigen-practice-gen', name: 'Practice problem generation endpoint' },
  { id: 'aigen-hints', name: 'Practice hints endpoint' },
  { id: 'aigen-coach', name: 'Practice coach endpoint' },
  { id: 'aigen-editorial', name: 'Practice editorial endpoint' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getAIGenerationTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const endpoints: Record<string, string> = {
        'aigen-questions': '/api/ai/generate-questions',
        'aigen-interview': '/api/ai/generate-interview',
        'aigen-practice-ai': '/api/sessions/practice-ai',
        'aigen-practice-gen': '/api/practice/generate',
        'aigen-hints': '/api/practice/hints',
        'aigen-coach': '/api/practice/coach',
        'aigen-editorial': '/api/practice/editorial',
      };
      const url = endpoints[td.id];
      // These are POST-only endpoints, verify they exist (not 404)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal,
      });
      if (res.status === 404) throw new Error(`Endpoint not found: ${url}`);
      // 400/401/500 all mean the route exists and responded
    },
  }));
}

export default function AIGenerationTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="AI Generation"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getAIGenerationTests(runner))}
      onRunTest={(id) => {
        const def = getAIGenerationTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
