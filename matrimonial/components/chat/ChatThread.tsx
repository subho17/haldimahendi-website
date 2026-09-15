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
  ChevronLeft,
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
  incoming.forEach((m) => {
    // If we already have this message by ID, skip
    if (byId.has(m.id)) return;
    // Deduplicate optimistic messages: if an incoming server message matches
    // an optimistic (local_*) by content+sender within 10s, replace the optimistic
    if (!m.id.startsWith("local_")) {
      for (const [key, existingMsg] of byId) {
        if (
          key.startsWith("local_") &&
          existingMsg.senderId === m.senderId &&
          existingMsg.content === m.content &&
          Math.abs(new Date(existingMsg.createdAt).getTime() - new Date(m.createdAt).getTime()) < 10000
        ) {
          byId.delete(key);
          break;
        }
      }
    }
    byId.set(m.id, m);
  });
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
          setMessages((prev) => mergeMessages(prev.filter((m) => m.id !== optimistic.id), [data.message]));
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
    [userId, otherUserId, onSent]
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

  // Hold-to-record & pointer interactions
  const [isHolding, setIsHolding] = useState(false);
  const [slideCancelActive, setSlideCancelActive] = useState(false);
  const pointerDownTimeRef = useRef<number>(0);
  const holdStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldActiveRef = useRef(false);
  const cancelSlideRef = useRef(false);
  const windowListenersCleanUpRef = useRef<(() => void) | null>(null);

  // Clean up global pointer listeners on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (windowListenersCleanUpRef.current) windowListenersCleanUpRef.current();
    };
  }, []);

  const handleVoicePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      // Only respond to primary click / touch
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (sending || isUploading) return;

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (windowListenersCleanUpRef.current) {
        windowListenersCleanUpRef.current();
        windowListenersCleanUpRef.current = null;
      }

      pointerDownTimeRef.current = Date.now();
      holdStartPosRef.current = { x: e.clientX, y: e.clientY };
      isHoldActiveRef.current = false;
      cancelSlideRef.current = false;
      setSlideCancelActive(false);

      // Start recording immediately
      startRecording();

      // Detect hold threshold (500ms)
      holdTimerRef.current = setTimeout(() => {
        isHoldActiveRef.current = true;
        setIsHolding(true);
      }, 500);

      const onPointerMove = (moveEvt: PointerEvent) => {
        if (!holdStartPosRef.current || !isHoldActiveRef.current) return;
        const deltaX = holdStartPosRef.current.x - moveEvt.clientX;
        // Slide left 60px or more to cancel
        if (deltaX > 60) {
          cancelSlideRef.current = true;
          setSlideCancelActive(true);
        } else {
          cancelSlideRef.current = false;
          setSlideCancelActive(false);
        }
      };

      const cleanupListeners = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        windowListenersCleanUpRef.current = null;
      };

      const onPointerUp = () => {
        cleanupListeners();
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        const wasHolding = isHoldActiveRef.current;
        const wasCancelled = cancelSlideRef.current;
        const pressDuration = Date.now() - pointerDownTimeRef.current;

        setIsHolding(false);
        isHoldActiveRef.current = false;
        setSlideCancelActive(false);
        holdStartPosRef.current = null;

        if (wasHolding) {
          if (wasCancelled) {
            cancelRecording();
          } else if (pressDuration >= 1200) {
            // Held and spoke for at least 1.2s -> send immediately
            stopRecording(true);
          }
          // If held for less than 1.2s, we do not auto-send;
          // user remains safely in hands-free recording mode.
        }
        // If it was a quick tap (<500ms), we do NOT send;
        // hands-free recording mode remains open so user can speak and send when ready.
      };

      const onPointerCancel = () => {
        cleanupListeners();
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        setIsHolding(false);
        isHoldActiveRef.current = false;
        setSlideCancelActive(false);
        holdStartPosRef.current = null;
        cancelRecording();
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      windowListenersCleanUpRef.current = cleanupListeners;
    },
    [sending, isUploading, startRecording, stopRecording, cancelRecording]
  );

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
        setMessages((prev) => mergeMessages(prev.filter((m) => m.id !== optimistic.id), [data.message]));
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
          <div className="flex items-center gap-2.5 w-full animate-in fade-in duration-150">
            <div
              className={`flex-1 flex items-center justify-between border rounded-full px-4 py-2 transition-all shadow-xs ${
                slideCancelActive
                  ? "bg-red-100 border-red-300 text-red-700 shadow-inner"
                  : "bg-red-50/90 border-red-200"
              }`}
            >
              {/* Blinking REC indicator & live timer */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="relative flex items-center justify-center w-3 h-3">
                  <span
                    className="absolute w-full h-full rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <span
                    className="relative w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                </span>
                <span className="text-xs font-black tracking-wider" style={{ color: "#dc2626" }}>
                  REC
                </span>
                <span className="text-xs font-mono font-bold text-gray-800 min-w-[36px]">
                  {formatDuration(recordingDuration)}
                </span>
              </div>

              {/* Sound wave visualizer animation with explicit pixel dimensions */}
              <div className="flex items-center justify-center gap-1 h-6 px-3">
                {[6, 12, 18, 10, 22, 14, 20, 8, 16, 10, 14, 8].map((pxHeight, i) => (
                  <span
                    key={i}
                    className="animate-pulse rounded-full"
                    style={{
                      display: "inline-block",
                      width: "3px",
                      height: `${pxHeight}px`,
                      backgroundColor: "#ef4444",
                      animationDelay: `${(i % 5) * 120}ms`,
                      animationDuration: "600ms",
                    }}
                  />
                ))}
              </div>

              {/* Dynamic Action: Hold gesture instruction OR Hands-free controls */}
              {isHolding ? (
                <div className="flex items-center gap-1 text-xs font-semibold select-none">
                  {slideCancelActive ? (
                    <span className="text-red-600 font-bold flex items-center gap-1 animate-pulse">
                      <Trash2 className="w-3.5 h-3.5" /> Release to cancel
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
                      <span className="hidden sm:inline">Slide left to cancel</span>
                      <span className="sm:hidden">Slide to cancel</span>
                      <span className="text-gray-300 mx-1">•</span>
                      <span className="text-[#d97706] font-bold">Release to send</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
                    title="Discard recording"
                    aria-label="Discard recording"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Discard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => stopRecording(false)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white rounded-full border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                    title="Listen before sending"
                    aria-label="Listen before sending"
                  >
                    <Square className="w-3 h-3 fill-amber-600 text-amber-600" />
                    <span>Review</span>
                  </button>
                </div>
              )}
            </div>

            {/* Send Voice Message Immediately Button */}
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className={`shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer ${
                isHolding
                  ? "bg-gradient-to-tr from-amber-600 to-amber-500 ring-4 ring-amber-200/70 animate-pulse"
                  : "bg-[#d97706] hover:bg-[#b45309]"
              }`}
              title="Send voice note"
              aria-label="Send voice note"
            >
              <Send className="w-4.5 h-4.5 ml-0.5" />
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
                <Send className="w-4.5 h-4.5 ml-0.5" />
              )}
            </button>
          </div>
        ) : (
          /* State 3: Normal Text & WhatsApp-style Dynamic Voice/Send Button */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 w-full"
          >
            {/* Text input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={sending || isUploading}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:border-[#d97706] focus:bg-white focus:outline-none text-sm text-gray-800 transition-all placeholder:text-gray-400"
            />

            {/* Dynamic Action Button: Send button when typing, Voice Note button when empty */}
            {input.trim().length > 0 ? (
              <button
                type="submit"
                disabled={sending || isUploading}
                className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-[#d97706] to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                aria-label="Send message"
                title="Send message"
              >
                {sending || isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4.5 h-4.5 ml-0.5" />
                )}
              </button>
            ) : (
              <div className="relative shrink-0 flex items-center justify-center">
                {/* Voice Note Button with Amber Branded Gradient */}
                <button
                  type="button"
                  onPointerDown={handleVoicePointerDown}
                  onClick={(e) => {
                    // Keyboard activation (Enter/Space on focused button)
                    if (e.detail === 0) {
                      startRecording();
                    }
                  }}
                  disabled={sending || isUploading}
                  className="relative shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-[#d97706] to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white flex items-center justify-center shadow-md hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 select-none touch-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  aria-label="Record voice note"
                  title="Record voice note (Tap to record, hold to talk)"
                >
                  {isUploading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Mic className="w-4.5 h-4.5 relative z-10 transition-transform duration-200" />
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
