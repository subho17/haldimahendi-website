/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft, Send, MessageSquare } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
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

    if (supabase) {
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
              content: String(row.content),
              createdAt: String(row.created_at),
              readAt: row.read_at ? String(row.read_at) : null,
            };
            setMessages((prev) => mergeMessages(prev, [incoming]));
          }
        )
        .subscribe();
      // Realtime is the primary source; a gentle poll keeps things honest
      // when the chat tables aren't in the supabase_realtime publication yet.
      poller = setInterval(() => {
        // Only poll when the tab is visible to avoid noisy DB reads.
        if (typeof document !== "undefined" && !document.hidden) {
          loadMessages();
        }
      }, 10000);
    } else {
      poller = setInterval(() => {
        if (typeof document !== "undefined" && !document.hidden) {
          loadMessages();
        }
      }, 4000);
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
  }, [messages.length]);

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
          <div className="w-10 h-10 rounded-full bg-red-100 text-[#e53238] flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-xs shrink-0 overflow-hidden">
            {partner?.avatarUrl ? (
              <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              partner?.name?.charAt(0) || "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {partner?.name || "Member"}
              {partner?.age ? `, ${partner.age}` : ""}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Connected</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#e53238] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-semibold">Say hello to {partner?.name || "your match"}</p>
            <p className="text-xs text-gray-400 mt-1">You are both connected — start the conversation!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === userId;
            const dayLabel = dayGroupLabel(m.createdAt, messages[i - 1]?.createdAt);
            return (
              <React.Fragment key={m.id}>
                {dayLabel && (
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      {dayLabel}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words ${
                      mine
                        ? "bg-[#e53238] text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <p>{m.content}</p>
                    <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-gray-400"} text-right`}>
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:border-[#e53238] focus:outline-none text-sm text-gray-800"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="shrink-0 p-2.5 rounded-full bg-[#e53238] text-white hover:bg-[#c92429] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}