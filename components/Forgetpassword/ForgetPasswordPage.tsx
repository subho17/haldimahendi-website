"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<"email" | "sent" | "reset" | "success">("email");
  const [email, setEmail] = useState("hello@alignui.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate password strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("sent");
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 900);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center relative overflow-hidden transition-all duration-300">
        
        {/* STEP 1: Request Password Reset */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {/* Top Lock Badge */}
            <div className="w-16 h-16 rounded-full bg-gray-100/80 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100 text-gray-700">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm font-normal">
                Enter your email to reset your password.
              </p>
            </div>

            {/* Dashed Line Divider */}
            <div className="border-b border-dashed border-gray-200 my-6 w-full" />

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Field */}
            <div className="text-left space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-700 block">
                Email Address <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@alignui.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 outline-none transition text-sm placeholder:text-gray-400 font-normal shadow-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2d2d2d] hover:bg-black text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-gray-900/10 transition-all duration-200 hover:shadow-xl active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Footer Section */}
            <div className="pt-2 text-center space-y-1">
              <p className="text-xs text-gray-500">Don’t have access anymore?</p>
              <button
                type="button"
                onClick={() => setStep("reset")}
                className="text-xs font-semibold text-gray-900 underline underline-offset-4 hover:text-orange-600 transition inline-block cursor-pointer"
              >
                Try another method
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Email Sent Confirmation */}
        {step === "sent" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
              <p className="text-gray-500 text-sm">
                We sent a password reset link to <br />
                <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            <div className="border-b border-dashed border-gray-200 my-4" />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setStep("reset")}
                className="w-full bg-[#2d2d2d] hover:bg-black text-white font-medium py-3 px-4 rounded-xl text-sm transition shadow-md cursor-pointer"
              >
                Enter New Password Directly
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 py-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to enter email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Enter New Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-fadeIn text-left">
            {/* Top Key Icon */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3 border border-orange-100">
                <KeyRound className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Set new password</h2>
              <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters.</p>
            </div>

            <div className="border-b border-dashed border-gray-200 my-4" />

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-4 pr-10 py-3 bg-gray-100/80 text-gray-900 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength 4-Bar Segment Indicator */}
              <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                {[1, 2, 3, 4].map((bar) => {
                  let barBg = "bg-gray-200";
                  if (strengthScore >= bar) {
                    if (strengthScore === 1) barBg = "bg-red-500";
                    else if (strengthScore === 2) barBg = "bg-orange-500";
                    else if (strengthScore === 3) barBg = "bg-amber-400";
                    else barBg = "bg-emerald-500";
                  }
                  return <div key={bar} className={`h-1.5 rounded-full transition-all duration-300 ${barBg}`} />;
                })}
              </div>
            </div>

            {/* Re-enter Password Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-gray-700 block">Re-enter password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-gray-100/80 text-gray-900 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#868e96] hover:bg-[#6c757d] text-white font-medium py-3 px-4 rounded-full transition text-sm shadow-md mt-4 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? "Updating..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-xs text-gray-500 hover:text-gray-800 text-center flex items-center justify-center gap-1 pt-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to enter email
            </button>
          </form>
        )}

        {/* STEP 4: Reset Success */}
        {step === "success" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">Password Reset Complete</h2>
            <p className="text-gray-500 text-sm">
              Your password has been successfully updated. You can now log in with your new password.
            </p>

            <div className="pt-4">
              <Link
                href="/auth/login"
                className="w-full bg-[#2d2d2d] hover:bg-black text-white font-medium py-3 px-4 rounded-xl text-sm transition shadow-md inline-block text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
