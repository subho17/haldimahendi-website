"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { ShieldCheck, AlertTriangle, UserCheck, Lock, Heart, Eye } from "lucide-react";

const TIPS = [
  {
    Icon: ShieldCheck,
    title: "Verify first, trust later",
    body: "Chat only with accepted connections and never share your OTP, banking, or ID details with anyone on the platform.",
  },
  {
    Icon: UserCheck,
    title: "Use video calls",
    body: "Prefer a video conversation before meeting in person. It helps confirm the person matches their profile.",
  },
  {
    Icon: Lock,
    title: "Keep sensitive data private",
    body: "Your phone number and address are never shown to other members. Never share them in chat before you are comfortable.",
  },
  {
    Icon: Heart,
    title: "Report suspicious behaviour",
    body: "If someone asks for money, shares inappropriate content, or seems fraudulent, report and block them immediately.",
  },
  {
    Icon: Eye,
    title: "Meet in public places",
    body: "For your first in-person meeting, choose a busy public venue and inform a friend or family member about your plans.",
  },
  {
    Icon: AlertTriangle,
    title: "Red flags to watch for",
    body: "Requests for quick marriage payments, inconsistent profile details, or pressure to move off the platform are warning signs.",
  },
];

export default function SafeOnlinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Be Safe Online
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg mx-auto">
            Your safety is our priority. Follow these simple guidelines to keep your journey
            to finding a life partner secure and scam-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 text-[#d97706] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-red-50/70 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-xs text-gray-700 font-semibold">
            Facing any issue or suspecting fraud? Contact us at{" "}
            <a href="mailto:help@shaadi.com" className="text-[#d97706] font-bold underline">
              help@shaadi.com
            </a>{" "}
            or call 1800-123-4567.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
