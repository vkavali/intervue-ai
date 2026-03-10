"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ScreenCaptureProps {
  sessionId: string;
  isInterviewer: boolean;
}

export default function ScreenCapture({ sessionId, isInterviewer }: ScreenCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [recordingRequested, setRecordingRequested] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if recording was requested (poll from server)
  useEffect(() => {
    if (isInterviewer) return; // Interviewer doesn't need to check

    const checkRecording = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.screenCaptureEnabled && !recording) {
            setRecordingRequested(true);
          }
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(checkRecording, 10000);
    return () => clearInterval(interval);
  }, [sessionId, isInterviewer, recording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as MediaTrackConstraints,
        audio: false,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        // Download the recording
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-${sessionId}-recording.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setRecording(false);
      };

      // Handle stream ending (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        setRecording(false);
      };

      mediaRecorder.start(1000); // Capture every second
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setRecordingRequested(false);
    } catch (err) {
      console.error("Screen capture error:", err);
    }
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Interviewer view: button to enable/start recording
  if (isInterviewer) {
    return (
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          recording
            ? "bg-red-600 text-white hover:bg-red-500"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {recording ? (
          <>
            <span className="h-2 w-2 rounded-full bg-red-300 animate-pulse" />
            Stop Recording
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Record Screen
          </>
        )}
      </button>
    );
  }

  // Candidate view: recording indicator + consent prompt
  return (
    <>
      {/* Recording Indicator */}
      {recording && (
        <div className="flex items-center gap-1.5 rounded-lg bg-red-900/50 border border-red-500/30 px-2.5 py-1">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-300">Screen Recording</span>
        </div>
      )}

      {/* Consent Modal */}
      {recordingRequested && !recording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Screen Recording Requested</h3>
                <p className="text-xs text-gray-400">The interviewer has requested screen capture</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Your interviewer would like to record your screen during this session. This helps with evaluation and review. You will need to share your screen to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                className="flex-1 rounded-lg bg-saffron px-4 py-2.5 text-sm font-medium text-white hover:bg-saffron transition-colors"
              >
                Share Screen
              </button>
              <button
                onClick={() => setRecordingRequested(false)}
                className="flex-1 rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
