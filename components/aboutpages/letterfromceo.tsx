import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function LetterFromCEO() {
  return (
    <main className="flex-1 max-w-4xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Letter from CEO</h1>
          
          <div className="relative w-full h-[320px] rounded-lg overflow-hidden mb-8 group">
            <Image 
              src="/ceo_banner.png" 
              alt="CEO Banner" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            <div className="absolute inset-0 p-12 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                At Shaadi, we build trust <br /> before we build matches.
              </h2>
              <p className="text-white/90 text-lg md:text-xl font-medium mt-4">
                - Anupam Mittal
              </p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>Dear,</p>
            
            <p>
              Weddings are not just a day in our lives, they are the beautiful milestone that marks the beginning of a new journey. But before that day comes, there&apos;s an equally important chapter: finding the person you want to share that journey with. It&apos;s one of life&apos;s most meaningful decisions, and at Shaadi.com, since 1997 we&apos;ve understood how significant and life-changing this phase is. That&apos;s why we&apos;ve dedicated ourselves to making this journey easier, more meaningful, and without any limitations. We are committed to helping people find their soulmates no matter where in the world they are.
            </p>

            <p>
              Over the years, millions have trusted Shaadi.com, not just because of the technology we&apos;ve built but because of the heart behind it. Today, we are at the perfect intersection of cutting-edge AI and human understanding. While our technology ensures smarter matches, greater privacy, and seamless experiences, our people ensure empathy, guidance, and the human touch that makes all the difference when it comes to matters of the heart.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">
              At the core of Team Shaadi.com are three clear mandates:
            </h3>

            <div className="bg-gray-50 rounded-2xl p-8 space-y-6 not-prose">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-800 leading-relaxed m-0 text-[16px]">
                    <strong className="text-gray-900 font-semibold">Understanding you deeply:</strong> Through research and insights, we keep learning about the needs, dreams, and concerns of singles everywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-800 leading-relaxed m-0 text-[16px]">
                    <strong className="text-gray-900 font-semibold">Creating a safe and superior experience:</strong> We zealously protect your privacy while ensuring your matchmaking journey feels fulfilling and respectful.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-800 leading-relaxed m-0 text-[16px]">
                    <strong className="text-gray-900 font-semibold">Empowering your choices:</strong> With easy-to-use features and tools, you stay in complete control as you connect with potential partners.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8">
              These principles guide our <strong className="text-gray-900">vision</strong> - to make finding a life partner a trusted and joyful experience for everyone. They define our <strong className="text-gray-900">mission</strong> - to be the world&apos;s most meaningful and effective matchmaking platform. And they fuel our confidence in offering an <strong className="text-gray-900">unconditional guarantee</strong> - a promise that we will always give you unmatched value and support on your journey.
            </p>

            <p>
              As you take the first steps toward one of the most important decisions of your life, I hope Shaadi.com helps you not just find a match, but find the one.
            </p>

            <p className="pt-2">
              Sincerely Yours,
            </p>

            <div className="mt-8">
              <p className="text-gray-800 font-medium m-0">Anupam Mittal</p>
              <p className="text-gray-600 m-0">Founder, Shaadi.com</p>
              
              <div className="mt-4 relative h-24 w-48 -ml-4">
                <Image
                  src="/signature.png"
                  alt="Anupam Mittal Signature"
                  fill
                  className="object-contain object-left mix-blend-multiply"
                />
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            <div>
              <p className="text-gray-800 mb-4">Follow me on:</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
    </main>
  );
}
