"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import SignupPageView from "@/components/ui/Signup/SignupPage";

const HERO_IMAGES = [
  "/images/hero-bg.jpg",
  "/images/hero-bg1.jpg",
  "/images/hero-bg2.jpg",
];

const SLIDE_INTERVAL_MS = 5000;

export default function SignupPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a0f14] flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 relative flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[calc(100vh-76px)]">
        {/* Hero Background Image Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#1a0f14]">
          {HERO_IMAGES.map((imgSrc, index) => (
            <div
              key={imgSrc}
              style={{ position: "absolute" }}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
              } transition-transform duration-10000`}
            >
              <Image
                src={imgSrc}
                alt="Matrimonial couples background"
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          {/* Dark Gradient & Vignette Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/75 backdrop-blur-[2px]" />
        </div>

        {/* Hero Section Content in Background */}
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-4 sm:mb-6 pointer-events-none">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium text-xs mb-2.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            <span>#1 Most Trusted Matrimonial & Matchmaking Service</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Find Your <span className="text-[#f59e0b]">Perfect Match</span>
          </h2>
        </div>

        {/* Rectangular Signup Card */}
        <div className="relative z-10 w-full mx-auto" style={{ maxWidth: "620px" }}>
          <Suspense fallback={<div className="flex h-64 items-center justify-center text-white font-bold text-sm">Loading signup...</div>}>
            <SignupPageView />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
