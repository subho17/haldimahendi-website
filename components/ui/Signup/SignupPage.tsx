"use client";

import React, { useState } from "react";
import { User, Heart, Mail, Lock, Phone, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SignupPageProps {
  onOpenLogin?: () => void;
  isModal?: boolean;
}

export default function SignupPage({ onOpenLogin, isModal = false }: SignupPageProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [profileFor, setProfileFor] = useState("Self");
  const [gender, setGender] = useState("Male");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Step 2 State
  const [religion, setReligion] = useState("Hindu");
  const [motherTongue, setMotherTongue] = useState("Hindi");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [city, setCity] = useState("Mumbai");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("Registration Successful! Welcome to Shaadi.com!");
    }, 1200);
  };

  return (
    <div className={`w-full font-sans ${isModal ? "p-2 sm:p-4" : "p-4 sm:p-8"}`}>
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 p-6 sm:p-8 max-w-lg w-full mx-auto text-left relative overflow-hidden transition-all duration-300">
        
        {/* Top Trust Banner */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#e53238] font-bold text-xs">
            <Heart className="w-3.5 h-3.5 fill-[#e53238]" />
            <span>#1 Trusted Matchmaking Service</span>
          </div>
          <span className="text-xs font-bold text-gray-400">Step {step} of 2</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#e53238] to-orange-500 h-full transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        {/* Title */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 ? "Create Free Account ✨" : "Personal & Background Details 💍"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">
            {step === 1
              ? "Join millions finding life partners with shared culture & values."
              : "Help us find matches tailored to your community & lifestyle."}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            
            {/* Create Profile For */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Create Profile For <span className="text-[#e53238]">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {["Self", "Son", "Daughter", "Brother", "Sister"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setProfileFor(opt)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      profileFor === opt
                        ? "border-[#e53238] bg-red-50/80 text-[#e53238]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Gender <span className="text-[#e53238]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      gender === g
                        ? "border-[#e53238] bg-red-50/80 text-[#e53238]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{g}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Full Name <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name of candidate"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Mobile Number <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Email Address <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Password <span className="text-[#e53238]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e53238] hover:bg-[#c92429] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* STEP 2: Cultural Background */}
        {step === 2 && (
          <form onSubmit={handleFinalRegister} className="space-y-4">
            
            {/* Religion */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Religion <span className="text-[#e53238]">*</span>
              </label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] outline-hidden cursor-pointer"
              >
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Parsi">Parsi</option>
              </select>
            </div>

            {/* Mother Tongue */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Mother Tongue <span className="text-[#e53238]">*</span>
              </label>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] outline-hidden cursor-pointer"
              >
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Punjabi">Punjabi</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Marital Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Marital Status <span className="text-[#e53238]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Never Married", "Divorced", "Widowed"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMaritalStatus(st)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      maritalStatus === st
                        ? "border-[#e53238] bg-red-50/80 text-[#e53238]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Current City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                Living City <span className="text-[#e53238]">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                required
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:border-[#e53238] outline-hidden"
              />
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
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
                    <span>Register Free</span>
                    <CheckCircle className="w-4 h-4" />
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
