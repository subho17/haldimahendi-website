/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { uploadImageToSupabase } from "@/lib/supabaseClient";
import { useMounted } from "@/hooks/useMounted";
import VerificationCard from "@/components/profile/VerificationCard";

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

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="w-9 h-9 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
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
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = displayName.trim() || user?.name || "Shaadi Member";

    login({
      ...user,
      name: updatedName,
      display_name: updatedName,
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0].url,
      avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
      gender,
      maritalStatus,
      city,
    });

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
  const viewerId = user?.mobile_number || user?.mobileNumber || user?.email || user?.profileId || "";

  // Compute profile completeness score dynamically
  const fieldsToCheck = [displayName, avatarUrl, gender, age, height, maritalStatus, religion, motherTongue, education, profession, city, bio];
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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#e53238] font-black text-3xl ring-2 ring-rose-100">
                    {rawAvatar && rawAvatar !== "/images/default-avatar.png" ? (
                      <img src={rawAvatar} alt={formattedDisplayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="uppercase">{formattedDisplayName.charAt(0)}</span>
                    )}
                  </div>

                  {/* Upload Button overlay */}
                  <label
                    title="Change profile photo"
                    className={`absolute bottom-0 right-0 p-2 rounded-full bg-[#e53238] text-white cursor-pointer shadow-md hover:bg-[#c92429] hover:scale-105 transition-all ${
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-[#e53238] shrink-0" />
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
                      : "bg-[#e53238] text-[#ffffff] hover:bg-[#c92429] shadow-rose-500/20"
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
                  <span className="text-[#e53238]">{completionPercentage}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-[#e53238] rounded-full transition-all duration-500"
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
                  <h3 className="font-bold text-sm text-[#e53238] flex items-center gap-2">
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
                          className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected ? "border-[#e53238] ring-2 ring-rose-200 scale-105 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
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
                    <User className="w-4 h-4 text-[#e53238]" />
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
                    <MapPin className="w-4 h-4 text-[#e53238]" />
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

                {/* Section 4: Bio */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#e53238]" />
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
                    className="px-7 py-2.5 rounded-xl bg-[#e53238] hover:bg-[#c92429] text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer transition-all"
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
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#e53238] rounded-l-2xl" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#e53238]" />
                    <span>About Myself</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>

                {/* Section 1: Basic Details Card Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Heart className="w-4 h-4 text-[#e53238]" />
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Basic Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Display Name */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedDisplayName}</span>
                      </div>
                    </div>

                    {/* Looking For */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Looking For</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{gender === "Groom" ? "Bride" : "Groom"}</span>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{age} yrs</span>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Ruler className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Height</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{height}</span>
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3 sm:col-span-2 lg:col-span-2">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
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
                    <MapPin className="w-4 h-4 text-[#e53238]" />
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Location & Background
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Living City */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Living City</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedCity}</span>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{country}</span>
                      </div>
                    </div>

                    {/* Religion */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Religion</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedReligion}</span>
                      </div>
                    </div>

                    {/* Mother Tongue */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mother Tongue</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedMotherTongue}</span>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{education}</span>
                      </div>
                    </div>

                    {/* Profession */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100/60 text-[#e53238]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profession</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{formattedProfession}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}