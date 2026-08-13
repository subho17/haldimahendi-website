"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [lookingFor, setLookingFor] = useState("Woman");
  const [ageFrom, setAgeFrom] = useState("21");
  const [ageTo, setAgeTo] = useState("28");
  const [religion, setReligion] = useState("Hindu");
  const [motherTongue, setMotherTongue] = useState("Hindi");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e53238] uppercase tracking-wider mb-2">
            <Search className="w-4 h-4" />
            <span>Advanced Partner Search</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
            Find Your Ideal Match
          </h1>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Looking For</label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#e53238]"
              >
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Age Range</label>
              <div className="flex items-center gap-2">
                <select
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                >
                  {Array.from({ length: 30 }, (_, i) => 18 + i).map((a) => (
                    <option key={a} value={a}>{a} yrs</option>
                  ))}
                </select>
                <span className="text-xs font-bold text-gray-400">to</span>
                <select
                  value={ageTo}
                  onChange={(e) => setAgeTo(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                >
                  {Array.from({ length: 30 }, (_, i) => 21 + i).map((a) => (
                    <option key={a} value={a}>{a} yrs</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Religion</label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              >
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Mother Tongue</label>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              >
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="button"
                onClick={() => alert("Searching matches...")}
                className="w-full py-4 bg-[#e53238] hover:bg-[#c92429] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Matches Now</span>
              </button>
            </div>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}