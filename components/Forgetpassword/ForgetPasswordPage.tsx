"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Step = "mobile" | "verify" | "success";

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<Step>("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to send OTP. Please try again.");
        return;
      }
      setStep("verify");
      setCooldown(30);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      setError("Please enter the OTP code sent to your mobile.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, otp, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to reset password. Please try again.");
        return;
      }
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 sm:p-10 max-w-md w-full relative overflow-hidden">

        {/* STEP 1: Enter Mobile to receive OTP */}
        {step === "mobile" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 border border-red-100">
              <KeyRound className="w-6 h-6 text-[#e53238]" />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Reset Password</h1>
              <p className="text-gray-500 text-sm">Enter your registered mobile number to receive an OTP.</p>
            </div>

            <div className="border-b border-dashed border-gray-200 my-6" />

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-left space-y-1.5">
              <label htmlFor="mobile" className="text-xs font-semibold text-gray-700 block">
                Mobile Number <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition text-sm placeholder:text-gray-400 font-normal shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send OTP"
              )}
            </button>

            <div className="pt-2 text-center">
              <Link href="/auth/login" className="text-xs font-semibold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Verify OTP + Set New Password */}
        {step === "verify" && (
          <form onSubmit={handleResetPassword} className="space-y-5 text-left">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 border border-red-100">
                <KeyRound className="w-6 h-6 text-[#e53238]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Set new password</h2>
              <p className="text-gray-500 text-xs mt-1">
                OTP sent to <span className="font-semibold text-gray-800">+91 {mobileNumber}</span> · at least 6 characters
              </p>
            </div>

            <div className="border-b border-dashed border-gray-200 my-2" />

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                required
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#e53238] outline-hidden font-medium"
              />
              <div className="flex items-center justify-between pt-1">
                {cooldown > 0 ? (
                  <span className="text-[11px] text-gray-400">Resend OTP in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[11px] font-semibold text-[#e53238] hover:text-[#c92429] cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep("mobile")}
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Change number
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-4 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#e53238] outline-hidden font-medium"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Re-enter password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#e53238] outline-hidden font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Reset Success */}
        {step === "success" && (
          <div className="space-y-5 text-center">
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
                className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 transition-all text-sm inline-block text-center"
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