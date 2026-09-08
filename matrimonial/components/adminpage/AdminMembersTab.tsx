/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Users, Search, Download, BadgeCheck, Crown, Ban, UserCheck, Loader2 } from "lucide-react";

export interface AdminMember {
  id: string;
  name: string;
  mobile: string;
  email: string;
  avatarUrl: string;
  gender?: string;
  city?: string;
  age?: number;
  provider?: string;
  verified: boolean;
  membership: string;
  isPremium: boolean;
  isSuspended: boolean;
  lastActive?: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminMembersTabProps {
  members: AdminMember[];
  onSearch: (query: string) => void;
  onApplyAction: (id: string, action: "suspend" | "activate" | "block" | "unblock", targetId?: string) => Promise<void>;
  onGrantMembership: (id: string, planId: string) => Promise<void>;
  busyId: string;
}

const PLAN_OPTIONS = [
  { id: "premium", label: "Premium · ₹999 / 90 days" },
  { id: "premium_plus", label: "Premium Plus · ₹2,499 / 365 days" },
  { id: "free", label: "Free (revoke membership)" },
];

export default function AdminMembersTab({
  members,
  onSearch,
  onApplyAction,
  onGrantMembership,
  busyId,
}: AdminMembersTabProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});

  const filteredMembers = members.filter((m) => {
    if (filter === "active") return m.isActive && !m.isSuspended;
    if (filter === "inactive") return !m.isActive;
    if (filter === "suspended") return m.isSuspended;
    return true;
  });

  const downloadCsv = () => {
    const headers = ["ID", "Name", "Mobile", "Email", "Gender", "City", "Age", "Verified", "Membership", "Status", "Joined"];
    const rows = filteredMembers.map((m) => [
      m.id,
      m.name,
      m.mobile,
      m.email,
      m.gender || "",
      m.city || "",
      m.age ?? "",
      m.verified ? "Yes" : "No",
      m.membership,
      m.isSuspended ? "Suspended" : m.isActive ? "Active" : "Inactive",
      m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "",
    ]);
    const content = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs font-sans">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
            placeholder="Search by name, ID, mobile, email or city…"
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#00875A] outline-hidden transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => onSearch(query)}
          className="px-6 py-2.5 rounded-full bg-[#00875A] hover:bg-[#00754e] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          Search
        </button>

        <button
          type="button"
          onClick={downloadCsv}
          className="px-5 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "active", "inactive", "suspended"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === f
                ? "bg-[#00875A] text-white shadow-xs"
                : "bg-gray-100 text-slate-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Member List */}
      {filteredMembers.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-600">No members found</p>
          <p className="text-xs mt-1 text-slate-400">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredMembers.map((m) => (
            <div key={m.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/60 rounded-2xl px-3 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                  alt={m.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                    {m.name}
                    {m.verified && <BadgeCheck className="w-4 h-4 text-[#00875A] shrink-0" />}
                    {m.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    {m.isSuspended && <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{m.id}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {m.mobile || m.email || "—"} {m.city ? ` · ${m.city}` : ""}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${m.isPremium ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-slate-500"}`}>
                  {m.membership}
                </span>

                <select
                  value={selectedPlan[m.id] || ""}
                  onChange={(e) => setSelectedPlan((p) => ({ ...p, [m.id]: e.target.value }))}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-slate-700 bg-white outline-hidden"
                >
                  <option value="">Set plan…</option>
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={busyId === `mem:${m.id}` || !selectedPlan[m.id]}
                  onClick={() => onGrantMembership(m.id, selectedPlan[m.id])}
                  className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {busyId === `mem:${m.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                  Apply
                </button>

                <button
                  type="button"
                  disabled={busyId === `${m.id}:suspend` || busyId === `${m.id}:activate`}
                  onClick={() => onApplyAction(m.id, m.isSuspended ? "activate" : "suspend")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 ${
                    m.isSuspended
                      ? "bg-[#00875A] hover:bg-[#00754e] text-white"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-600"
                  }`}
                >
                  {busyId === `${m.id}:suspend` || busyId === `${m.id}:activate` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : m.isSuspended ? (
                    <UserCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  {m.isSuspended ? "Activate" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
