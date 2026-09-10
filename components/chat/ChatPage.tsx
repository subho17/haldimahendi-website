"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import ChatThread, { type ChatPartner } from "@/components/chat/ChatThread";

interface ChatListItem {
  id: string;
  userA: string;
  userB: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unread: number;
  partner: ChatPartner | null;
}

function listTime(iso?: string | null): string {
  if (!iso) return "";
  const t = new Date(iso);
  if (isNaN(t.getTime())) return "";
  const now = new Date();
  if (t.toDateString() === now.toDateString()) {
    return t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return t.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();

  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [active, setActive] = useState<ChatListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const deepLinkHandled = useRef<string | null>(null);

  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  const otherId = searchParams?.get("otherId") || "";

  const refreshList = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/chat/conversations?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        setLoading(false);
      }
    } catch (e) {
      console.error("[Chat] Failed to load conversations:", e);
      setLoading(false);
    }
  }, [userId]);

  const openById = useCallback(
    async (id: string) => {
      const existing = conversations.find((c) => c.partner?.id === id);
      if (existing) {
        setActive(existing);
        return;
      }
      try {
        const res = await fetch("/api/chat/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, otherId: id }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(data.message || "You can only chat with accepted connections.");
          return;
        }
        const profileRes = await fetch(`/api/profile?id=${encodeURIComponent(id)}`);
        const profileData = await profileRes.json();
        const item: ChatListItem = {
          id: data.conversation?.id,
          userA: data.conversation?.userA,
          userB: data.conversation?.userB,
          lastMessage: data.conversation?.lastMessage || null,
          lastMessageAt: data.conversation?.lastMessageAt || null,
          unread: 0,
          partner:
            profileData.profile
              ? {
                  id,
                  name: profileData.profile.name || "Member",
                  age: profileData.profile.age,
                  city: profileData.profile.city,
                  avatarUrl: profileData.profile.avatarUrl,
                  profession: profileData.profile.profession,
                }
              : { id, name: "Member" },
        };
        setConversations((prev) => {
          if (prev.some((c) => c.id === item.id)) return prev;
          return [item, ...prev];
        });
        setActive(item);
      } catch (e) {
        console.error("[Chat] Failed to open conversation:", e);
        alert("Something went wrong. Please try again.");
      }
    },
    [conversations, userId]
  );

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (!mounted || !isAuthenticated || !userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/conversations?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations || []);
        }
      } catch (e) {
        console.error("[Chat] Failed to load conversations:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted, isAuthenticated, isLoading, userId, router]);

  useEffect(() => {
    if (!otherId || !isAuthenticated || !userId) return;
    if (deepLinkHandled.current === otherId) return;
    deepLinkHandled.current = otherId;
    openById(otherId);
  }, [otherId, isAuthenticated, userId, openById]);

  useEffect(() => {
    if (!userId) return;
    const poll = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        refreshList();
      }
    }, 8000);
    return () => clearInterval(poll);
  }, [userId, refreshList]);

  const backToInbox = () => {
    setActive(null);
    if (searchParams?.toString()) {
      router.replace("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chats</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Message your accepted connections in real time.
            </p>
          </div>
        </div>

        {(!mounted || isLoading || !isAuthenticated || loading) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
          </div>
        ) : conversations.length === 0 && !active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs max-w-sm">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-lg mb-1">No conversations yet</h3>
              <p className="text-sm text-gray-500">
                When someone accepts your interest, you can start chatting with them here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex">
            {/* Conversation list */}
            <div
              className={`${
                active ? "hidden lg:flex" : "flex"
              } w-full lg:w-72 xl:w-80 flex-col border-r border-gray-100 overflow-hidden`}
            >
              <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Messages</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-400">No conversations yet.</p>
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isActive = active?.id === c.id;
                    const partner = c.partner;
                    const otherUid = c.userA === userId ? c.userB : c.userA;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActive(c)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 cursor-pointer transition-colors ${
                          isActive ? "bg-red-50/60" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-full bg-red-100 text-[#d97706] flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-xs shrink-0 overflow-hidden" style={{ position: "relative" }}>
                          {partner?.avatarUrl ? (
                            <Image src={partner.avatarUrl} alt={partner.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            partner?.name?.charAt(0) || "?"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {partner?.name || "Member"}
                              {partner?.age ? `, ${partner.age}` : ""}
                            </h4>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {listTime(c.lastMessageAt)}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${
                              c.unread > 0 ? "text-gray-800 font-bold" : "text-gray-500"
                            }`}
                          >
                            {c.unread > 0 && (
                              <span className="mr-1 text-[#d97706]">{otherUid} :</span>
                            )}
                            {c.lastMessage || "Say hello!"}
                          </p>
                        </div>
                        {c.unread > 0 && (
                          <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#d97706] text-white text-[10px] font-black flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active thread */}
            <div className={`${active ? "flex" : "hidden"} flex-1 flex-col lg:flex overflow-hidden`}>
              {active ? (
                <ChatThread
                  key={active.id}
                  userId={userId}
                  conversationId={active.id}
                  otherUserId={active.userA === userId ? active.userB : active.userA}
                  partner={active.partner}
                  onBack={backToInbox}
                  onSent={refreshList}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-300">
                  <MessageSquare className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
