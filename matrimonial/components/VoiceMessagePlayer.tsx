"use client";

import React, { useEffect, useRef, useState, useId, useMemo } from "react";
import { Play, Pause, AlertCircle, Loader2 } from "lucide-react";

interface VoiceMessagePlayerProps {
  voiceUrl: string;
  voiceDuration?: number;
  theme?: "mine" | "other";
  onPlay?: () => void;
  onEnd?: () => void;
}

// Generate a deterministic pleasing waveform pattern for audio bars based on duration and url
function generateWaveformBars(seedStr: string, count = 28): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    // Generate pseudo-random bar height between 20% and 100%
    const pseudoRand = Math.abs(Math.sin(hash + i * 0.73) * 0.7 + Math.cos(i * 1.1) * 0.3);
    const heightPercent = Math.max(22, Math.min(100, Math.round(pseudoRand * 100)));
    bars.push(heightPercent);
  }
  return bars;
}

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function VoiceMessagePlayer({
  voiceUrl,
  voiceDuration = 0,
  theme = "other",
  onPlay,
  onEnd,
}: VoiceMessagePlayerProps) {
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(voiceDuration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hasError, setHasError] = useState(false);

  // Generate waveform bars based on the URL
  const waveformBars = useMemo(() => generateWaveformBars(voiceUrl || "audio"), [voiceUrl]);

  // Single-player coordination: pause other players when this one starts
  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id !== playerId && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("chat-voice-play", handleOtherPlay);
    return () => {
      window.removeEventListener("chat-voice-play", handleOtherPlay);
    };
  }, [playerId]);

  // Audio element setup and cleanup
  useEffect(() => {
    if (!voiceUrl) return;

    const audio = new Audio(voiceUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnd?.();
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onAudioEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onAudioEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
      audio.src = "";
      audioRef.current = null;
    };
  }, [voiceUrl, onEnd]);

  const togglePlay = async () => {
    if (hasError || !audioRef.current) return;

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        // Dispatch event so any other currently playing message pauses
        window.dispatchEvent(new CustomEvent("chat-voice-play", { detail: { id: playerId } }));
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        onPlay?.();
      } catch (err) {
        console.warn("[VoiceMessagePlayer] Play failed:", err);
        setIsPlaying(false);
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (index: number) => {
    if (!audioRef.current || hasError) return;
    const progressRatio = index / (waveformBars.length - 1);
    const targetTime = progressRatio * (duration || 1);
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const isMine = theme === "mine";
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const activeBarCount = Math.floor(progressRatio * waveformBars.length);

  if (hasError) {
    return (
      <div className={`flex items-center gap-2 py-1 px-1 text-xs ${isMine ? "text-white/80" : "text-gray-500"}`}>
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Audio unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[210px] sm:min-w-[250px] select-none">
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={isLoading && !isPlaying}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
          isMine
            ? "bg-white text-[#d97706] hover:bg-amber-50"
            : "bg-[#d97706] text-white hover:bg-[#b45309]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Waveform & Duration */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        {/* Interactive Waveform Bars */}
        <div
          className="flex items-center gap-[2.5px] h-7 cursor-pointer py-1"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            if (audioRef.current && duration > 0) {
              const targetTime = ratio * duration;
              audioRef.current.currentTime = targetTime;
              setCurrentTime(targetTime);
            }
          }}
          title="Click to seek"
        >
          {waveformBars.map((heightPercent, idx) => {
            const isFilled = idx <= activeBarCount;
            return (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeek(idx);
                }}
                className="flex-1 min-w-[2px] max-w-[4px] rounded-full transition-all duration-75"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isMine
                    ? isFilled
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.4)"
                    : isFilled
                    ? "#d97706"
                    : "#e5e7eb",
                }}
              />
            );
          })}
        </div>

        {/* Time and Speed bar */}
        <div className="flex items-center justify-between text-[11px] font-medium leading-none mt-0.5">
          <span className={isMine ? "text-white/85" : "text-gray-500"}>
            {isPlaying ? formatDuration(currentTime) : formatDuration(duration || voiceDuration || 0)}
          </span>

          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
              isMine
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessagePlayer;