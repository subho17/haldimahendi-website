"use client";

import React from "react";
import { ArrowUpRight, ArrowUp, ArrowDown } from "lucide-react";

interface AdminBalanceCardProps {
  balance?: string;
  onSendMoney?: () => void;
  onReceiveMoney?: () => void;
}

export default function AdminBalanceCard({
  balance = "$32,678.90",
  onSendMoney,
  onReceiveMoney,
}: AdminBalanceCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs flex flex-col justify-between h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
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

      {/* Balance Amount */}
      <div className="text-center my-2">
        <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Total Balance</p>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{balance}</h2>
      </div>

      {/* Area Line Chart SVG */}
      <div className="w-full h-24 my-2 relative">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00875A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00875A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d="M 0,50 Q 30,10 60,35 T 120,25 T 180,45 T 240,15 T 300,30 L 300,80 L 0,80 Z"
            fill="url(#balanceGradient)"
          />

          {/* Smooth Stroke Line */}
          <path
            d="M 0,50 Q 30,10 60,35 T 120,25 T 180,45 T 240,15 T 300,30"
            fill="none"
            stroke="#00875A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onSendMoney}
          className="flex-1 max-w-[120px] py-2.5 px-4 rounded-full bg-[#00875A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#00875A]/20 hover:bg-[#00754e] transition-colors cursor-pointer"
        >
          <span>Send</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onReceiveMoney}
          className="flex-1 max-w-[120px] py-2.5 px-4 rounded-full bg-white border border-gray-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span>Receive</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
