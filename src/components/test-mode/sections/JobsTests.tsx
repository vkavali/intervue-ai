'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'jobs';

const TEST_DEFS = [
  { id: 'jobs-list', name: 'Public jobs list API' },
  { id: 'jobs-careers', name: 'Careers page loads' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getJobsTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'jobs-list': {
          const res = await fetch('/api/jobs', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'jobs-careers': {
          const res = await fetch('/careers', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
      }
    },
  }));
}

export default function JobsTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Jobs & Careers"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getJobsTests(runner))}
      onRunTest={(id) => {
        const def = getJobsTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
