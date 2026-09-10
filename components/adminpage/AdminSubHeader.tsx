"use client";

import React, { useState } from "react";
import { Calendar, Plus } from "lucide-react";

interface AdminSubHeaderProps {
  adminName?: string;
  onOpenAddWallet?: () => void;
}

export default function AdminSubHeader({
  adminName = "Sujon",
  onOpenAddWallet,
}: AdminSubHeaderProps) {
  const [dateRange, setDateRange] = useState("29 Jun, 2025 - 29 August, 2025");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const presets = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "29 Jun, 2025 - 29 August, 2025",
    "Year to Date",
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Welcome Back, <span className="font-normal text-slate-600">{adminName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{dateRange}</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Select Period</p>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setDateRange(p);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    dateRange === p ? "bg-[#00875A]/10 text-[#00875A]" : "hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenAddWallet}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-slate-800 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-600" />
          <span>Add New Wallet</span>
        </button>
      </div>
    </div>
  );
}
