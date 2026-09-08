"use client";

import React, { useState } from "react";
import { CreditCard, ArrowUpRight } from "lucide-react";

export default function AdminEngagementChart() {
  const [period, setPeriod] = useState<"monthly" | "annually">("annually");

  const annuallyData = [
    { month: "JAN", heightPct: 40, count: "2.1k", isPeak: false },
    { month: "FEB", heightPct: 75, count: "3.8k", isPeak: false },
    { month: "MAR", heightPct: 62, count: "3.1k", isPeak: false },
    { month: "APR", heightPct: 92, count: "4.8k", isPeak: true, badge: "+17.8%" },
    { month: "MAY", heightPct: 72, count: "3.6k", isPeak: false },
    { month: "JUN", heightPct: 84, count: "4.2k", isPeak: false },
  ];

  const monthlyData = [
    { month: "W1", heightPct: 55, count: "1.2k", isPeak: false },
    { month: "W2", heightPct: 70, count: "2.4k", isPeak: false },
    { month: "W3", heightPct: 95, count: "3.9k", isPeak: true, badge: "+24.2%" },
    { month: "W4", heightPct: 60, count: "1.8k", isPeak: false },
  ];

  const currentData = period === "annually" ? annuallyData : monthlyData;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs flex flex-col justify-between h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-slate-700">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Engagement Rate</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Monthly / Annually Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                period === "monthly"
                  ? "bg-[#00875A] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod("annually")}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                period === "annually"
                  ? "bg-[#00875A] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Annually
            </button>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Hatching Pattern */}
      <svg className="w-0 h-0 absolute">
        <defs>
          <pattern
            id="stripes"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#00875A" strokeWidth="3" opacity="0.35" />
          </pattern>
        </defs>
      </svg>

      {/* Main Chart Area */}
      <div className="relative pt-10 pb-2 flex-1 flex flex-col justify-end min-h-[260px]">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium pb-8 pt-4">
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">5k</span>
            <div className="flex-1 border-b border-dashed border-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">4k</span>
            <div className="flex-1 border-b border-dashed border-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">3k</span>
            <div className="flex-1 border-b border-dashed border-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">2k</span>
            <div className="flex-1 border-b border-dashed border-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">1k</span>
            <div className="flex-1 border-b border-dashed border-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 text-right">0</span>
            <div className="flex-1 border-b border-gray-200" />
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative z-10 pl-8 pr-2 flex items-end justify-around h-52">
          {currentData.map((d) => (
            <div key={d.month} className="flex flex-col items-center flex-1 h-full justify-end relative group">
              {/* Floating Tooltip Badge over Peak */}
              {d.isPeak && (
                <div
                  className="absolute flex flex-col items-center z-30 transition-all duration-300"
                  style={{ bottom: `calc(${d.heightPct}% + 12px)` }}
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00875A] text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                    {d.badge}
                  </span>
                  <div className="w-2 h-2 bg-[#00875A] rotate-45 -mt-1 rounded-xs" />
                  <div className="w-2 h-2 rounded-full bg-white border-2 border-[#00875A] mt-0.5" />
                </div>
              )}

              {/* Bar Graphic */}
              <div
                className="w-10 sm:w-11 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ height: `${d.heightPct}%` }}
              >
                {d.isPeak ? (
                  <div className="w-full h-full bg-[#00875A] rounded-full shadow-md" />
                ) : (
                  <div className="w-full h-full bg-[#00875A]/20 border border-[#00875A]/40 rounded-full relative">
                    <svg className="w-full h-full">
                      <rect width="100%" height="100%" fill="url(#stripes)" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] font-bold text-slate-500 mt-3">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
