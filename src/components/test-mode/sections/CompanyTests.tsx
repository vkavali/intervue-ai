'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'company';

const TEST_DEFS = [
  { id: 'co-positions', name: 'Positions API' },
  { id: 'co-interviewers', name: 'Interviewer availability API' },
  { id: 'co-pipeline', name: 'Pipeline API' },
  { id: 'co-templates', name: 'Interview templates API' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getCompanyTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const endpoints: Record<string, string> = {
        'co-positions': '/api/positions',
        'co-interviewers': '/api/interviewers/availability',
        'co-pipeline': '/api/pipeline',
        'co-templates': '/api/interviews',
      };
      const res = await fetch(endpoints[td.id], { signal });
      if (!res.ok) throw new Error(`Status ${res.status}`);
    },
  }));
}

export default function CompanyTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Company Management"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getCompanyTests(runner))}
      onRunTest={(id) => {
        const def = getCompanyTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
