import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function MissionAndPromise() {
  return (
    <main className="flex-1 max-w-4xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Mission & Promise</h1>
          
          <div className="relative w-full h-[320px] rounded-lg overflow-hidden mb-8 bg-[#f5efe9]">
            <Image 
              src="/mission_banner.png" 
              alt="Mission Banner" 
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe9] via-[#f5efe9]/90 to-transparent"></div>
            <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-xl">
              <span className="text-8xl font-serif text-gray-300/40 leading-none absolute top-4 left-6">&ldquo;</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug relative z-10 mt-6">
                At Shaadi.com, it is our life&apos;s mission to use technology for good and bring back deep and meaningful relationships.
              </h2>
              <p className="text-gray-600 font-medium relative z-10 mt-2">
                - Anupam Mittal, Founder & CEO
              </p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Our Vision
              </h3>
              <p>
                Our vision is a world where the search for a life-partner is as fulfilling as the journey with a soul-mate
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Our Mission
              </h3>
              <p>
                The mission of Shaadi.com is to provide people with a superior matchmaking experience by expanding the opportunities available to meet potential life partners and build fulfilling relationships. We strive to do this through superior technology, in-depth research, valuable matrimonial content & services, and above all the highest quality of customer service delivered with a sense of warmth, understanding, respect, and care.
              </p>
            </div>

            <div>
              <p>
                Our Vision and Mission have shaped our objectives as well as our technology. The world - class technology used at Shaadi.com is a result of the objectives of the organization which are based on tireless research and understanding of our customers.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-10 mb-4">
              Shaadi.com strives to -
            </h3>

            <div className="bg-gray-50 rounded-2xl p-8 space-y-6 not-prose">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-gray-800 m-0 text-[16px]">
                  Display more relevant matches than any other matchmaking service
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-gray-800 m-0 text-[16px]">
                  Provide exemplary service 24 hours a day
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-gray-800 m-0 text-[16px]">
                  Protect our member&apos;s privacy vigorously
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-gray-800 m-0 text-[16px]">
                  Offer our services in a safe, friendly and courteous manner
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
                Our Promise
              </h3>
              <p>
                Our research, mission and objectives have all combined to deliver to you the Shaadi.com Promise.
              </p>
              <p className="mt-6">
                We will continually attempt to provide you with more relevant matches for every search that you conduct than any other matchmaking service provider. We will work with our customers to understand their needs and provide solutions that meet those needs through superior technology and superior service.
              </p>
              <p className="mt-6">
                In fact we believe so strongly that Shaadi.com is the right match-making solution for you, we even back our promise with an <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">unconditional guarantee</a>.
              </p>
            </div>
          </div>
    </main>
  );
}
