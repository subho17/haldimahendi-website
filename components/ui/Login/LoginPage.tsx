"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface LoginPageProps {
  onOpenForgotPassword?: () => void;
  onOpenSignup?: () => void;
  isModal?: boolean;
}

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
      });
      router.push("/dashboard");
    }, 600);
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

        {/* Divider */}
        <div className="relative my-6 text-center">
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
