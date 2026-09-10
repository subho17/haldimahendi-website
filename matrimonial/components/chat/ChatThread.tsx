"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Send,
  MessageSquare,
  Mic,
  Trash2,
  Square,
  X,
  AlertCircle,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useVoiceMessage } from "@/hooks/useVoiceMessage";
import { VoiceMessagePlayer } from "@/components/VoiceMessagePlayer";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  voiceUrl?: string | null;
  voiceDuration?: number | null;
  createdAt: string;
  readAt?: string | null;
}

export interface ChatPartner {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  avatarUrl?: string | null;
  profession?: string | null;
}

function timeLabel(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso);
  if (isNaN(t.getTime())) return "";
  const now = new Date();
  const time = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (t.toDateString() === now.toDateString()) return time;
  return `${t.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  existing.forEach((m) => byId.set(m.id, m));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

interface ChatThreadProps {
  userId: string;
  conversationId: string;
  otherUserId: string;
  partner: ChatPartner | null;
  onBack?: () => void;
  onSent?: () => void;
  showHeader?: boolean;
}

export default function ChatThread({
  userId,
  conversationId,
  otherUserId,
  partner,
  onBack,
  onSent,
  showHeader = true,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sentRef = useRef<boolean>(false);

  // Callback to handle sending voice messages
  const sendVoiceMessage = useCallback(
    async (payload: { conversationId: string; voiceUrl: string; voiceDuration: number }) => {
      const optimistic: ChatMessage = {
        id: `local_voice_${Date.now()}`,
        conversationId: payload.conversationId,
        senderId: userId,
        recipientId: otherUserId,
        content: "",
        voiceUrl: payload.voiceUrl,
        voiceDuration: payload.voiceDuration,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: payload.conversationId,
            senderId: userId,
            recipientId: otherUserId,
            content: "",
            voiceUrl: payload.voiceUrl,
            voiceDuration: payload.voiceDuration,
          }),
        });

        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
          if (!sentRef.current) {
            sentRef.current = true;
            onSent?.();
          }
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          alert(data.message || "Failed to send voice message");
        }
      } catch (e) {
        console.error("[Chat] Failed to send voice:", e);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        alert("Failed to send voice message. Please try again.");
      }
    },
    [conversationId, userId, otherUserId, onSent]
  );

  const {
    isRecording,
    recordingDuration,
    isUploading,
    error: voiceError,
    clearError: clearVoiceError,
    preview,
    startRecording,
    stopRecording,
    cancelRecording,
    sendPreview,
    discardPreview,
  } = useVoiceMessage({
    conversationId,
    senderId: userId,
    recipientId: otherUserId,
    onMessageSend: sendVoiceMessage,
  });

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/chat/messages?userId=${encodeURIComponent(userId)}&conversationId=${encodeURIComponent(conversationId)}`
      );
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => mergeMessages(prev, data.messages || []));
      }
    } catch (e) {
      console.error("[Chat] Failed to load thread:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, conversationId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/messages?userId=${encodeURIComponent(userId)}&conversationId=${encodeURIComponent(conversationId)}`
        );
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => mergeMessages(prev, data.messages || []));
        }
      } catch (e) {
        console.error("[Chat] Failed to load thread:", e);
      } finally {
        setLoading(false);
      }
    })();

    const supabase = getSupabaseClient();
    let channel: { unsubscribe: () => Promise<unknown> } | null = null;
    let poller: ReturnType<typeof setInterval> | null = null;

    // Polling for messages
    poller = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadMessages();
      }
    }, 3000);

    // Additionally try Supabase Realtime if available
    if (supabase) {
      try {
        channel = supabase
          .channel(`chat_${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              const incoming: ChatMessage = {
                id: String(row.id),
                conversationId,
                senderId: String(row.sender_id),
                recipientId: String(row.recipient_id),
                content: String(row.content || ""),
                voiceUrl: row.voice_url ? String(row.voice_url) : null,
                voiceDuration: row.voice_duration ? Number(row.voice_duration) : null,
                createdAt: String(row.created_at),
                readAt: row.read_at ? String(row.read_at) : null,
              };
              setMessages((prev) => mergeMessages(prev, [incoming]));
            }
          )
          .subscribe();
      } catch (e) {
        console.warn("[Chat] Supabase Realtime subscription failed, using polling:", e);
      }
    }

    return () => {
      if (channel) {
        channel.unsubscribe().catch(() => undefined);
      }
      if (poller) clearInterval(poller);
    };
  }, [conversationId, loadMessages, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isRecording, preview]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !userId || !otherUserId) return;
    setSending(true);

    const optimistic: ChatMessage = {
      id: `local_${Date.now()}`,
      conversationId,
      senderId: userId,
      recipientId: otherUserId,
      content: text,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          senderId: userId,
          recipientId: otherUserId,
          content: text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
        if (!sentRef.current) {
          sentRef.current = true;
          onSent?.();
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(text);
        alert(data.message || "Failed to send message");
      }
    } catch (e) {
      console.error("[Chat] Failed to send:", e);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
      alert("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const dayGroupLabel = (iso: string, prevIso?: string): string | null => {
    const t = new Date(iso);
    const prev = prevIso ? new Date(prevIso) : null;
    if (prev && t.toDateString() === prev.toDateString()) return null;
    const now = new Date();
    if (t.toDateString() === now.toDateString()) return "Today";
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (t.toDateString() === y.toDateString()) return "Yesterday";
    return t.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {showHeader && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label="Back to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="relative w-10 h-10 rounded-full bg-red-100 text-[#d97706] flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-xs shrink-0 overflow-hidden"
            style={{ position: "relative" }}
          >
            {partner?.avatarUrl ? (
              <Image
                src={partner.avatarUrl}
                alt={partner.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              partner?.name?.charAt(0) || "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {partner?.name || "Member"}
              {partner?.age ? `, ${partner.age}` : ""}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Connected
            </p>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#d97706] flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-700 font-bold">Say hello to {partner?.name || "your match"}</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              You are mutually connected! Send a warm text or voice note to break the ice.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === userId;
            const dayLabel = dayGroupLabel(m.createdAt, messages[i - 1]?.createdAt);

            return (
              <React.Fragment key={m.id}>
                {dayLabel && (
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200/70 rounded-full px-3 py-1 shadow-2xs">
                      {dayLabel}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs transition-all ${
                      mine
                        ? "bg-[#d97706] text-white rounded-br-xs"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                    }`}
                  >
                    {/* Voice message player */}
                    {m.voiceUrl && (
                      <div className="mb-1">
                        <VoiceMessagePlayer
                          voiceUrl={m.voiceUrl}
                          voiceDuration={m.voiceDuration || 0}
                          theme={mine ? "mine" : "other"}
                        />
                      </div>
                    )}

                    {/* Optional text caption */}
                    {m.content && (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}

                    {/* Timestamp & read status */}
                    <p
                      className={`text-[10px] mt-1 text-right font-medium select-none ${
                        mine ? "text-white/75" : "text-gray-400"
                      }`}
                    >
                      {timeLabel(m.createdAt)}
                      {mine && m.readAt && " • Read"}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input / Voice Console Area */}
      <div className="relative bg-white border-t border-gray-100 p-3 shrink-0">
        {/* Voice recording error alert */}
        {voiceError && (
          <div className="absolute -top-11 left-3 right-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="truncate">{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={clearVoiceError}
              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* State 1: Active Voice Recording Bar */}
        {isRecording ? (
          <div className="flex items-center gap-2.5 w-full">
            <div className="flex-1 flex items-center justify-between bg-red-50/90 border border-red-200 rounded-full px-4 py-2">
              {/* Blinking REC indicator & live timer */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-600 tracking-wider">REC</span>
                <span className="text-xs font-mono font-bold text-gray-800 min-w-[36px]">
                  {formatDuration(recordingDuration)}
                </span>
              </div>

              {/* Sound wave visualizer animation */}
              <div className="flex items-center gap-1 h-5 px-2">
                {[45, 80, 100, 60, 90, 50, 85, 40].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: "700ms",
                    }}
                  />
                ))}
              </div>

              {/* Controls: Discard & Review */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                  title="Discard recording"
                  aria-label="Discard recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => stopRecording(false)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white rounded-full border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                  title="Listen before sending"
                  aria-label="Listen before sending"
                >
                  <Square className="w-3 h-3 fill-current text-gray-600" />
                  <span>Review</span>
                </button>
              </div>
            </div>

            {/* Send Voice Message Immediately Button */}
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className="shrink-0 w-10 h-10 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Send voice note"
              aria-label="Send voice note"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : preview ? (
          /* State 2: Voice Preview Bar (Listen before sending) */
          <div className="flex items-center gap-2.5 w-full">
            <div className="flex-1 flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-2xl px-3 py-1.5">
              <div className="flex-1 min-w-0">
                <VoiceMessagePlayer
                  voiceUrl={preview.url}
                  voiceDuration={preview.duration}
                  theme="other"
                />
              </div>
              <button
                type="button"
                onClick={discardPreview}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer ml-2 shrink-0"
                title="Discard voice recording"
                aria-label="Discard voice recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={sendPreview}
              disabled={isUploading}
              className="shrink-0 w-10 h-10 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Send voice note"
              aria-label="Send voice note"
            >
              {isUploading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        ) : (
          /* State 3: Normal Text & Microphone Input Bar */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 w-full"
          >
            {/* Microphone button */}
            <button
              type="button"
              onClick={startRecording}
              disabled={sending || isUploading}
              className="shrink-0 p-2.5 rounded-full bg-gray-100 text-gray-600 hover:text-[#d97706] hover:bg-amber-50 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              aria-label="Record voice message"
              title="Record voice message"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or press mic to record..."
              disabled={sending || isUploading}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:border-[#d97706] focus:bg-white focus:outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || sending || isUploading}
              className="shrink-0 p-2.5 rounded-full bg-[#d97706] text-white hover:bg-[#b45309] disabled:opacity-30 disabled:hover:bg-[#d97706] transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
              title="Send message"
            >
              {sending || isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
