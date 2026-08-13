"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#e53238] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e53238] uppercase tracking-wider mb-2">
            <Settings className="w-4 h-4" />
            <span>Account & Privacy Settings</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
            Settings
          </h1>

          <div className="space-y-4 text-left">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Phone Number Privacy</h3>
                <p className="text-xs text-gray-500">Decide who can view your mobile number (+91 {user?.mobileNumber})</p>
              </div>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800">
                <option>Only Verified Matches</option>
                <option>All Premium Members</option>
                <option>Hide From All</option>
              </select>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Photo Privacy Settings</h3>
                <p className="text-xs text-gray-500">Control profile picture visibility</p>
              </div>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800">
                <option>Visible to All Members</option>
                <option>Visible on Acceptance</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Account</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}