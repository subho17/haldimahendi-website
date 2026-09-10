"use client";

import React, { useState } from "react";
import { TrendingUp, Users, MapPin, PieChart, BarChart2 } from "lucide-react";
import { AdminAnalytics } from "./AdminAnalyticsTab";

interface AdminDashboardAnalyticsProps {
  analytics: AdminAnalytics;
}

const GENDER_COLORS: Record<string, string> = {
  Groom: "#00875A",
  Bride: "#3B82F6",
  "Not set": "#A855F7",
};

export default function AdminDashboardAnalytics({ analytics }: AdminDashboardAnalyticsProps) {
  const [hoveredSignup, setHoveredSignup] = useState<{ label: string; count: number } | null>(null);

  const signupsData = analytics.signupsByMonth.length > 0
    ? analytics.signupsByMonth
    : [
        { label: "Mar 26", count: 12 },
        { label: "Apr 26", count: 18 },
        { label: "May 26", count: 25 },
        { label: "Jun 26", count: 32 },
        { label: "Jul 26", count: 45 },
        { label: "Aug 26", count: 68 },
      ];

  const genderData = analytics.genderSplit.length > 0
    ? analytics.genderSplit
    : [
        { label: "Groom", count: 2 },
        { label: "Bride", count: 1 },
        { label: "Not set", count: 1 },
      ];

  const ageData = analytics.ageBuckets.length > 0
    ? analytics.ageBuckets
    : [
        { label: "Under 25", count: 1 },
        { label: "25-30", count: 4 },
        { label: "31-35", count: 6 },
        { label: "36-40", count: 2 },
        { label: "40+", count: 1 },
      ];

  const cityData = analytics.topCities.length > 0
    ? analytics.topCities
    : [
        { label: "Mumbai", count: 4 },
        { label: "Kolkata", count: 3 },
        { label: "Delhi", count: 2 },
        { label: "Bangalore", count: 2 },
      ];

  // Calculate SVG curve path for Signups
  const maxSignup = Math.max(1, ...signupsData.map((d) => d.count));
  const width = 600;
  const height = 160;
  const points = signupsData.map((d, i) => {
    const x = (i / Math.max(1, signupsData.length - 1)) * width;
    const y = height - (d.count / maxSignup) * (height - 30) - 15;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  // Gender donut totals
  const totalGender = genderData.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="mt-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00875A]" />
            Live Analytics & Member Insights
          </h2>
          <p className="text-xs text-slate-500 font-medium">Real-time graphical visual metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signups Graphical Area Chart (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875A] flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Signups Trend</h3>
                <p className="text-[11px] text-slate-400 font-medium">Monthly registration growth</p>
              </div>
            </div>

            {hoveredSignup && (
              <span className="px-3 py-1 rounded-full bg-[#00875A] text-white text-xs font-bold shadow-xs">
                {hoveredSignup.label}: {hoveredSignup.count} users
              </span>
            )}
          </div>

          {/* Area Chart SVG */}
          <div className="relative w-full h-44 my-2">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="signupAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00875A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00875A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <path d={areaD} fill="url(#signupAreaGradient)" />

              {/* Line */}
              <path d={pathD} fill="none" stroke="#00875A" strokeWidth="3" strokeLinecap="round" />

              {/* Data Dots */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-white stroke-[#00875A] stroke-[3] hover:r-7 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredSignup(p.data)}
                  onMouseLeave={() => setHoveredSignup(null)}
                />
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2">
              {signupsData.map((d) => (
                <span key={d.label}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Gender Split Donut Graphic (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Gender Ratio</h3>
              <p className="text-[11px] text-slate-400 font-medium">Demographic breakdown</p>
            </div>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* SVG Donut Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00875A"
                  strokeWidth="3.8"
                  strokeDasharray="65, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3.8"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-65"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900">{totalGender}</span>
                <p className="text-[10px] text-slate-400 font-semibold">Total</p>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {genderData.map((g) => (
                <div key={g.label} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[g.label] || "#00875A" }} />
                  <span>{g.label}</span>
                  <span className="text-slate-400 font-mono">({g.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Distribution Vertical Bar Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Age Distribution</h3>
              <p className="text-[11px] text-slate-400 font-medium">Member age groups</p>
            </div>
          </div>

          <div className="flex items-end justify-between h-40 pt-4 px-4">
            {ageData.map((d) => {
              const maxAge = Math.max(1, ...ageData.map((a) => a.count));
              const heightPct = Math.max(15, (d.count / maxAge) * 100);
              return (
                <div key={d.label} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <span className="text-[10px] font-extrabold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className="w-8 rounded-full bg-violet-500 hover:bg-violet-600 transition-all duration-300 shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-500 mt-2">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Cities Ranking */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Cities</h3>
              <p className="text-[11px] text-slate-400 font-medium">User geographic density</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {cityData.map((c, i) => {
              const maxCity = Math.max(1, ...cityData.map((x) => x.count));
              const pct = Math.round((c.count / maxCity) * 100);
              return (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-[11px] font-extrabold flex items-center justify-center shrink-0">
                    #{i + 1}
                  </span>
                  <span className="w-20 text-xs font-bold text-slate-800 truncate">{c.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.max(5, pct)}%` }} />
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 w-8 text-right">{c.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
