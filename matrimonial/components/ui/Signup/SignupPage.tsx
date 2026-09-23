"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Lock,
  Eye,
  EyeOff,
  Mail,
  Users,
  X,
  Zap,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { uploadImageToSupabase } from "@/lib/supabaseClient";
import { RASHIS, SUN_RASHIS, NAKSHATRAS } from "@/lib/kundli";
import {
  MOTHER_TONGUES,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  FATHER_OCCUPATION_OPTIONS,
  MOTHER_OCCUPATION_OPTIONS,
} from "@/lib/profileOptions";
import AiBioModal from "@/components/profile/AiBioModal";

interface SignupPageProps {
  onOpenLogin?: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
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

export default function SignupPage({ onOpenLogin, onSuccess, onClose, isModal = false, initialData }: SignupPageProps) {
  const { login } = useAuth();
  const router = useRouter();

  // Wizard Steps: 1 = Mobile & OTP Trigger, 2 = OTP Verification, 3 = Matrimonial Profile Completion
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profileStep, setProfileStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMethod, setOtpMethod] = useState<"mobile" | "email">("mobile");
  const [otpEmail, setOtpEmail] = useState("");

  // Sub-step 1: Basic & Contact details
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0].url);
  const [gender, setGender] = useState<"Bride" | "Groom">(() => {
    if (initialData?.lookingFor) {
      const lf = initialData.lookingFor.toLowerCase();
      if (lf.includes("woman") || lf.includes("bride") || lf.includes("female") || lf.includes("girl")) {
        return "Groom";
      }
      if (lf.includes("man") || lf.includes("groom") || lf.includes("male") || lf.includes("boy")) {
        return "Bride";
      }
    }
    return "Groom";
  });
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  // Sub-step 2: Location, Religion & Education
  const [city, setCity] = useState("");
  const [religion, setReligion] = useState(() => initialData?.religion || "");
  const [motherTongue, setMotherTongue] = useState(() => initialData?.motherTongue || "");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [customProfession, setCustomProfession] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Sub-step 3: Astrology & Horoscope (Kundli)
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [rashi, setRashi] = useState("");
  const [sunRashi, setSunRashi] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [manglik, setManglik] = useState("");
  const [gotra, setGotra] = useState("");

  // Sub-step 4: Lifestyle & Family Details
  const [diet, setDiet] = useState("");
  const [smoking, setSmoking] = useState("");
  const [drinking, setDrinking] = useState("");
  const [disability, setDisability] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [siblings, setSiblings] = useState("");
  const [familyType, setFamilyType] = useState("");
  const [familyValues, setFamilyValues] = useState("");

  // Sub-step 5: Bio & Password
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // AI Bio Assistant state
  const [isAiBioOpen, setIsAiBioOpen] = useState(false);
  const [aiBioTone, setAiBioTone] = useState("balanced");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
      return;
    }
    if (cooldownTimerRef.current) return;
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldown]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // Step 1: Check existing user & Send Real OTP via /api/otp/send or /api/otp/send-email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsExistingUser(false);
    setInfoMessage("");
    setIsLoading(true);

    try {
      if (otpMethod === "email") {
        const cleanEmail = otpEmail.trim().toLowerCase();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          setIsLoading(false);
          setError("Please enter a valid email address.");
          return;
        }
        const checkRes = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setIsLoading(false);
          setIsExistingUser(true);
          setError(`Already registered! An account is already registered with ${cleanEmail}. Please sign in.`);
          return;
        }
        const res = await fetch("/api/otp/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to send OTP to email.");
          return;
        }
        setStep(2);
        setInfoMessage(`OTP Sent to ${cleanEmail}`);
        setCooldown(60);
        return;
      }
      const cleaned = mobileNumber.replace(/\D/g, "");
      if (!cleaned || cleaned.length < 10) {
        setIsLoading(false);
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
      // 1. Check if user already exists
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cleaned }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        setIsLoading(false);
        setIsExistingUser(true);
        setError(`Already registered! An account is already registered with +91 ${cleaned}. Please sign in to your account.`);
        return;
      }

      // 2. Doesn't exist -> Send OTP
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cleaned }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setStep(2);
      setInfoMessage(`OTP Sent to +91 ${cleaned}`);
      setCooldown(60);
    } catch {
      setIsLoading(false);
      setError("Network error sending OTP. Please try again.");
    }
  };

  // Step 2: Verify OTP & move to Profile Completion Step 3
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOtp = otp.replace(/\D/g, "").trim();
    if (!cleanedOtp || cleanedOtp.length < 4) {
      setError("Please enter the 4-digit OTP code.");
      return;
    }
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      if (otpMethod === "email") {
        const cleanEmail = otpEmail.trim().toLowerCase();
        const res = await fetch("/api/otp/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, otp: cleanedOtp }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (!res.ok || !data.success) {
          setError(data.message || "Invalid OTP code.");
          return;
        }
        if (!email) setEmail(cleanEmail);
        setStep(3);
        setProfileStep(1);
        setInfoMessage("Email verified! Complete your matrimonial profile to start matching.");
        return;
      }
      const cleaned = mobileNumber.replace(/\D/g, "");
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cleaned, otp: cleanedOtp }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP code.");
        return;
      }

      // Move to Step 3: Profile Completion Form
      setStep(3);
      setProfileStep(1);
      setInfoMessage("Mobile verified! Complete your matrimonial profile to start matching.");
    } catch {
      setIsLoading(false);
      setError("Network error verifying OTP. Please try again.");
    }
  };

  // Step 3 Next handler with sub-step validation
  const handleNextProfileStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (profileStep === 1) {
      if (!displayName.trim()) {
        setError("Please enter your full display name.");
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (profileStep < 5) {
      setProfileStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleCompleteProfile(e);
    }
  };

  // Step 3: Save Matrimonial Profile Data & Redirect to /profile
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

    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    const finalDisplayName = displayName.trim() || (email ? email.split("@")[0] : `Member (${cleanedMobile.slice(-4)})`);

    const profileData = {
      name: finalDisplayName,
      display_name: finalDisplayName,
      mobileNumber: cleanedMobile,
      mobile_number: cleanedMobile,
      email: email.trim().toLowerCase(),
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0].url,
      avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
      gender,
      age: age ? Number(age) : 25,
      height: height || "5'7\"",
      maritalStatus: maritalStatus || "Never Married",
      religion: religion || "Hindu",
      motherTongue: motherTongue || "Hindi",
      education: education || "Graduate",
      profession: (profession === "Other" && customProfession.trim() ? customProfession.trim() : profession) || "Professional",
      companyName: companyName.trim() || "",
      city: city || "Mumbai",
      bio: bio || "Registered Member.",
      dob: dob || "",
      birthTime: birthTime || "",
      birthPlace: birthPlace || "",
      rashi: rashi || "",
      sunRashi: sunRashi || "",
      nakshatra: nakshatra || "",
      manglik: manglik || "",
      gotra: gotra || "",
      diet: diet || "Not specified",
      smoking: smoking || "Not specified",
      drinking: drinking || "Not specified",
      disability: disability || "None",
      fatherOccupation: fatherOccupation || "Not specified",
      motherOccupation: motherOccupation || "Not specified",
      siblings: siblings || "Not specified",
      familyType: familyType || "Nuclear",
      familyValues: familyValues || "Moderate",
      provider: "otp" as const,
    };

    try {
      const saveData = password ? { ...profileData, password } : profileData;
      const res = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });
      const data = await res.json();
      if (data.success && data.user?.profileId) {
        login({ ...profileData, profileId: data.user.profileId });
        // Save default partner preferences immediately
        fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.profileId,
            partnerGender: gender === "Groom" ? "Woman" : "Man",
            ageMin: 21,
            ageMax: 35,
          }),
        }).catch(() => { });
      } else {
        login(profileData);
      }
    } catch (err) {
      console.warn("Failed to persist matrimonial profile to server:", err);
      login(profileData);
    }

    if (onSuccess) {
      onSuccess();
    }

    router.push("/profile");
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

  // Resend OTP — respects server cooldown/rate-limit and shows actual result
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      if (otpMethod === "email") {
        const cleanEmail = otpEmail.trim().toLowerCase();
        const res = await fetch("/api/otp/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (data.success) {
          setInfoMessage(`OTP resent to ${cleanEmail}`);
          setCooldown(60);
        } else {
          setError(data.message || "Failed to resend OTP.");
          if (data.message?.includes("wait") && typeof data.retryAfterSeconds === "number") setCooldown(data.retryAfterSeconds);
          else if (res.status === 429) setCooldown(60);
        }
        return;
      }
      const cleaned = mobileNumber.replace(/\D/g, "");
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cleaned }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (data.success) {
        setInfoMessage(`OTP resent to +91 ${cleaned}`);
        setCooldown(60);
      } else {
        setError(data.message || "Failed to resend OTP.");
        if (data.message?.includes("wait") && typeof data.retryAfterSeconds === "number") {
          setCooldown(data.retryAfterSeconds);
        } else if (res.status === 429) {
          setCooldown(60);
        }
      }
    } catch {
      setIsLoading(false);
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className={`w-full font-sans ${isModal ? "p-0" : "p-2 sm:p-4"}`}>
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/25 border border-slate-200/90 ${isModal ? "p-4 sm:p-6" : "p-6 sm:p-8"
          } w-full mx-auto text-left relative transition-all duration-300`}
        style={{ maxWidth: step === 3 ? "620px" : "480px" }}
      >
        {/* Close Button (anchored snugly to the top-right corner of the card) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close signup modal"
            className="absolute -top-1 -right-1 z-30 bg-white rounded-full p-1.5 sm:p-2 shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        )}

        {/* Top Trust Badge */}
        <div className="flex items-center justify-between mb-3 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#d97706] font-bold text-[11px] border border-amber-200/60">
            <Heart className="w-3.5 h-3.5 fill-[#d97706]" />
            <span>
              {step === 1 && `Step 1 of 3 • ${otpMethod === "email" ? "Email" : "Mobile"} Verification`}
              {step === 2 && "Step 2 of 3 • OTP Confirmation"}
              {step === 3 && `Step 3 of 3 • Part ${profileStep} of 5: Profile Creation`}
            </span>
          </div>
          {step === 3 && (
            <span className="text-xs font-extrabold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
              {profileStep * 20}% Done
            </span>
          )}
        </div>

        {/* Step Progress Bar for Step 3 */}
        {step === 3 && (
          <div className="mb-3.5 space-y-1">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${profileStep * 20}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
              <span className={profileStep >= 1 ? "text-amber-700 font-extrabold" : ""}>1. Basic</span>
              <span className={profileStep >= 2 ? "text-amber-700 font-extrabold" : ""}>2. Location</span>
              <span className={profileStep >= 3 ? "text-amber-700 font-extrabold" : ""}>3. Kundli</span>
              <span className={profileStep >= 4 ? "text-amber-700 font-extrabold" : ""}>4. Lifestyle</span>
              <span className={profileStep >= 5 ? "text-amber-700 font-extrabold" : ""}>5. Finish</span>
            </div>
          </div>
        )}

        {/* Title Header */}
        <div className="space-y-0.5 mb-3.5">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {step === 1 && <span>Create Free Account ✨</span>}
            {step === 2 && <span>{otpMethod === "email" ? "Verify Email OTP ✉️" : "Verify Mobile OTP 📱"}</span>}
            {step === 3 && profileStep === 1 && <span>Basic & Contact Details 👤</span>}
            {step === 3 && profileStep === 2 && <span>Location, Religion & Education 📍</span>}
            {step === 3 && profileStep === 3 && <span>Astrology & Horoscope (Kundli) ✨</span>}
            {step === 3 && profileStep === 4 && <span>Lifestyle & Family Details 🏡</span>}
            {step === 3 && profileStep === 5 && <span>Account Security & Finish 🔒</span>}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal">
            {step === 1 && (otpMethod === "email" ? "Enter your email to receive a verification code." : "Enter your mobile number to get started with verified matchmaking.")}
            {step === 2 && (otpMethod === "email" ? `Enter the 4-digit code sent to ${otpEmail}.` : `Enter the 4-digit code sent to +91 ${mobileNumber.replace(/\D/g, "")}.`)}
            {step === 3 && profileStep === 1 && "Add your name, email ID, and photo so other verified members can recognize you."}
            {step === 3 && profileStep === 2 && "Enter your location, community background, and educational qualifications."}
            {step === 3 && profileStep === 3 && "Used for kundli compatibility scoring and accurate astrological match calculation."}
            {step === 3 && profileStep === 4 && "Share your lifestyle habits and family values for compatible partner recommendations."}
            {step === 3 && profileStep === 5 && "Set an optional password and brief intro to complete your matrimonial registration."}
          </p>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="mb-3 bg-emerald-50 text-emerald-800 text-xs font-bold py-2 px-3.5 rounded-xl border border-emerald-200 animate-in fade-in text-center shadow-xs">
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error / Already Registered Alert Banner */}
        {error && (
          <div className={`mb-3.5 p-3.5 rounded-xl border animate-in fade-in ${isExistingUser ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-100"
            }`}>
            <div className="flex items-start gap-2.5">
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isExistingUser ? "text-amber-600" : "text-rose-600"}`} />
              <div className="flex-1">
                <p className="text-xs font-bold">{error}</p>
                {isExistingUser && (
                  <div className="mt-2.5">
                    {onOpenLogin ? (
                      <button
                        type="button"
                        onClick={onOpenLogin}
                        className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Your Account Now</span>
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-lg shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Your Account Now</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Mobile / Email OTP Toggle */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button type="button" onClick={() => { setOtpMethod("mobile"); setError(""); }} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${otpMethod === "mobile" ? "bg-[#d97706] text-white shadow" : "text-slate-600 hover:bg-white"}`}>
                <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
              </button>
              <button type="button" onClick={() => { setOtpMethod("email"); setError(""); }} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${otpMethod === "email" ? "bg-[#d97706] text-white shadow" : "text-slate-600 hover:bg-white"}`}>
                <Mail className="w-3.5 h-3.5" /> Email OTP
              </button>
            </div>
            {otpMethod === "mobile" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Mobile Number <span className="text-[#d97706]">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:border-[#d97706] focus:ring-2 focus:ring-amber-500/10 outline-hidden transition placeholder:text-slate-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Email Address <span className="text-[#d97706]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:border-[#d97706] focus:ring-2 focus:ring-amber-500/10 outline-hidden transition placeholder:text-slate-400"
                  />
                </div>
                <span className="text-[11px] text-slate-400">OTP will be sent to your email (check spam).</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3 px-5 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-1 border border-amber-100">
              <KeyRound className="w-7 h-7 text-[#d97706]" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-otp-input" className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-center">
                Enter 4-Digit OTP <span className="text-[#d97706]">*</span>
              </label>
              <input
                id="signup-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(cleaned);
                  if (error) setError("");
                }}
                placeholder="• • • •"
                required
                className="w-full text-center tracking-[0.25em] font-mono text-2xl py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:border-[#d97706] focus:ring-2 focus:ring-amber-500/10 outline-hidden transition placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || cooldown > 0}
                className="font-bold text-[#d97706] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP Code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setInfoMessage("");
                }}
                className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
              >
                Change Number
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setInfoMessage("");
                }}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <form onSubmit={handleNextProfileStep} className="space-y-3.5 animate-in fade-in">

            {/* ----------------- SUB-STEP 1: Basic & Contact Details ----------------- */}
            {profileStep === 1 && (
              <div className="space-y-3.5 animate-in slide-in-from-right-2 fade-in duration-300">
                {/* Avatar Selector */}
                <div className="flex flex-col items-center justify-center gap-2 mb-1">
                  <div className="relative group">
                    <Image
                      src={avatarUrl}
                      alt="Profile Avatar"
                      width={72}
                      height={72}
                      className="rounded-full object-cover border-2 border-amber-200 shadow-md"
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

                  <div className="flex items-center gap-2 mt-0.5">
                    {DEFAULT_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`relative w-7 h-7 rounded-full overflow-hidden border-2 transition ${avatarUrl === av.url ? "border-[#d97706] scale-110 shadow-xs" : "border-slate-200 opacity-70"
                          }`}
                      >
                        <Image src={av.url} alt={av.label} width={28} height={28} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Upload photo or choose preset avatar</span>
                </div>

                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Full Display Name <span className="text-[#d97706]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-bold focus:bg-white focus:border-[#d97706] outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Email Address Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Email ID <span className="text-[#d97706]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul.sharma@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-bold focus:bg-white focus:border-[#d97706] outline-hidden transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block pl-1">Displayed on profile & used for account recovery</span>
                </div>

                {/* Profile Gender Choice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      I Am Creating Profile For <span className="text-[#d97706]">*</span>
                    </label>
                    <span className="text-xs text-amber-700 font-semibold">
                      Looking for: {gender === "Groom" ? "👰 Bride" : "🤵 Groom"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("Groom")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${gender === "Groom"
                          ? "bg-amber-50 border-[#d97706] text-[#d97706] shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <span>🤵 Groom (Male)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGender("Bride")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${gender === "Bride"
                          ? "bg-amber-50 border-[#d97706] text-[#d97706] shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <span>👰 Bride (Female)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Matches will automatically show {gender === "Groom" ? "verified Brides (Women)" : "verified Grooms (Men)"}.
                  </p>
                </div>

                {/* Age, Height & Marital Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Age (Years)</label>
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Height</label>
                    <select
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706] cursor-pointer"
                    >
                      <option value="">Select Height</option>
                      <option value="4'10&quot;">4&apos;10&quot; (147 cm)</option>
                      <option value="5'0&quot;">5&apos;0&quot; (152 cm)</option>
                      <option value="5'1&quot;">5&apos;1&quot; (155 cm)</option>
                      <option value="5'2&quot;">5&apos;2&quot; (157 cm)</option>
                      <option value="5'3&quot;">5&apos;3&quot; (160 cm)</option>
                      <option value="5'4&quot;">5&apos;4&quot; (162 cm)</option>
                      <option value="5'5&quot;">5&apos;5&quot; (165 cm)</option>
                      <option value="5'6&quot;">5&apos;6&quot; (168 cm)</option>
                      <option value="5'7&quot;">5&apos;7&quot; (170 cm)</option>
                      <option value="5'8&quot;">5&apos;8&quot; (173 cm)</option>
                      <option value="5'9&quot;">5&apos;9&quot; (175 cm)</option>
                      <option value="5'10&quot;">5&apos;10&quot; (178 cm)</option>
                      <option value="5'11&quot;">5&apos;11&quot; (180 cm)</option>
                      <option value="6'0&quot;">6&apos;0&quot; (183 cm)</option>
                      <option value="6'1&quot;">6&apos;1&quot; (185 cm)</option>
                      <option value="6'2&quot;">6&apos;2&quot; (188 cm)</option>
                      <option value="6'3&quot;">6&apos;3&quot; (191 cm)</option>
                      <option value="6'4&quot;+">6&apos;4&quot;+ (193+ cm)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706] cursor-pointer"
                    >

                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- SUB-STEP 2: Location, Religion & Education ----------------- */}
            {profileStep === 2 && (
              <div className="space-y-3.5 animate-in slide-in-from-right-2 fade-in duration-300">
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                    <MapPin className="w-4 h-4 text-[#d97706]" />
                    <span>Location, Religion & Education</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Current City */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Current City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Kolkata, Delhi"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>

                    {/* Religion */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Religion</label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Hindu</option>
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
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Mother Tongue</label>
                      <select
                        value={motherTongue}
                        onChange={(e) => setMotherTongue(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Mother Tongue</option>
                        {MOTHER_TONGUES.map((mt) => (
                          <option key={mt} value={mt}>
                            {mt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Highest Education */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Highest Education</label>
                      <select
                        value={
                          !education
                            ? ""
                            : (EDUCATION_OPTIONS as readonly string[]).includes(education)
                              ? education
                              : education.toLowerCase().includes("b.com") || education.toLowerCase().includes("commerce")
                                ? "B.Com / M.Com / Commerce"
                                : education.toLowerCase().includes("eng") || education.toLowerCase().includes("b.tech")
                                  ? "B.Tech / B.E. / Engineering"
                                  : "Other"
                        }
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Highest Education</option>
                        {EDUCATION_OPTIONS.map((edu) => (
                          <option key={edu} value={edu}>
                            {edu}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Profession / Occupation Dropdown */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Profession / Occupation</label>
                      <select
                        value={
                          !profession
                            ? ""
                            : (OCCUPATION_OPTIONS as readonly string[]).includes(profession)
                              ? profession
                              : (profession.toLowerCase().includes("founder") || profession.toLowerCase().includes("entrepreneur"))
                                ? "Founder / Co-Founder / Entrepreneur"
                                : "Other"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfession(val);
                          if (val !== "Other") {
                            setCustomProfession("");
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Profession / Occupation</option>
                        {OCCUPATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {/* If Founder or Business Owner: allow entering Company / Startup name */}
                      {(profession === "Founder / Co-Founder / Entrepreneur" ||
                        profession === "Business Owner / Self-Employed" ||
                        profession.toLowerCase().includes("founder")) && (
                          <div className="pt-1.5 animate-in fade-in duration-200">
                            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                              Company / Startup / Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="e.g. Acme Innovations, My Tech Studio"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                            />
                          </div>
                        )}

                      {/* If Other is selected: allow typing custom profession */}
                      {(profession === "Other" || (!((OCCUPATION_OPTIONS as readonly string[]).includes(profession)) && profession !== "")) && (
                        <div className="pt-1.5 animate-in fade-in duration-200">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Specify Your Profession / Title
                          </label>
                          <input
                            type="text"
                            value={customProfession || (((OCCUPATION_OPTIONS as readonly string[]).includes(profession)) ? "" : profession)}
                            onChange={(e) => {
                              setCustomProfession(e.target.value);
                              setProfession("Other");
                            }}
                            placeholder="e.g. Graphic Designer, Freelancer, Consultant..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- SUB-STEP 3: Astrology & Horoscope (Kundli) ----------------- */}
            {profileStep === 3 && (
              <div className="space-y-3.5 animate-in slide-in-from-right-2 fade-in duration-300">
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <span>Astrology & Horoscope (Kundli)</span>
                  </h4>
                  <p className="text-xs text-slate-500 -mt-1">
                    Used for kundli compatibility scoring in matches.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Birth Time</label>
                      <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>

                    {/* Birth Place */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Birth Place</label>
                      <input
                        type="text"
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="e.g. Kolkata, West Bengal"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>

                    {/* Rashi (Moon Sign) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Rashi (Moon Sign)</label>
                      <select
                        value={rashi}
                        onChange={(e) => setRashi(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Rashi</option>
                        {RASHIS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sun Rashi (Sun Sign) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Sun Rashi (Sun Sign)</label>
                      <select
                        value={sunRashi}
                        onChange={(e) => setSunRashi(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Sun Rashi</option>
                        {SUN_RASHIS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nakshatra (Star) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Nakshatra (Star)</label>
                      <select
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Nakshatra</option>
                        {NAKSHATRAS.map((n) => (
                          <option key={n.name} value={n.name}>{n.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Manglik (Mangal Dosh) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Manglik (Mangal Dosh)</label>
                      <select
                        value={manglik}
                        onChange={(e) => setManglik(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">No</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Anshik Manglik">Anshik Manglik</option>
                      </select>
                    </div>

                    {/* Gotra */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Gotra</label>
                      <input
                        type="text"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        placeholder="e.g. Kashyap"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- SUB-STEP 4: Lifestyle & Family Details ----------------- */}
            {profileStep === 4 && (
              <div className="space-y-3.5 animate-in slide-in-from-right-2 fade-in duration-300">
                {/* LIFESTYLE CARD */}
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                    <Heart className="w-4 h-4 text-[#d97706]" />
                    <span>Lifestyle</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Diet */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Diet</label>
                      <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Vegetarian</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Jain">Jain</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>

                    {/* Smoking */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Smoking</label>
                      <select
                        value={smoking}
                        onChange={(e) => setSmoking(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">No</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Occasionally">Occasionally</option>
                      </select>
                    </div>

                    {/* Drinking */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Drinking</label>
                      <select
                        value={drinking}
                        onChange={(e) => setDrinking(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">No</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Occasionally">Occasionally</option>

                      </select>
                    </div>

                    {/* Disability */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Disability</label>
                      <select
                        value={disability}
                        onChange={(e) => setDisability(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Disability Status</option>
                        <option value="None">None</option>
                        <option value="Physical Disability">Physical Disability</option>
                        <option value="Visual Impairment">Visual Impairment</option>
                        <option value="Hearing Impairment">Hearing Impairment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FAMILY DETAILS CARD */}
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                    <Users className="w-4 h-4 text-[#d97706]" />
                    <span>Family Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Father's Occupation */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Father&apos;s Occupation</label>
                      <select
                        value={fatherOccupation}
                        onChange={(e) => setFatherOccupation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Father&apos;s Occupation</option>
                        {FATHER_OCCUPATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mother's Occupation */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Mother&apos;s Occupation</label>
                      <select
                        value={motherOccupation}
                        onChange={(e) => setMotherOccupation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Mother&apos;s Occupation</option>
                        {MOTHER_OCCUPATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Siblings */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Siblings</label>
                      <input
                        type="text"
                        value={siblings}
                        onChange={(e) => setSiblings(e.target.value)}
                        placeholder="e.g. 1 brother, 1 sister"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all"
                      />
                    </div>

                    {/* Family Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Family Type</label>
                      <select
                        value={familyType}
                        onChange={(e) => setFamilyType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Family Type</option>
                        <option value="Nuclear Family">Nuclear Family</option>
                        <option value="Joint Family">Joint Family</option>
                        <option value="Extended Family">Extended Family</option>
                      </select>
                    </div>

                    {/* Family Values */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Family Values</label>
                      <select
                        value={familyValues}
                        onChange={(e) => setFamilyValues(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Select Family Values</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Liberal">Liberal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- SUB-STEP 5: Security & Bio ----------------- */}
            {profileStep === 5 && (
              <div className="space-y-3.5 animate-in slide-in-from-right-2 fade-in duration-300">
                {/* About Myself (Bio) */}
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#d97706]" />
                      <span>About Myself (Bio)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAiBioTone("balanced");
                        setIsAiBioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-[#d97706] text-white text-xs font-extrabold shadow-2xs hover:from-amber-600 hover:to-[#b45309] cursor-pointer transition active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ AI Bio Writer</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#d97706] outline-hidden transition-all leading-relaxed"
                    placeholder="Describe your interests, lifestyle, family, and partner expectations..."
                  />
                  {/* Quick AI Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AI Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiBioTone("balanced");
                        setIsAiBioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#b45309] text-[11px] font-bold hover:bg-amber-100 cursor-pointer transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Balanced</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiBioTone("career");
                        setIsAiBioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer transition"
                    >
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>Career Focus</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiBioTone("traditional");
                        setIsAiBioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer transition"
                    >
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Family Values</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiBioTone("short");
                        setIsAiBioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer transition"
                    >
                      <Zap className="w-3 h-3 text-slate-400" />
                      <span>Short</span>
                    </button>
                  </div>
                </div>

                {/* Password (optional, for password login later) */}
                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#d97706]" />
                      <span>Create Account Password (Optional)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You can always log in via Mobile OTP or set a password for instant sign-in.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password (min 6 chars)"
                        className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-hidden focus:bg-white focus:border-[#d97706]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-3.5 pt-1">
              {profileStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setProfileStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
                  disabled={isLoading}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : profileStep < 5 ? (
                  <>
                    <span>Next: {
                      profileStep === 1 ? "Location & Religion" :
                        profileStep === 2 ? "Kundli & Horoscope" :
                          profileStep === 3 ? "Lifestyle & Family" :
                            "Account Security"
                    }</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Save Profile & Start Matching</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Social Proof Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 font-medium">
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
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            {onOpenLogin ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:border-[#d97706] hover:text-[#d97706] transition-all cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="w-full inline-block py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:border-[#d97706] hover:text-[#d97706] transition-all text-center"
              >
                Already have an account? Sign In
              </Link>
            )}
          </div>
        )}

        {/* AI Bio Writer Modal */}
        <AiBioModal
          isOpen={isAiBioOpen}
          onClose={() => setIsAiBioOpen(false)}
          onSelectBio={(newBio) => setBio(newBio)}
          profile={{
            name: displayName,
            gender,
            age,
            profession,
            companyName,
            education,
            city,
            religion,
            motherTongue,
            maritalStatus,
            familyValues,
            diet,
          }}
          initialBio={bio}
          initialTone={aiBioTone}
        />

      </div>
    </div>
  );
}
