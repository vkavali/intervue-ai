'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'auth';

const TEST_DEFS = [
  { id: 'auth-session', name: 'Session valid (/api/auth/me)' },
  { id: 'auth-role', name: 'Role is COMPANY_ADMIN' },
  { id: 'auth-company', name: 'Company associated' },
  { id: 'auth-csrf', name: 'CSRF token present (/api/auth/csrf)' },
  { id: 'auth-providers', name: 'Auth providers available (/api/auth/providers)' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getAuthTests(_runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'auth-session': {
          const res = await fetch('/api/auth/me', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          if (!data.id) throw new Error('No user ID in session');
          break;
        }
        case 'auth-role': {
          const res = await fetch('/api/auth/me', { signal });
          const data = await res.json();
          if (data.role !== 'COMPANY_ADMIN') throw new Error(`Role is ${data.role}, expected COMPANY_ADMIN`);
          break;
        }
        case 'auth-company': {
          const res = await fetch('/api/auth/me', { signal });
          const data = await res.json();
          if (!data.companyId) throw new Error('No company associated');
          break;
        }
        case 'auth-csrf': {
          const res = await fetch('/api/auth/csrf', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          if (!data.csrfToken) throw new Error('No CSRF token');
          break;
        }
        case 'auth-providers': {
          const res = await fetch('/api/auth/providers', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          if (!data || Object.keys(data).length === 0) throw new Error('No providers');
          break;
        }
      }
    },
  }));
}

export default function AuthTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Auth & Roles"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getAuthTests(runner))}
      onRunTest={(id) => {
        const def = getAuthTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
