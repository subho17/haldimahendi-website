"use client";

import React from "react";
import { ArrowUpRight, Wifi } from "lucide-react";

interface AdminCreditCardProps {
  totalGoal?: string;
  cardNumber?: string;
  expiry?: string;
  weeklyRevenue?: string;
  revenueIncrease?: string;
}

export default function AdminCreditCard({
  totalGoal = "$ 78,989.09",
  cardNumber = "**** 909090",
  expiry = "EXP 09/26",
  weeklyRevenue = "+3,945 USD",
  revenueIncrease = "+12.8%",
}: AdminCreditCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between h-full font-sans">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Payment Goal</h3>
          <p className="text-[11px] text-slate-400 font-medium">Total amount goal</p>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Green VISA Credit Card */}
      <div className="w-full bg-[#00875A] text-white rounded-2xl p-5 shadow-lg shadow-[#00875A]/20 flex flex-col justify-between mb-4 relative overflow-hidden">
        {/* Subtle background glow circle */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-black italic tracking-wider">VISA</span>
          <Wifi className="w-5 h-5 text-white/80 rotate-90" />
        </div>

        <div>
          <p className="text-[11px] text-white/70 font-medium mb-0.5">Credit Card</p>
          <p className="text-2xl font-extrabold tracking-tight mb-4">{totalGoal}</p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/80">
          <span>{cardNumber}</span>
          <span>{expiry}</span>
        </div>
      </div>

      {/* Weekly Revenue Widget */}
      <div className="pt-2">
        <p className="text-[11px] text-slate-400 font-semibold mb-1">Weekly Revenue</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-extrabold text-slate-900">{weeklyRevenue}</span>
          <span className="px-2.5 py-1 rounded-full bg-[#00875A]/10 text-[#00875A] text-[11px] font-bold">
            {revenueIncrease}
          </span>
        </div>
      </div>
    </div>
  );
}
