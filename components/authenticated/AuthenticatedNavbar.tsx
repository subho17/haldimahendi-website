"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, ChevronDown, Percent, Settings, Shield } from "lucide-react";

export default function AuthenticatedNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  // Derive active main tab from the current pathname
  const activeMainTab = pathname.includes("/matches")
    ? "matches"
    : pathname.includes("/search")
    ? "search"
    : pathname.includes("/inbox")
    ? "inbox"
    : "my-shaadi";

  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 font-sans shadow-md">
      
      {/* 1. TOP RED BRAND BAR (exact screenshot match) */}
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
            
            {/* My Shaadi (Active Tab with Caret Arrow Indicator) */}
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
              {/* White Caret Pointer Arrow pointing down to Sub-Navbar */}
              {activeMainTab === "my-shaadi" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Matches with Notification Pill Badge */}
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
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#e53238] font-extrabold text-[11px] leading-none shadow-sm">
                  20
                </span>
              </Link>
              {activeMainTab === "matches" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
              )}
            </div>

            {/* Search */}
            <div className="relative h-full flex items-center">
              <Link
                href="/search"
                className={`flex items-center h-full px-2 transition-colors ${
                  activeMainTab === "search"
                    ? "text-white font-bold"
                    : "text-red-100 hover:text-white"
                }`}
              >
                Search
              </Link>
              {activeMainTab === "search" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></span>
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
                className="flex items-center gap-1.5 p-1 rounded-full border-2 border-white/60 hover:border-white transition-all cursor-pointer bg-white/10"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 border border-white flex items-center justify-center text-amber-800 font-bold overflow-hidden shadow-xs">
                  {user?.avatarUrl ? (
                    <User className="w-5 h-5 text-gray-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 text-gray-800 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-sm text-gray-900">{user?.name || "Shaadi Member"}</p>
                    <p className="text-gray-400 text-[11px] font-semibold">ID: {user?.profileId}</p>
                    <p className="text-gray-400 text-[11px]">+91 {user?.mobileNumber}</p>
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

      {/* 2. SECONDARY WHITE SUB-NAVBAR (exact screenshot match) */}
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
