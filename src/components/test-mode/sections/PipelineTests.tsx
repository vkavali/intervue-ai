'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'pipeline';

const TEST_DEFS = [
  { id: 'pipe-list', name: 'Pipeline list API' },
  { id: 'pipe-compare', name: 'Candidate compare API' },
  { id: 'pipe-user-search', name: 'User search API' },
  { id: 'pipe-candidates-page', name: 'Candidates page loads' },
  { id: 'pipe-compare-page', name: 'Candidates compare page loads' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPipelineTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const urls: Record<string, { url: string; method?: string }> = {
        'pipe-list': { url: '/api/pipeline' },
        'pipe-compare': { url: '/api/pipeline/compare' },
        'pipe-user-search': { url: '/api/users/search' },
        'pipe-candidates-page': { url: '/dashboard/candidates' },
        'pipe-compare-page': { url: '/dashboard/candidates/compare' },
      };
      const { url, method } = urls[td.id];
      const res = await fetch(url, { signal, redirect: 'manual', method: method || 'GET' });
      if (res.status === 404) throw new Error(`Route not found: ${url}`);
    },
  }));
}

export default function PipelineTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Pipeline & Candidates"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPipelineTests(runner))}
      onRunTest={(id) => {
        const def = getPipelineTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
