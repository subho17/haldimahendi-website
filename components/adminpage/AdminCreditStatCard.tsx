/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { CreditCard, ArrowUpRight } from "lucide-react";

interface AdminCreditStatCardProps {
  creditAmount?: string;
  creditGrowth?: string;
  onOpenRecipients?: () => void;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
];

export default function AdminCreditStatCard({
  creditAmount = "$8,945.89",
  creditGrowth = "+12.8%",
  onOpenRecipients,
}: AdminCreditStatCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs flex flex-col justify-between font-sans">
      {/* Top Credit Stat */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-slate-700">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Amount of credit</h3>
            <p className="text-[10px] text-slate-400 font-medium">Total refund amount with fee</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{creditAmount}</h2>
          <span className="px-2.5 py-1 rounded-full bg-[#00875A]/10 text-[#00875A] text-[11px] font-bold">
            {creditGrowth}
          </span>
        </div>
      </div>

      {/* Mandatory Payments / Avatars Sub-card */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Mandatory Payments</h4>
            <p className="text-[10px] text-slate-400 font-medium">Recent payments</p>
          </div>
          <button
            type="button"
            onClick={onOpenRecipients}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Avatars stack */}
        <div
          onClick={onOpenRecipients}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex -space-x-2 overflow-hidden">
            {AVATARS.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Member Avatar"
                className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover group-hover:scale-105 transition-transform"
              />
            ))}
          </div>

          <div className="w-9 h-9 rounded-full bg-[#00875A] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-xs ml-1 group-hover:bg-[#00754e] transition-colors">
            +2
          </div>
        </div>
      </div>
    </div>
  );
}
