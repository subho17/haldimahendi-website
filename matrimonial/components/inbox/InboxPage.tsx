"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Check, X, Loader2, Inbox as InboxIcon, Send, UserCheck, MessageCircle, Bookmark, Ban } from "lucide-react";
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

type TabKey = "received" | "accepted" | "sent" | "shortlisted" | "blocked";

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
  const [shortlisted, setShortlisted] = useState<InboxInterest[]>([]);
  const [blocked, setBlocked] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("received");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      const loadAll = async () => {
        try {
          const [interestRes, blockRes] = await Promise.all([
            fetch(`/api/interests?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
            fetch(`/api/block?userId=${encodeURIComponent(userId)}`).then((r) => r.json()).catch(() => ({ success: false })),
          ]);
          if (interestRes.success) {
            setReceived(interestRes.received || []);
            setSent(interestRes.sent || []);
            // Build shortlisted list with partner profiles
            const sIds: string[] = interestRes.shortlistedIds || [];
            if (sIds.length > 0) {
              const lookups = await Promise.all(
                sIds.slice(0, 20).map(async (sid: string) => {
                  try {
                    const pr = await fetch(`/api/profile?id=${encodeURIComponent(sid)}`).then((r) => r.json());
                    const p = pr.profile || pr.user || null;
                    return {
                      id: `shortlist-${sid}`,
                      senderId: userId,
                      recipientId: sid,
                      status: "pending" as const,
                      createdAt: new Date().toISOString(),
                      partner: p ? { id: p.id || p.profileId || sid, name: p.name || p.display_name || "Member", age: p.age, city: p.city, country: p.country, profession: p.profession } : { id: sid, name: sid, age: null, city: null, country: null, profession: null },
                    } as InboxInterest;
                  } catch {
                    return null;
                  }
                })
              );
              setShortlisted(lookups.filter(Boolean) as InboxInterest[]);
            } else {
              setShortlisted([]);
            }
          }
          if (blockRes.success && Array.isArray(blockRes.blockedIds)) {
            const bIds: string[] = blockRes.blockedIds;
            const bProfiles = await Promise.all(
              bIds.slice(0, 20).map(async (bid: string) => {
                try {
                  const pr = await fetch(`/api/profile?id=${encodeURIComponent(bid)}`).then((r) => r.json());
                  const p = pr.profile || pr.user || null;
                  if (p) return { id: p.id || p.profileId || bid, name: p.name || p.display_name || bid, age: p.age, city: p.city, country: p.country, profession: p.profession } as MatchProfile;
                  return { id: bid, name: bid, age: null, city: null, country: null, profession: null } as MatchProfile;
                } catch {
                  return { id: bid, name: bid, age: null, city: null, country: null, profession: null } as MatchProfile;
                }
              })
            );
            setBlocked(bProfiles);
          } else {
            setBlocked([]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadAll();
    }
  }, [mounted, isAuthenticated, isLoading, router, userId]);

  const runAction = async (otherId: string, action: string) => {
    if (!userId || busyKey) return;
    setBusyKey(otherId);
    try {
      // Block/unblock goes to /api/block
      if (action === "block" || action === "unblock") {
        const res = await fetch("/api/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actorId: userId, otherId, action }),
        });
        const data = await res.json();
        if (data.success) {
          const br = await fetch(`/api/block?userId=${encodeURIComponent(userId)}`).then((r) => r.json());
          if (br.success) {
            const bProfiles = await Promise.all(
              (br.blockedIds || []).slice(0, 20).map(async (bid: string) => {
                try {
                  const pr = await fetch(`/api/profile?id=${encodeURIComponent(bid)}`).then((r) => r.json());
                  const p = pr.profile || pr.user || null;
                  if (p) return { id: p.id || p.profileId || bid, name: p.name || p.display_name || bid, age: p.age, city: p.city, country: p.country, profession: p.profession } as MatchProfile;
                  return { id: bid, name: bid, age: null, city: null, country: null, profession: null } as MatchProfile;
                } catch { return { id: bid, name: bid, age: null, city: null, country: null, profession: null } as MatchProfile; }
              })
            );
            setBlocked(bProfiles);
          }
        } else alert(data.message || "Something went wrong");
        return;
      }
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
          const sIds: string[] = stateData.shortlistedIds || [];
          const sLookups = await Promise.all(
            sIds.slice(0, 20).map(async (sid: string) => {
              try {
                const pr = await fetch(`/api/profile?id=${encodeURIComponent(sid)}`).then((r) => r.json());
                const p = pr.profile || pr.user || null;
                return { id: `shortlist-${sid}`, senderId: userId, recipientId: sid, status: "pending" as const, createdAt: new Date().toISOString(), partner: p ? { id: p.id || p.profileId || sid, name: p.name || p.display_name || "Member", age: p.age, city: p.city, country: p.country, profession: p.profession } : { id: sid, name: sid, age: null, city: null, country: null, profession: null } } as InboxInterest;
              } catch { return null; }
            })
          );
          setShortlisted(sLookups.filter(Boolean) as InboxInterest[]);
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
  const acceptedList = [
    ...received.filter((r) => r.status === "accepted"),
    ...sent.filter((r) => r.status === "accepted"),
  ];

  const shownList =
    tab === "received" ? pendingReceived : tab === "accepted" ? acceptedList : tab === "shortlisted" ? shortlisted : tab === "blocked" ? [] : sent;

  const TABS: { key: TabKey; label: string; Icon: typeof Send; count: number }[] = [
    { key: "received", label: "Received", Icon: InboxIcon, count: pendingReceived.length },
    { key: "accepted", label: "Accepted", Icon: UserCheck, count: acceptedList.length },
    { key: "sent", label: "Sent", Icon: Send, count: sent.length },
    { key: "shortlisted", label: "Shortlisted", Icon: Bookmark, count: shortlisted.length },
    { key: "blocked", label: "Blocked", Icon: Ban, count: blocked.length },
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
            <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
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
                      ? "border-[#d97706] text-[#d97706]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        tab === key ? "bg-red-100 text-[#d97706]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Invitations / Shortlisted / Blocked Lists */}
            {tab === "blocked" ? (
              blocked.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
                  <Ban className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg mb-1">No blocked members</h3>
                  <p className="text-sm text-gray-500">Members you block will appear here. You can unblock them anytime.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {blocked.map((m) => {
                    const busy = busyKey === m.id;
                    return (
                      <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-extrabold border-2 border-white shadow-xs shrink-0">
                            {m.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{m.name || "Member"} <span className="text-gray-400 font-semibold">({m.id})</span></h3>
                            <p className="text-xs text-gray-500">{m.age ? `${m.age} yrs • ` : ""}{m.city || "—"}</p>
                          </div>
                        </div>
                        <button onClick={() => runAction(m.id, "unblock")} disabled={busy} className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                          <Ban className="w-4 h-4" /> <span>{busy ? "Unblocking..." : "Unblock"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : shownList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
                <InboxIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {tab === "sent" ? "No interests sent yet" : tab === "shortlisted" ? "No shortlisted profiles yet" : "No invitations here"}
                </h3>
                <p className="text-sm text-gray-500">
                  {tab === "sent" ? "Browse your matches and send an interest to start connecting." : tab === "shortlisted" ? "Tap Shortlist on any profile to save it here." : "When someone sends you an interest, it will show up here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {shownList.map((inv) => {
                  const busy = busyKey === inv.senderId || (tab === "sent" && busyKey === inv.recipientId) || (tab === "shortlisted" && busyKey === inv.recipientId);
                  return (
                    <div
                      key={inv.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-[#d97706] flex items-center justify-center font-extrabold border-2 border-white shadow-xs shrink-0">
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
                              : tab === "shortlisted"
                              ? `Shortlisted ${timeAgo(inv.createdAt)}`
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
                              className="flex-1 sm:flex-none px-4 py-2 bg-[#d97706] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#b45309] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
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
                        {tab === "shortlisted" && (
                          <button
                            onClick={() => runAction(inv.recipientId, "unshortlist")}
                            disabled={busy}
                            className="flex-1 sm:flex-none px-4 py-2 border border-amber-200 text-amber-700 bg-amber-50 text-xs font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <Bookmark className="w-4 h-4" />
                            <span>{busy ? "Removing..." : "Remove"}</span>
                          </button>
                        )}
                        {tab === "accepted" && (
                          <button
                            onClick={() => {
                              const partnerId = inv.partner?.id || (inv.recipientId === userId ? inv.senderId : inv.recipientId);
                              router.push(`/chat?otherId=${encodeURIComponent(partnerId)}`);
                            }}
                            disabled={busy}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
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
