"use client";

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/chatStore';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onVoicePlay?: (voiceUrl: string) => void;
}

export function ChatMessageBubble({
  message,
  isCurrentUser,
  onVoicePlay,
}: ChatMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle play/pause for voice messages
  const handleVoicePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      if (message.voiceUrl) {
        onVoicePlay?.(message.voiceUrl);
      }
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  // Render based on message type
  if (message.voiceUrl) {
    return (
      <div
        className={`chat-bubble ${isCurrentUser ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'} relative rounded-xl max-w-xs p-4 flex items-start gap-3`}
        aria-label="Voice message"
      >
        <VoiceMessagePlayer
          voiceUrl={message.voiceUrl}
          voiceDuration={message.voiceDuration || 0}
          isPlaying={isPlaying}
          onPlay={handleVoicePlay}
        />

        <span className="absolute top-1 right-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full px-2">
          {message.voiceDuration}s
        </span>

        <span className="absolute left-1 top-1 text-amber-500 text-xs">🎤</span>
      </div>
    );
  }

  // Text message rendering
  return (
    <div
      className={`chat-bubble ${isCurrentUser ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-xl max-w-xs p-4 flex items-start gap-3`}
    >
      {message.content ? (
        <p className="text-sm line-clamp-3">{message.content}</p>
      ) : (
        <p className="text-xs text-gray-400">(empty message)</p>
      )}
    </div>
  );
}