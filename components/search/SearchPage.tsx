"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Search, Loader2, MapPin, UserX, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

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
  mobileNumber?: string;
  email?: string;
  verified?: boolean;
  premium?: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.profileId || user?.mobileNumber || user?.email || "";

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
      if (userId) params.set("userId", userId);
      if (user?.profileId) params.set("profileId", user.profileId);
      const mobile = user?.mobile_number || user?.mobileNumber || "";
      if (mobile) params.set("userMobile", mobile);
      if (user?.email) params.set("userEmail", user.email);
      if (lookingFor !== "Any") params.set("gender", lookingFor);
      params.set("minAge", ageFrom);
      params.set("maxAge", ageTo);
      if (religion !== "Any") params.set("religion", religion);
      if (motherTongue !== "Any") params.set("motherTongue", motherTongue);
      if (maritalStatus !== "Any") params.set("maritalStatus", maritalStatus);
      if (city.trim()) params.set("city", city.trim());

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        const myProfileId = (user?.profileId || "").toLowerCase().trim();
        const myMobile = (user?.mobile_number || user?.mobileNumber || "").replace(/\D/g, "");
        const myEmail = (user?.email || "").toLowerCase().trim();
        const safe = data.profiles.filter((p: SearchProfile) => {
          const pId = (p.id || "").toLowerCase().trim();
          const pMob = p.mobileNumber ? String(p.mobileNumber).replace(/\D/g, "") : "";
          const pEm = p.email ? String(p.email).toLowerCase().trim() : "";
          if (myProfileId && pId === myProfileId) return false;
          if (myMobile && pMob && pMob === myMobile) return false;
          if (myEmail && pEm && pEm === myEmail) return false;
          return true;
        });
        setResults(safe);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error("Search failed:", e);
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const selectCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#d97706] outline-none";
  const inputCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#d97706] outline-none";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d97706] uppercase tracking-wider mb-2">
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
                className="w-full py-4 bg-[#d97706] hover:bg-[#b45309] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
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
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#d97706]" /> Searching...</span>
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
                    onClick={() => router.push(`/profile/${encodeURIComponent(p.id)}?back=/search`)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                  >
                    <div>
                      <div className="relative w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {p.premium && (
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1 z-10 text-[10px] font-black text-amber-900 bg-gradient-to-r from-amber-300 to-amber-400 px-2.5 py-1 rounded-full shadow-md border border-amber-200/70 uppercase">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                        )}
                        {p.avatarUrl && p.avatarUrl !== "/images/default-avatar.png" ? (
                          <Image
                            src={p.avatarUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-rose-500 via-[#d97706] to-amber-500 flex items-center justify-center text-white font-black text-4xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="mb-3">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#d97706] transition-colors text-base flex items-center gap-1">
                            <span>{p.name}</span>
                            <span className="text-xs text-emerald-600 font-bold">✓</span>
                          </h3>
                          <p className="text-xs text-gray-400 font-semibold">ID: {p.id ? (p.id.startsWith("#") ? p.id : `#${p.id}`) : ""}</p>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
                          <p><span className="font-bold text-gray-700">Age / Height:</span> {p.age} yrs, {p.height}</p>
                          <p><span className="font-bold text-gray-700">Community:</span> {p.religion}, {p.motherTongue || "—"}</p>
                          <p><span className="font-bold text-gray-700">Status:</span> {p.maritalStatus}</p>
                          <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> <span className="font-bold text-gray-700">Location:</span> {p.city}</p>
                          <p><span className="font-bold text-gray-700">Profession:</span> {p.profession || p.education}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/profile/${encodeURIComponent(p.id)}?back=/search`}
                        className="block w-full py-2.5 px-3 rounded-xl bg-[#d97706] text-white text-xs font-bold shadow-xs hover:bg-[#b45309] transition-colors text-center cursor-pointer"
                      >
                        View Full Profile
                      </Link>
                    </div>
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
