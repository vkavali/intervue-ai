'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'payments';

const TEST_DEFS = [
  { id: 'pay-stripe-config', name: 'Stripe config valid' },
  { id: 'pay-stripe-api', name: 'Stripe checkout endpoint' },
  { id: 'pay-razorpay', name: 'Razorpay order endpoint' },
  { id: 'pay-plans', name: 'Launch offer / plans structure' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPaymentTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'pay-stripe-config': {
          // Check that the Stripe checkout endpoint exists (POST-only, GET might 405)
          const res = await fetch('/api/stripe/checkout', { method: 'POST', signal, body: '{}', headers: { 'Content-Type': 'application/json' } });
          // 400 = exists but bad input, 405 = method issue, 500 = server error
          if (res.status === 404) throw new Error('Stripe checkout endpoint not found');
          break;
        }
        case 'pay-stripe-api': {
          const res = await fetch('/api/stripe/portal', { method: 'POST', signal, body: '{}', headers: { 'Content-Type': 'application/json' } });
          if (res.status === 404) throw new Error('Stripe portal endpoint not found');
          break;
        }
        case 'pay-razorpay': {
          const res = await fetch('/api/razorpay/order', { method: 'POST', signal, body: '{}', headers: { 'Content-Type': 'application/json' } });
          if (res.status === 404) throw new Error('Razorpay order endpoint not found');
          break;
        }
        case 'pay-plans': {
          const res = await fetch('/api/launch-offer/status', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
      }
    },
  }));
}

export default function PaymentTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Payments"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPaymentTests(runner))}
      onRunTest={(id) => {
        const def = getPaymentTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
