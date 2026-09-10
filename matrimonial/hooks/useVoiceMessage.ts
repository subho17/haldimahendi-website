"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function getSupportedMimeType(): string {
  if (typeof window === "undefined" || !window.MediaRecorder) return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/wav",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

export interface VoiceMessagePayload {
  conversationId: string;
  voiceUrl: string;
  voiceDuration: number;
}

interface UseVoiceMessageOptions {
  conversationId: string;
  senderId: string;
  recipientId: string;
  onMessageSend: (message: VoiceMessagePayload) => void | Promise<void>;
  maxDuration?: number; // seconds, default 120s
}

export function useVoiceMessage({
  conversationId,
  senderId,
  onMessageSend,
  maxDuration = 120,
}: UseVoiceMessageOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("");
  const stopRecordingRef = useRef<((sendImmediately?: boolean) => void) | null>(null);

  // Helper to release microphone access
  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      releaseStream();
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [clearTimer, releaseStream, preview]);

  // Upload a recorded audio blob to the server and trigger send callback
  const uploadAndSend = useCallback(
    async (blob: Blob, durationSec: number) => {
      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        const ext = mimeTypeRef.current.includes("mp4")
          ? "mp4"
          : mimeTypeRef.current.includes("ogg")
          ? "ogg"
          : mimeTypeRef.current.includes("wav")
          ? "wav"
          : "webm";
        formData.append("file", blob, `voice_${Date.now()}.${ext}`);
        formData.append("conversationId", conversationId);
        formData.append("senderId", senderId);
        formData.append("duration", String(Math.max(1, durationSec)));

        const res = await fetch("/api/chat/upload-voice", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.voiceUrl) {
          await onMessageSend({
            conversationId,
            voiceUrl: data.voiceUrl,
            voiceDuration: data.voiceDuration || Math.max(1, durationSec),
          });
          if (preview?.url) {
            URL.revokeObjectURL(preview.url);
            setPreview(null);
          }
        } else {
          setError(data.message || "Failed to upload voice message");
        }
      } catch (err) {
        console.error("[useVoiceMessage] Upload failed:", err);
        setError("Network error while sending voice message");
      } finally {
        setIsUploading(false);
      }
    },
    [conversationId, senderId, onMessageSend, preview]
  );

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mime = getSupportedMimeType();
      mimeTypeRef.current = mime;
      const options: MediaRecorderOptions = mime ? { mimeType: mime } : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(250); // Emit chunks every 250ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingDuration(0);

      clearTimer();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);

        if (elapsed >= maxDuration) {
          // Auto stop when hitting max duration
          stopRecordingRef.current?.(true);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("[useVoiceMessage] getUserMedia error:", err);
      const isDenied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setError(
        isDenied
          ? "Microphone access was denied. Please allow microphone permissions in your browser."
          : "Unable to access microphone. Please check your audio input device."
      );
      releaseStream();
      setIsRecording(false);
    }
  }, [clearTimer, maxDuration, preview, releaseStream]);

  // Stop recording. If `sendImmediately` is true, sends directly; else creates a preview
  const stopRecording = useCallback(
    (sendImmediately = true) => {
      clearTimer();
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        releaseStream();
        return;
      }

      const finalDuration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
      setRecordingDuration(finalDuration);

      recorder.onstop = () => {
        const mime = mimeTypeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        releaseStream();
        setIsRecording(false);

        if (blob.size === 0) {
          setError("No audio was recorded.");
          return;
        }

        if (sendImmediately) {
          uploadAndSend(blob, finalDuration);
        } else {
          const localUrl = URL.createObjectURL(blob);
          setPreview({ blob, url: localUrl, duration: finalDuration });
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        console.warn("[useVoiceMessage] Error stopping recorder:", err);
        releaseStream();
        setIsRecording(false);
      }
    },
    [clearTimer, releaseStream, uploadAndSend]
  );

  // Keep ref in sync with latest stopRecording
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Cancel recording and discard audio
  const cancelRecording = useCallback(() => {
    clearTimer();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    chunksRef.current = [];
    releaseStream();
    setIsRecording(false);
    setRecordingDuration(0);
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }, [clearTimer, preview, releaseStream]);

  // Send the previewed audio
  const sendPreview = useCallback(() => {
    if (!preview) return;
    uploadAndSend(preview.blob, preview.duration);
  }, [preview, uploadAndSend]);

  const discardPreview = useCallback(() => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }, [preview]);

  return {
    isRecording,
    recordingDuration,
    isUploading,
    error,
    clearError: () => setError(null),
    preview,
    startRecording,
    stopRecording,
    cancelRecording,
    sendPreview,
    discardPreview,
  };
}

export default useVoiceMessage;