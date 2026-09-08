"use client";

import React from "react";
import { UserCheck, Ban, Sparkles, Crown } from "lucide-react";

export interface AdminAnalytics {
  signupsByMonth: { label: string; count: number }[];
  genderSplit: { label: string; count: number }[];
  topCities: { label: string; count: number }[];
  ageBuckets: { label: string; count: number }[];
  activeMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  premiumConversionRate: number;
}

interface AdminAnalyticsTabProps {
  analytics: AdminAnalytics;
}

export default function AdminAnalyticsTab({ analytics }: AdminAnalyticsTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.activeMembers}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Active Members</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
            <Ban className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.inactiveMembers}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Inactive Members</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.newThisMonth}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">New This Month</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Crown className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.premiumConversionRate}%</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Premium Conversion</p>
        </div>
      </div>

      {/* Chart: Signups */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Signups (Last 6 Months)</h3>
        <HBarChart data={analytics.signupsByMonth} color="bg-[#00875A]" />
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Gender Split</h3>
          <HBarChart data={analytics.genderSplit} color="bg-blue-500" />
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Age Distribution</h3>
          <HBarChart data={analytics.ageBuckets} color="bg-violet-500" />
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Top Cities</h3>
        <HBarChart data={analytics.topCities} color="bg-teal-500" />
      </div>
    </div>
  );
}

function HBarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-6">No analytical data recorded yet.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs font-bold text-slate-600 truncate">{d.label}</span>
          <div className="flex-1 h-3.5 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-extrabold text-slate-800">{d.count}</span>
        </div>
      ))}
    </div>
  );
}
