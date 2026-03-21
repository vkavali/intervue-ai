'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'auth-pages';

const TEST_DEFS = [
  { id: 'authp-signin', name: 'Sign in page loads' },
  { id: 'authp-signup', name: 'Sign up page loads' },
  { id: 'authp-forgot', name: 'Forgot password page loads' },
  { id: 'authp-reset', name: 'Reset password page loads' },
  { id: 'authp-redirect', name: 'Auth redirect page loads' },
  { id: 'authp-register-api', name: 'Register API endpoint exists' },
  { id: 'authp-forgot-api', name: 'Forgot password API endpoint exists' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getAuthPageTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      const urls: Record<string, { url: string; method?: string }> = {
        'authp-signin': { url: '/auth/signin' },
        'authp-signup': { url: '/auth/signup' },
        'authp-forgot': { url: '/auth/forgot-password' },
        'authp-reset': { url: '/auth/reset-password' },
        'authp-redirect': { url: '/auth/redirect' },
        'authp-register-api': { url: '/api/auth/register', method: 'POST' },
        'authp-forgot-api': { url: '/api/auth/forgot-password', method: 'POST' },
      };
      const { url, method } = urls[td.id];
      const opts: RequestInit = { signal, redirect: 'manual' };
      if (method === 'POST') {
        opts.method = 'POST';
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = '{}';
      }
      const res = await fetch(url, opts);
      if (res.status === 404) throw new Error(`Route not found: ${url}`);
    },
  }));
}

export default function AuthPageTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Auth Pages"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getAuthPageTests(runner))}
      onRunTest={(id) => {
        const def = getAuthPageTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
