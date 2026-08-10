'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HERO_IMAGES = [
  '/images/hero-bg.jpg',
  '/images/hero-bg1.jpg',
  '/images/hero-bg2.jpg',

];

const SLIDE_INTERVAL_MS = 5000;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lookingFor, setLookingFor] = useState('Woman');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('28');
  const [religion, setReligion] = useState('Hindu');
  const [motherTongue, setMotherTongue] = useState('Hindi');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Hero Background Slideshow with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          key={HERO_IMAGES[activeIndex]}
          src={HERO_IMAGES[activeIndex]}
          alt={`Matrimonial couples background ${activeIndex + 1}`}
          fill
          sizes="100vw"
          priority={activeIndex === 0}
          className="object-cover object-center"
        />
        {/* Dark Romantic Gradient Overlay for Perfect Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full translate-y-6">

        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm mb-6 shadow-lg animate-pulse -translate-y-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d52]"></span>
          <span>#1 Most Trusted Matrimonial & Matchmaking Service</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto drop-shadow-md">
          Find Your <span className="text-[#ff4d52] underline decoration-red-400 decoration-wavy">Perfect Match</span> With Trust & Joy
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-light">
          Over 6 million happy marriages started right here. Connect with verified profiles based on culture, values, and shared dreams.
        </p>

        {/* Interactive Search Bar Glassmorphism Card */}
        <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

            {/* Looking For */}
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                I&apos;m looking for a
              </label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-[#e53238] focus:border-transparent outline-hidden cursor-pointer hover:bg-gray-100/80 transition-colors"
              >
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
              </select>
            </div>

            {/* Age Range */}
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Aged
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(e.target.value)}
                  className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-[#e53238] outline-hidden cursor-pointer hover:bg-gray-100/80 transition-colors"
                >
                  {Array.from({ length: 50 }, (_, i) => 18 + i).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <span className="text-gray-400 text-xs font-bold">to</span>
                <select
                  value={ageTo}
                  onChange={(e) => setAgeTo(e.target.value)}
                  className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-[#e53238] outline-hidden cursor-pointer hover:bg-gray-100/80 transition-colors"
                >
                  {Array.from({ length: 50 }, (_, i) => 21 + i).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Religion */}
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Religion
              </label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-[#e53238] outline-hidden cursor-pointer hover:bg-gray-100/80 transition-colors"
              >
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Parsi">Parsi</option>
                <option value="Other">Any Religion</option>
              </select>
            </div>

            {/* Mother Tongue */}
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Mother Tongue
              </label>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-[#e53238] outline-hidden cursor-pointer hover:bg-gray-100/80 transition-colors"
              >
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Punjabi">Punjabi</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Search CTA Button */}
            <div>
              <Link
                href={`/auth/signup?lookingFor=${lookingFor}&religion=${religion}&motherTongue=${motherTongue}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#e53238] text-white font-bold text-sm shadow-lg hover:bg-[#c92429] active:scale-98 transition-all cursor-pointer hover:shadow-red-500/25"
              >
                <span>Let&apos;s Begin</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
        {/* Slideshow Dots */}
        <div className="mt-10 sm:mt-12 flex items-center justify-center gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeIndex ? 'w-8 bg-[#ff4d52]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
