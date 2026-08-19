/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Flag,
  Ban,
  X,
  Crown,
  Phone,
  Lock,
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
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const viewerId = user?.mobileNumber || user?.email || user?.profileId || "";

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (mounted && isAuthenticated && profileId) {
      Promise.all([
        fetch(`/api/profile?id=${encodeURIComponent(profileId)}${viewerId ? `&viewerId=${encodeURIComponent(viewerId)}` : ""}`).then((r) => r.json()),
        fetch(`/api/interests?userId=${encodeURIComponent(viewerId)}`).then((r) => r.json()),
        fetch(`/api/block?userId=${encodeURIComponent(viewerId)}`).then((r) => r.json()),
      ])
        .then(([profileData, interestData, blockData]) => {
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
            if (interestData.success) {
              setInterestSent((interestData.sentIds || []).includes(profileData.profile.id));
              setShortlisted((interestData.shortlistedIds || []).includes(profileData.profile.id));
              setConnected((interestData.acceptedIds || []).includes(profileData.profile.id));
            }
            if (blockData.success) {
              setBlocked((blockData.blockedIds || []).includes(profileData.profile.id));
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
    { Icon: Sparkles, label: "Rashi", value: profile.rashi || "—" },
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#e53238] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to matches
        </a>

        {/* Outer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Profile Header Block (Clean, No Banner) */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
              
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#e53238] font-black text-5xl ring-2 ring-rose-100 shrink-0">
                {profile.avatarUrl && profile.avatarUrl !== "/images/default-avatar.png" ? (
                  <img src={profile.avatarUrl} alt={formattedName} className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase">{formattedName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{profile.verified ? "100% Verified Member" : "Registered Member"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-[#e53238] shrink-0" />
                    <span>{profile.verified ? "Verified Match Profile" : "Member Profile"}</span>
                  </span>
                  {profile.membership?.isPremium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs">
                      <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{profile.membership.label || "Premium"} Member</span>
                    </span>
                  )}
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
          </div>

          <div className="p-6 sm:p-8 pt-6">

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
                        <span className="ml-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full align-middle">
                          Premium unlocked
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {isAuthenticated
                          ? "Contact details are available to Premium members."
                          : "Log in & upgrade to Premium to unlock contact details."}
                      </p>
                    )}
                  </div>
                </div>
                {!profile.mobile && isAuthenticated && (
                  <Link
                    href="/membership"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black shadow-md hover:from-amber-500 hover:to-amber-600 transition-all cursor-pointer"
                  >
                    <Crown className="w-4 h-4" /> Upgrade
                  </Link>
                )}
                {!profile.mobile && !isAuthenticated && (
                  <Link
                    href="/login"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e53238] text-white text-xs font-black shadow-md hover:bg-[#c92429] transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" /> Login
                  </Link>
                )}
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
                className={`flex-1 w-full py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                  blocked
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
                    className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReport} className="space-y-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
                      <Flag className="w-6 h-6 text-[#e53238]" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Report {formattedName}</h3>
                    <p className="text-xs text-slate-500">Help us keep Shaadi safe. Reports are reviewed by our team.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Reason *</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#e53238]"
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
                      className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#e53238] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportBusy || !reportReason}
                    className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-60"
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