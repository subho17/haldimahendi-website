"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
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
  Flag,
  Ban,
  X,
  Crown,
  Phone,
  Lock,
  CheckCircle2,
  Check,
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
  membership?: {
    tier: string;
    isPremium: boolean;
    label: string;
  };
  dob?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  rashi?: string | null;
  sunRashi?: string | null;
  nakshatra?: string | null;
  manglik?: string | null;
  gotra?: string | null;
  fatherOccupation?: string | null;
  motherOccupation?: string | null;
  siblings?: string | null;
  familyType?: string | null;
  familyValues?: string | null;
  diet?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  disability?: string | null;
  mobile?: string | null;
  maskedMobile?: string | null;
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
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);
  const [interestReceived, setInterestReceived] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const viewerId = user?.profileId || user?.mobileNumber || user?.email || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && profileId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotFound(false);
      setLimitReached(false);
      setProfile(null);
      setLoading(true);
      Promise.all([
        fetch(`/api/profile?id=${encodeURIComponent(profileId)}${viewerId ? `&viewerId=${encodeURIComponent(viewerId)}` : ""}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(viewerId)}`).then((r) => r.json()),
        fetch(`/api/block?userId=${encodeURIComponent(viewerId)}`).then((r) => r.json()),
      ])
        .then(([profileData, interestData, blockData]) => {
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
            if (interestData?.success) {
              const pId = profileData.profile.id;
              const isAccepted = (interestData.acceptedIds || []).includes(pId) || (interestData.acceptedIds || []).includes(profileId);
              const isSent = (interestData.sentIds || []).includes(pId) || (interestData.sentIds || []).includes(profileId);
              const isReceived = (interestData.received || []).some(
                (r: { senderId: string; status: string }) =>
                  (r.senderId === pId || r.senderId === profileId) && r.status === "pending"
              );
              setConnected(isAccepted);
              setInterestSent(isSent && !isAccepted);
              setInterestReceived(isReceived && !isAccepted);
              setShortlisted((interestData.shortlistedIds || []).includes(pId) || (interestData.shortlistedIds || []).includes(profileId));
            }
            if (blockData?.success) {
              setBlocked((blockData.blockedIds || []).includes(profileData.profile.id));
            }
          } else if (profileData.upgradeRequired) {
            setLimitReached(true);
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
      if (!data.success && data.upgradeRequired) {
        setLimitReached(true);
        return;
      }
      if (data.success && data.state) {
        const isAccepted =
          (data.state.acceptedIds || []).includes(profile.id) ||
          (data.state.acceptedIds || []).includes(profileId || "") ||
          action === "accept";
        const isSent = (data.state.sentIds || []).includes(profile.id);
        setConnected(isAccepted);
        setInterestSent(isSent && !isAccepted);
        if (action === "accept") {
          setInterestReceived(false);
        } else if (action === "decline") {
          setInterestReceived(false);
        }
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

  const toggleBlock = async () => {
    if (!viewerId || busy || !profile) return;
    setBusy(true);
    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: viewerId, otherId: profile.id, action: blocked ? "unblock" : "block" }),
      });
      const data = await res.json();
      if (data.success) {
        setBlocked(!blocked);
        if (!blocked) {
          alert("Member blocked. They will no longer appear in your matches or be able to contact you.");
        }
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (e) {
      console.error("Block failed:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerId || !profile || !reportReason) return;
    setReportBusy(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: viewerId, otherId: profile.id, reason: reportReason, details: reportDetails }),
      });
      const data = await res.json();
      if (data.success) {
        setReportDone(true);
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (e) {
      console.error("Report failed:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setReportBusy(false);
    }
  };

  if (!mounted || isLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10" />
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => router.push(back)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => router.push(back)} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900"><X className="w-5 h-5" /></button>
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4"><Lock className="w-7 h-7 text-amber-600" /></div>
              <h3 className="text-lg font-extrabold text-slate-900">Free limit reached</h3>
              <p className="text-xs text-slate-500 mt-2">You have reached your free limit. Wait for 24 hours to view more profiles.</p>
              <p className="text-[11px] text-slate-400 mt-1">You can still revisit profiles you have already viewed.</p>
              <div className="flex gap-3 mt-6">
                <a href="/membership" className="flex-1 py-3 rounded-xl bg-[#d97706] text-white font-bold text-xs text-center hover:bg-[#b45309]">Upgrade Plan</a>
                <button onClick={() => router.push(back)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs hover:bg-slate-50">Go Back</button>
              </div>
            </div>
          </div>
          <div className="opacity-30 pointer-events-none">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Preview</h1>
            <p className="text-xs text-slate-500">Upgrade to unlock full profile details.</p>
          </div>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d97706] text-white text-xs font-bold shadow-md hover:bg-[#b45309] transition-all"
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
    { Icon: MapPin, label: "current City", value: [formattedCity, profile.country || "India"].filter(Boolean).join(", ") || "—" },
    { Icon: Sparkles, label: "Religion", value: formattedReligion || "—" },
    { Icon: Languages, label: "Mother Tongue", value: formattedMotherTongue || "—" },
    { Icon: GraduationCap, label: "Education", value: profile.education || "—" },
    { Icon: Briefcase, label: "Profession", value: formattedProfession || "—" },
    { Icon: Sparkles, label: "Rashi", value: profile.rashi || "—" },
    { Icon: Sparkles, label: "Sun Rashi", value: (profile as { sunRashi?: string; sun_rashi?: string }).sunRashi || (profile as { sun_rashi?: string }).sun_rashi || "—" },
    { Icon: Sparkles, label: "Nakshatra", value: profile.nakshatra || "—" },
    { Icon: Users, label: "Manglik", value: profile.manglik || "—" },
    { Icon: Heart, label: "Diet", value: profile.diet || "—" },
    { Icon: Heart, label: "Smoking", value: profile.smoking || "—" },
    { Icon: Heart, label: "Drinking", value: profile.drinking || "—" },
    { Icon: Users, label: "Family Type", value: profile.familyType || "—" },
    { Icon: Users, label: "Family Values", value: profile.familyValues || "—" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Back Link */}
        <a
          href={back}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#d97706] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to matches
        </a>

        {/* Outer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all duration-300">

          {/* Profile Header Block (Clean, No Banner) */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">

              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#d97706] font-black text-5xl ring-2 ring-amber-100 shrink-0">
                {profile.avatarUrl && profile.avatarUrl !== "/images/default-avatar.png" ? (
                  <Image src={profile.avatarUrl} alt={formattedName} fill loading="eager" sizes="176px" className="object-cover" />
                ) : (
                  <span className="uppercase">{formattedName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {profile.verified ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% Verified Member</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 shadow-2xs">
                        <Award className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                        <span>Verified Match Profile</span>
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 shadow-2xs">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Unverified Profile</span>
                    </span>
                  )}
                  {profile.membership?.isPremium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs">
                      <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{profile.membership.label || "Premium"} Member</span>
                    </span>
                  )}
                  {connected && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Request Accepted • Connected</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{formattedName}</h1>

                <p className="text-xs text-slate-500 font-semibold">
                  Profile ID: <strong className="text-slate-800">{profile.id ? (profile.id.startsWith("#") ? profile.id : `#${profile.id}`) : "----"}</strong>
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
          </div>

          <div className="p-6 sm:p-8 pt-6">

            {/* About Myself Callout */}
            {profile.bio && (
              <div className="my-6 relative bg-gradient-to-br from-rose-50/50 via-slate-50/80 to-white p-6 rounded-2xl border border-rose-100/70 shadow-2xs">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d97706] rounded-l-2xl" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d97706]" />
                  <span>About Myself</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-normal">&ldquo;{profile.bio}&rdquo;</p>
              </div>
            )}

            {/* Profile Detail Cards Grid */}
            <div className="space-y-4 my-6">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#d97706]" />
                <span>Profile Background & Lifestyle</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fields.map(({ Icon, label, value }) => (
                  <div key={label} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706] shrink-0">
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

            {/* Premium-gated Contact Reveal */}
            <div className="my-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Contact Details</h3>
                    {profile.mobile ? (
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        +91 {profile.mobile}
                        <span className="ml-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full align-middle">
                          ✓ Premium Unlocked
                        </span>
                      </p>
                    ) : (
                      <div className="mt-0.5">
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600 inline shrink-0" />
                          <span>{profile.maskedMobile || "+91 ••••• •••••"}</span>
                          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full align-middle">
                            Subscribers Only
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {isAuthenticated
                            ? "Mobile number is confidential. Upgrade to a Premium subscription to view full contact details."
                            : "Mobile number is confidential. Log in & subscribe to Premium to view."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {!profile.mobile && isAuthenticated && (
                  <Link
                    href="/membership"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Crown className="w-4 h-4" /> Upgrade to View
                  </Link>
                )}
                {!profile.mobile && !isAuthenticated && (
                  <Link
                    href="/login"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d97706] text-white text-xs font-black shadow-md hover:bg-[#b45309] transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" /> Login
                  </Link>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100">
              {connected ? (
                <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Request Accepted</span>
                  </div>
                  <button
                    onClick={() => router.push(`/chat?otherId=${encodeURIComponent(profile.id)}`)}
                    disabled={busy}
                    className="flex-1 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <MessageCircle className="w-4 h-4" /> Message / Chat
                  </button>
                </div>
              ) : interestReceived ? (
                <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
                  <div className="py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center">
                    Sent you an interest
                  </div>
                  <button
                    onClick={() => runAction("accept")}
                    disabled={busy}
                    className="flex-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> Accept Request
                  </button>
                  <button
                    onClick={() => runAction("decline")}
                    disabled={busy}
                    className="py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              ) : interestSent ? (
                <button
                  onClick={() => runAction("unsend")}
                  disabled={busy}
                  className="flex-1 w-full py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  ✓ Interest Sent (Pending Acceptance - click to withdraw)
                </button>
              ) : (
                <button
                  onClick={() => runAction("interest")}
                  disabled={busy}
                  className="flex-1 w-full py-3 rounded-xl bg-[#d97706] text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:bg-[#b45309] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" /> Send Interest
                  </span>
                </button>
              )}
              <button
                onClick={() => runAction(shortlisted ? "unshortlist" : "shortlist")}
                disabled={busy}
                className={`flex-1 w-full py-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 ${shortlisted
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {shortlisted ? "✓ Shortlisted (click to remove)" : "Shortlist Profile"}
              </button>
            </div>

            {/* Safety Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button
                onClick={() => {
                  setReportReason("");
                  setReportDetails("");
                  setReportDone(false);
                  setShowReportModal(true);
                }}
                disabled={busy}
                className="flex-1 w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
              <button
                onClick={toggleBlock}
                disabled={busy}
                className={`flex-1 w-full py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${blocked
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Ban className="w-4 h-4" /> {blocked ? "Unblock Member" : "Block Member"}
              </button>
            </div>

          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowReportModal(false)}
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                aria-label="Close report popup"
                className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {reportDone ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                    <Flag className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Report Submitted</h3>
                  <p className="text-xs text-slate-500">
                    Thank you. Our moderation team will review your report and take appropriate action.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReport} className="space-y-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
                      <Flag className="w-6 h-6 text-[#d97706]" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Report {formattedName}</h3>
                    <p className="text-xs text-slate-500">Help us keep Shaadi safe. Reports are reviewed by our team.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Reason *</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                    >
                      <option value="">Select a reason...</option>
                      <option value="fake_profile">Fake / Misleading Profile</option>
                      <option value="harassment">Harassment / Abusive Behaviour</option>
                      <option value="inappropriate_content">Inappropriate Content</option>
                      <option value="fraud_or_scam">Fraud / Financial Scam</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Details (optional)</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder="Provide any additional details to help our team..."
                      className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportBusy || !reportReason}
                    className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {reportBusy ? "Submitting..." : "Submit Report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
