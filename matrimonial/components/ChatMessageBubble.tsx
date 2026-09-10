"use client";

import React from "react";
import { ChatMessage } from "@/lib/chatStore";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";

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
  if (message.voiceUrl) {
    return (
      <div
        className={`chat-bubble ${
          isCurrentUser ? "bg-[#d97706] text-white" : "bg-white text-gray-800 border border-gray-100"
        } relative rounded-2xl max-w-xs p-3 shadow-xs`}
        aria-label="Voice message"
      >
        <VoiceMessagePlayer
          voiceUrl={message.voiceUrl}
          voiceDuration={message.voiceDuration || 0}
          theme={isCurrentUser ? "mine" : "other"}
          onPlay={() => message.voiceUrl && onVoicePlay?.(message.voiceUrl)}
        />
        {message.content && (
          <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`chat-bubble ${
        isCurrentUser ? "bg-[#d97706] text-white" : "bg-white text-gray-800 border border-gray-100"
      } rounded-2xl max-w-xs p-3.5 shadow-xs`}
    >
      {message.content ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      ) : (
        <p className="text-xs text-gray-400 italic">(empty message)</p>
      )}
    </div>
  );
}

export default ChatMessageBubble;