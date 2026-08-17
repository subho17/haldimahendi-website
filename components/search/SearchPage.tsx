/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Search, Loader2, MapPin, UserX } from "lucide-react";
import Link from "next/link";

interface SearchProfile {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  motherTongue?: string;
  education: string;
  profession: string;
  city: string;
  maritalStatus: string;
  gender: string;
  avatarUrl: string;
  bio?: string;
}

export default function SearchPage() {
  const [lookingFor, setLookingFor] = useState("Woman");
  const [ageFrom, setAgeFrom] = useState("21");
  const [ageTo, setAgeTo] = useState("35");
  const [religion, setReligion] = useState("Any");
  const [motherTongue, setMotherTongue] = useState("Any");
  const [maritalStatus, setMaritalStatus] = useState("Any");
  const [city, setCity] = useState("");

  const [results, setResults] = useState<SearchProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (lookingFor !== "Any") params.set("gender", lookingFor);
      params.set("minAge", ageFrom);
      params.set("maxAge", ageTo);
      if (religion !== "Any") params.set("religion", religion);
      if (motherTongue !== "Any") params.set("motherTongue", motherTongue);
      if (maritalStatus !== "Any") params.set("maritalStatus", maritalStatus);
      if (city.trim()) params.set("city", city.trim());

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.success && Array.isArray(data.profiles) ? data.profiles : []);
    } catch (e) {
      console.error("Search failed:", e);
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const selectCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#e53238] outline-none";
  const inputCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#e53238] outline-none";

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

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Looking For</label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className={selectCls}
              >
                <option value="Any">Any</option>
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Age Range</label>
              <div className="flex items-center gap-2">
                <select value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} className={selectCls}>
                  {Array.from({ length: 50 }, (_, i) => 18 + i).map((a) => (
                    <option key={a} value={a}>{a} yrs</option>
                  ))}
                </select>
                <span className="text-xs font-bold text-gray-400">to</span>
                <select value={ageTo} onChange={(e) => setAgeTo(e.target.value)} className={selectCls}>
                  {Array.from({ length: 50 }, (_, i) => 18 + i).map((a) => (
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
                className={selectCls}
              >
                <option value="Any">Any</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Mother Tongue</label>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className={selectCls}
              >
                <option value="Any">Any</option>
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Malayalam">Malayalam</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className={selectCls}
              >
                <option value="Any">Any</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block uppercase">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={searching}
                className="w-full py-4 bg-[#e53238] hover:bg-[#c92429] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{searching ? "Searching..." : "Search Matches Now"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">
                {searching ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#e53238]" /> Searching...</span>
                ) : (
                  `${results.length} Result${results.length === 1 ? "" : "s"} Found`
                )}
              </h2>
            </div>

            {!searching && results.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-xs">
                <UserX className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">No profiles match your criteria</h3>
                <p className="text-sm text-gray-500">Try widening your search filters.</p>
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-red-100 to-amber-100 text-[#e53238] flex items-center justify-center font-black text-lg mx-auto border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        {p.avatarUrl && p.avatarUrl !== "/images/default-avatar.png" ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name.charAt(0)
                        )}
                      </div>

                      <div className="text-center mb-3 mt-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#e53238] transition-colors">
                          {p.name} <span className="text-xs text-emerald-600 font-bold">✓</span>
                        </h3>
                        <p className="text-xs text-gray-500 font-semibold">{p.id}</p>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                        <p><span className="font-bold text-gray-700">Age / Height:</span> {p.age} yrs, {p.height}</p>
                        <p><span className="font-bold text-gray-700">Community:</span> {p.religion}, {p.motherTongue || "—"}</p>
                        <p><span className="font-bold text-gray-700">Status:</span> {p.maritalStatus}</p>
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> <span className="font-bold text-gray-700">Location:</span> {p.city}</p>
                        <p><span className="font-bold text-gray-700">Profession:</span> {p.profession || p.education}</p>
                      </div>
                    </div>

                    <Link
                      href={`/profile/${encodeURIComponent(p.id)}?back=/search`}
                      className="block w-full py-2.5 px-3 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-xs hover:bg-[#c92429] transition-colors text-center cursor-pointer"
                    >
                      View Full Profile
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}