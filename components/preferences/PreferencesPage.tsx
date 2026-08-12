"use client";

import React from "react";
import { Navbar, Footer } from "@/components/Global";
import { Sliders, Save } from "lucide-react";

export default function PreferencesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e53238] uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4" />
            <span>Matchmaking Criteria</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
            Partner Preferences
          </h1>

          <div className="space-y-6 text-left">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Basic Partner Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Preferred Age:</span>
                  <span className="font-bold text-gray-800">21 to 28 yrs</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Preferred Height:</span>
                  <span className="font-bold text-gray-800">5&apos;0&quot; to 5&apos;8&quot;</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Cultural & Community Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Religion:</span>
                  <span className="font-bold text-gray-800">Hindu</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Mother Tongue:</span>
                  <span className="font-bold text-gray-800">Hindi, Bengali, Marathi</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Partner preferences saved!")}
              className="px-6 py-3 bg-[#e53238] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#c92429] flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Partner Preferences</span>
            </button>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}