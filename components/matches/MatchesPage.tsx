/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Filter, Loader2, Heart, Crown, CheckCircle2 } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

interface MatchProfile {
  id: string;
  name: string;
  age?: number | null;
  height?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  education?: string | null;
  profession?: string | null;
  city?: string | null;
  country?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  premium?: boolean;
}

interface MatchResult {
  profile: MatchProfile;
  score: number;
  isEligible: boolean;
  isNew: boolean;
}

export default function MatchesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  const loadInteractions = (data: { sentIds?: string[]; shortlistedIds?: string[]; acceptedIds?: string[] }) => {
    setSentIds(new Set(data.sentIds || []));
    setShortlistedIds(new Set(data.shortlistedIds || []));
    setAcceptedIds(new Set(data.acceptedIds || []));
  };

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      const mParams = new URLSearchParams();
      if (userId) mParams.set("userId", userId);
      if (user?.profileId) mParams.set("profileId", user.profileId);
      const mob = user?.mobile_number || user?.mobileNumber || "";
      if (mob) mParams.set("userMobile", mob);
      if (user?.email) mParams.set("userEmail", user.email);
      if (user?.gender) mParams.set("viewerGender", user.gender);

      Promise.all([
        fetch(`/api/matches?${mParams.toString()}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      ])
        .then(([matchData, interestData]) => {
          if (matchData.success) {
            const myProfileId = (user?.profileId || "").toLowerCase().trim();
            const myMobile = (user?.mobile_number || user?.mobileNumber || "").replace(/\D/g, "");
            const myEmail = (user?.email || "").toLowerCase().trim();

            const safeMatches = (matchData.matches || []).filter((m: MatchResult) => {
              const mId = (m.profile?.id || "").toLowerCase().trim();
              if (myProfileId && mId === myProfileId) return false;
              if (myMobile && mId === myMobile) return false;
              if (myEmail && mId === myEmail) return false;
              return m.isEligible !== false;
            });

            setMatches(safeMatches);
            setNewCount(safeMatches.filter((m: MatchResult) => m.isNew).length);
          }
          if (interestData.success) {
            loadInteractions(interestData);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, isLoading, router, userId, user?.email, user?.mobileNumber, user?.mobile_number, user?.profileId, user?.gender]);

  const runAction = async (otherId: string, action: string) => {
    if (!userId || busyId) return;
    const profileId = otherId;
    setBusyId(profileId);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: userId, otherId: profileId, action }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        loadInteractions(data.state);
      }
    } catch (e) {
      console.error("Interaction failed:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const showLoading = !mounted || isLoading || !isAuthenticated || (loading && matches.length === 0);
  const eligible = matches.filter((m) => m.isEligible);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Matches{" "}
              {eligible.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-[#d97706] font-bold ml-1 align-middle">
                  {newCount > 0 ? `${newCount} New` : `${eligible.length} Profiles`}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Profiles meeting your partner preferences, ranked by compatibility score.
            </p>
          </div>

          <a
            href="/preferences"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#d97706]" />
            <span>Refine Preferences</span>
          </a>
        </div>

        {showLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
          </div>
        ) : eligible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
            <Heart className="w-10 h-10 text-[#d97706] mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">No matches found yet</h3>
            <p className="text-sm text-gray-500 mb-5">
              Widen your partner preferences or add more profile details to unlock matches.
            </p>
            <a
              href="/preferences"
              className="inline-block px-6 py-3 bg-[#d97706] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#b45309] cursor-pointer"
            >
              Adjust Preferences
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eligible.map((m, idx) => (
              <div
                key={m.profile.id || idx}
                onClick={() => router.push(`/profile/${encodeURIComponent(m.profile.id)}?back=/matches`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
              >
                <div>
                  <div className="relative w-full h-52 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {m.profile.premium && (
                      <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-gradient-to-r from-amber-300 to-amber-400 px-2.5 py-1 rounded-full shadow-md border border-amber-200/70 uppercase">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                    {m.profile.avatarUrl && m.profile.avatarUrl !== "/images/default-avatar.png" ? (
                      <img
                        src={m.profile.avatarUrl}
                        alt={m.profile.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-rose-500 via-[#d97706] to-amber-500 flex items-center justify-center text-white font-black text-5xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {m.profile.name[0]}
                      </div>
                    )}

                    {acceptedIds.has(m.profile.id) ? (
                      <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-black text-white bg-emerald-600/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Accepted
                      </span>
                    ) : m.isNew ? (
                      <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-[#d97706] px-2.5 py-0.5 rounded-full shadow-md uppercase">
                        NEW
                      </span>
                    ) : null}

                    <span className="absolute top-3 right-3 text-xs font-black text-white bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-white/20">
                      {m.score}% Match
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#d97706] transition-colors text-base">
                        {m.profile.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold">ID: {m.profile.id ? (m.profile.id.startsWith("#") ? m.profile.id : `#${m.profile.id}`) : ""}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
                      <p>
                        <span className="font-bold text-gray-700">Age / Height:</span>{" "}
                        {m.profile.age ?? "—"} yrs, {m.profile.height || "—"}
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">Community:</span>{" "}
                        {m.profile.religion || "—"}, {m.profile.motherTongue || "—"}
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">Location:</span>{" "}
                        {[m.profile.city, m.profile.country || "India"].filter(Boolean).join(", ") || "—"}
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">Profession:</span>{" "}
                        {m.profile.profession || m.profile.education || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {acceptedIds.has(m.profile.id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/chat?otherId=${encodeURIComponent(m.profile.id)}`);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold hover:bg-emerald-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      title="Request Accepted - Click to Chat"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Accepted • Chat</span>
                    </button>
                  ) : sentIds.has(m.profile.id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(m.profile.id, "unsend");
                      }}
                      disabled={busyId === m.profile.id}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
                      title="Withdraw interest"
                    >
                      ✓ Interest Sent
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(m.profile.id, "interest");
                      }}
                      disabled={busyId === m.profile.id}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#d97706] text-white text-xs font-bold shadow-xs hover:bg-[#b45309] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {busyId === m.profile.id ? "..." : "Send Interest"}
                    </button>
                  )}
                  {shortlistedIds.has(m.profile.id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(m.profile.id, "unshortlist");
                      }}
                      disabled={busyId === m.profile.id}
                      className="py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
                      title="Remove from shortlist"
                    >
                      ✓ Saved
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(m.profile.id, "shortlist");
                      }}
                      disabled={busyId === m.profile.id}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      Shortlist
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
