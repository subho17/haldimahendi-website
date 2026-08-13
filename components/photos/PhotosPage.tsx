"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Camera, Upload } from "lucide-react";

export default function PhotosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-lg mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#e53238] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Camera className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Photos & Privacy Control 📸
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2">
            Profiles with photos get up to 10x more responses. You have 100% control over who can view your photo.
          </p>

          <div className="mt-8 p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="font-bold text-gray-800 text-sm">Drag and drop your photos here</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Supports JPG, PNG (Max 10MB per photo)</p>

            <button
              onClick={() => alert("Select photos to upload")}
              className="px-6 py-3 bg-[#e53238] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#c92429] cursor-pointer"
            >
              Browse Photo Files
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}