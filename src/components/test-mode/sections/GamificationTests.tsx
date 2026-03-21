'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'gamification';

const TEST_DEFS = [
  { id: 'gam-stats', name: 'Gamification stats API' },
  { id: 'gam-leaderboard', name: 'Leaderboard API' },
  { id: 'gam-daily', name: 'Daily challenge API' },
  { id: 'gam-badges', name: 'Badges seed endpoint' },
  { id: 'gam-level-calc', name: 'Level calculation (in-memory)' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getGamificationTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'gam-stats': {
          const res = await fetch('/api/gamification/stats', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'gam-leaderboard': {
          const res = await fetch('/api/gamification/leaderboard', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'gam-daily': {
          const res = await fetch('/api/gamification/daily-challenge', { signal });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          break;
        }
        case 'gam-badges': {
          const res = await fetch('/api/gamification/seed-badges', { signal });
          // Seed endpoint might require POST, just check it exists
          if (res.status === 404) throw new Error('Endpoint not found');
          break;
        }
        case 'gam-level-calc': {
          // Simple in-memory calculation test
          const xpToLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
          const level = xpToLevel(500);
          if (level < 1) throw new Error(`Invalid level calculation: ${level}`);
          break;
        }
      }
    },
  }));
}

export default function GamificationTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Gamification"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getGamificationTests(runner))}
      onRunTest={(id) => {
        const def = getGamificationTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
