"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Crown, Check, Loader2 } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "Unlimited matching",
      "Send & accept interests",
      "Real-time chat with connections",
      "Personal profile & photo upload",
      "Basic search",
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹999",
    period: "/ 3 months",
    features: [
      "Everything in Free",
      "View member contact details",
      "See who viewed your profile",
      "Chat priority support",
      "Profile highlighted in search",
      "Ad-free experience",
    ],
    cta: "Upgrade to Premium",
    highlight: true,
  },
  {
    name: "Premium Plus",
    price: "₹2,499",
    period: "/ 12 months",
    features: [
      "Everything in Premium",
      "Personal matchmaking manager",
      "Advanced astro & kundli matching",
      "Profile boost twice a month",
      "Dedicated support line",
    ],
    cta: "Upgrade to Plus",
    highlight: false,
  },
];

export default function MembershipPage() {
  const [paying, setPaying] = useState<string | null>(null);

  const selectPlan = (name: string) => {
    if (name === "Free") return;
    setPaying(name);
    // Payment gateway integration comes in a later phase.
    setTimeout(() => {
      setPaying(null);
      alert(`Payment gateway for "${name}" is coming soon. Stay tuned!`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Crown className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Premium Membership
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Unlock more ways to connect with your perfect match.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-3xl border p-6 flex flex-col shadow-lg ${
                plan.highlight ? "border-[#e53238] ring-2 ring-[#e53238]/20" : "border-gray-100"
              }`}
            >
              {plan.highlight && (
                <span className="self-start px-2.5 py-1 rounded-full bg-[#e53238] text-white text-[10px] font-black uppercase tracking-wider mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="font-extrabold text-gray-900 text-lg">{plan.name}</h3>
              <p className="mt-2 mb-4">
                <span className="text-2xl font-black text-gray-900">{plan.price}</span>{" "}
                <span className="text-xs text-gray-400 font-semibold">{plan.period}</span>
              </p>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => selectPlan(plan.name)}
                disabled={plan.name === "Free" || paying !== null}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                  plan.highlight
                    ? "bg-[#e53238] text-white shadow-md hover:bg-[#c92429]"
                    : plan.name === "Free"
                    ? "bg-gray-100 text-gray-600"
                    : "border border-gray-200 text-gray-800 hover:bg-gray-50"
                }`}
              >
                {paying === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </span>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Payment gateway integration is planned. Prices are indicative and subject to change.
        </p>
      </main>
      <Footer />
    </div>
  );
}