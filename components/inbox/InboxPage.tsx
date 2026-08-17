"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Check, X, Loader2, Inbox as InboxIcon, Send, UserCheck, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";

interface MatchProfile {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  profession?: string | null;
}

interface InboxInterest {
  id: string;
  senderId: string;
  recipientId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  partner: MatchProfile | null;
}

type TabKey = "received" | "accepted" | "sent";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(t).toLocaleDateString();
}

export default function InboxPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [received, setReceived] = useState<InboxInterest[]>([]);
  const [sent, setSent] = useState<InboxInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("received");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const userId = user?.mobileNumber || user?.email || user?.profileId || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      fetch(`/api/interests?userId=${encodeURIComponent(userId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReceived(data.received || []);
            setSent(data.sent || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, isLoading, router, userId]);

  const runAction = async (otherId: string, action: string) => {
    if (!userId || busyKey) return;
    setBusyKey(otherId);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: userId, otherId, action }),
      });
      const data = await res.json();
      if (data.success) {
        const stateRes = await fetch(`/api/interests?userId=${encodeURIComponent(userId)}`);
        const stateData = await stateRes.json();
        if (stateData.success) {
          setReceived(stateData.received || []);
          setSent(stateData.sent || []);
        }
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (e) {
      console.error("Action failed:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusyKey(null);
    }
  };

  const pendingReceived = received.filter((r) => r.status === "pending");
  const acceptedReceived = received.filter((r) => r.status === "accepted");

  const shownList =
    tab === "received" ? pendingReceived : tab === "accepted" ? acceptedReceived : sent;

  const TABS: { key: TabKey; label: string; Icon: typeof Send; count: number }[] = [
    { key: "received", label: "Received", Icon: InboxIcon, count: pendingReceived.length },
    { key: "accepted", label: "Accepted", Icon: UserCheck, count: acceptedReceived.length },
    { key: "sent", label: "Sent", Icon: Send, count: sent.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Inbox & Invitations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your connection requests, invitations, and chats.
            </p>
          </div>
        </div>

        {(!mounted || isLoading || !isAuthenticated || loading) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#e53238] animate-spin" />
          </div>
        ) : (
          <>
            {/* Tab Toggle */}
            <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
              {TABS.map(({ key, label, Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    tab === key
                      ? "border-[#e53238] text-[#e53238]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        tab === key ? "bg-red-100 text-[#e53238]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Invitations List */}
            {shownList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
                <InboxIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {tab === "sent" ? "No interests sent yet" : "No invitations here"}
                </h3>
                <p className="text-sm text-gray-500">
                  {tab === "sent"
                    ? "Browse your matches and send an interest to start connecting."
                    : "When someone sends you an interest, it will show up here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {shownList.map((inv) => {
                  const busy = busyKey === inv.senderId || (tab === "sent" && busyKey === inv.recipientId);
                  return (
                    <div
                      key={inv.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-[#e53238] flex items-center justify-center font-extrabold border-2 border-white shadow-xs shrink-0">
                          {inv.partner?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {inv.partner?.name || "Shaadi Member"}{" "}
                            <span className="text-gray-400 font-semibold">
                              ({inv.partner?.id || "—"})
                            </span>
                          </h3>
                          <p className="text-xs text-gray-500">
                            {inv.partner?.age ? `${inv.partner.age} yrs • ` : ""}
                            {inv.partner?.city || "—"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {tab === "sent"
                              ? `Interest sent ${timeAgo(inv.createdAt)}`
                              : `Invitation received ${timeAgo(inv.createdAt)}`}
                            {inv.status === "accepted" && (
                              <span className="ml-1.5 text-emerald-600 font-bold">• Accepted</span>
                            )}
                            {inv.status === "declined" && (
                              <span className="ml-1.5 text-red-500 font-bold">• Declined</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {tab === "received" && (
                          <>
                            <button
                              onClick={() => runAction(inv.senderId, "accept")}
                              disabled={busy}
                              className="flex-1 sm:flex-none px-4 py-2 bg-[#e53238] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#c92429] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => runAction(inv.senderId, "decline")}
                              disabled={busy}
                              className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              <X className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        {tab === "sent" && inv.status === "pending" && (
                          <button
                            onClick={() => runAction(inv.recipientId, "unsend")}
                            disabled={busy}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer disabled:opacity-60"
                          >
                            Withdraw
                          </button>
                        )}
                        {tab === "accepted" && (
                          <button
                            onClick={() =>
                              router.push(`/chat?otherId=${encodeURIComponent(inv.senderId)}`)
                            }
                            disabled={busy}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[#e53238] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#c92429] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Message</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}