"use client";

import React from "react";
import { Navbar, Footer } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

const MATCHES = [
  { name: "Priya S.", age: 25, height: "5'4\"", religion: "Hindu", tongue: "Hindi", loc: "Mumbai", edu: "Software Engineer", id: "SH884120" },
  { name: "Ananya M.", age: 24, height: "5'2\"", religion: "Hindu", tongue: "Bengali", loc: "Delhi NCR", edu: "Chartered Accountant", id: "SH910244" },
  { name: "Sneha R.", age: 26, height: "5'5\"", religion: "Hindu", tongue: "Marathi", loc: "Bengaluru", edu: "Product Manager", id: "SH774812" },
  { name: "Kavya P.", age: 25, height: "5'3\"", religion: "Hindu", tongue: "Telugu", loc: "Hyderabad", edu: "Data Scientist", id: "SH662910" },
  { name: "Ritu G.", age: 27, height: "5'6\"", religion: "Hindu", tongue: "Punjabi", loc: "Chandigarh", edu: "Doctor (MD)", id: "SH551930" },
  { name: "Divya K.", age: 24, height: "5'4\"", religion: "Hindu", tongue: "Tamil", loc: "Chennai", edu: "Architect", id: "SH441029" },
  { name: "Megha N.", age: 26, height: "5'5\"", religion: "Hindu", tongue: "Gujarati", loc: "Ahmedabad", edu: "Business Analyst", id: "SH332194" },
  { name: "Pooja V.", age: 25, height: "5'3\"", religion: "Hindu", tongue: "Hindi", loc: "Pune", edu: "HR Manager", id: "SH229104" },
];

export default function MatchesPage() {
  const { isAuthenticated } = useAuth();
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Matches <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-[#e53238] font-bold">20 New</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verified profiles matching your religion, mother tongue, and age criteria.
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 shadow-xs cursor-pointer">
            <Filter className="w-4 h-4 text-[#e53238]" />
            <span>Filter Matches</span>
          </button>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MATCHES.map((m, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-100 to-amber-100 text-[#e53238] flex items-center justify-center font-black text-xl mb-4 mx-auto border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  {m.name[0]}
                </div>

                <div className="text-center mb-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#e53238] transition-colors">{m.name}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{m.id}</p>
                </div>

                <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                  <p><span className="font-bold text-gray-700">Age / Height:</span> {m.age} yrs, {m.height}</p>
                  <p><span className="font-bold text-gray-700">Community:</span> {m.religion}, {m.tongue}</p>
                  <p><span className="font-bold text-gray-700">Location:</span> {m.loc}</p>
                  <p><span className="font-bold text-gray-700">Profession:</span> {m.edu}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 px-3 rounded-xl bg-[#e53238] text-white text-xs font-bold shadow-xs hover:bg-[#c92429] transition-colors cursor-pointer">
                  Send Interest
                </button>
                <button className="py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer">
                  Shortlist
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}