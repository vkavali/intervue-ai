'use client';

import { useState, useCallback, useRef, useMemo } from 'react';

export type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'skip';

export interface TestResultItem {
  id: string;
  name: string;
  section: string;
  status: TestStatus;
  durationMs: number;
  error: string | null;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  idle: number;
  skipped: number;
}

const TIMEOUT_MS = 15_000;

export function useTestRunner() {
  const [tests, setTests] = useState<Map<string, TestResultItem>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  const registerTest = useCallback(
    (id: string, name: string, section: string) => {
      setTests((prev) => {
        const next = new Map(prev);
        if (!next.has(id)) {
          next.set(id, { id, name, section, status: 'idle', durationMs: 0, error: null });
        }
        return next;
      });
    },
    []
  );

  const updateTest = useCallback((id: string, partial: Partial<TestResultItem>) => {
    setTests((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        next.set(id, { ...existing, ...partial });
      }
      return next;
    });
  }, []);

  const runTest = useCallback(
    async (id: string, fn: (signal: AbortSignal) => Promise<void>) => {
      if (stoppedRef.current) return;

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

      updateTest(id, { status: 'running', error: null, durationMs: 0 });
      const start = performance.now();

      try {
        await fn(ac.signal);
        const dur = Math.round(performance.now() - start);
        updateTest(id, { status: 'pass', durationMs: dur });
      } catch (err) {
        const dur = Math.round(performance.now() - start);
        const message = err instanceof Error ? err.message : String(err);
        updateTest(id, {
          status: ac.signal.aborted ? 'skip' : 'fail',
          durationMs: dur,
          error: ac.signal.aborted ? 'Timed out (15s)' : message,
        });
      } finally {
        clearTimeout(timer);
      }
    },
    [updateTest]
  );

  const runSection = useCallback(
    async (
      section: string,
      testDefs: { id: string; fn: (signal: AbortSignal) => Promise<void> }[]
    ) => {
      const CONCURRENCY = 3;
      for (let i = 0; i < testDefs.length; i += CONCURRENCY) {
        if (stoppedRef.current) break;
        const batch = testDefs.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map((t) => runTest(t.id, t.fn)));
      }
    },
    [runTest]
  );

  const runAll = useCallback(
    async (
      sections: {
        section: string;
        tests: { id: string; fn: (signal: AbortSignal) => Promise<void> }[];
      }[]
    ) => {
      stoppedRef.current = false;
      abortRef.current = new AbortController();
      for (const s of sections) {
        if (stoppedRef.current) break;
        await runSection(s.section, s.tests);
      }
    },
    [runSection]
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    abortRef.current?.abort();
  }, []);

  const resetAll = useCallback(() => {
    stoppedRef.current = false;
    setTests((prev) => {
      const next = new Map(prev);
      Array.from(next.entries()).forEach(([key, val]) => {
        next.set(key, { ...val, status: 'idle', durationMs: 0, error: null });
      });
      return next;
    });
  }, []);

  const summary: TestSummary = useMemo(() => {
    const s: TestSummary = { total: 0, passed: 0, failed: 0, running: 0, idle: 0, skipped: 0 };
    Array.from(tests.values()).forEach((t) => {
      s.total++;
      if (t.status === 'pass') s.passed++;
      else if (t.status === 'fail') s.failed++;
      else if (t.status === 'running') s.running++;
      else if (t.status === 'skip') s.skipped++;
      else s.idle++;
    });
    return s;
  }, [tests]);

  return { tests, registerTest, runTest, runSection, runAll, stop, resetAll, summary, updateTest };
}
