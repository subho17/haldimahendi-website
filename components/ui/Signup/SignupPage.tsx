"use client";

import React, { useState } from "react";
import { Heart, Smartphone, KeyRound, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SignupPageProps {
  onOpenLogin?: () => void;
  isModal?: boolean;
}

export default function SignupPage({ onOpenLogin, isModal = false }: SignupPageProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Step 1: Send Real OTP via /api/otp/send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
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

      setOtpSent(true);
      if (data.demoOtp) {
        setInfoMessage(`[Your Verification Code: ${data.demoOtp}]`);
      } else {
        setInfoMessage(`OTP Sent to +91 ${mobileNumber}`);
      }
    } catch {
      setIsLoading(false);
      setError("Network error sending OTP. Please try again.");
    }
  };

  // Step 2: Verify OTP via /api/otp/verify
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

      alert(`Mobile +91 ${mobileNumber} verified successfully! Profile registration complete 🎉`);
    } catch {
      setIsLoading(false);
      setError("Network error verifying OTP. Please try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.demoOtp) {
        setInfoMessage(`[Your Verification Code: ${data.demoOtp}]`);
      } else {
        setInfoMessage(`OTP resent to +91 ${mobileNumber}`);
      }
    } catch {
      setIsLoading(false);
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className={`w-full font-sans ${isModal ? "p-2 sm:p-4" : "p-4 sm:p-8"}`}>
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 p-6 sm:p-8 max-w-md w-full mx-auto text-left relative overflow-hidden transition-all duration-300">
        
        {/* Top Trust Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#e53238] font-bold text-xs">
            <Heart className="w-3.5 h-3.5 fill-[#e53238]" />
            <span>100% Verified Profile Setup</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {!otpSent ? "Create New Profile ✨" : "Verify Mobile OTP 📱"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">
            {!otpSent
              ? "Enter your mobile number to receive a verification OTP code."
              : `We sent a 4-digit code to +91 ${mobileNumber}.`}
          </p>
        </div>

        {/* Info / Code Banner */}
        {infoMessage && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 text-sm font-bold p-3 rounded-xl border border-emerald-200 animate-in fade-in text-center shadow-xs">
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form 1: Enter Mobile Number */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Mobile Number <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
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
                  <span>Get Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Form 2: Enter OTP Code */
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2 border border-red-100">
              <KeyRound className="w-8 h-8 text-[#e53238]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider text-center">
                Enter 4-Digit OTP <span className="text-[#e53238]">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1 2 3 4"
                required
                className="w-full text-center tracking-widest text-2xl py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-extrabold focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="font-bold text-[#e53238] hover:underline cursor-pointer"
              >
                Resend OTP Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
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
                  setOtpSent(false);
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
                className="w-2/3 bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Create</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase font-semibold">
            Already Registered?
          </span>
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          {onOpenLogin ? (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#e53238] hover:text-[#e53238] hover:bg-red-50/30 transition-all cursor-pointer"
            >
              Sign In to Your Account
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="w-full inline-block py-3 px-4 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:border-[#e53238] hover:text-[#e53238] hover:bg-red-50/30 transition-all text-center"
            >
              Sign In to Your Account
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
