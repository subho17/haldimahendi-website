"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Filter, Loader2, Heart } from "lucide-react";
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
  const [busyId, setBusyId] = useState<string | null>(null);

  const userId = user?.mobileNumber || user?.email || user?.profileId || "";

  const loadInteractions = (data: { sentIds?: string[]; shortlistedIds?: string[] }) => {
    setSentIds(new Set(data.sentIds || []));
    setShortlistedIds(new Set(data.shortlistedIds || []));
  };

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && userId) {
      Promise.all([
        fetch(`/api/matches?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      ])
        .then(([matchData, interestData]) => {
          if (matchData.success) {
            setMatches(matchData.matches || []);
            setNewCount(matchData.meta?.newCount || 0);
          }
          if (interestData.success) {
            loadInteractions(interestData);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, isLoading, router, userId]);

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
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-[#e53238] font-bold ml-1 align-middle">
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
            <Filter className="w-4 h-4 text-[#e53238]" />
            <span>Refine Preferences</span>
          </a>
        </div>

        {showLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#e53238] animate-spin" />
          </div>
        ) : eligible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
            <Heart className="w-10 h-10 text-[#e53238] mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">No matches found yet</h3>
            <p className="text-sm text-gray-500 mb-5">
              Widen your partner preferences or add more profile details to unlock matches.
            </p>
            <a
              href="/preferences"
              className="inline-block px-6 py-3 bg-[#e53238] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#c92429] cursor-pointer"
            >
              Adjust Preferences
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eligible.map((m, idx) => (
              <div
                key={m.profile.id || idx}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-red-100 to-amber-100 text-[#e53238] flex items-center justify-center font-black text-lg mx-auto border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    {m.profile.name[0]}
                    <span className="absolute -top-1 -right-2 text-[10px] font-black text-white bg-emerald-500 rounded-full px-2 py-0.5 shadow-sm">
                      {m.score}%
                    </span>
                  </div>

                  <div className="text-center mb-3 mt-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#e53238] transition-colors">
                      {m.profile.name}
                      {m.isNew && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 align-middle">
                          NEW
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold">{m.profile.id}</p>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
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

                <div className="flex items-center gap-2">
                  {sentIds.has(m.profile.id) ? (
                    <button
                      onClick={() => runAction(m.profile.id, "unsend")}
                      disabled={busyId === m.profile.id}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
                      title="Withdraw interest"
                    >
                      ✓ Interest Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => runAction(m.profile.id, "interest")}
                      disabled={busyId === m.profile.id}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-xs hover:bg-[#c92429] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {busyId === m.profile.id ? "..." : "Send Interest"}
                    </button>
                  )}
                  {shortlistedIds.has(m.profile.id) ? (
                    <button
                      onClick={() => runAction(m.profile.id, "unshortlist")}
                      disabled={busyId === m.profile.id}
                      className="py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
                      title="Remove from shortlist"
                    >
                      ✓ Saved
                    </button>
                  ) : (
                    <button
                      onClick={() => runAction(m.profile.id, "shortlist")}
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