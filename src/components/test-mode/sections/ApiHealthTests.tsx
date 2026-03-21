'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'api-health';

const ENDPOINTS = [
  '/api/capabilities',
  '/api/sessions',
  '/api/interviews',
  '/api/positions',
  '/api/notifications',
  '/api/usage',
  '/api/gamification/stats',
  '/api/gamification/leaderboard',
  '/api/problems/bank',
  '/api/practice/progress',
  '/api/jobs',
  '/api/launch-offer/status',
  '/api/calendar',
  '/api/company/settings',
];

const TEST_DEFS = ENDPOINTS.map((ep) => ({
  id: `health-${ep.replace(/\//g, '-')}`,
  name: `GET ${ep}`,
}));

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getApiHealthTests(runner: ReturnType<typeof useTestRunner>) {
  return ENDPOINTS.map((ep) => ({
    id: `health-${ep.replace(/\//g, '-')}`,
    fn: async (signal: AbortSignal) => {
      const res = await fetch(ep, { signal });
      if (!res.ok && res.status !== 401 && res.status !== 403) {
        throw new Error(`Status ${res.status}`);
      }
    },
  }));
}

export default function ApiHealthTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="API Health"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getApiHealthTests(runner))}
      onRunTest={(id) => {
        const def = getApiHealthTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
