import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function LetterFromCEO() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 tracking-tight">Letter from CEO</h1>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 group shadow-sm" style={{ height: "320px", minHeight: "260px" }}>
        <Image 
          src="/ceo_banner.png" 
          alt="Haldimehendi CEO Banner" 
          fill
          sizes="(max-width: 768px) 100vw, 850px"
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <span className="inline-block text-[#fbbf24] text-xs font-bold uppercase tracking-widest mb-2">Our Founder&apos;s Vision</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
            At Haldimehendi, we build trust <br className="hidden sm:inline" /> before we build matches.
          </h2>
          <p className="text-white/90 text-sm sm:text-base font-semibold mt-3">
            — Leadership &amp; Founders Team
          </p>
        </div>
      </div>

      <div className="text-gray-700 leading-relaxed space-y-6 text-[15px] sm:text-base">
        <p className="font-semibold text-gray-900 text-lg">Dear Member,</p>
        
        <p>
          Weddings are not just a day in our lives, they are the beautiful milestone that marks the beginning of a new journey. But before that day comes, there&apos;s an equally important chapter: finding the person you want to share that journey with. It&apos;s one of life&apos;s most meaningful decisions, and at <strong>Haldimehendi.com</strong>, we understand how significant and life-changing this phase is. That&apos;s why we&apos;ve dedicated ourselves to making this journey easier, more meaningful, and without any limitations. We are committed to helping people find their soulmates no matter where in the world they are.
        </p>

        <p>
          Over the years, thousands have trusted <strong>Haldimehendi.com</strong>, not just because of the modern technology we&apos;ve built but because of the heart behind it. Today, we are at the perfect intersection of intelligent matchmaking and human understanding. While our technology ensures smarter matches, greater privacy, and seamless experiences, our people ensure empathy, guidance, and the human touch that makes all the difference when it comes to matters of the heart.
        </p>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-4">
          At the core of Team Haldimehendi are three clear mandates:
        </h3>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-gray-800 leading-relaxed m-0 text-sm sm:text-[15px]">
                <strong className="text-gray-900 font-bold">Understanding you deeply:</strong> Through continuous feedback and community insights, we keep learning about the authentic needs, dreams, and preferences of families and singles everywhere.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-gray-800 leading-relaxed m-0 text-sm sm:text-[15px]">
                <strong className="text-gray-900 font-bold">Creating a safe and superior experience:</strong> We zealously protect your privacy, verify profiles with document and selfie checks, and ensure your matchmaking journey feels fulfilling and respectful.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-gray-800 leading-relaxed m-0 text-sm sm:text-[15px]">
                <strong className="text-gray-900 font-bold">Empowering your choices:</strong> With intuitive features, flexible search filters, and audio/chat tools, you stay in complete control as you connect with prospective life partners.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8">
          These principles guide our <strong className="text-gray-900">vision</strong> — to make finding a life partner a trusted, joyful, and authentic experience for everyone. They define our <strong className="text-gray-900">mission</strong> — to be the world&apos;s most meaningful and effective matrimonial matchmaking platform. And they fuel our confidence in offering unmatched value and support on your journey.
        </p>

        <p>
          As you take the first steps toward one of the most important decisions of your life, we hope <strong>Haldimehendi.com</strong> helps you not just find a match, but find the one.
        </p>

        <p className="pt-2 font-medium text-gray-700">
          Sincerely Yours,
        </p>

        <div className="pt-2">
          <p className="text-gray-900 font-bold text-base m-0">Leadership Team</p>
          <p className="text-slate-500 text-xs sm:text-sm m-0">Haldimehendi.com</p>
          
          <div className="mt-3 relative h-16 w-44 -ml-2">
            <Image
              src="/signature.png"
              alt="Haldimehendi Signature"
              fill
              sizes="180px"
              className="object-contain object-left mix-blend-multiply"
            />
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        <div>
          <p className="text-gray-800 font-semibold text-sm mb-4">Connect with us on:</p>
          <div className="flex gap-3">
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
