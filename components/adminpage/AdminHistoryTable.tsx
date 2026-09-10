"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export interface PaymentHistoryItem {
  id: string;
  name: string;
  subtext?: string;
  date: string;
  time: string;
  status: "Successful" | "Pending" | "Failed";
  amount: string;
  logoBg: string;
  logoText: string;
}

const DEFAULT_ITEMS: PaymentHistoryItem[] = [
  {
    id: "1",
    name: "Dribbble Design",
    subtext: "+18.67%",
    date: "16 Jun 2025",
    time: "10:30 PM",
    status: "Successful",
    amount: "$89,345.23 USD",
    logoBg: "bg-pink-100 text-pink-600",
    logoText: "🏀",
  },
  {
    id: "2",
    name: "Google Pay",
    subtext: "+9.34%",
    date: "15 Jun 2025",
    time: "11:45 PM",
    status: "Successful",
    amount: "$12,345.89 USD",
    logoBg: "bg-amber-100 text-amber-600 font-bold",
    logoText: "G",
  },
  {
    id: "3",
    name: "Amazon Shopping",
    subtext: "+12.23%",
    date: "14 Jun 2025",
    time: "10:15 PM",
    status: "Successful",
    amount: "$32,123.67 USD",
    logoBg: "bg-amber-50 text-amber-800 font-bold",
    logoText: "a",
  },
];

interface AdminHistoryTableProps {
  items?: PaymentHistoryItem[];
  onSelectTransaction?: (item: PaymentHistoryItem) => void;
}

export default function AdminHistoryTable({
  items = DEFAULT_ITEMS,
  onSelectTransaction,
}: AdminHistoryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Payment History</h3>
          <p className="text-[11px] text-slate-400 font-medium">Recent payments history</p>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table Headers (Clean flex spacing to prevent overlapping) */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-gray-100 px-2">
        <span className="w-2/5">Name</span>
        <span className="w-1/4 hidden sm:inline">Date</span>
        <span className="w-1/6 hidden md:inline">Time</span>
        <span className="w-1/5 text-center">Status</span>
        <span className="w-1/4 text-right">Amount</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectTransaction && onSelectTransaction(item)}
            className="flex items-center justify-between py-3.5 px-2 hover:bg-gray-50/80 rounded-xl transition-colors cursor-pointer"
          >
            {/* Name & Logo */}
            <div className="w-2/5 flex items-center gap-3 pr-2 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 ${item.logoBg}`}>
                {item.logoText}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                {item.subtext && <p className="text-[10px] text-slate-400 font-medium">{item.subtext}</p>}
              </div>
            </div>

            {/* Date */}
            <span className="w-1/4 hidden sm:inline text-xs font-semibold text-slate-700">{item.date}</span>

            {/* Time */}
            <span className="w-1/6 hidden md:inline text-xs font-medium text-slate-500">{item.time}</span>

            {/* Status Indicator */}
            <div className="w-1/5 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00875A]/10 text-[#00875A] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
                {item.status}
              </span>
            </div>

            {/* Amount */}
            <span className="w-1/4 text-xs font-extrabold text-slate-900 text-right whitespace-nowrap pl-2">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
