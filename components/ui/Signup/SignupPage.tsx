"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Smartphone,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Camera,
  Sparkles,
  MapPin,
  LogIn,
  BookOpen,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { uploadImageToSupabase } from "@/lib/supabaseClient";

interface SignupPageProps {
  onOpenLogin?: () => void;
  onSuccess?: () => void;
  isModal?: boolean;
  initialData?: {
    lookingFor?: string;
    religion?: string;
    motherTongue?: string;
  };
}

const DEFAULT_AVATARS = [
  { label: "Female Avatar 1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" },
  { label: "Female Avatar 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250" },
  { label: "Male Avatar 2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250" },
];

export default function SignupPage({ onOpenLogin, onSuccess, isModal = false, initialData }: SignupPageProps) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initLookingFor = initialData?.lookingFor || searchParams?.get("lookingFor") || "Woman";
  const initReligion = initialData?.religion || searchParams?.get("religion") || "Hindu";
  const initMotherTongue = initialData?.motherTongue || searchParams?.get("motherTongue") || "Hindi";

  // Wizard Steps: 1 = Registration Choice / Mobile Check, 2 = OTP Verification, 3 = Matrimonial Profile Completion
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Profile completion fields
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0].url);
  const [gender, setGender] = useState<"Bride" | "Groom" | "Other">(initLookingFor === "Woman" ? "Bride" : "Groom");
  const [companyName, setCompanyName] = useState("");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("5'8\"");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [religion, setReligion] = useState(initReligion);
  const [motherTongue, setMotherTongue] = useState(initMotherTongue);
  const [education, setEducation] = useState("B.Tech / Graduate");
  const [profession, setProfession] = useState("Software Engineer");
  const [city, setCity] = useState("Mumbai");
  const [bio] = useState("Looking for a caring, well-educated, and family-oriented life partner.");

  // Login password (optional, used for password-based login later)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Step 1: Check existing user & Send Real OTP via /api/otp/send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsExistingUser(false);
    setInfoMessage("");
    setIsLoading(true);

    try {
      // 1. Check if user already exists
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        setIsLoading(false);
        setIsExistingUser(true);
        setError(`Already registered! An account is already registered with +91 ${mobileNumber}. Please sign in to your account.`);
        return;
      }

      // 2. Doesn't exist -> Send OTP
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setStep(2);
      setInfoMessage(`OTP Sent to +91 ${mobileNumber}`);
    } catch {
      setIsLoading(false);
      setError("Network error sending OTP. Please try again.");
    }
  };

  // Step 2: Verify OTP & move to Profile Completion Step 3
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit OTP code.");
      return;
    }
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, otp }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP code.");
        return;
      }

      // Move to Step 3: Profile Completion Form
      setStep(3);
      setInfoMessage("Mobile verified! Please complete your matrimonial profile below.");
    } catch {
      setIsLoading(false);
      setError("Network error verifying OTP. Please try again.");
    }
  };

  // Step 3: Save Matrimonial Profile Data & Redirect to /dashboard
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password && password.length < 6) {
      setIsLoading(false);
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password && password !== confirmPassword) {
      setIsLoading(false);
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const finalDisplayName = displayName.trim() || (email ? email.split("@")[0] : `Member (${mobileNumber.slice(-4)})`);

    const profileData = {
      name: finalDisplayName,
      display_name: finalDisplayName,
      mobileNumber,
      mobile_number: mobileNumber,
      email,
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0].url,
      avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
      gender,
      age: Number(age) || 25,
      height,
      maritalStatus,
      religion,
      motherTongue,
      education,
      profession,
      companyName,
      city,
      bio,
      provider: "otp" as const,
    };

    login(profileData);

    try {
      const saveData = password ? { ...profileData, password } : profileData;
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });
    } catch (e) {
      console.warn("Failed to persist matrimonial profile to server:", e);
    }

    if (onSuccess) {
      onSuccess();
    }

    router.push("/dashboard");
  };

  // Photo Upload Handler (Direct to Supabase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be under 10MB.");
      return;
    }

    setInfoMessage("Uploading profile photo to Supabase Storage...");
    const uploadRes = await uploadImageToSupabase(file, "avatars");
    const finalUrl = uploadRes.success && uploadRes.publicUrl ? uploadRes.publicUrl : URL.createObjectURL(file);

    setAvatarUrl(finalUrl);
    setInfoMessage("Photo uploaded successfully!");
    setTimeout(() => setInfoMessage(""), 3000);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });

      setIsLoading(false);
      setInfoMessage(`OTP resent to +91 ${mobileNumber}`);
    } catch {
      setIsLoading(false);
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className={`w-full font-sans ${isModal ? "p-2 sm:p-4" : "p-4 sm:p-8"}`}>
      <div className="bg-[#ffffff] rounded-3xl shadow-2xl shadow-black/10 border border-[#e2e8f0] p-6 sm:p-8 max-w-lg w-full mx-auto text-left relative overflow-hidden transition-all duration-300">
        
        {/* Top Trust Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#d97706] font-bold text-xs">
            <Heart className="w-3.5 h-3.5 fill-[#d97706]" />
            <span>Step {step} of 3 • 100% Verified Registration</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 && "Create Free Account ✨"}
            {step === 2 && "Verify Mobile OTP 📱"}
            {step === 3 && "Create Matrimonial Profile 👤"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">
            {step === 1 && "Choose Mobile or Gmail registration to find your life partner."}
            {step === 2 && `Enter the 4-digit code sent to +91 ${mobileNumber}.`}
            {step === 3 && "Fill in your matrimonial details so your profile becomes searchable."}
          </p>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold p-3 rounded-xl border border-emerald-200 animate-in fade-in text-center shadow-xs">
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error / Already Registered Alert Banner */}
        {error && (
          <div className={`mb-5 p-4 rounded-2xl border animate-in fade-in ${
            isExistingUser ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-red-50 text-red-600 border-red-100"
          }`}>
            <div className="flex items-start gap-2.5">
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isExistingUser ? "text-amber-600" : "text-red-600"}`} />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold">{error}</p>
                {isExistingUser && (
                  <div className="mt-3">
                    {onOpenLogin ? (
                      <button
                        type="button"
                        onClick={onOpenLogin}
                        className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Your Account Now</span>
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Your Account Now</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Mobile Number Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Mobile Number <span className="text-[#d97706]">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Get Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2 border border-red-100">
              <KeyRound className="w-8 h-8 text-[#d97706]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider text-center">
                Enter 4-Digit OTP <span className="text-[#d97706]">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1 2 3 4"
                required
                className="w-full text-center tracking-widest text-2xl py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-extrabold focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="font-bold text-[#d97706] hover:underline cursor-pointer"
              >
                Resend OTP Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setInfoMessage("");
                }}
                className="text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setInfoMessage("");
                }}
                className="w-1/3 py-3.5 px-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Full Matrimonial Profile Form */}
        {step === 3 && (
          <form onSubmit={handleCompleteProfile} className="space-y-4 animate-in fade-in">
            
            {/* Avatar Selector */}
            <div className="flex flex-col items-center justify-center gap-3 mb-2">
              <div className="relative group">
                <Image
                  src={avatarUrl}
                  alt="Profile Avatar"
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-4 border-red-100 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#d97706] text-white cursor-pointer shadow-md hover:scale-105 transition">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    style={{ position: "relative" }}
                    className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                      avatarUrl === av.url ? "border-[#d97706] scale-110" : "border-gray-200 opacity-70"
                    }`}
                  >
                    <Image src={av.url} alt={av.label} width={32} height={32} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Upload photo to Supabase or select preset</span>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Full Display Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-gray-900 text-xs font-semibold focus:bg-white focus:border-[#d97706] outline-hidden"
                />
              </div>
            </div>

            {/* Gender Choice */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Looking For
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("Bride")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === "Bride"
                      ? "bg-red-50 border-[#d97706] text-[#d97706]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>👰 Bride</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender("Groom")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === "Groom"
                      ? "bg-red-50 border-[#d97706] text-[#d97706]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>🤵 Groom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender("Other")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === "Other"
                      ? "bg-red-50 border-[#d97706] text-[#d97706]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>✨ Other</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Height</label>
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                >
                  <option value="5'2&quot;">5&apos;2&quot;</option>
                  <option value="5'4&quot;">5&apos;4&quot;</option>
                  <option value="5'6&quot;">5&apos;6&quot;</option>
                  <option value="5'8&quot;">5&apos;8&quot;</option>
                  <option value="5'10&quot;">5&apos;10&quot;</option>
                  <option value="6'0&quot;">6&apos;0&quot;</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Religion */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Religion</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                >
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Jain">Jain</option>
                </select>
              </div>

              {/* Marital Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                >
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Education */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Education</label>
                <div className="relative">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech"
                    className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                  />
                </div>
              </div>

              {/* Profession */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Profession</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                  >
                    <option value="">Select Profession</option>
                    <option value="Govt">Govt</option>
                    <option value="Private">Private</option>
                    <option value="Own Business">Own Business</option>
                  </select>
                </div>
              </div>

              {/* Company Name (shown for Own Business) */}
              {profession === "Own Business" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Company Name</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. My Company Pvt Ltd"
                      className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Living City</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi"
                  className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                />
              </div>
            </div>

            {/* Password (optional, for password login later) */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                Create a Login Password <span className="text-gray-300 normal-case font-medium">(optional)</span>
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full pl-8 pr-10 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Matrimonial Profile & Start Matching</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Social Proof */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Privacy Control</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Government ID Verified</span>
          </div>
        </div>

        {/* Switch to Login */}
        {step === 1 && (
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            {onOpenLogin ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-3 px-4 rounded-xl border border-[#e2e8f0] text-[#1e293b] font-bold text-sm hover:border-[#d97706] hover:text-[#d97706] transition-all cursor-pointer"
              >
                Sign In to Your Account
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="w-full inline-block py-3 px-4 rounded-xl border border-[#e2e8f0] text-[#1e293b] font-bold text-sm hover:border-[#d97706] hover:text-[#d97706] transition-all text-center"
              >
                Sign In to Your Account
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
