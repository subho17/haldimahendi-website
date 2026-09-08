import React from 'react';
import Image from 'next/image';

export default function Celebrating30Years() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-6">Celebrating 30 years of innovation</h1>
      
      <div className="relative w-full h-[320px] rounded-lg overflow-hidden mb-8 bg-[#fdeadc]">
        <Image 
          src="/celebrating_30_years_banner.png" 
          alt="Celebrating 30 Years" 
          fill
          className="object-cover object-right"
        />
        {/* Added a subtle gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdeadc] via-[#fdeadc]/90 to-transparent"></div>
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold text-[#e45b5c] mb-2 tracking-tight">30 YEARS.</h2>
            <h3 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Millions of Matches.</h3>
            <p className="text-2xl text-gray-800 font-medium tracking-tight">Come, Join the celebrations!</p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-[#333333] leading-relaxed space-y-6 text-[16px]">
        <p>
          We at Shaadi.com have been constantly innovating in order to provide a superior match making experience to our members.
        </p>
        <p>
          We also endeavour to use this technology to undertake activities that will benefit the society at large.
        </p>
        <p>
          To be awarded the Indian Digital Media Awards (IDMA) 2013 for Best Social Media Campaign - Social Cause as well as Indira Awards for Marketing Excellence for our Anti Dowry initiative, Angry brides, tells us that we are on the right path.
        </p>
        <p>
          With over 35 million members and millions of couples who have started their journey with us, Shaadi.com is definitely the World&apos;s Largest Matchmaking Service.
        </p>
      </div>
    </main>
  );
}
