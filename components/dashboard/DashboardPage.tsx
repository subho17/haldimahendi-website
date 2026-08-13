/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Eye, UserCheck } from "lucide-react";
import Link from "next/link";
import { useMounted } from "@/hooks/useMounted";

const STATS = [
  { label: "New Matches", value: "20", sub: "↑ 5 today", Icon: Heart, color: "text-[#e53238]" },
  { label: "Profile Views", value: "48", sub: "↑ 12 this week", Icon: Eye, color: "text-cyan-600" },
  { label: "Interests Sent", value: "8", sub: "3 accepted", Icon: UserCheck, color: "text-emerald-600" },
  { label: "Shortlisted", value: "14", sub: "Saved profiles", Icon: Sparkles, color: "text-amber-500" },
];

const MATCHES = [
  { name: "Priya S.", age: "25", loc: "Mumbai", edu: "Software Engineer", id: "SH884120" },
  { name: "Ananya M.", age: "24", loc: "Delhi NCR", edu: "Chartered Accountant", id: "SH910244" },
  { name: "Sneha R.", age: "26", loc: "Bengaluru", edu: "Product Manager", id: "SH774812" },
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  const userAvatar = user?.avatar_url || user?.avatarUrl;
  const displayName = user?.display_name || user?.name || "Shaadi Member";
  const userMobile = user?.mobile_number || user?.mobileNumber || "";

  React.useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 via-[#e53238] to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              {/* Profile Avatar Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/40 bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0">
                {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                  <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase">{displayName.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold mb-1.5 border border-white/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Verified Member ID: {user?.profileId}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="mt-1 text-red-100 text-xs sm:text-sm font-light">
                  {userMobile ? `+91 ${userMobile}` : "Verified Account"} {user?.city ? `• ${user.city}` : ""} {user?.gender ? `• Looking for ${user.gender}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href="/matches"
                className="px-5 py-2.5 rounded-xl bg-white text-[#e53238] font-bold text-xs sm:text-sm shadow-md hover:bg-red-50 transition-colors"
              >
                View 20 New Matches
              </Link>
              <Link
                href="/profile"
                className="px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/30 hover:bg-white/25 transition-colors"
              >
                My Profile
              </Link>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, value, sub, Icon, color }) => (
            <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className={`text-[11px] font-semibold mt-1 ${sub.startsWith("↑") ? "text-emerald-600" : "text-gray-400"}`}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Recommended Matches Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Matches For You</h2>
              <p className="text-xs text-gray-500">Based on your cultural, age, and location preferences.</p>
            </div>
            <Link href="/matches" className="text-xs font-bold text-[#e53238] hover:underline">
              View All (20) →
            </Link>
          </div>

          {/* Sample Match Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MATCHES.map((match, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 text-[#e53238] flex items-center justify-center font-bold text-lg border-2 border-white shadow-xs">
                    {match.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#e53238] transition-colors">{match.name}</h3>
                    <p className="text-xs text-gray-500">{match.age} yrs • {match.loc}</p>
                    <p className="text-xs text-gray-600 font-medium">{match.edu}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button className="flex-1 py-2 px-3 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-xs hover:bg-[#c92429] transition-colors cursor-pointer">
                    Connect Now
                  </button>
                  <button className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}