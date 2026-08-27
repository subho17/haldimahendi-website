"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Smartphone,
  MessageSquare,
  Timer,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";

interface LoginPageProps {
  onOpenForgotPassword?: () => void;
  onOpenSignup?: () => void;
  isModal?: boolean;
}

const parseGoogleCredential = (credentialToken: string) => {
  try {
    const base64Url = credentialToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

type LoginMode = "otp" | "password";

export default function LoginPage({
  onOpenForgotPassword,
  onOpenSignup,
  isModal = false,
}: LoginPageProps) {
  const { login } = useAuth();
  const router = useRouter();

  // Mode: OTP is the default because signup is OTP-based (no password is set).
  const [mode, setMode] = useState<LoginMode>("otp");

  // Password mode fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP mode fields
  const [otpMobile, setOtpMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const isRealClient =
    clientId &&
    !clientId.includes("YOUR_GOOGLE_CLIENT_ID") &&
    clientId.endsWith(".apps.googleusercontent.com");

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
      cooldownTimerRef.current = null;
    };
  }, [cooldown]);

  const cleanMobile = (value: string) => value.replace(/\D/g, "").slice(-10);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your Profile ID, Email, or Mobile Number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      const p = data.profile;
      login({
        profileId: p?.id || undefined,
        mobileNumber: p?.mobileNumber || identifier,
        email: p?.email || "",
        name: p?.name || `Member (${identifier.slice(0, 8)})`,
        display_name: p?.name,
        avatarUrl: p?.avatarUrl || "/images/default-avatar.png",
        avatar_url: p?.avatarUrl,
        provider: "password",
        gender: p?.gender,
        maritalStatus: p?.maritalStatus,
        city: p?.city,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("[Login] Password login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = cleanMobile(otpMobile);
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setOtpSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setOtp("");
        setCooldown(30);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("[Login] OTP send failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanMobile(otpMobile);
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!otp.trim()) {
      setError("Please enter the OTP code.");
      return;
    }
    setError("");
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: clean, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid OTP code.");
        return;
      }

      // Load the member's saved profile so they land back in their account.
      let profile: {
        id?: string;
        name?: string;
        avatarUrl?: string | null;
        gender?: string | null;
        maritalStatus?: string | null;
        city?: string | null;
      } | null = null;
      try {
        const pRes = await fetch(`/api/profile?id=${encodeURIComponent(clean)}`);
        const pData = await pRes.json();
        if (pData.success) profile = pData.profile;
      } catch (err) {
        console.warn("[Login] Could not load profile after OTP verify:", err);
      }

      login({
        profileId: profile?.id || undefined,
        mobileNumber: clean,
        name: profile?.name || `Member (${clean.slice(-4)})`,
        display_name: profile?.name || undefined,
        avatarUrl: profile?.avatarUrl || "/images/default-avatar.png",
        avatar_url: profile?.avatarUrl || undefined,
        provider: "otp",
        gender: profile?.gender || undefined,
        maritalStatus: profile?.maritalStatus || undefined,
        city: profile?.city || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("[Login] OTP verify failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Google OAuth Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json();
        login({
          name: googleUser.name || "Google Member",
          email: googleUser.email || "user@gmail.com",
          avatarUrl: googleUser.picture || "/images/default-avatar.png",
          provider: "google",
          profileId: googleUser.sub ? `SH${googleUser.sub.slice(-6)}` : undefined,
        });
        router.push("/dashboard");
      } catch {
        login({
          name: "Google Member",
          email: "googleuser@gmail.com",
          provider: "google",
        });
        router.push("/dashboard");
      }
    },
    onError: () => {
      login({
        name: "Google Member",
        email: "googleuser@gmail.com",
        provider: "google",
      });
      router.push("/dashboard");
    },
  });

  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (provider === "google") {
      if (isRealClient) {
        try {
          googleLogin();
          return;
        } catch {
          // fallback
        }
      }

      login({ name: "Google Member", email: "googleuser@gmail.com", provider: "google" });
      router.push("/dashboard");
    } else {
      login({ name: "Facebook Member", email: "facebookuser@gmail.com", provider: "facebook" });
      router.push("/dashboard");
    }
  };

  return (
    <div className={`w-full font-sans ${isModal ? "p-2 sm:p-4" : "p-4 sm:p-8"}`}>
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 p-6 sm:p-8 max-w-md w-full mx-auto text-left relative overflow-hidden transition-all duration-300">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#d97706] text-xs font-bold border border-red-100">
            <ShieldCheck className="w-4 h-4 text-[#d97706]" />
            <span>100% Safe & Secure Login</span>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1 mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Member Login 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">
            Welcome back! Sign in with OTP or password to access your profile.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("otp");
              setError("");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "otp"
                ? "bg-white text-[#d97706] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Login with OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError("");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "password"
                ? "bg-white text-[#d97706] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            Login with Password
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "otp" ? (
          <>
            {!isOtpSent ? (
              /* Step 1: Enter mobile & send OTP */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                    Mobile Number <span className="text-[#d97706]">*</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={otpMobile}
                      onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 10-digit mobile number"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpSending || cleanMobile(otpMobile).length < 10}
                  className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
                >
                  {otpSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP & verify */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <Timer className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter the 4-digit OTP"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    OTP sent to +91 {cleanMobile(otpMobile)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying || otp.trim().length === 0}
                  className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
                >
                  {otpVerifying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={cooldown > 0}
                    className="font-bold text-[#d97706] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? (
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" /> Resend in {cooldown}s
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* Password Login Form */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Email / Mobile / Profile ID <span className="text-[#d97706]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. SH1234567 or user@mail.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password <span className="text-[#d97706]">*</span>
                </label>
                {onOpenForgotPassword ? (
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-xs font-semibold text-[#d97706] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                ) : (
                  <Link
                    href="/auth/forgetpassowrd"
                    className="text-xs font-semibold text-[#d97706] hover:underline"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  <span>Login to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Social Login Section */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase font-semibold">
            Or Continue With
          </span>
        </div>

        {/* Official Google Login Button if configured */}
        {isRealClient && (
          <div className="mb-3 flex justify-center w-full">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const googleUser = parseGoogleCredential(credentialResponse.credential || "");
                login({
                  name: googleUser?.name || "Google Member",
                  email: googleUser?.email || "user@gmail.com",
                  avatarUrl: googleUser?.picture || "/images/default-avatar.png",
                  provider: "google",
                  profileId: googleUser?.sub ? `SH${googleUser.sub.slice(-6)}` : undefined,
                });
                router.push("/dashboard");
              }}
              onError={() => {
                handleSocialLogin("google");
              }}
              theme="outline"
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-2">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Google</span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase font-semibold">
            New to Shaadi.com?
          </span>
        </div>

        {/* Bottom Switch to Sign Up */}
        <div className="text-center">
          {onOpenSignup ? (
            <button
              type="button"
              onClick={onOpenSignup}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/30 transition-all cursor-pointer"
            >
              Create New Profile - Free
            </button>
          ) : (
            <Link
              href="/auth/signup"
              className="w-full inline-block py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/30 transition-all text-center"
            >
              Create New Profile - Free
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
