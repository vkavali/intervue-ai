'use client';

import { useEffect } from 'react';
import type { useTestRunner } from '../useTestRunner';
import TestSection from '../TestSection';

const SECTION = 'video';

const TEST_DEFS = [
  { id: 'vid-rtc', name: 'RTCPeerConnection available' },
  { id: 'vid-media', name: 'MediaDevices API' },
  { id: 'vid-stun', name: 'STUN server reachable' },
  { id: 'vid-signal', name: 'Signal endpoint exists' },
];

interface Props {
  runner: ReturnType<typeof useTestRunner>;
}

export function getVideoCallTests(runner: ReturnType<typeof useTestRunner>) {
  return TEST_DEFS.map((td) => ({
    id: td.id,
    fn: async (signal: AbortSignal) => {
      switch (td.id) {
        case 'vid-rtc': {
          if (typeof RTCPeerConnection === 'undefined') {
            throw new Error('RTCPeerConnection not available in this browser');
          }
          const pc = new RTCPeerConnection();
          pc.close();
          break;
        }
        case 'vid-media': {
          if (!navigator.mediaDevices) {
            throw new Error('MediaDevices API not available');
          }
          if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
            throw new Error('getUserMedia not available');
          }
          if (typeof navigator.mediaDevices.enumerateDevices !== 'function') {
            throw new Error('enumerateDevices not available');
          }
          break;
        }
        case 'vid-stun': {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });
          try {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(() => {
                reject(new Error('STUN request timed out'));
              }, 5000);

              pc.onicecandidate = (e) => {
                if (e.candidate) {
                  clearTimeout(timer);
                  resolve();
                }
              };

              pc.createDataChannel('test');
              pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .catch(reject);
            });
          } finally {
            pc.close();
          }
          break;
        }
        case 'vid-signal': {
          // Check if the signal endpoint exists on a dummy session
          const res = await fetch('/api/sessions/test-mode-check/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'ping' }),
            signal,
          });
          // Any status except a literal 404 route-not-found means the endpoint exists
          if (res.status === 404) {
            const text = await res.text();
            if (text.includes('Cannot POST') || text.includes('Not Found')) {
              throw new Error('Signal endpoint route not found');
            }
          }
          break;
        }
      }
    },
  }));
}

export default function VideoCallTests({ runner }: Props) {
  const { registerTest, tests, runSection, runTest } = runner;

  useEffect(() => {
    TEST_DEFS.forEach((td) => registerTest(td.id, td.name, SECTION));
  }, [registerTest]);

  const sectionTests = TEST_DEFS.map((td) => tests.get(td.id)).filter(Boolean) as ReturnType<typeof useTestRunner>['tests'] extends Map<string, infer V> ? V[] : never;

  return (
    <TestSection
      title="Video Call"
      tests={sectionTests}
      onRunSection={() => runSection(SECTION, getVideoCallTests(runner))}
      onRunTest={(id) => {
        const def = getVideoCallTests(runner).find((t) => t.id === id);
        if (def) runTest(id, def.fn);
      }}
    />
  );
}
