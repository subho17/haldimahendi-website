"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Edit3,
  Camera,
  Save,
  X,
  CheckCircle,
  User,
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  BookOpen,
  Languages,
  Sparkles,
  Ruler,
  Users,
  Globe,
  Award,
  Check,
  Crown,
} from "lucide-react";
import { uploadImageToSupabase } from "@/lib/supabaseClient";
import { useMounted } from "@/hooks/useMounted";
import VerificationCard from "@/components/profile/VerificationCard";
import { RASHIS, NAKSHATRAS } from "@/lib/kundli";

const DEFAULT_AVATARS = [
  { label: "Female Avatar 1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" },
  { label: "Female Avatar 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250" },
];

/** Utility to convert text to Title Case for professional look */
function formatCapitalize(str?: string | null): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [membership, setMembership] = useState<{ isPremium: boolean; label: string; expiresAt: string | null }>({
    isPremium: false,
    label: "",
    expiresAt: null,
  });

  // Editable Form Fields initialized lazily from user context
  const [displayName, setDisplayName] = useState(() => user?.display_name || user?.name || "Shaadi Member");
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url || user?.avatarUrl || DEFAULT_AVATARS[0].url);
  const [gender, setGender] = useState(() => user?.gender || "Groom");
  const [age, setAge] = useState("26");
  const [height, setHeight] = useState("5'8\"");
  const [maritalStatus, setMaritalStatus] = useState(() => user?.maritalStatus || "Never Married");
  const [religion, setReligion] = useState("Hindu");
  const [motherTongue, setMotherTongue] = useState("Hindi");
  const [education, setEducation] = useState("B.Tech / B.E");
  const [profession, setProfession] = useState("Software Engineer");
  const [city, setCity] = useState(() => user?.city || "Kolkata");
  const [country] = useState("India");
  const [bio, setBio] = useState("Looking for a caring, family-oriented partner with good moral values.");

  // Phase 5: Extended profile fields (astrology, lifestyle, family)
  const [dob, setDob] = useState(() => user?.dob || "");
  const [birthTime, setBirthTime] = useState(() => user?.birthTime || "");
  const [birthPlace, setBirthPlace] = useState(() => user?.birthPlace || "");
  const [rashi, setRashi] = useState(() => user?.rashi || "");
  const [nakshatra, setNakshatra] = useState(() => user?.nakshatra || "");
  const [manglik, setManglik] = useState(() => user?.manglik || "");
  const [gotra, setGotra] = useState(() => user?.gotra || "");
  const [fatherOccupation, setFatherOccupation] = useState(() => user?.fatherOccupation || "");
  const [motherOccupation, setMotherOccupation] = useState(() => user?.motherOccupation || "");
  const [siblings, setSiblings] = useState(() => user?.siblings || "");
  const [familyType, setFamilyType] = useState(() => user?.familyType || "");
  const [familyValues, setFamilyValues] = useState(() => user?.familyValues || "");
  const [diet, setDiet] = useState(() => user?.diet || "");
  const [smoking, setSmoking] = useState(() => user?.smoking || "");
  const [drinking, setDrinking] = useState(() => user?.drinking || "");
  const [disability, setDisability] = useState(() => user?.disability || "");

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!mounted || !user) return;
    const id =
      user?.profileId ||
      user?.mobile_number ||
      user?.mobileNumber ||
      user?.email ||
      "";
    if (!id) return;
    fetch(`/api/membership?userId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.membership) {
          setMembership({
            isPremium: !!data.membership.isPremium,
            label: data.membership.plan?.badgeLabel || data.membership.tier || "",
            expiresAt: data.membership.expiresAt || null,
          });
        }
      })
      .catch(() => {});
  }, [mounted, user]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="w-9 h-9 border-3 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Photo Upload (Direct to Supabase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image file under 10MB.");
      return;
    }

    setIsUploading(true);
    setSuccessMessage("Uploading profile photo...");

    try {
      const uploadRes = await uploadImageToSupabase(file, "avatars");
      const finalUrl = uploadRes.success && uploadRes.publicUrl ? uploadRes.publicUrl : URL.createObjectURL(file);

      setAvatarUrl(finalUrl);
      login({
        ...user,
        avatarUrl: finalUrl,
        avatar_url: finalUrl,
      });
      setSuccessMessage("Profile photo updated successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setSuccessMessage("Photo set successfully.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setSuccessMessage(""), 3500);
    }
  };

  // Handle Form Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = displayName.trim() || user?.name || "Shaadi Member";

    const updatedUser = {
      ...user,
      name: updatedName,
      display_name: updatedName,
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0].url,
      avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
      gender,
      age: parseInt(age, 10) || undefined,
      height,
      maritalStatus,
      religion,
      motherTongue,
      education,
      profession,
      city,
      bio,
      dob,
      birthTime,
      birthPlace,
      rashi,
      nakshatra,
      manglik,
      gotra,
      fatherOccupation,
      motherOccupation,
      siblings,
      familyType,
      familyValues,
      diet,
      smoking,
      drinking,
      disability,
    };

    login(updatedUser);

    // Persist to backend (scratch + Postgres) so public profile & search reflect edits.
    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: user?.profileId,
          mobileNumber: user?.mobile_number || user?.mobileNumber || "",
          email: user?.email || "",
          ...updatedUser,
        }),
      });
    } catch (err) {
      console.error("Failed to persist profile:", err);
    }

    setIsEditing(false);
    setSuccessMessage("Profile details updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const rawAvatar = avatarUrl || user?.avatar_url || user?.avatarUrl || DEFAULT_AVATARS[0].url;
  const rawDisplayName = displayName || user?.display_name || user?.name || "Shaadi Member";
  const formattedDisplayName = formatCapitalize(rawDisplayName);
  const formattedCity = formatCapitalize(city);
  const formattedReligion = formatCapitalize(religion);
  const formattedMotherTongue = formatCapitalize(motherTongue);
  const formattedProfession = formatCapitalize(profession);
  const userMobile = user?.mobile_number || user?.mobileNumber || "9163399882";
  const userProfileId = user?.profileId || "SH270341";
  const viewerId = user?.profileId || user?.mobile_number || user?.mobileNumber || user?.email || "";

  // Compute profile completeness score dynamically
  const fieldsToCheck = [displayName, avatarUrl, gender, age, height, maritalStatus, religion, motherTongue, education, profession, city, bio, rashi, nakshatra, diet, smoking, drinking, familyType, fatherOccupation];
  const filledCount = fieldsToCheck.filter((f) => f && f.trim() !== "").length;
  const completionPercentage = Math.round((filledCount / fieldsToCheck.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Success Toast */}
        {successMessage && (
          <div className="mb-6 bg-emerald-500/10 text-emerald-800 px-5 py-3.5 rounded-2xl border border-emerald-200/80 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Outer Profile Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all duration-300">

          {/* Profile Header Content (Clean Header, No Banner) */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
              
              {/* Avatar & Upload Camera Trigger */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#d97706] font-black text-4xl ring-2 ring-amber-100" style={{ position: "relative" }}>
                    {rawAvatar && rawAvatar !== "/images/default-avatar.png" ? (
                      <Image src={rawAvatar} alt={formattedDisplayName} width={144} height={144} className="w-full h-full object-cover" />
                    ) : (
                      <span className="uppercase">{formattedDisplayName.charAt(0)}</span>
                    )}
                  </div>

                  {/* Upload Button overlay */}
                  <label
                    title="Change profile photo"
                    className={`absolute bottom-0 right-0 p-2 rounded-full bg-[#d97706] text-white cursor-pointer shadow-md hover:bg-[#b45309] hover:scale-105 transition-all ${
                      isUploading ? "animate-pulse" : ""
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Name & Quick Metadata */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Verified Member</span>
                    </span>
                    {membership.isPremium && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs">
                        <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{membership.label || "Premium"} Member</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                      <span>Verified Match Profile</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {formattedDisplayName}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold">
                    <span>ID: <strong className="text-slate-800 font-bold">{userProfileId}</strong></span>
                    <span>•</span>
                    <span>Mobile: <strong className="text-slate-800 font-bold">+91 {userMobile}</strong></span>
                  </div>

                  {/* Key Info Pills */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {age} Yrs
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {height}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                      {formattedCity}, {country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Toggle Action */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full sm:w-auto px-6 py-2.5 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isEditing
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      : "bg-[#d97706] text-[#ffffff] hover:bg-[#b45309] shadow-rose-500/20"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Cancel Editing</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          <div className="p-6 sm:p-8 pt-6">

            {/* Profile Completion Bar */}
            <div className="my-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-1/2 space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Profile Strength</span>
                  <span className="text-[#d97706]">{completionPercentage}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-[#d97706] rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-center sm:text-right">
                ✨ A 100% complete profile gets up to <strong className="text-slate-800">3x more interest requests</strong>.
              </p>
            </div>

            {/* Trust & Verification */}
            {viewerId && <VerificationCard userId={viewerId} />}

            {/* EDIT MODE FORM */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-8 pt-2 animate-in fade-in duration-300">
                <div className="bg-rose-50/70 p-4 sm:p-5 rounded-2xl border border-rose-100/80">
                  <h3 className="font-bold text-sm text-[#d97706] flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile Details</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Keep your profile information updated to connect with compatible life partners.
                  </p>
                </div>

                {/* Section 1: Avatar Selector */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Choose Preset Avatar (Or upload custom photo above)
                  </label>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    {DEFAULT_AVATARS.map((av, idx) => {
                      const isSelected = avatarUrl === av.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(av.url)}
                          style={{ position: "relative" }}
                          className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected ? "border-[#d97706] ring-2 ring-amber-200 scale-105 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image src={av.url} alt={av.label} width={56} height={56} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Basic & Personal Info */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-4 h-4 text-[#d97706]" />
                    <span>Basic Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Display Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Full Display Name *</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Gagan Kalra"
                        required
                      />
                    </div>

                    {/* Gender / Profile Role */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Looking For *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="Groom">Bride (Groom Profile)</option>
                        <option value="Bride">Groom (Bride Profile)</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Age (Years)</label>
                      <input
                        type="number"
                        min={18}
                        max={80}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Height</label>
                      <select
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="5'0&quot;">5&apos;0&quot; (152 cm)</option>
                        <option value="5'2&quot;">5&apos;2&quot; (157 cm)</option>
                        <option value="5'4&quot;">5&apos;4&quot; (162 cm)</option>
                        <option value="5'6&quot;">5&apos;6&quot; (167 cm)</option>
                        <option value="5'8&quot;">5&apos;8&quot; (172 cm)</option>
                        <option value="5'10&quot;">5&apos;10&quot; (177 cm)</option>
                        <option value="6'0&quot;">6&apos;0&quot; (182 cm)</option>
                        <option value="6'2&quot;">6&apos;2&quot; (187 cm)</option>
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Marital Status</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Section 3: Location & Background */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="w-4 h-4 text-[#d97706]" />
                    <span>Location, Religion & Education</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Living City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Kolkata"
                      />
                    </div>

                    {/* Religion */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Religion</label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Parsi">Parsi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Mother Tongue */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Mother Tongue</label>
                      <input
                        type="text"
                        value={motherTongue}
                        onChange={(e) => setMotherTongue(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Hindi, Bengali, Punjabi"
                      />
                    </div>

                    {/* Education */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Highest Education</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. B.Tech / M.B.A"
                      />
                    </div>

                    {/* Profession */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Profession / Occupation</label>
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Software Engineer, Business Owner"
                      />
                    </div>

                  </div>
                </div>

                {/* Section 4: Astrology & Horoscope */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <span>Astrology & Horoscope (Kundli)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 -mt-2">
                    Used for kundli compatibility scoring in matches.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                      />
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Birth Time</label>
                      <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                      />
                    </div>

                    {/* Birth Place */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Birth Place</label>
                      <input
                        type="text"
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Kolkata, West Bengal"
                      />
                    </div>

                    {/* Rashi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Rashi (Moon Sign)</label>
                      <select
                        value={rashi}
                        onChange={(e) => setRashi(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Rashi</option>
                        {RASHIS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nakshatra */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Nakshatra (Star)</label>
                      <select
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Nakshatra</option>
                        {NAKSHATRAS.map((n) => (
                          <option key={n.name} value={n.name}>{n.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Manglik */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Manglik (Mangal Dosh)</label>
                      <select
                        value={manglik}
                        onChange={(e) => setManglik(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Not sure / Skip</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {/* Gotra */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Gotra</label>
                      <input
                        type="text"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Kashyap"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Lifestyle */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Heart className="w-4 h-4 text-[#d97706]" />
                    <span>Lifestyle</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Diet */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Diet</label>
                      <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>Vegetarian</option>
                        <option>Eggetarian</option>
                        <option>Non-Vegetarian</option>
                        <option>Jain</option>
                        <option>Vegan</option>
                      </select>
                    </div>

                    {/* Smoking */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Smoking</label>
                      <select
                        value={smoking}
                        onChange={(e) => setSmoking(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>No</option>
                        <option>Yes</option>
                        <option>Occasionally</option>
                      </select>
                    </div>

                    {/* Drinking */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Drinking</label>
                      <select
                        value={drinking}
                        onChange={(e) => setDrinking(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>No</option>
                        <option>Yes</option>
                        <option>Socially</option>
                      </select>
                    </div>

                    {/* Disability */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Disability</label>
                      <select
                        value={disability}
                        onChange={(e) => setDisability(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>None</option>
                        <option>Physical Disability</option>
                        <option>Visual Impairment</option>
                        <option>Hearing Impairment</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 6: Family Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Users className="w-4 h-4 text-[#d97706]" />
                    <span>Family Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father occupation */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Father&apos;s Occupation</label>
                      <input
                        type="text"
                        value={fatherOccupation}
                        onChange={(e) => setFatherOccupation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Business Owner"
                      />
                    </div>

                    {/* Mother occupation */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Mother&apos;s Occupation</label>
                      <input
                        type="text"
                        value={motherOccupation}
                        onChange={(e) => setMotherOccupation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. Homemaker"
                      />
                    </div>

                    {/* Siblings */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Siblings</label>
                      <input
                        type="text"
                        value={siblings}
                        onChange={(e) => setSiblings(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all"
                        placeholder="e.g. 1 brother, 1 sister"
                      />
                    </div>

                    {/* Family Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Family Type</label>
                      <select
                        value={familyType}
                        onChange={(e) => setFamilyType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>Nuclear Family</option>
                        <option>Joint Family</option>
                        <option>Extended Family</option>
                      </select>
                    </div>

                    {/* Family Values */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Family Values</label>
                      <select
                        value={familyValues}
                        onChange={(e) => setFamilyValues(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option>Traditional</option>
                        <option>Moderate</option>
                        <option>Liberal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 7: Bio */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#d97706]" />
                    <span>About Myself (Bio)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-hidden transition-all leading-relaxed"
                    placeholder="Describe your personality, background, interests, and what you look for in a life partner..."
                  />
                </div>

                {/* Form Action Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE DISPLAY */
              <div className="space-y-8 pt-2 animate-in fade-in duration-300">
                
                {/* About Myself Callout */}
                <div className="relative bg-gradient-to-br from-rose-50/50 via-slate-50/80 to-white p-6 rounded-2xl border border-rose-100/70 shadow-2xs">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d97706] rounded-l-2xl" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#d97706]" />
                    <span>About Myself</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>

                {/* Section 1: Basic Details Card Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Heart className="w-4 h-4 text-[#d97706]" />
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Basic Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Display Name */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedDisplayName}</span>
                      </div>
                    </div>

                    {/* Looking For */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Looking For</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{gender === "Groom" ? "Bride" : "Groom"}</span>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{age} yrs</span>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Ruler className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Height</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{height}</span>
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3 sm:col-span-2 lg:col-span-2">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marital Status</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{maritalStatus}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 2: Location & Background Card Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="w-4 h-4 text-[#d97706]" />
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Location & Background
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Living City */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Living City</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedCity}</span>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{country}</span>
                      </div>
                    </div>

                    {/* Religion */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Religion</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedReligion}</span>
                      </div>
                    </div>

                    {/* Mother Tongue */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mother Tongue</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedMotherTongue}</span>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{education}</span>
                      </div>
                    </div>

                    {/* Profession */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profession</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedProfession}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 3: Astrology & Horoscope */}
                {(rashi || nakshatra || manglik || dob) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Sparkles className="w-4 h-4 text-[#d97706]" />
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Horoscope & Kundli
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dob && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{dob}{birthTime ? `, ${birthTime}` : ""}</span>
                          </div>
                        </div>
                      )}
                      {birthPlace && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Birth Place</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{birthPlace}</span>
                          </div>
                        </div>
                      )}
                      {rashi && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rashi</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{rashi}</span>
                          </div>
                        </div>
                      )}
                      {nakshatra && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nakshatra</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{nakshatra}</span>
                          </div>
                        </div>
                      )}
                      {manglik && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manglik</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{manglik}</span>
                          </div>
                        </div>
                      )}
                      {gotra && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gotra</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{gotra}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 4: Lifestyle */}
                {(diet || smoking || drinking || disability) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Heart className="w-4 h-4 text-[#d97706]" />
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Lifestyle
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {diet && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diet</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{diet}</span>
                          </div>
                        </div>
                      )}
                      {smoking && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Smoking</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{smoking}</span>
                          </div>
                        </div>
                      )}
                      {drinking && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drinking</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{drinking}</span>
                          </div>
                        </div>
                      )}
                      {disability && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disability</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{disability}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 5: Family Details */}
                {(fatherOccupation || motherOccupation || siblings || familyType || familyValues) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Users className="w-4 h-4 text-[#d97706]" />
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Family Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {fatherOccupation && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Father&apos;s Occupation</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{fatherOccupation}</span>
                          </div>
                        </div>
                      )}
                      {motherOccupation && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mother&apos;s Occupation</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{motherOccupation}</span>
                          </div>
                        </div>
                      )}
                      {siblings && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Siblings</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{siblings}</span>
                          </div>
                        </div>
                      )}
                      {familyType && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Family Type</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{familyType}</span>
                          </div>
                        </div>
                      )}
                      {familyValues && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100/60 text-[#d97706]">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Family Values</span>
                            <span className="text-xs font-bold text-slate-900 truncate block">{familyValues}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
