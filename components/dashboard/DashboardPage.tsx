"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Eye, UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMounted } from "@/hooks/useMounted";

interface MatchProfile {
  id: string;
  name: string;
  age?: number | null;
  height?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  city?: string | null;
  country?: string | null;
  profession?: string | null;
  education?: string | null;
  avatarUrl?: string | null;
}

interface MatchResult {
  profile: MatchProfile;
  score: number;
  isEligible: boolean;
  isNew: boolean;
}

interface DashboardStats {
  newMatches: number;
  newCount: number;
  interestsSent: number;
  interestsAccepted: number;
  shortlisted: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [stats, setStats] = useState<DashboardStats>({
    newMatches: 0,
    newCount: 0,
    interestsSent: 0,
    interestsAccepted: 0,
    shortlisted: 0,
  });
  const [recommended, setRecommended] = useState<MatchResult[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(() => Boolean(user?.isVerified || (user as { verified?: boolean })?.verified));

  const userAvatar = user?.avatar_url || user?.avatarUrl;
  const displayName = user?.display_name || user?.name || "Shaadi Member";
  const userMobile = user?.mobile_number || user?.mobileNumber || "";
  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

  React.useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (mounted && isAuthenticated && userId) {
      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
      const mParams = new URLSearchParams();
      if (userId) mParams.set("userId", userId);
      if (user?.profileId) mParams.set("profileId", user.profileId);
      const mob = user?.mobile_number || user?.mobileNumber || "";
      if (mob) mParams.set("userMobile", mob);
      if (user?.email) mParams.set("userEmail", user.email);

      Promise.all([
        fetch(`/api/matches?${mParams.toString()}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
        fetch(`/api/verification?userId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      ])
        .then(([matchData, interestData, verData]) => {
          if (verData?.success && verData.verified) {
            setIsVerified(true);
          }
          if (matchData.success) {
            const myProfileId = (user?.profileId || "").toLowerCase().trim();
            const myMobile = (user?.mobile_number || user?.mobileNumber || "").replace(/\D/g, "");
            const myEmail = (user?.email || "").toLowerCase().trim();

            const eligible = (matchData.matches || []).filter((m: MatchResult) => {
              const mId = (m.profile?.id || "").toLowerCase().trim();
              if (myProfileId && mId === myProfileId) return false;
              if (myMobile && mId === myMobile) return false;
              if (myEmail && mId === myEmail) return false;
              return m.isEligible;
            });
            setRecommended(eligible.slice(0, 3));
            setStats((prev) => ({
              ...prev,
              newMatches: eligible.length,
              newCount: eligible.length,
            }));
          }
          if (interestData.success) {
            const sent = interestData.sentIds || [];
            const shortlisted = interestData.shortlistedIds || [];
            const accepted = interestData.acceptedIds || [];
            setSentIds(new Set(sent));
            setShortlistedIds(new Set(shortlisted));
            setAcceptedIds(new Set(accepted));
            setStats((prev) => ({
              ...prev,
              interestsSent: sent.length,
              interestsAccepted: accepted.length,
              shortlisted: shortlisted.length,
            }));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, isLoading, router, userId, user?.email, user?.mobileNumber, user?.mobile_number, user?.profileId]);

  const runAction = async (otherId: string, action: string) => {
    if (!userId || busyId) return;
    setBusyId(otherId);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: userId, otherId, action }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setSentIds(new Set(data.state.sentIds || []));
        setShortlistedIds(new Set(data.state.shortlistedIds || []));
        setAcceptedIds(new Set(data.state.acceptedIds || []));
        setStats((prev) => ({
          ...prev,
          interestsSent: (data.state.sentIds || []).length,
          interestsAccepted: (data.state.acceptedIds || []).length,
          shortlisted: (data.state.shortlistedIds || []).length,
        }));
      }
    } catch (e) {
      console.error("Interaction failed:", e);
    } finally {
      setBusyId(null);
    }
  };

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { label: "New Matches", value: String(stats.newMatches), sub: `${stats.newCount} new this week`, Icon: Heart, color: "text-[#d97706]" },
    { label: "Profile Views", value: "48", sub: "↑ 12 this week", Icon: Eye, color: "text-cyan-600" },
    { label: "Interests Sent", value: String(stats.interestsSent), sub: `${stats.interestsAccepted} accepted`, Icon: UserCheck, color: "text-emerald-600" },
    { label: "Shortlisted", value: String(stats.shortlisted), sub: "Saved profiles", Icon: Sparkles, color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 via-[#d97706] to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div className="flex items-center gap-5">
              {/* Profile Avatar Badge */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/40 bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0" style={{ position: "relative" }}>
                {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                  <Image
                    src={userAvatar}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="uppercase">{displayName.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold mb-1.5 border border-white/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isVerified ? "Verified Member" : "Registered Member"} · ID: {user?.profileId ? (user.profileId.startsWith("#") ? user.profileId : `#${user.profileId}`) : "----"}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="mt-1 text-red-100 text-xs sm:text-sm font-light">
                  {userMobile ? `+91 ${userMobile}` : ""} {user?.city ? `• ${user.city}` : ""} {user?.gender ? `• Looking for ${user.gender}` : ""} {isVerified ? "• Verified Account" : "• Unverified"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href="/matches"
                className="px-5 py-2.5 rounded-xl bg-white text-[#d97706] font-bold text-xs sm:text-sm shadow-md hover:bg-red-50 transition-colors"
              >
                {stats.newMatches > 0 ? `View ${stats.newMatches} New Matches` : "Find Matches"}
              </Link>
              <Link
                href="/profile"
                className="px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/30 hover:bg-white/25 transition-colors"
              >
                My Profile
              </Link>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, sub, Icon, color }) => (
            <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className={`text-[11px] font-semibold mt-1 ${sub.startsWith("↑") ? "text-emerald-600" : "text-gray-400"}`}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Recommended Matches Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Matches For You</h2>
              <p className="text-xs text-gray-500">Based on your cultural, age, and location preferences.</p>
            </div>
            {stats.newMatches > 0 && (
              <Link href="/matches" className="text-xs font-bold text-[#d97706] hover:underline">
                View All ({stats.newMatches}) →
              </Link>
            )}
          </div>

          {loading && recommended.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="w-10 h-10 text-[#d97706] mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Head to your <Link href="/preferences" className="font-bold text-[#d97706] hover:underline">preferences</Link> to start finding matches.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((m) => (
                <div
                  key={m.profile.id}
                  onClick={() => router.push(`/profile/${encodeURIComponent(m.profile.id)}?back=/dashboard`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  <div>
                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center" style={{ position: "relative" }}>
                      {m.profile.avatarUrl && m.profile.avatarUrl !== "/images/default-avatar.png" ? (
                        <Image
                          src={m.profile.avatarUrl}
                          alt={m.profile.name}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-rose-500 via-[#d97706] to-amber-500 flex items-center justify-center text-white font-black text-4xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {m.profile.name[0]}
                        </div>
                      )}

                      <span className="absolute top-3 right-3 text-xs font-black text-white bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-white/20">
                        {m.score}% Match
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#d97706] transition-colors text-base">
                          {m.profile.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-semibold">ID: {m.profile.id.startsWith("#") ? m.profile.id : `#${m.profile.id}`}</p>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
                        <p>
                          <span className="font-bold text-gray-700">Age / City:</span>{" "}
                          {m.profile.age ?? "—"} yrs, {m.profile.city || "—"}
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
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold hover:bg-emerald-200 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
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
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        ✓ Sent
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runAction(m.profile.id, "interest");
                        }}
                        disabled={busyId === m.profile.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#d97706] text-white text-xs font-bold shadow-xs hover:bg-[#b45309] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {busyId === m.profile.id ? "..." : "Connect Now"}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(m.profile.id, shortlistedIds.has(m.profile.id) ? "unshortlist" : "shortlist");
                      }}
                      disabled={busyId === m.profile.id}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                        shortlistedIds.has(m.profile.id)
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {shortlistedIds.has(m.profile.id) ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
