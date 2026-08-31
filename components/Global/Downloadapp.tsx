import React from 'react';
import Image from 'next/image';
import { Apple, Play, QrCode } from 'lucide-react';

export default function Downloadapp() {
  return (
    <section className="bg-white py-16 px-4 md:px-8 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1f2937]">
            Download the Haldi Mehendi app
          </h2>
          <p className="text-lg text-gray-600">
            Connect with your matches anytime, anywhere
          </p>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 max-w-md w-full mt-6">
            <p className="text-gray-700 text-sm md:text-base mb-6 text-center">
              Point your phone camera at the QR code or use one of the download links below
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <QrCode size={90} className="text-gray-800" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <button className="flex items-center justify-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-green-700 transition w-full">
                  <Play size={24} fill="currentColor" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-gray-300">GET IT ON</div>
                    <div className="text-sm font-semibold leading-none mt-1">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-green-700 transition w-full">
                  <Apple size={24} fill="currentColor" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-gray-300">Download on the</div>
                    <div className="text-sm font-semibold leading-none mt-1">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Mobile Mockups */}
        <div className="relative h-[550px] md:h-[600px] w-full flex justify-center items-center mt-8 md:mt-0">
          
          {/* Secondary Phone (Background) */}
          <div className="absolute right-4 sm:right-12 md:-right-4 lg:right-4 top-12 w-[220px] sm:w-[240px] h-[480px] bg-white rounded-[2.5rem] p-2 shadow-xl border-4 border-gray-100 opacity-90 scale-95 transform translate-x-8 sm:translate-x-12 overflow-hidden z-0">
             <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-gray-50 flex flex-col">
              {/* Phone Header */}
              <div className="px-4 py-4 border-b flex justify-between items-center bg-white">
                <div className="font-semibold text-sm">Activity</div>
              </div>
               {/* Phone Image area */}
               <div className="p-3 grid grid-cols-2 gap-2 h-full overflow-hidden bg-gray-50">
                  <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=300" width={200} height={300} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Profile" />
                  <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=300" width={200} height={300} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Profile" />
                  <Image src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=300" width={200} height={300} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Profile" />
                  <Image src="https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200&h=300" width={200} height={300} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Profile" />
               </div>
             </div>
          </div>

          {/* Main Phone */}
          <div className="absolute left-4 sm:left-12 md:left-4 lg:left-12 z-10 w-[240px] sm:w-[260px] h-[520px] bg-white rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-100 overflow-hidden">
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-gray-50 flex flex-col">
              {/* Phone Header */}
              <div className="px-4 py-4 border-b flex justify-between items-center bg-white z-10">
                <div className="font-semibold text-sm">My Matches</div>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-100"></div>
                </div>
              </div>
              {/* Phone Image area */}
              <div className="relative flex-1 bg-gray-200">
                <Image 
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400&h=600" 
                  alt="Match profile" 
                  fill
                  sizes="(max-width: 768px) 400px, 600px"
                  className="object-cover"
                />
                {/* Overlay text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">Pro Lite</span>
                    <span className="text-[10px] text-gray-200">Last seen at 11:30 am</span>
                  </div>
                  <div className="font-bold text-xl mt-1">Ayushi Gupta, 27</div>
                  <div className="text-xs text-gray-200 mt-1 line-clamp-2">5&apos;4&quot; • New Delhi • Bania - Khandelwal<br/>Software Professional</div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </div>
                      <span className="text-[9px]">Send Interest</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </div>
                      <span className="text-[9px]">Shortlist</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <span className="text-[9px]">Chat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pill 1 */}
            <div className="absolute top-1/4 -left-8 sm:-left-12 bg-white rounded-full py-2.5 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 z-20 transform hover:scale-105 transition-transform duration-300">
              <span className="text-sm font-semibold text-amber-600">Easy Verification</span>
            </div>
            
            {/* Pill 2 */}
            <div className="absolute top-1/2 -right-8 sm:-right-12 bg-white rounded-full py-2.5 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 z-20 transform hover:scale-105 transition-transform duration-300">
              <span className="text-sm font-semibold text-green-600">Voice & Video Calls</span>
            </div>
          </div>

          {/* Pill 3 */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-1/3 bg-white rounded-full py-2.5 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 z-20 transform hover:scale-105 transition-transform duration-300">
            <span className="text-sm font-bold text-amber-600">10M+ downloads</span>
          </div>

        </div>
      </div>
    </section>
  );
}
