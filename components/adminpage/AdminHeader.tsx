/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: "dashboard" | "analytics" | "verifications" | "reports" | "members" | "coupons") => void;
  openReportsCount?: number;
  openVerificationsCount?: number;
  onLogout: () => void;
}

export default function AdminHeader({
  activeTab,
  setActiveTab,
  openReportsCount = 0,
  openVerificationsCount = 0,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="w-full bg-white rounded-3xl shadow-xs border border-gray-100 px-6 py-3.5 mb-6 flex items-center justify-between font-sans">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00875A] flex items-center justify-center text-white shadow-xs">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">
          Quixotic<span className="text-[#00875A]">.</span>
        </span>
      </div>

      {/* Nav Pills */}
      <nav className="hidden md:flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-full border border-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Members
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verifications")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "verifications"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Verifications
          {openVerificationsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#00875A]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Reports
          {openReportsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Analytics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("coupons")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "coupons"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Coupons
        </button>
      </nav>

      {/* Header Controls (Search, Notifications, Profile) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00875A]" />
        </button>

        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Profile Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 hidden group-hover:block z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-slate-800">Admin Account</p>
              <p className="text-[10px] text-slate-400">admin@matrimonial.com</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
