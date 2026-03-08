"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface VideoCallProps {
  sessionId: string;
  userId: string;
}

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function VideoCall({ sessionId, userId }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("disconnected");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<number>(1000);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    pc.oniceconnectionstatechange = () => {
      setConnectionState(pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setRemoteConnected(true);
        // Slow down polling once connected
        if (pollIntervalRef.current !== 2000) {
          pollIntervalRef.current = 2000;
          startSignalPolling();
        }
      }
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        setRemoteConnected(false);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Send ICE candidates via signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`/api/sessions/${sessionId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            from: userId,
          }),
        }).catch(() => {});
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sessionId, userId]);

  async function startCall(audioOnly?: boolean) {
    const useAudioOnly = audioOnly ?? isAudioOnly;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !useAudioOnly,
        audio: true,
      });
      setIsAudioOnly(useAudioOnly);
      setIsCameraOn(!useAudioOnly);

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await fetch(`/api/sessions/${sessionId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "offer",
          sdp: offer,
          from: userId,
        }),
      });

      setIsCallActive(true);
      setConnectionState("connecting");

      // Poll for signaling messages
      startSignalPolling();
    } catch (err) {
      console.error("Failed to start call:", err);
      setConnectionState("failed");
    }
  }

  function startSignalPolling() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/signal?for=${userId}`);
        if (res.ok) {
          const signals = await res.json();
          for (const signal of signals) {
            await handleSignal(signal);
          }
        }
      } catch {
        /* silent */
      }
    }, pollIntervalRef.current);
  }

  async function handleSignal(signal: { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) {
    const pc = pcRef.current;
    if (!pc) return;

    if (signal.type === "offer" && pc.signalingState === "stable") {
      // We received an offer, set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch(`/api/sessions/${sessionId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "answer",
          sdp: answer,
          from: userId,
        }),
      });
    } else if (signal.type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
    } else if (signal.type === "ice-candidate" && signal.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }

  function endCall() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIsCallActive(false);
    setConnectionState("disconnected");
    setRemoteConnected(false);
    setIsScreenSharing(false);
    pollIntervalRef.current = 1000;
  }

  async function reconnect() {
    const wasAudioOnly = isAudioOnly;
    endCall();
    await startCall(wasAudioOnly);
  }

  function toggleCamera() {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  }

  function toggleMic() {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  }

  async function toggleScreenShare() {
    if (!pcRef.current || !localStreamRef.current) return;

    if (isScreenSharing) {
      // Switch back to camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(videoTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
        localStreamRef.current = stream;
        setIsScreenSharing(false);
      } catch {
        /* silent */
      }
    } else {
      // Share screen
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(videoTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        videoTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch {
        /* silent */
      }
    }
  }

  const connectionColors: Record<string, string> = {
    disconnected: "text-gray-500",
    connecting: "text-yellow-400",
    connected: "text-green-400",
    completed: "text-green-400",
    failed: "text-red-400",
  };

  if (!isCallActive) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => startCall(false)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Start Call
        </button>
        <button
          onClick={() => startCall(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Audio Only
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
      {/* Remote Video */}
      <div className="relative rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shadow-xl" style={{ width: 240, height: 180 }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!remoteConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <p className="text-xs text-gray-400">Waiting for participant...</p>
          </div>
        )}
        {/* Connection Status */}
        <div className="absolute top-1 left-1">
          <span className={`text-[9px] font-medium ${connectionColors[connectionState] || "text-gray-500"}`}>
            {connectionState}
          </span>
        </div>
      </div>

      {/* Reconnect Banner */}
      {(connectionState === "failed" || connectionState === "disconnected") && isCallActive && (
        <div className="flex items-center justify-center">
          <button
            onClick={reconnect}
            className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reconnect
          </button>
        </div>
      )}

      {/* Local Video (PiP) */}
      <div className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-600" style={{ width: 120, height: 90 }}>
        {isAudioOnly ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        ) : (
          <>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-900 border border-gray-700 p-1.5">
        <button
          onClick={toggleCamera}
          className={`rounded p-1.5 transition-colors ${isCameraOn ? "bg-gray-700 text-white" : "bg-red-600 text-white"}`}
          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCameraOn
              ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            } />
          </svg>
        </button>

        <button
          onClick={toggleMic}
          className={`rounded p-1.5 transition-colors ${isMicOn ? "bg-gray-700 text-white" : "bg-red-600 text-white"}`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMicOn
              ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            } />
          </svg>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`rounded p-1.5 transition-colors ${isScreenSharing ? "bg-blue-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"}`}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (isAudioOnly) {
              // Switch to video mode: restart the call with video
              reconnect();
              setIsAudioOnly(false);
            } else {
              // Switch to audio-only: stop video track and update state
              if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
              }
              setIsAudioOnly(true);
              setIsCameraOn(false);
            }
          }}
          className={`rounded p-1.5 transition-colors ${isAudioOnly ? "bg-purple-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"}`}
          title={isAudioOnly ? "Switch to video" : "Audio only"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAudioOnly
              ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            } />
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-700" />

        <button
          onClick={endCall}
          className="rounded bg-red-600 p-1.5 text-white hover:bg-red-500 transition-colors"
          title="End call"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
