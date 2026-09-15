import React from 'react';
import Image from 'next/image';

export default function Celebrating30Years() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Celebrating Milestones of Trust &amp; Innovation</h1>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 bg-[#fdeadc] shadow-sm" style={{ height: "300px", minHeight: "240px" }}>
        <Image 
          src="/celebrating_30_years_banner.png" 
          alt="Celebrating Milestones" 
          fill
          sizes="(max-width: 768px) 100vw, 850px"
          loading="lazy"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdeadc] via-[#fdeadc]/90 to-transparent"></div>
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-center relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-700 mb-2 tracking-tight">
              COMMUNITY.
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Thousands of Happy Matches.</h3>
            <p className="text-lg sm:text-xl text-gray-800 font-medium">Come, join the celebrations!</p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-[#333333] leading-relaxed space-y-6 text-[15px] sm:text-base">
        <p>
          At <strong>Haldimehendi.com</strong>, we have been constantly innovating to provide a superior, secure, and delightful matchmaking experience to our members.
        </p>
        <p>
          We also endeavor to use technology to create positive social impact—promoting respectful connections, gender equality, and safe digital matchmaking spaces.
        </p>
        <p>
          With verified members and countless couples who have embarked on their life journeys through our platform, Haldimehendi is dedicated to shaping happy lifelong unions across India and worldwide.
        </p>
      </div>
    </div>
  );
}
