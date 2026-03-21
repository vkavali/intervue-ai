'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'candidate';

const TEST_DEFS = [
  { id: 'cand-dashboard', name: 'Candidate dashboard page loads' },
  { id: 'cand-profile', name: 'Candidate profile visibility API' },
  { id: 'cand-interviews', name: 'Candidate interviews page loads' },
  { id: 'cand-badges', name: 'Candidate badges page loads' },
  { id: 'cand-leaderboard', name: 'Candidate leaderboard page loads' },
  { id: 'cand-schedule', name: 'Candidate schedule page loads' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getCandidateDashTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const pages: Record<string, string> = {
        'cand-dashboard': '/candidate',
        'cand-profile': '/api/candidate/profile/visibility',
        'cand-interviews': '/candidate/interviews',
        'cand-badges': '/candidate/badges',
        'cand-leaderboard': '/candidate/leaderboard',
        'cand-schedule': '/candidate/schedule',
      };
      const url = pages[td.id];
      const res = await fetch(url, { signal, redirect: 'manual' });
      // 200 = loads, 307/302 = redirect (auth gate), both mean route exists
      if (res.status === 404) throw new Error(`Route not found: ${url}`);
    },
  }));
}

export default function CandidateDashTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Candidate Dashboard"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getCandidateDashTests(runner))}
      onRunTest={(id) => {
        const def = getCandidateDashTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
