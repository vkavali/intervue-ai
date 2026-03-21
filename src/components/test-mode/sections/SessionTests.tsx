'use client';

import { useEffect, useState } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'sessions';

const TEST_DEFS = [
  { id: 'sess-list', name: 'List sessions' },
  { id: 'sess-templates', name: 'List interview templates' },
  { id: 'sess-count', name: 'Session count check' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getSessionTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'sess-list': {
          const res = await fetch('/api/sessions', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'sess-templates': {
          const res = await fetch('/api/interviews', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'sess-count': {
          const res = await fetch('/api/sessions', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          const sessions = Array.isArray(data) ? data : data.sessions || [];
          if (typeof sessions.length !== 'number') throw new Error('Invalid sessions response');
          break;
        }
      }
    },
  }));
}

export default function SessionTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;
  const [writeConfirmed, setWriteConfirmed] = useState(false);

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <div>
      <TestSection
        title="Interview Sessions"
        tests={sectionTests}
        onRunSection={() => runSection(SECTION, getSessionTests(runner))}
        onRunTest={(id) => {
          const def = getSessionTests(runner).find((t) => t.id === id);
          if (def) runTest(id, def.fn);
        }}
      />
      <div className="ml-4 mt-1 mb-2">
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={writeConfirmed}
            onChange={(e) => setWriteConfirmed(e.target.checked)}
            className="rounded border-gray-300"
          />
          Enable write tests (create + delete test session)
        </label>
      </div>
    </div>
  );
}
