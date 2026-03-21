'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'dashboard-pages';

const TEST_DEFS = [
  { id: 'dp-home', name: 'Dashboard home loads' },
  { id: 'dp-sessions', name: 'Sessions page loads' },
  { id: 'dp-interviews', name: 'Interviews page loads' },
  { id: 'dp-interviews-new', name: 'New interview page loads' },
  { id: 'dp-templates', name: 'Templates page loads' },
  { id: 'dp-candidates', name: 'Candidates page loads' },
  { id: 'dp-candidates-add', name: 'Add candidate page loads' },
  { id: 'dp-positions', name: 'Positions page loads' },
  { id: 'dp-interviewers', name: 'Interviewers page loads' },
  { id: 'dp-interviewers-avail', name: 'Interviewer availability page loads' },
  { id: 'dp-calendar', name: 'Calendar page loads' },
  { id: 'dp-analytics', name: 'Analytics page loads' },
  { id: 'dp-billing', name: 'Billing page loads' },
  { id: 'dp-settings', name: 'Settings page loads' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getDashboardPageTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const pages: Record<string, string> = {
        'dp-home': '/dashboard',
        'dp-sessions': '/dashboard/sessions',
        'dp-interviews': '/dashboard/interviews',
        'dp-interviews-new': '/dashboard/interviews/new',
        'dp-templates': '/dashboard/interviews/templates',
        'dp-candidates': '/dashboard/candidates',
        'dp-candidates-add': '/dashboard/candidates/add',
        'dp-positions': '/dashboard/positions',
        'dp-interviewers': '/dashboard/interviewers',
        'dp-interviewers-avail': '/dashboard/interviewers/availability',
        'dp-calendar': '/dashboard/calendar',
        'dp-analytics': '/dashboard/analytics',
        'dp-billing': '/dashboard/billing',
        'dp-settings': '/dashboard/settings',
      };
      const url = pages[td.id];
      const res = await fetch(url, { signal, redirect: 'manual' });
      if (res.status === 404) throw new Error(`Page not found: ${url}`);
    },
  }));
}

export default function DashboardPageTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Dashboard Pages"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getDashboardPageTests(runner))}
      onRunTest={(id) => {
        const def = getDashboardPageTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
