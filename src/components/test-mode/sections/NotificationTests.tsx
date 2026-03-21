'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'notifications';

const TEST_DEFS = [
  { id: 'notif-list', name: 'List notifications API' },
  { id: 'notif-send', name: 'Send notification endpoint exists' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getNotificationTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'notif-list': {
          const res = await fetch('/api/notifications', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'notif-send': {
          const res = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
            signal,
          });
          if (res.status === 404) throw new Error('Send notification endpoint not found');
          break;
        }
      }
    },
  }));
}

export default function NotificationTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Notifications"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getNotificationTests(runner))}
      onRunTest={(id) => {
        const def = getNotificationTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
