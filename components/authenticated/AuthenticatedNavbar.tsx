/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
  Briefcase,
  ChevronRight,
  Loader2,
  Sparkles,
  Heart,
} from "lucide-react";

interface SearchResultProfile {
  id: string;
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

export default function AuthenticatedNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  // Search Hover & Dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"" | "Bride" | "Groom">("");
  const [selectedReligion, setSelectedReligion] = useState("Any");
  const [searchResults, setSearchResults] = useState<SearchResultProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userAvatar = user?.avatar_url || user?.avatarUrl;
  const userName = user?.display_name || user?.name || "Shaadi Member";
  const userMobile = user?.mobile_number || user?.mobileNumber || "";

  // Derive active main tab from the current pathname
  const activeMainTab = pathname.includes("/matches")
    ? "matches"
    : pathname.includes("/search")
    ? "search"
    : pathname.includes("/inbox")
    ? "inbox"
    : pathname.includes("/chat")
    ? "chat"
    : "my-shaadi";

  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
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
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedGender) params.set("gender", selectedGender);
      if (selectedReligion && selectedReligion !== "Any") params.set("religion", selectedReligion);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.profiles)) {
        setSearchResults(data.profiles.slice(0, 5)); // Show top 5 live matches
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error("Failed to fetch live search results:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedGender, selectedReligion]);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        performSearch();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen, searchQuery, selectedGender, selectedReligion, performSearch]);

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

  return (
    <header className="w-full sticky top-0 z-50 font-sans shadow-md">
      
      {/* 1. TOP RED BRAND BAR */}
      <div className="bg-[#e53238] text-white h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* Left: Shaadi Logo */}
          <Link href="/dashboard" className="flex items-center group">
            <div className="flex items-center gap-1 select-none">
              <span className="relative flex items-center">
                <span className="font-extrabold text-3xl sm:text-4xl tracking-tight font-serif italic text-white">
                  shaadi
                </span>
                {/* Interlocking Rings Emblem */}
                <span className="absolute left-6 sm:left-8 -top-1 sm:-top-1.5 flex items-center -space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-white bg-transparent"></span>
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-300 bg-transparent"></span>
                </span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-cyan-200 self-end mb-1">
                .com
              </span>
            </div>
          </Link>

          {/* Middle: Main Header Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 h-full font-semibold text-sm sm:text-base">
            
            {/* My Shaadi */}
            <div className="relative h-full flex items-center">
              <Link
                href="/dashboard"
                className={`flex items-center h-full px-2 transition-colors ${
                  activeMainTab === "my-shaadi"
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
                }`}
              >
                My Shaadi
              </Link>
              {activeMainTab === "my-shaadi" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Matches */}
            <div className="relative h-full flex items-center">
              <Link
                href="/matches"
                className={`flex items-center gap-1.5 h-full px-2 transition-colors ${
                  activeMainTab === "matches"
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
                }`}
              >
                <span>Matches</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#e53238] font-extrabold text-[11px] leading-none shadow-xs">
                  20
                </span>
              </Link>
              {activeMainTab === "matches" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* ⭐ SEARCH HOVER DROPDOWN PANEL */}
            <div
              className="relative h-full flex items-center"
              ref={searchMenuRef}
              onMouseEnter={handleSearchMouseEnter}
              onMouseLeave={handleSearchMouseLeave}
            >
              <Link
                href="/search"
                onClick={() => setIsSearchOpen(false)}
                className={`flex items-center gap-1.5 h-full px-2 transition-colors cursor-pointer ${
                  activeMainTab === "search" || isSearchOpen
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
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
                    <div className="flex items-center gap-2 text-[#e53238] font-black text-base">
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
                        className="w-full pl-12 pr-28 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#e53238] focus:ring-4 focus:ring-red-500/10 outline-hidden transition shadow-xs placeholder:text-gray-400"
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
                        className="absolute right-2 px-5 py-2.5 bg-[#e53238] hover:bg-[#c92429] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
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
                              : selectedGender === "Bride"
                              ? "bg-[#e53238] text-white shadow-xs"
                              : "bg-[#e53238] text-white shadow-xs"
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
                          className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 outline-hidden focus:border-[#e53238]"
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
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                      <span>Live Matching Profiles ({searchResults.length})</span>
                      {isSearching && (
                        <span className="flex items-center gap-1 text-[#e53238] lowercase">
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
                              <img
                                src={profile.avatarUrl || "/images/default-avatar.png"}
                                alt={profile.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#e53238]">
                                    {profile.name}
                                  </p>
                                  <span className="text-[10px] text-gray-400 font-mono font-bold">({profile.id})</span>
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
                              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 group-hover:bg-[#e53238] group-hover:text-white group-hover:border-[#e53238] rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
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
                        <p className="font-bold text-gray-600">No matching profiles found.</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Try searching by member name, city, or profession</p>
                      </div>
                    )}
                  </div>

                  {/* Advanced Search Link Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-xs text-gray-400 font-medium">Verified Matrimonial Profiles</span>
                    <Link
                      href="/search"
                      onClick={() => setIsSearchOpen(false)}
                      className="font-extrabold text-[#e53238] hover:underline flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span>Open Advanced Search Page</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              )}
            </div>

            {/* Inbox */}
            <div className="relative h-full flex items-center">
              <Link
                href="/inbox"
                className={`flex items-center h-full px-2 transition-colors ${
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
            <div className="relative h-full flex items-center">
              <Link
                href="/chat"
                className={`flex items-center h-full px-2 transition-colors ${
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

          </nav>

          {/* Right Actions: Offer Badge, Help, Profile Avatar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Promo Banner Button */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/40 bg-white/10 text-white text-xs font-extrabold uppercase tracking-wide hover:bg-white/20 transition-all cursor-pointer shadow-xs">
              <Percent className="w-3.5 h-3.5" />
              <span>UPTO 60% OFF</span>
            </div>

            {/* Help Dropdown */}
            <div className="relative" ref={helpMenuRef}>
              <button
                type="button"
                onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-white hover:text-red-100 transition-colors cursor-pointer py-1"
              >
                <span>Help</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHelpMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isHelpMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800 text-xs font-medium animate-in fade-in zoom-in-95">
                  <Link href="/help" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#e53238]">
                    Customer Support
                  </Link>
                  <Link href="/safe-online" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#e53238]">
                    Be Safe Online
                  </Link>
                  <Link href="/membership" onClick={() => setIsHelpMenuOpen(false)} className="block px-4 py-2 hover:bg-red-50 hover:text-[#e53238]">
                    Premium Plans
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 px-2 rounded-full border border-white/40 hover:border-white transition-all cursor-pointer bg-white/10"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 border border-white flex items-center justify-center text-red-800 font-bold overflow-hidden shadow-xs shrink-0">
                  {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs sm:text-sm font-extrabold text-[#e53238] uppercase">
                      {userName.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-white max-w-[100px] truncate">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 text-gray-800 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0">
                      {userAvatar && userAvatar !== "/images/default-avatar.png" ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-extrabold text-[#e53238] uppercase">{userName.charAt(0)}</span>
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
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#e53238] font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/photos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#e53238] font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Manage Photos</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 hover:text-[#e53238] font-medium transition-colors"
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
                  ? "text-[#e53238] font-bold"
                  : "hover:text-[#e53238]"
              }`}
            >
              <span>Dashboard</span>
              {pathname === "/dashboard" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e53238] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/profile"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/profile"
                  ? "text-[#e53238] font-bold"
                  : "hover:text-[#e53238]"
              }`}
            >
              <span>My Profile</span>
              {pathname === "/profile" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e53238] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/photos"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/photos"
                  ? "text-[#e53238] font-bold"
                  : "hover:text-[#e53238]"
              }`}
            >
              <span>My Photos</span>
              {pathname === "/photos" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e53238] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/preferences"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/preferences"
                  ? "text-[#e53238] font-bold"
                  : "hover:text-[#e53238]"
              }`}
            >
              <span>Partner Preferences</span>
              {pathname === "/preferences" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e53238] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/settings"
              className={`relative py-1 transition-colors whitespace-nowrap ${
                pathname === "/settings"
                  ? "text-[#e53238] font-bold"
                  : "hover:text-[#e53238]"
              }`}
            >
              <span>Settings</span>
              {pathname === "/settings" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e53238] rounded-full"></span>
              )}
            </Link>

            <Link
              href="/help"
              className="py-1 hover:text-[#e53238] transition-colors whitespace-nowrap"
            >
              <span>More</span>
            </Link>

          </div>
        </div>
      </div>

    </header>
  );
}
