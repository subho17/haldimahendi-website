"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
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

export default function LoginPage({
  onOpenForgotPassword,
  onOpenSignup,
  isModal = false,
}: LoginPageProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const isRealClient =
    clientId &&
    !clientId.includes("YOUR_GOOGLE_CLIENT_ID") &&
    clientId.endsWith(".apps.googleusercontent.com");

  const handlePasswordLogin = (e: React.FormEvent) => {
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

    setTimeout(() => {
      setIsLoading(false);
      login({
        mobileNumber: identifier.replace(/\D/g, "") || "9876543210",
        name: `Member (${identifier.slice(0, 8)})`,
        provider: "password",
      });
      router.push("/dashboard");
    }, 600);
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#e53238] text-xs font-bold border border-red-100">
            <ShieldCheck className="w-4 h-4 text-[#e53238]" />
            <span>100% Safe & Secure Login</span>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Member Login 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">
            Welcome back! Enter your details to access your profile.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Login Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Email / Mobile / Profile ID <span className="text-[#e53238]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. SH1234567 or user@mail.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password <span className="text-[#e53238]">*</span>
              </label>
              {onOpenForgotPassword ? (
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs font-semibold text-[#e53238] hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              ) : (
                <Link
                  href="/auth/forgetpassowrd"
                  className="text-xs font-semibold text-[#e53238] hover:underline"
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
                className="w-full pl-10 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
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
            className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
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
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#e53238] hover:text-[#e53238] hover:bg-red-50/30 transition-all cursor-pointer"
            >
              Create New Profile - Free
            </button>
          ) : (
            <Link
              href="/auth/signup"
              className="w-full inline-block py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#e53238] hover:text-[#e53238] hover:bg-red-50/30 transition-all text-center"
            >
              Create New Profile - Free
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
