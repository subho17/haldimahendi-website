"use client";

import React from "react";
import { Navbar, Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">

          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-8 mb-8 text-center sm:text-left">
            <div className="w-24 h-24 rounded-full bg-red-100 text-[#e53238] flex items-center justify-center font-black text-3xl border-4 border-white shadow-md">
              {user?.name?.[0] || "M"}
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-2 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Phone Verified Member</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{user?.name || "Shaadi Member"}</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">Profile ID: {user?.profileId} • Mobile: +91 {user?.mobileNumber}</p>
            </div>

            <button className="px-5 py-2.5 bg-[#e53238] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#c92429] flex items-center gap-1.5 cursor-pointer">
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider text-left border-b pb-2">Basic Information</h3>
              <div className="text-xs space-y-2 text-left">
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Created For:</span> <span className="font-bold text-gray-800">Self</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Age:</span> <span className="font-bold text-gray-800">26 yrs</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Height:</span> <span className="font-bold text-gray-800">5&apos;8&quot;</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Marital Status:</span> <span className="font-bold text-gray-800">Never Married</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider text-left border-b pb-2">Religious & Background</h3>
              <div className="text-xs space-y-2 text-left">
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Religion:</span> <span className="font-bold text-gray-800">Hindu</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Mother Tongue:</span> <span className="font-bold text-gray-800">Hindi</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Living City:</span> <span className="font-bold text-gray-800">Mumbai</span></p>
                <p className="flex justify-between py-1"><span className="text-gray-400 font-semibold">Country:</span> <span className="font-bold text-gray-800">India</span></p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}