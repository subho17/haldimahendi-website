/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft, Heart, MapPin, User, Briefcase, GraduationCap, Users, BookOpen, MessageCircle } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Profile not found</h1>
          <p className="text-sm text-gray-500 mb-6">This member profile could not be found.</p>
          <a
            href={back}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  const fields: { Icon: typeof User; label: string; value: string }[] = [
    { Icon: User, label: "Looking For", value: profile.gender ? (profile.gender.toLowerCase() === "groom" ? "Groom" : "Bride") : "—" },
    { Icon: Heart, label: "Age", value: profile.age != null ? `${profile.age} yrs` : "—" },
    { Icon: User, label: "Height", value: profile.height || "—" },
    { Icon: Users, label: "Marital Status", value: profile.maritalStatus || "—" },
    { Icon: MapPin, label: "Living City", value: [profile.city, profile.country || "India"].filter(Boolean).join(", ") || "—" },
    { Icon: BookOpen, label: "Mother Tongue", value: profile.motherTongue || "—" },
    { Icon: GraduationCap, label: "Education", value: profile.education || "—" },
    { Icon: Briefcase, label: "Profession", value: profile.profession || "—" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a
          href={back}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e53238] mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </a>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8 text-left">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-8 mb-6 text-center sm:text-left">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-100 shadow-md bg-red-50 flex items-center justify-center text-[#e53238] font-black text-3xl shrink-0">
              {profile.avatarUrl && profile.avatarUrl !== "/images/default-avatar.png" ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="uppercase">{profile.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-2 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{profile.verified ? "100% Verified Member" : "Registered Member"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">{profile.name}</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Profile ID: <span className="text-gray-800 font-bold">{profile.id}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {profile.age != null ? `${profile.age} yrs • ` : ""}
                {profile.religion || ""} {profile.religion && profile.city ? "• " : ""}
                {profile.city || ""}
              </p>
            </div>
          </div>

          {/* About */}
          {profile.bio && (
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 mb-6">
              <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-2">
                About Myself
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/50 border border-gray-100">
                <Icon className="w-4 h-4 text-[#e53238] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 mt-6 border-t border-gray-100">
            {connected ? (
              <button
                onClick={() => router.push(`/chat?otherId=${encodeURIComponent(profile.id)}`)}
                disabled={busy}
                className="flex-1 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Message Member
                </span>
              </button>
            ) : interestSent ? (
              <button
                onClick={() => runAction("unsend")}
                disabled={busy}
                className="flex-1 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
              >
                ✓ Interest Sent (click to withdraw)
              </button>
            ) : (
              <button
                onClick={() => runAction("interest")}
                disabled={busy}
                className="flex-1 w-full py-3 rounded-xl bg-[#e53238] text-white text-sm font-bold shadow-md hover:bg-[#c92429] transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" /> Send Interest
                </span>
              </button>
            )}
            <button
              onClick={() => runAction(shortlisted ? "unshortlist" : "shortlist")}
              disabled={busy}
              className={`flex-1 w-full py-3 rounded-xl border text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                shortlisted
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {shortlisted ? "✓ Shortlisted (click to remove)" : "Shortlist Profile"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}