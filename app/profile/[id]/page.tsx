/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Heart,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Users,
  MessageCircle,
  Sparkles,
  Award,
  Ruler,
  Languages,
} from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

interface PublicProfile {
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
  bio?: string | null;
  createdAt?: string | null;
  verified: boolean;
}

function formatCapitalize(str?: string | null): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PublicProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();
  const rawParams = useParams();
  const searchParams = useSearchParams();

  const profileId = Array.isArray(rawParams?.id) ? rawParams.id[0] : (rawParams?.id as string | undefined);
  const back = searchParams?.get("back") || "/matches";

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const viewerId = user?.mobileNumber || user?.email || user?.profileId || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && profileId) {
      Promise.all([
        fetch(`/api/profile?id=${encodeURIComponent(profileId)}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(viewerId)}`).then((r) => r.json()),
      ])
        .then(([profileData, interestData]) => {
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
            if (interestData.success) {
              setInterestSent((interestData.sentIds || []).includes(profileData.profile.id));
              setShortlisted((interestData.shortlistedIds || []).includes(profileData.profile.id));
              setConnected((interestData.acceptedIds || []).includes(profileData.profile.id));
            }
          } else {
            setNotFound(true);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, isLoading, router, profileId, viewerId]);

  // Visiting your own profile? Send the member to their edit page.
  useEffect(() => {
    if (mounted && profile && viewerId && profile.id === viewerId) {
      router.replace("/profile");
    }
  }, [mounted, profile, viewerId, router]);

  const runAction = async (action: string) => {
    if (!viewerId || busy || !profile) return;
    setBusy(true);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: viewerId, otherId: profile.id, action }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setInterestSent((data.state.sentIds || []).includes(profile.id));
        setShortlisted((data.state.shortlistedIds || []).includes(profile.id));
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (e) {
      console.error("Action failed:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!mounted || isLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#e53238] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Not Found</h1>
          <p className="text-xs text-slate-500 mb-6">This member profile could not be found or is no longer available.</p>
          <a
            href={back}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-md hover:bg-[#c92429] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedName = formatCapitalize(profile.name);
  const formattedCity = formatCapitalize(profile.city);
  const formattedReligion = formatCapitalize(profile.religion);
  const formattedMotherTongue = formatCapitalize(profile.motherTongue);
  const formattedProfession = formatCapitalize(profile.profession);

  const fields: { Icon: typeof User; label: string; value: string }[] = [
    { Icon: User, label: "Looking For", value: profile.gender ? (profile.gender.toLowerCase() === "groom" ? "Bride" : "Groom") : "—" },
    { Icon: Sparkles, label: "Age", value: profile.age != null ? `${profile.age} yrs` : "—" },
    { Icon: Ruler, label: "Height", value: profile.height || "—" },
    { Icon: Users, label: "Marital Status", value: profile.maritalStatus || "—" },
    { Icon: MapPin, label: "Living City", value: [formattedCity, profile.country || "India"].filter(Boolean).join(", ") || "—" },
    { Icon: Sparkles, label: "Religion", value: formattedReligion || "—" },
    { Icon: Languages, label: "Mother Tongue", value: formattedMotherTongue || "—" },
    { Icon: GraduationCap, label: "Education", value: profile.education || "—" },
    { Icon: Briefcase, label: "Profession", value: formattedProfession || "—" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Back Link */}
        <a
          href={back}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#e53238] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to matches
        </a>

        {/* Outer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Decorative Cover Banner */}
          <div className="relative h-32 sm:h-44 bg-gradient-to-r from-rose-600 via-[#e53238] to-pink-600 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-xs border border-white/20">
              <Award className="w-3.5 h-3.5" />
              <span>{profile.verified ? "Verified Member" : "Member Profile"}</span>
            </div>
          </div>

          {/* Profile Header Block */}
          <div className="px-6 sm:px-10 pb-8 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 border-b border-slate-100 pb-8 text-center sm:text-left">
              
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center text-[#e53238] font-black text-4xl ring-1 ring-slate-200/60 shrink-0">
                {profile.avatarUrl && profile.avatarUrl !== "/images/default-avatar.png" ? (
                  <img src={profile.avatarUrl} alt={formattedName} className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase">{formattedName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{profile.verified ? "100% Verified Member" : "Registered Member"}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{formattedName}</h1>
                
                <p className="text-xs text-slate-500 font-semibold">
                  Profile ID: <strong className="text-slate-800">{profile.id}</strong>
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {profile.age != null && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {profile.age} Yrs
                    </span>
                  )}
                  {profile.height && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {profile.height}
                    </span>
                  )}
                  {formattedCity && (
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                      {formattedCity}, {profile.country || "India"}
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* About Myself Callout */}
            {profile.bio && (
              <div className="my-6 relative bg-gradient-to-br from-rose-50/50 via-slate-50/80 to-white p-6 rounded-2xl border border-rose-100/70 shadow-2xs">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#e53238] rounded-l-2xl" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#e53238]" />
                  <span>About Myself</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-normal">&ldquo;{profile.bio}&rdquo;</p>
              </div>
            )}

            {/* Profile Detail Cards Grid */}
            <div className="space-y-4 my-6">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#e53238]" />
                <span>Profile Background & Lifestyle</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fields.map(({ Icon, label, value }) => (
                  <div key={label} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
                      <span className="text-xs font-bold text-slate-900 truncate block">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100">
              {connected ? (
                <button
                  onClick={() => router.push(`/chat?otherId=${encodeURIComponent(profile.id)}`)}
                  disabled={busy}
                  className="flex-1 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message Member
                  </span>
                </button>
              ) : interestSent ? (
                <button
                  onClick={() => runAction("unsend")}
                  disabled={busy}
                  className="flex-1 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  ✓ Interest Sent (click to withdraw)
                </button>
              ) : (
                <button
                  onClick={() => runAction("interest")}
                  disabled={busy}
                  className="flex-1 w-full py-3 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:bg-[#c92429] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" /> Send Interest
                  </span>
                </button>
              )}
              <button
                onClick={() => runAction(shortlisted ? "unshortlist" : "shortlist")}
                disabled={busy}
                className={`flex-1 w-full py-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                  shortlisted
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {shortlisted ? "✓ Shortlisted (click to remove)" : "Shortlist Profile"}
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}