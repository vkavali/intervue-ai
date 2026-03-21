'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'practice-pages';

const TEST_DEFS = [
  { id: 'pp-hub', name: 'Practice hub page loads' },
  { id: 'pp-custom', name: 'Custom problem page loads' },
  { id: 'pp-analytics', name: 'Practice analytics page loads' },
  { id: 'pp-progress-api', name: 'Practice progress API' },
  { id: 'pp-saved-api', name: 'Saved problems API' },
  { id: 'pp-recommend-api', name: 'Recommendations API' },
  { id: 'pp-weakness-api', name: 'Weakness profile API' },
  { id: 'pp-quality-api', name: 'Quality score endpoint exists' },
  { id: 'pp-bank-api', name: 'Problem bank API' },
  { id: 'pp-bank-suggest', name: 'Problem bank suggest endpoint' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPracticePageTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const urls: Record<string, { url: string; method?: string }> = {
        'pp-hub': { url: '/practice' },
        'pp-custom': { url: '/practice/custom' },
        'pp-analytics': { url: '/practice/analytics' },
        'pp-progress-api': { url: '/api/practice/progress' },
        'pp-saved-api': { url: '/api/practice/saved' },
        'pp-recommend-api': { url: '/api/practice/recommend' },
        'pp-weakness-api': { url: '/api/practice/weakness-profile' },
        'pp-quality-api': { url: '/api/practice/quality-score', method: 'POST' },
        'pp-bank-api': { url: '/api/problems/bank' },
        'pp-bank-suggest': { url: '/api/problems/bank/suggest', method: 'POST' },
      };
      const { url, method } = urls[td.id];
      const opts: RequestInit = { signal, redirect: 'manual' };
      if (method === 'POST') {
        opts.method = 'POST';
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = '{}';
      }
      const res = await fetch(url, opts);
      if (res.status === 404) throw new Error(`Route not found: ${url}`);
    },
  }));
}

export default function PracticePageTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Practice Mode"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPracticePageTests(runner))}
      onRunTest={(id) => {
        const def = getPracticePageTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
