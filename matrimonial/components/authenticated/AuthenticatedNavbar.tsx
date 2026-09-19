"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  User,
  LogOut,
  ChevronDown,
  Percent,
  Settings,
  Shield,
  Search,
  X,
  MapPin,
  ChevronRight,
  Loader2,
  Bell,
  Heart,
  MessageCircle,
  CheckCircle2,
  Info,
  Crown,
} from "lucide-react";

interface SearchResultProfile {
  id: string;
  mobileNumber?: string;
  email?: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  profession: string;
  city: string;
  gender: string;
  avatarUrl: string;
  bio?: string;
}

interface NavNotification {
  id: string;
  type: "interest" | "accept" | "message" | "system";
  title?: string;
  message: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
  timeLabel?: string;
}

export default function AuthenticatedNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Search Hover & Dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"" | "Bride" | "Groom">("");
  const [selectedReligion, setSelectedReligion] = useState("Any");
  const [searchResults, setSearchResults] = useState<SearchResultProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userAvatar = user?.avatar_url || user?.avatarUrl;
  const userName = user?.display_name || user?.name || "Shaadi Member";
  const userMobile = user?.mobile_number || user?.mobileNumber || "";
  const userId = user?.profileId || user?.mobile_number || user?.mobileNumber || user?.email || "";

  // Derive active main tab from the current pathname
  const activeMainTab: "dashboard" | "analytics" | "verifications" | "reports" | "members" | "coupons" | "matches" | "search" | "inbox" | "chat" | "my-haldimehendi" = pathname.includes("/matches")
    ? "matches"
    : pathname.includes("/search")
    ? "search"
    : pathname.includes("/inbox")
    ? "inbox"
    : pathname.includes("/chat")
    ? "chat"
    : "my-haldimehendi";

  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchMenuRef.current && !searchMenuRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results on query or filter changes
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (user?.profileId) params.set("profileId", user.profileId);
      const mobile = user?.mobile_number || user?.mobileNumber || "";
      if (mobile) params.set("userMobile", mobile);
      if (user?.email) params.set("userEmail", user.email);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedGender) params.set("gender", selectedGender);
      if (selectedReligion && selectedReligion !== "Any") params.set("religion", selectedReligion);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.profiles)) {
        // Client-side safety filter: ensure logged-in user never matches themselves
        const myProfileId = (user?.profileId || "").toLowerCase().trim();
        const myMobile = (user?.mobile_number || user?.mobileNumber || "").replace(/\D/g, "");
        const myEmail = (user?.email || "").toLowerCase().trim();

        const safeProfiles = data.profiles.filter((p: SearchResultProfile) => {
          const pId = (p.id || "").toLowerCase().trim();
          const pMob = (p.mobileNumber || "").replace(/\D/g, "");
          const pEm = (p.email || "").toLowerCase().trim();
          if (myProfileId && pId === myProfileId) return false;
          if (myMobile && pMob && pMob === myMobile) return false;
          if (myEmail && pEm && pEm === myEmail) return false;
          return true;
        });

        setSearchResults(safeProfiles.slice(0, 6)); // Show top live matches
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error("Failed to fetch live search results:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedGender, selectedReligion, userId, user]);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        performSearch();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen, searchQuery, selectedGender, selectedReligion, performSearch]);

  // Load the live eligible match count for the Matches badge.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const mParams = new URLSearchParams();
        if (userId) mParams.set("userId", userId);
        if (user?.profileId) mParams.set("profileId", user.profileId);
        const mob = user?.mobile_number || user?.mobileNumber || "";
        if (mob) mParams.set("userMobile", mob);
        if (user?.email) mParams.set("userEmail", user.email);

        const res = await fetch(`/api/matches?${mParams.toString()}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setMatchCount(typeof data.meta?.matches === "number" ? data.meta.matches : null);
        }
      } catch (e) {
        console.error("Failed to load match count:", e);
        if (!cancelled) setMatchCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, user]);

  const handleSearchMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSearchOpen(false);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedGender) params.set("gender", selectedGender);
    if (selectedReligion && selectedReligion !== "Any") params.set("religion", selectedReligion);
    router.push(`/search?${params.toString()}`);
  };

  // Load notifications + unread badge, with Supabase Realtime + polling fallback.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let failCount = 0;
    const load = async () => {
      const now = Date.now();
      const fmt = (iso: string) => {
        try {
          const diff = now - new Date(iso).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 1) return "just now";
          if (mins < 60) return `${mins}m ago`;
          const hrs = Math.floor(mins / 60);
          if (hrs < 24) return `${hrs}h ago`;
          return `${Math.floor(hrs / 24)}d ago`;
        } catch {
          return "";
        }
      };
      try {
        const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setNotifications(
            (data.notifications || []).map((n: NavNotification) => ({ ...n, timeLabel: fmt(n.createdAt) }))
          );
          setUnread(typeof data.unread === "number" ? data.unread : 0);
          failCount = 0;
        }
      } catch {
        failCount++;
        if (!cancelled && failCount <= 2) console.error("Failed to load notifications (will retry)");
      } finally {
        if (!cancelled) setNotifLoading(false);
      }
    };
    load();

    // Polling fallback every 30s (backoff on failures)
    const interval = setInterval(() => {
      if (failCount >= 5) return;
      load();
    }, 30000);

    // Supabase Realtime for instant notifications
    let channel: { unsubscribe: () => Promise<unknown> } | null = null;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        channel = supabase
          .channel(`notif_${userId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
            () => { if (!cancelled) load(); }
          )
          .subscribe();
      } catch {
        // Realtime unavailable, polling only
      }
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (channel) channel.unsubscribe().catch(() => undefined);
    };
  }, [userId]);

  const handleNotifOpen = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unread > 0) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "readAll" }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setUnread(data.unread || 0);
        })
        .catch(() => {});
    }
  };

  const handleNotifClick = (n: NavNotification) => {
    setIsNotifOpen(false);
    if (n.data?.conversationId && (n.type === "message" || n.type === "accept")) {
      router.push(`/chat?otherId=${encodeURIComponent(n.data.profileId || "")}`);
    } else if (n.data?.profileId) {
      router.push(`/profile/${encodeURIComponent(n.data.profileId)}`);
    } else {
      router.push("/inbox");
    }
  };

  const notifIcon = (n: NavNotification) => {
    if (n.type === "message") return <MessageCircle className="w-4 h-4 text-cyan-500" />;
    if (n.type === "accept") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (n.type === "interest") return <Heart className="w-4 h-4 text-[#d97706]" />;
    return <Info className="w-4 h-4 text-gray-400" />;
  };

  return (
    <header className="w-full sticky top-0 z-50 font-sans shadow-md">
      
      {/* 1. TOP MEHENDI GREEN BRAND BAR */}
      <div className="bg-[#15803d] text-white h-14 sm:h-16 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Left: Shaadi Logo with Haldi Accent */}
          <Link href="/dashboard" className="flex items-center group shrink-0">
            <div className="flex items-center gap-1 select-none">
              <span className="relative flex items-center">
                <span className="font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight font-serif italic text-amber-300">
haldimehendi
                </span>
                {/* Interlocking Rings Emblem */}
                <span className="absolute left-5 sm:left-7 -top-1 sm:-top-1.5 flex items-center -space-x-1">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-amber-300 bg-transparent"></span>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-amber-400 bg-transparent"></span>
                </span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-emerald-100 self-end mb-1">
                .com
              </span>
            </div>
          </Link>

          {/* Middle: Main Header Links */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-2 lg:space-x-4 h-full font-semibold text-xs sm:text-sm lg:text-base shrink-0">
            
            {/* My Shaadi */}
            <div className="relative h-full flex items-center shrink-0">
              <Link
                href="/dashboard"
                className={`whitespace-nowrap flex items-center h-full px-2 lg:px-3 transition-colors ${
activeMainTab === "my-haldimehendi"
                    ? "text-white font-bold"
                    : "text-emerald-100 hover:text-white"
                }`}
              >
My Haldimehendi
              </Link>
              {activeMainTab === "my-haldimehendi" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Matches */}
            <div className="relative h-full flex items-center shrink-0">
              <Link
                href="/matches"
                className={`whitespace-nowrap flex items-center gap-1.5 h-full px-2 lg:px-3 transition-colors ${
                  activeMainTab === "matches"
                    ? "text-white font-bold"
                    : "text-emerald-100 hover:text-white"
                }`}
              >
                <span>Matches</span>
                {matchCount !== null && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[11px] leading-none shadow-xs">
                    {matchCount}
                  </span>
                )}
              </Link>
              {activeMainTab === "matches" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* ⭐ SEARCH HOVER DROPDOWN PANEL */}
            <div
              className="relative h-full flex items-center shrink-0"
              ref={searchMenuRef}
              onMouseEnter={handleSearchMouseEnter}
              onMouseLeave={handleSearchMouseLeave}
            >
              <Link
                href="/search"
                onClick={() => setIsSearchOpen(false)}
                className={`whitespace-nowrap flex items-center gap-1.5 h-full px-2 lg:px-3 transition-colors cursor-pointer ${
                  activeMainTab === "search" || isSearchOpen
                    ? "text-white font-bold"
                    : "text-emerald-100 hover:text-white"
                }`}
              >
                <span>Search</span>
              </Link>

              {/* White Triangle Indicator pointing up to Search */}
              {(activeMainTab === "search" || isSearchOpen) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white z-50"></span>
              )}

              {/* Hover Search Dropdown Panel (Extra Wide) */}
              {isSearchOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[92vw] max-w-[860px] sm:w-[720px] md:w-[800px] lg:w-[860px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 text-gray-800 text-xs animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Panel Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-[#d97706] font-black text-base">
                      <Search className="w-5 h-5" />
                      <span>Quick Member Search</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium hidden sm:inline">Search by Name, ID, City, or Profession</span>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input Form (Big Search Bar) */}
                  <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="relative flex items-center">
                      <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Name, Profile ID (e.g. SH1001), City (e.g. Mumbai), or Profession..."
                        className="w-full pl-12 pr-28 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#d97706] focus:ring-4 focus:ring-amber-500/10 outline-hidden transition shadow-xs placeholder:text-gray-400"
                      />
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-24 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        className="absolute right-2 px-5 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </div>

                    {/* Quick Filters Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                      {/* Gender Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-400 uppercase text-[10px] tracking-wider">Looking For:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedGender(selectedGender === "" ? "Bride" : selectedGender === "Bride" ? "Groom" : "")}
                          className={`px-3 py-1 rounded-xl font-bold transition text-xs cursor-pointer ${
                            selectedGender === ""
                              ? "bg-gray-200 text-gray-800"
                              : "bg-[#d97706] text-white shadow-xs"
                          }`}
                        >
                          {selectedGender === "" ? "All Profiles" : selectedGender === "Bride" ? "👰 Bride Profiles" : "🤵 Groom Profiles"}
                        </button>
                      </div>

                      {/* Religion Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-400 uppercase text-[10px] tracking-wider">Religion:</span>
                        <select
                          value={selectedReligion}
                          onChange={(e) => setSelectedReligion(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 outline-hidden focus:border-[#d97706]"
                        >
                          <option value="Any">All Religions</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Muslim">Muslim</option>
                          <option value="Christian">Christian</option>
                          <option value="Sikh">Sikh</option>
                          <option value="Jain">Jain</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  {/* Real-time Search Results List (2-Column Grid on Wide Screens) */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Check if user searched for their own Profile ID or mobile */}
                    {(() => {
                      const cleanQ = searchQuery.trim().toLowerCase();
                      const myId = (user?.profileId || "").toLowerCase().trim();
                      const myMob = (user?.mobile_number || user?.mobileNumber || "").replace(/\D/g, "");
                      const isOwn =
                        Boolean(cleanQ) &&
                        (cleanQ === myId ||
                          (myMob && cleanQ.replace(/\D/g, "") === myMob) ||
                          (cleanQ.length >= 4 && myId.includes(cleanQ)));

                      if (isOwn) {
                        return (
                          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <User className="w-5 h-5 text-amber-600 shrink-0" />
                              <div>
                                <p className="font-bold text-amber-950 text-xs sm:text-sm">
                                  This is your own profile ID ({user?.profileId || "You"})
                                </p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                  Search only shows prospective matches. Your own profile is not displayed in matching results.
                                </p>
                              </div>
                            </div>
                            <Link
                              href="/profile"
                              onClick={() => setIsSearchOpen(false)}
                              className="self-start sm:self-auto px-4 py-2 bg-[#d97706] text-white rounded-xl font-bold text-xs hover:bg-[#b45309] transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <span>View My Profile</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex items-center justify-between text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                      <span>Live Matching Profiles ({searchResults.length})</span>
                      {isSearching && (
                        <span className="flex items-center gap-1 text-[#d97706] lowercase">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> searching live database...
                        </span>
                      )}
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {searchResults.map((profile) => (
                          <div
                            key={profile.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              router.push(`/profile/${encodeURIComponent(profile.id)}?back=${encodeURIComponent(`/search?q=${encodeURIComponent(profile.name)}`)}`);
                            }}
                            className="p-3 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-red-50/50 hover:border-red-200 transition-all flex items-center justify-between cursor-pointer group shadow-xs hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={profile.avatarUrl || "/images/default-avatar.png"}
                                alt={profile.name}
                                width={44}
                                height={44}
                                className="rounded-full object-cover border-2 border-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#d97706]">
                                    {profile.name}
                                  </p>
                                  <span className="text-[10px] text-gray-400 font-mono font-bold">(ID: {profile.id ? (profile.id.startsWith("#") ? profile.id : `#${profile.id}`) : ""})</span>
                                </div>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium flex items-center gap-1.5">
                                  <span>{profile.age} yrs • {profile.height}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-gray-400" /> {profile.city}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 group-hover:bg-[#d97706] group-hover:text-white group-hover:border-[#d97706] rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400 text-xs bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <User className="w-8 h-8 mx-auto mb-1.5 text-gray-300" />
                        <p className="font-bold text-gray-600">No other matching profiles found.</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Search for prospective partner profiles by Name, Profile ID, or City</p>
                      </div>
                    )}
                  </div>

                  {/* Advanced Search Link Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-xs text-gray-400 font-medium">Verified Matrimonial Profiles</span>
                    <Link
                      href="/search"
                      onClick={() => setIsSearchOpen(false)}
                      className="font-extrabold text-[#d97706] hover:underline flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span>Open Advanced Search Page</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              )}
            </div>

            {/* Inbox */}
            <div className="relative h-full flex items-center shrink-0">
              <Link
                href="/inbox"
                className={`whitespace-nowrap flex items-center h-full px-2 lg:px-3 transition-colors ${
                  activeMainTab === "inbox"
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
                }`}
              >
                Inbox
              </Link>
              {activeMainTab === "inbox" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Chats */}
            <div className="relative h-full flex items-center shrink-0">
              <Link
                href="/chat"
                className={`whitespace-nowrap flex items-center h-full px-2 lg:px-3 transition-colors ${
                  activeMainTab === "chat"
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
                }`}
              >
                Chats
              </Link>
              {activeMainTab === "chat" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Premium Plans */}
            <div className="relative h-full flex items-center shrink-0">
              <Link
                href="/membership"
                className={`whitespace-nowrap flex items-center gap-1.5 h-full px-2 lg:px-3 transition-all ${
                  pathname.includes("/membership")
                    ? "text-amber-200 font-bold"
                    : "text-amber-100 hover:text-white"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </Link>
              {pathname.includes("/membership") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

          </nav>

          {/* Right Actions: Offer Badge, Help, Profile Avatar */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 shrink-0">
            
            {/* Promo Banner Button */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/40 bg-white/10 text-white text-[11px] font-extrabold uppercase tracking-wide hover:bg-white/20 transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
              <Percent className="w-3.5 h-3.5" />
              <span>UPTO 60% OFF</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative shrink-0" ref={notifMenuRef}>
              <button
                type="button"
                onClick={handleNotifOpen}
                aria-label="Notifications"
                className="relative flex items-center justify-center w-9 h-9 rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-[#7a4a00] text-[10px] font-extrabold flex items-center justify-center leading-none shadow-xs border border-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 text-gray-800 text-xs overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-black text-sm text-gray-900">Notifications</span>
                    {notifLoading ? (
                      <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    ) : unread > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                        {unread} new
                      </span>
                    ) : null}
                  </div>

                  <div className="max-h-[340px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        <p className="font-bold text-gray-500">No notifications yet</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Interests, accepts and messages will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleNotifClick(n)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 transition-colors cursor-pointer hover:bg-red-50/50 ${
                            !n.read ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">{notifIcon(n)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-bold text-gray-900 truncate">{n.title || (n.type === "message" ? "New Message" : n.type === "accept" ? "Interest Accepted" : "Update")}</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />}
                            </span>
                            <span className="block text-gray-600 leading-snug mt-0.5">{n.message}</span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-1">{n.timeLabel}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => router.push("/inbox")}
                      className="w-full text-center text-[#d97706] font-bold hover:underline cursor-pointer"
                    >
                      View All in Inbox
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div className="relative shrink-0" ref={helpMenuRef}>
              <button
                type="button"
                onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                className="whitespace-nowrap flex items-center gap-1 text-xs sm:text-sm font-semibold text-white hover:text-red-100 transition-colors cursor-pointer py-1"
              >
                <span>Help</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHelpMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isHelpMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800 text-xs font-medium animate-in fade-in zoom-in-95">
                  <Link href="/help" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#d97706]">
                    Customer Support
                  </Link>
                  <Link href="/safe-online" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#d97706]">
                    Be Safe Online
                  </Link>
                  <Link href="/membership" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#d97706]">
                    Premium Plans
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="whitespace-nowrap flex items-center gap-2 p-1 px-2.5 rounded-full border border-white/40 hover:border-white transition-all cursor-pointer bg-white/10"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 border border-white flex items-center justify-center text-red-800 font-bold overflow-hidden shadow-xs shrink-0" style={{ position: "relative" }}>
                  {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                    <Image src={userAvatar} alt={userName} width={32} height={32} loading="eager" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs sm:text-sm font-extrabold text-[#d97706] uppercase">
                      {userName.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-white max-w-[90px] lg:max-w-[120px] truncate">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 text-gray-800 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0" style={{ position: "relative" }}>
                      {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                        <Image src={userAvatar} alt={userName} width={40} height={40} loading="eager" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-extrabold text-[#d97706] uppercase">{userName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate">{userName}</p>
                      <p className="text-gray-400 text-[11px] font-semibold">ID: {user?.profileId}</p>
                      {userMobile && <p className="text-gray-400 text-[11px] truncate">+91 {userMobile}</p>}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#d97706] font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/photos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#d97706] font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Manage Photos</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#d97706] font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        router.push('/');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 2. SECONDARY WHITE SUB-NAVBAR */}
      <div className="bg-white border-b border-gray-200 text-xs sm:text-sm font-medium text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar py-2.5">
            
            <Link
              href="/dashboard"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/dashboard"
                  ? "text-[#d97706] font-bold"
                  : "hover:text-[#d97706]"
              }`}
            >
              <span>Dashboard</span>
              {pathname === "/dashboard" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d97706] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/profile"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/profile"
                  ? "text-[#d97706] font-bold"
                  : "hover:text-[#d97706]"
              }`}
            >
              <span>My Profile</span>
              {pathname === "/profile" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d97706] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/photos"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/photos"
                  ? "text-[#d97706] font-bold"
                  : "hover:text-[#d97706]"
              }`}
            >
              <span>My Photos</span>
              {pathname === "/photos" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d97706] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/preferences"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/preferences"
                  ? "text-[#d97706] font-bold"
                  : "hover:text-[#d97706]"
              }`}
            >
              <span>Partner Preferences</span>
              {pathname === "/preferences" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d97706] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/settings"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/settings"
                  ? "text-[#d97706] font-bold"
                  : "hover:text-[#d97706]"
              }`}
            >
              <span>Settings</span>
              {pathname === "/settings" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d97706] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/help"
              className="py-1 hover:text-[#d97706] transition-colors whitespace-nowrap"
            >
              <span>More</span>
            </Link>

          </div>
        </div>
      </div>

    </header>
  );
}
