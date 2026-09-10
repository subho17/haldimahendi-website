import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function MissionAndPromise() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Mission &amp; Promise</h1>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 bg-[#f5efe9] shadow-sm" style={{ height: "320px", minHeight: "260px" }}>
        <Image 
          src="/mission_banner.png" 
          alt="Haldimehendi Mission Banner" 
          fill
          sizes="(max-width: 768px) 100vw, 850px"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe9] via-[#f5efe9]/90 to-transparent"></div>
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-xl">
          <span className="text-6xl sm:text-8xl font-serif text-amber-300/40 leading-none absolute top-4 left-6">&ldquo;</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-snug relative z-10 mt-4">
            At Haldimehendi, it is our life&apos;s mission to use technology for good and bring back deep and meaningful relationships.
          </h2>
          <p className="text-gray-600 font-medium relative z-10 mt-1 text-sm sm:text-base">
            — Leadership &amp; Founders Team
          </p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-8 text-[15px] sm:text-base">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Our Vision
          </h3>
          <p>
            Our vision is a world where the search for a life partner is as fulfilling, authentic, and joyful as the lifelong journey with a soulmate.
          </p>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Our Mission
          </h3>
          <p>
            The mission of Haldimehendi.com is to provide people with a superior matchmaking experience by expanding the opportunities available to meet potential life partners and build fulfilling relationships. We strive to do this through superior technology, in-depth research, valuable matrimonial content &amp; services, and above all the highest quality of customer service delivered with warmth, understanding, respect, and care.
          </p>
        </div>

        <div>
          <p>
            Our Vision and Mission have shaped our objectives as well as our technology. The modern platform used at Haldimehendi is a result of our continuous dedication to understanding our members and honoring their heritage and future aspirations.
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">
          Haldimehendi strives to —
        </h3>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-5 not-prose">
          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-800 m-0 text-sm sm:text-base">
              Display authentic, verified, and relevant matches aligned with your preferences
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-800 m-0 text-sm sm:text-base">
              Provide exemplary support and guidance 24 hours a day
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-800 m-0 text-sm sm:text-base">
              Protect our members&apos; privacy and personal contact details vigorously
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-800 m-0 text-sm sm:text-base">
              Offer our services in a safe, transparent, and courteous environment
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">
            Our Promise
          </h3>
          <p>
            Our research, mission, and core values combine to deliver to you the <strong>Haldimehendi Promise</strong>.
          </p>
          <p className="mt-4">
            We continually attempt to provide you with more relevant matches for every search that you conduct. We work with our community to understand their expectations and deliver trustworthy matchmaking through modern innovation and human empathy.
          </p>
        </div>
      </div>
    </div>
  );
}
