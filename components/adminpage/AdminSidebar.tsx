"use client";

import React from "react";
import {
  LayoutGrid,
  LineChart,
  Wallet,
  FileText,
  Users,
  Percent,
  Settings,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: "dashboard" | "analytics" | "verifications" | "reports" | "members") => void;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-16 bg-white rounded-3xl border border-gray-100 p-3 flex flex-col items-center justify-between shadow-xs shrink-0 self-start">
      {/* Top icon group */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Active Dock Item */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-[#00875A] text-white shadow-md shadow-[#00875A]/20"
              : "text-slate-400 hover:bg-gray-50 hover:text-slate-700"
          }`}
          title="Dashboard"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#00875A] text-white shadow-md shadow-[#00875A]/20"
              : "text-slate-400 hover:bg-gray-50 hover:text-slate-700"
          }`}
          title="Analytics"
        >
          <LineChart className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-[#00875A] text-white shadow-md shadow-[#00875A]/20"
              : "text-slate-400 hover:bg-gray-50 hover:text-slate-700"
          }`}
          title="Members"
        >
          <Wallet className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verifications")}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === "verifications"
              ? "bg-[#00875A] text-white shadow-md shadow-[#00875A]/20"
              : "text-slate-400 hover:bg-gray-50 hover:text-slate-700"
          }`}
          title="Verifications"
        >
          <FileText className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === "reports"
              ? "bg-[#00875A] text-white shadow-md shadow-[#00875A]/20"
              : "text-slate-400 hover:bg-gray-50 hover:text-slate-700"
          }`}
          title="Reports"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-slate-700 transition-all cursor-pointer"
          title="Promotions"
        >
          <Percent className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom icon group */}
      <div className="flex flex-col items-center gap-3 pt-6 border-t border-gray-100 w-full mt-10">
        <button
          type="button"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-slate-700 transition-all cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
