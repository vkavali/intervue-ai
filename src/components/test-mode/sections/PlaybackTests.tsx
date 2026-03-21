'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'playback';

const TEST_DEFS = [
  { id: 'play-snapshots', name: 'Snapshots API exists' },
  { id: 'play-component', name: 'SessionPlayback component imports' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getPlaybackTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'play-snapshots': {
          // Just verify the endpoint pattern exists by hitting a dummy session ID
          const res = await fetch('/api/sessions/test-mode-check/snapshots', { signal });
          // 404 on the session is fine, but the route should exist (won't be 404 for route)
          // A 401/403/400/500 means the route exists
          if (res.status === 404) {
            // Check if it's a "session not found" vs "route not found"
            const text = await res.text();
            if (text.includes('Cannot GET') || text.includes('Not Found')) {
              throw new Error('Snapshots route not found');
            }
          }
          break;
        }
        case 'play-component': {
          try {
            // Dynamic import to check if the component file exists
            // Use variable to prevent TypeScript from resolving the module at compile time
            const modPath = '@/components/SessionPlayback';
            await import(/* webpackIgnore: true */ modPath);
          } catch {
            // Component may not exist yet - that's a valid test failure
            throw new Error('SessionPlayback component not found or import failed');
          }
          break;
        }
      }
    },
  }));
}

export default function PlaybackTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Session Playback"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getPlaybackTests(runner))}
      onRunTest={(id) => {
        const def = getPlaybackTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
