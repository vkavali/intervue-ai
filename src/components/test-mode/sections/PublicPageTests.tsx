'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'public-pages';

const TEST_DEFS = [
  { id: 'pub-landing', name: 'Landing page loads (/)' },
  { id: 'pub-careers', name: 'Careers page loads (/careers)' },
  { id: 'pub-jobs', name: 'Jobs listing page loads (/jobs)' },
  { id: 'pub-jobs-api', name: 'Jobs API (/api/jobs)' },
  { id: 'pub-join', name: 'Join code route pattern exists' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPublicPageTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'pub-landing': {
          const res = await fetch('/', { signal, redirect: 'manual' });
          if (res.status === 404) throw new Error('Landing page not found');
          break;
        }
        case 'pub-careers': {
          const res = await fetch('/careers', { signal, redirect: 'manual' });
          if (res.status === 404) throw new Error('Careers page not found');
          break;
        }
        case 'pub-jobs': {
          const res = await fetch('/jobs', { signal, redirect: 'manual' });
          if (res.status === 404) throw new Error('Jobs page not found');
          break;
        }
        case 'pub-jobs-api': {
          const res = await fetch('/api/jobs', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'pub-join': {
          // Hit a dummy join code to verify the route pattern exists
          const res = await fetch('/join/test-mode-check', { signal, redirect: 'manual' });
          if (res.status === 404) {
            const text = await res.text();
            if (text.includes('Cannot GET')) throw new Error('Join route pattern not found');
          }
          break;
        }
      }
    },
  }));
}

export default function PublicPageTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Public Pages"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPublicPageTests(runner))}
      onRunTest={(id) => {
        const def = getPublicPageTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
