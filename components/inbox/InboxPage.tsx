"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Check, X } from "lucide-react";

const TABS = [
  { key: "received", label: "Received (3)" },
  { key: "accepted", label: "Accepted (2)" },
  { key: "sent", label: "Sent (5)" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const INVITATIONS = [
  { name: "Ananya M.", age: 24, loc: "Delhi NCR", id: "SH910244", time: "2 hours ago" },
  { name: "Sneha R.", age: 26, loc: "Bengaluru", id: "SH774812", time: "Yesterday" },
  { name: "Priya S.", age: 25, loc: "Mumbai", id: "SH884120", time: "3 days ago" },
];

export default function InboxPage() {
  const [tab, setTab] = useState<TabKey>("received");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Inbox & Invitations 📬
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your connection requests, invitations, and chats.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === key
                  ? "border-[#e53238] text-[#e53238]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Invitations List */}
        <div className="space-y-4 mb-8">
          {INVITATIONS.map((inv, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-[#e53238] flex items-center justify-center font-extrabold border-2 border-white shadow-xs">
                  {inv.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{inv.name} ({inv.id})</h3>
                  <p className="text-xs text-gray-500">{inv.age} yrs • {inv.loc}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Invitation received {inv.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => alert("Accepted interest!")}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#e53238] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#c92429] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => alert("Declined interest")}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}