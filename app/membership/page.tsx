"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Crown, Check, X, Lock, ShieldCheck, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMounted } from "@/hooks/useMounted";

interface Plan {
  id: string;
  tier: string;
  name: string;
  price: string;
  periodLabel: string;
  features: string[];
  highlight: boolean;
  badgeLabel: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    tier: "free",
    name: "Free",
    price: "₹0",
    periodLabel: "forever",
    features: [
      "Unlimited matching",
      "Send & accept interests",
      "Real-time chat with connections",
      "Personal profile & photo upload",
      "Basic search",
    ],
    highlight: false,
    badgeLabel: "",
  },
  {
    id: "premium",
    tier: "premium",
    name: "Premium",
    price: "₹999",
    periodLabel: "/ 3 months",
    features: [
      "Everything in Free",
      "View member contact details",
      "See who viewed your profile",
      "Chat priority support",
      "Profile highlighted in search",
      "Ad-free experience",
    ],
    highlight: true,
    badgeLabel: "Premium",
  },
  {
    id: "premium_plus",
    tier: "premium_plus",
    name: "Premium Plus",
    price: "₹2,499",
    periodLabel: "/ 12 months",
    features: [
      "Everything in Premium",
      "Personal matchmaking manager",
      "Advanced astro & kundli matching",
      "Profile boost twice a month",
      "Dedicated support line",
    ],
    highlight: false,
    badgeLabel: "Premium Plus",
  },
];

interface MembershipStatus {
  tier: string;
  expiresAt: string | null;
  isPremium: boolean;
  plan: Plan | null;
}

const FREE_MEMBERSHIP: MembershipStatus = { tier: "free", expiresAt: null, isPremium: false, plan: null };

function formatExpiry(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MembershipPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const mounted = useMounted();

  const [status, setStatus] = useState<MembershipStatus>(FREE_MEMBERSHIP);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalPrice: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const userId =
    user?.profileId ||
    user?.mobile_number ||
    user?.mobileNumber ||
    user?.email ||
    "";

  useEffect(() => {
    if (!mounted || isLoading || !isAuthenticated || !userId) return;
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/membership?userId=${encodeURIComponent(userId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data.membership) setStatus(data.membership);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [mounted, isLoading, isAuthenticated, userId]);

  const openCheckout = (plan: Plan) => {
    setFormError("");
    setMessage("");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setStep("form");
    setSelectedPlan(plan);
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiryInput = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim() || !selectedPlan) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, planId: selectedPlan.id, userId }),
      });
      const data = await res.json();
      if (data?.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
        });
        setCouponCode("");
      } else {
        setCouponError(data?.message || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!selectedPlan) return;
    if (!cardName.trim()) return setFormError("Please enter the name on the card.");
    if (cardNumber.replace(/\D/g, "").length < 12) return setFormError("Please enter a valid card number.");
    if (cardExpiry.length < 5) return setFormError("Please enter a valid expiry (MM/YY).");
    if (cardCvv.length < 3) return setFormError("Please enter a valid CVV.");

    setStep("processing");
    // Simulated payment gateway: authorize + process.
    await new Promise((r) => setTimeout(r, 1800));

    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId: selectedPlan.id, couponCode: appliedCoupon?.code || "" }),
      });
      const data = await res.json();
      if (data?.success && data.membership) {
        setStatus(data.membership);
        setStep("success");
        setAppliedCoupon(null);
      } else {
        setFormError(data?.message || "Payment failed. Please try again.");
        setStep("form");
      }
    } catch {
      setFormError("Network error while processing payment. Please try again.");
      setStep("form");
    }
  };

  const switchToFree = async () => {
    if (!userId || !status.isPremium) return;
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId: "free" }),
      });
      const data = await res.json();
      if (data?.success) {
        setStatus(FREE_MEMBERSHIP);
        setMessage("You are now on the Free plan.");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const currentPlanName = status.isPremium
    ? status.plan?.badgeLabel || (status.tier === "premium" ? "Premium" : status.tier)
    : "Free";

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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {isAuthenticated && (
              <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                      status.isPremium
                        ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {status.isPremium ? <Crown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {currentPlanName}
                  </span>
                  <div className="text-sm">
                    <p className="font-bold text-gray-900">
                      {status.isPremium ? "Active Premium Membership" : "You are on the Free plan"}
                    </p>
                    {status.isPremium && status.expiresAt ? (
                      <p className="text-xs text-gray-500">Valid until {formatExpiry(status.expiresAt)}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Upgrade to unlock premium benefits</p>
                    )}
                  </div>
                </div>
                {status.isPremium && (
                  <button
                    type="button"
                    onClick={switchToFree}
                    className="text-xs font-bold text-gray-500 hover:text-[#e53238] underline underline-offset-2 cursor-pointer"
                  >
                    Switch to Free
                  </button>
                )}
              </div>
            )}

            {message && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4" /> {message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PLANS.map((plan) => {
                const isCurrent = status.tier === plan.tier;
                return (
                  <div
                    key={plan.id}
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
                      <span className="text-xs text-gray-400 font-semibold">{plan.periodLabel}</span>
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
                      onClick={() => {
                        if (plan.tier === "free") return switchToFree();
                        openCheckout(plan);
                      }}
                      disabled={isCurrent || !isAuthenticated}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                        plan.highlight
                          ? "bg-[#e53238] text-white shadow-md hover:bg-[#c92429]"
                          : plan.tier === "free"
                          ? "bg-gray-100 text-gray-600"
                          : "border border-gray-200 text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : plan.tier === "free"
                        ? "Switch to Free"
                        : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-6">
              Demo checkout — no real payment is processed. Prices are indicative and subject to change.
            </p>
          </>
        )}
      </main>

      {/* Simulated Checkout Modal */}
      {selectedPlan && step !== "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">
                {step === "form" ? "Secure Checkout" : "Processing Payment"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                disabled={step === "processing"}
                className="text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-40"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-gray-900">{selectedPlan.name} Membership</p>
                  <p className="text-xs text-gray-500">{selectedPlan.periodLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">{selectedPlan.price}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">incl. of all taxes</p>
                </div>
              </div>
            </div>

            {step === "form" ? (
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    Name on Card
                  </label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    Card Number
                  </label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                      Expiry
                    </label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                      CVV
                    </label>
                    <input
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••"
                      type="password"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                    />
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="space-y-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-700">
                          {appliedCoupon.code} applied
                        </span>
                        <span className="text-xs text-emerald-600">−₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-emerald-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e53238]/40"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#e53238] text-white text-sm font-bold disabled:opacity-60 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {validatingCoupon ? "Validating..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs font-semibold text-rose-600">{couponError}</p>
                  )}
                </div>

                {formError && (
                  <p className="text-xs font-semibold text-rose-600">{formError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#e53238] text-white text-sm font-bold shadow-md hover:bg-[#c92429] transition-colors cursor-pointer"
                >
                  Pay {selectedPlan.price}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                  <Lock className="w-3 h-3" /> This is a demo checkout — no real payment is taken.
                </p>
              </form>
            ) : (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-700">Authorizing payment…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {selectedPlan && step === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Crown className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Welcome to {selectedPlan.name}!
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Your premium membership is active
              {status.expiresAt ? ` until ${formatExpiry(status.expiresAt)}` : ""}.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4" /> {selectedPlan.badgeLabel} badge enabled on your profile
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-6 w-full py-3 rounded-xl bg-[#e53238] text-white text-sm font-bold shadow-md hover:bg-[#c92429] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}