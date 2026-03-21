'use client';

import dynamic from 'next/dynamic';
import { useTestRunner } from './useTestRunner';
import AuthTests, { getAuthTests } from './sections/AuthTests';
import ApiHealthTests, { getApiHealthTests } from './sections/ApiHealthTests';
import CodeExecutionTests, { getCodeExecutionTests } from './sections/CodeExecutionTests';
import AIAssistTests, { getAIAssistTests } from './sections/AIAssistTests';
import SessionTests, { getSessionTests } from './sections/SessionTests';
import GamificationTests, { getGamificationTests } from './sections/GamificationTests';
import PracticeTests, { getPracticeTests } from './sections/PracticeTests';
import CompanyTests, { getCompanyTests } from './sections/CompanyTests';
import JobsTests, { getJobsTests } from './sections/JobsTests';
import PaymentTests, { getPaymentTests } from './sections/PaymentTests';
import PlaybackTests, { getPlaybackTests } from './sections/PlaybackTests';

// Lazy load heavy components
const EditorPreview = dynamic(() => import('./sections/EditorPreview'), { ssr: false });
const RealtimeTests = dynamic(() => import('./sections/RealtimeTests'), { ssr: false });
const VideoCallTests = dynamic(() => import('./sections/VideoCallTests'), { ssr: false });

export default function TestModePage() {
  const runner = useTestRunner();
  const { summary, stop, resetAll, runAll } = runner;

  const completed = summary.passed + summary.failed + summary.skipped;
  const pct = summary.total > 0 ? Math.round((completed / summary.total) * 100) : 0;

  const handleRunAll = () => {
    runAll([
      { section: 'auth', tests: getAuthTests(runner) },
      { section: 'api-health', tests: getApiHealthTests(runner) },
      { section: 'company', tests: getCompanyTests(runner) },
      { section: 'jobs', tests: getJobsTests(runner) },
      { section: 'gamification', tests: getGamificationTests(runner) },
      { section: 'practice', tests: getPracticeTests(runner) },
      { section: 'payments', tests: getPaymentTests(runner) },
      { section: 'code-execution', tests: getCodeExecutionTests(runner) },
      { section: 'ai-assist', tests: getAIAssistTests(runner) },
      { section: 'sessions', tests: getSessionTests(runner) },
      { section: 'playback', tests: getPlaybackTests(runner) },
      // Editor, Realtime, Video tests need to be manually triggered from their lazy sections
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900">Test Mode</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAll}
              disabled={summary.running > 0}
              className="px-4 py-1.5 rounded-lg bg-india-green text-white text-sm font-medium hover:bg-india-green-dark transition disabled:opacity-50"
            >
              Run All
            </button>
            <button
              onClick={stop}
              disabled={summary.running === 0}
              className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
            >
              Stop
            </button>
            <button
              onClick={resetAll}
              disabled={summary.running > 0}
              className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{summary.total} tests</span>
          {summary.passed > 0 && <span className="text-green-600 font-medium">{summary.passed} passed</span>}
          {summary.failed > 0 && <span className="text-red-600 font-medium">{summary.failed} failed</span>}
          {summary.running > 0 && <span className="text-blue-600 font-medium">{summary.running} running</span>}
          {summary.idle > 0 && <span className="text-gray-400">{summary.idle} idle</span>}
          {summary.skipped > 0 && <span className="text-yellow-600">{summary.skipped} skipped</span>}
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              backgroundColor:
                summary.failed > 0 ? '#ef4444' : summary.running > 0 ? '#3b82f6' : '#22c55e',
            }}
          />
        </div>
        <div className="text-right text-xs text-gray-400 mt-1">{pct}%</div>
      </div>

      {/* Test Sections */}
      <div className="space-y-3">
        <AuthTests runner={runner} />
        <ApiHealthTests runner={runner} />
        <EditorPreview runner={runner} />
        <CodeExecutionTests runner={runner} />
        <AIAssistTests runner={runner} />
        <SessionTests runner={runner} />
        <RealtimeTests runner={runner} />
        <VideoCallTests runner={runner} />
        <GamificationTests runner={runner} />
        <PracticeTests runner={runner} />
        <CompanyTests runner={runner} />
        <JobsTests runner={runner} />
        <PaymentTests runner={runner} />
        <PlaybackTests runner={runner} />
      </div>
    </div>
  );
}
