'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'practice';

const TEST_DEFS = [
  { id: 'prac-progress', name: 'Practice progress API' },
  { id: 'prac-saved', name: 'Saved problems API' },
  { id: 'prac-recommend', name: 'Recommendations API' },
  { id: 'prac-weakness', name: 'Weakness profile API' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPracticeTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const endpoints: Record<string, string> = {
        'prac-progress': '/api/practice/progress',
        'prac-saved': '/api/practice/saved',
        'prac-recommend': '/api/practice/recommend',
        'prac-weakness': '/api/practice/weakness-profile',
      };
      const res = await fetch(endpoints[td.id], { signal });
      if (!res.ok) throw new Error(`Status ${res.status}`);
    },
  }));
}

export default function PracticeTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Practice Mode"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPracticeTests(runner))}
      onRunTest={(id) => {
        const def = getPracticeTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
