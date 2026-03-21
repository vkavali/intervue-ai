'use client';

import dynamic from 'next/dynamic';
import { useTestRunner } from './useTestRunner';

// Core sections
import AuthTests, { getAuthTests } from './sections/AuthTests';
import AuthPageTests, { getAuthPageTests } from './sections/AuthPageTests';
import ApiHealthTests, { getApiHealthTests } from './sections/ApiHealthTests';
import CodeExecutionTests, { getCodeExecutionTests } from './sections/CodeExecutionTests';
import AIAssistTests, { getAIAssistTests } from './sections/AIAssistTests';
import AIGenerationTests, { getAIGenerationTests } from './sections/AIGenerationTests';
import SessionTests, { getSessionTests } from './sections/SessionTests';
import GamificationTests, { getGamificationTests } from './sections/GamificationTests';
import CompanyTests, { getCompanyTests } from './sections/CompanyTests';
import JobsTests, { getJobsTests } from './sections/JobsTests';
import PaymentTests, { getPaymentTests } from './sections/PaymentTests';
import PlaybackTests, { getPlaybackTests } from './sections/PlaybackTests';
import NotificationTests, { getNotificationTests } from './sections/NotificationTests';
import PipelineTests, { getPipelineTests } from './sections/PipelineTests';

// Full-app coverage sections
import PublicPageTests, { getPublicPageTests } from './sections/PublicPageTests';
import DashboardPageTests, { getDashboardPageTests } from './sections/DashboardPageTests';
import CandidateDashTests, { getCandidateDashTests } from './sections/CandidateDashTests';
import SchoolTests, { getSchoolTests } from './sections/SchoolTests';
import PracticePageTests, { getPracticePageTests } from './sections/PracticePageTests';

// Lazy load heavy components
const EditorPreview = dynamic(() => import('./sections/EditorPreview'), { ssr: false });
const RealtimeTests = dynamic(() => import('./sections/RealtimeTests'), { ssr: false });
const VideoCallTests = dynamic(() => import('./sections/VideoCallTests'), { ssr: false });

// Remove the old PracticeTests since PracticePageTests is a superset
// (kept import above for backwards compatibility in runAll)

export default function TestModePage() {
  const runner = useTestRunner();
  const { summary, stop, resetAll, runAll } = runner;

  const completed = summary.passed + summary.failed + summary.skipped;
  const pct = summary.total > 0 ? Math.round((completed / summary.total) * 100) : 0;

  const handleRunAll = () => {
    runAll([
      // Auth & access
      { section: 'auth', tests: getAuthTests(runner) },
      { section: 'auth-pages', tests: getAuthPageTests(runner) },
      // Public pages
      { section: 'public-pages', tests: getPublicPageTests(runner) },
      // API health
      { section: 'api-health', tests: getApiHealthTests(runner) },
      // Dashboard pages (all admin pages)
      { section: 'dashboard-pages', tests: getDashboardPageTests(runner) },
      // Candidate dashboard
      { section: 'candidate', tests: getCandidateDashTests(runner) },
      // School dashboard
      { section: 'school', tests: getSchoolTests(runner) },
      // Practice mode
      { section: 'practice-pages', tests: getPracticePageTests(runner) },
      // Company management
      { section: 'company', tests: getCompanyTests(runner) },
      { section: 'pipeline', tests: getPipelineTests(runner) },
      { section: 'jobs', tests: getJobsTests(runner) },
      // Gamification
      { section: 'gamification', tests: getGamificationTests(runner) },
      // Notifications
      { section: 'notifications', tests: getNotificationTests(runner) },
      // Payments
      { section: 'payments', tests: getPaymentTests(runner) },
      // Code execution
      { section: 'code-execution', tests: getCodeExecutionTests(runner) },
      // AI
      { section: 'ai-assist', tests: getAIAssistTests(runner) },
      { section: 'ai-generation', tests: getAIGenerationTests(runner) },
      // Sessions & playback
      { section: 'sessions', tests: getSessionTests(runner) },
      { section: 'playback', tests: getPlaybackTests(runner) },
      // Editor, Realtime, Video are lazy — included in Run All
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
        {/* Auth & Access */}
        <AuthTests runner={runner} />
        <AuthPageTests runner={runner} />

        {/* Public Pages */}
        <PublicPageTests runner={runner} />

        {/* API Health */}
        <ApiHealthTests runner={runner} />

        {/* Dashboard Pages (Admin) */}
        <DashboardPageTests runner={runner} />

        {/* Candidate Dashboard */}
        <CandidateDashTests runner={runner} />

        {/* School Dashboard */}
        <SchoolTests runner={runner} />

        {/* Practice Mode */}
        <PracticePageTests runner={runner} />

        {/* Editor */}
        <EditorPreview runner={runner} />

        {/* Code Execution */}
        <CodeExecutionTests runner={runner} />

        {/* AI */}
        <AIAssistTests runner={runner} />
        <AIGenerationTests runner={runner} />

        {/* Sessions */}
        <SessionTests runner={runner} />
        <RealtimeTests runner={runner} />
        <VideoCallTests runner={runner} />
        <PlaybackTests runner={runner} />

        {/* Company & Pipeline */}
        <CompanyTests runner={runner} />
        <PipelineTests runner={runner} />
        <JobsTests runner={runner} />

        {/* Gamification */}
        <GamificationTests runner={runner} />

        {/* Notifications */}
        <NotificationTests runner={runner} />

        {/* Payments */}
        <PaymentTests runner={runner} />
      </div>
    </div>
  );
}
