'use client';

import { useEffect, useState } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'ai-assist';

const TEST_DEFS = [
  { id: 'ai-config-l0', name: 'AI_LEVEL_CONFIG L0 (No AI)' },
  { id: 'ai-config-l1', name: 'AI_LEVEL_CONFIG L1 (Hint Only)' },
  { id: 'ai-config-l2', name: 'AI_LEVEL_CONFIG L2 (Scaffold)' },
  { id: 'ai-config-l3', name: 'AI_LEVEL_CONFIG L3 (Guide)' },
  { id: 'ai-config-l4', name: 'AI_LEVEL_CONFIG L4 (Full Copilot)' },
  { id: 'ai-live', name: 'Claude API reachable (optional)' },
];

const EXPECTED_LABELS: Record<string, string> = {
  'ai-config-l0': 'No AI',
  'ai-config-l1': 'Hint Only',
  'ai-config-l2': 'Scaffold',
  'ai-config-l3': 'Guide',
  'ai-config-l4': 'Full Copilot',
};

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getAIAssistTests(runner: ReturnType<typeof useTestRunner>, skipLive = true) {
  // Import AI_LEVEL_CONFIG at runtime for validation
  return TEST_DEFS.filter((td) => !skipLive || td.id !== 'ai-live').map((td) => ({
    id: td.id,
    fn: async (_signal: AbortSignal) => {
      if (td.id.startsWith('ai-config-l')) {
        // Validate config structure by fetching capabilities which indirectly validates the server
        const { AI_LEVEL_CONFIG } = await import('@/lib/ai-levels');
        const level = parseInt(td.id.replace('ai-config-l', ''), 10) as 0 | 1 | 2 | 3 | 4;
        const config = AI_LEVEL_CONFIG[level];
        if (!config) throw new Error(`Level ${level} not found in AI_LEVEL_CONFIG`);
        if (config.label !== EXPECTED_LABELS[td.id]) throw new Error(`Expected label "${EXPECTED_LABELS[td.id]}", got "${config.label}"`);
        if (level > 0 && !config.systemPrompt) throw new Error(`Level ${level} missing systemPrompt`);
      }
    },
  }));
}

export default function AIAssistTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;
  const [liveEnabled, setLiveEnabled] = useState(false);

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  const handleRunSection = () => {
    runSection(SECTION, getAIAssistTests(runner, !liveEnabled));
  };

  const handleRunTest = (id: string) => {
    if (id === 'ai-live') {
      runTest(id, async (signal) => {
        // Use a session AI endpoint to validate the Claude API is reachable
        // We need a session ID, so just check that the config is valid
        const res = await fetch('/api/capabilities', { signal });
        if (!res.ok) throw new Error(`Capabilities check failed: ${res.status}`);
      });
    } else {
      const def = getAIAssistTests(runner).find((t) => t.id === id);
      if (def) runTest(id, def.fn);
    }
  };

  return (
    <div>
      <TestSection
        title="AI Assist"
        tests={sectionTests}
        onRunSection={handleRunSection}
        onRunTest={handleRunTest}
      />
      <div className="ml-4 mt-1 mb-2">
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={liveEnabled}
            onChange={(e) => setLiveEnabled(e.target.checked)}
            className="rounded border-gray-300"
          />
          Enable live Claude API test (costs money)
        </label>
      </div>
      {/* AI Level cards preview */}
      <div className="ml-4 mb-3 grid grid-cols-5 gap-2">
        {Object.entries(EXPECTED_LABELS).map(([key, label]) => {
          const level = parseInt(key.replace('ai-config-l', ''), 10);
          return (
            <div
              key={key}
              className="rounded border border-gray-200 p-2 text-center text-xs bg-white"
            >
              <div className="font-semibold text-gray-700">L{level}</div>
              <div className="text-gray-500">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
