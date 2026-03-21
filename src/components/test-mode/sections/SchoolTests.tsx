'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'school';

const TEST_DEFS = [
  { id: 'sch-dashboard', name: 'School dashboard page loads' },
  { id: 'sch-students', name: 'Students API' },
  { id: 'sch-assignments', name: 'Assignments API' },
  { id: 'sch-enrollment', name: 'Enrollment API' },
  { id: 'sch-analytics', name: 'School analytics page loads' },
  { id: 'sch-billing', name: 'School billing page loads' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getSchoolTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const urls: Record<string, string> = {
        'sch-dashboard': '/school',
        'sch-students': '/api/school/students',
        'sch-assignments': '/api/school/assignments',
        'sch-enrollment': '/api/school/enrollment',
        'sch-analytics': '/school/analytics',
        'sch-billing': '/school/billing',
      };
      const url = urls[td.id];
      const res = await fetch(url, { signal, redirect: 'manual' });
      if (res.status === 404) throw new Error(`Route not found: ${url}`);
    },
  }));
}

export default function SchoolTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="School Dashboard"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getSchoolTests(runner))}
      onRunTest={(id) => {
        const def = getSchoolTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
