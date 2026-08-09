import React from 'react';
import { Search, Phone, Check, Bookmark } from 'lucide-react';

export default function Steps() {
  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center md:text-left mb-16">
          <p className="text-sm font-semibold tracking-[0.15em] text-gray-400 uppercase mb-2">
            Three simple steps to
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-gray-900">
            Find the <span className="text-[#de4f5b]">One for You</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start relative z-10">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            {/* Illustration */}
            <div className="h-48 w-full flex items-center justify-center relative mb-8">
              <div className="w-56 h-32 relative flex flex-col justify-between p-2">
                {/* Checkbox item 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#de4f5b] rounded-[4px] flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                  <div className="w-24 h-3 bg-gray-300 rounded-full"></div>
                </div>
                {/* Checkbox item 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-[4px] flex-shrink-0"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded-full"></div>
                </div>
                {/* Checkbox item 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#de4f5b] rounded-[4px] flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                  <div className="w-20 h-3 bg-gray-300 rounded-full"></div>
                </div>
                {/* Checkbox item 4 (unchecked) */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-[4px] flex-shrink-0"></div>
                  <div className="w-24 h-3 bg-gray-300 rounded-full"></div>
                </div>

                {/* Floating Slider element */}
                <div className="absolute right-0 top-8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-2xl w-40 h-16 p-4 flex flex-col justify-center gap-3">
                  <div className="relative h-[2px] bg-gray-200 w-full rounded-full">
                     <div className="absolute left-[20%] right-[30%] h-full bg-[#1976d2] flex items-center justify-between">
                        <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1976d2] -ml-1"></div>
                        <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1976d2] -mr-1"></div>
                     </div>
                  </div>
                  <div className="relative h-[2px] bg-gray-200 w-full rounded-full">
                     <div className="absolute left-[30%] right-[10%] h-full bg-[#1976d2] flex items-center justify-between">
                        <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1976d2] -ml-1"></div>
                        <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1976d2] -mr-1"></div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              <span className="text-[#de4f5b] mr-1">01.</span> Define Your Partner Preferences
            </h3>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            {/* Illustration */}
            <div className="h-48 w-full flex items-center justify-center relative mb-8">
              <div className="w-64 h-36 bg-gray-50/50 rounded-xl flex flex-col relative p-4 gap-4">
                 
                 {/* Floating Search bar */}
                 <div className="absolute -top-4 right-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-full h-10 w-44 px-4 flex items-center justify-between border border-gray-50 z-10">
                   <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                   <Search size={16} className="text-[#1976d2]" />
                 </div>

                 {/* Profile list item 1 */}
                 <div className="flex items-center gap-3 mt-4">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-sm">
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="w-24 h-3 bg-gray-300 rounded-full"></div>
                     <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                   </div>
                 </div>

                 {/* Profile list item 2 (active) */}
                 <div className="flex items-center gap-3 bg-white p-2 -mx-2 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.04)] z-0">
                   <div className="w-10 h-10 rounded-full bg-[#fdecec] flex-shrink-0 flex items-center justify-center border-2 border-white">
                      <div className="w-4 h-4 rounded-full bg-[#de4f5b]"></div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="w-28 h-3 bg-gray-400 rounded-full"></div>
                     <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                   </div>
                 </div>

                 {/* Profile list item 3 */}
                 <div className="flex items-center gap-3 opacity-50">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border-2 border-white">
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="w-20 h-3 bg-gray-300 rounded-full"></div>
                     <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                   </div>
                 </div>

              </div>
            </div>
            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              <span className="text-[#de4f5b] mr-1">02.</span> Browse Profiles
            </h3>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            {/* Illustration */}
            <div className="h-48 w-full flex items-center justify-center relative mb-8">
              <div className="relative w-56 h-36 flex items-center justify-center">
                {/* Background Card Left */}
                <div className="absolute w-36 h-28 bg-white border border-gray-100 shadow-sm rounded-xl -rotate-12 -translate-x-12 translate-y-2 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                </div>

                {/* Background Card Right */}
                <div className="absolute w-36 h-28 bg-white border border-gray-100 shadow-sm rounded-xl rotate-12 translate-x-12 translate-y-2 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                </div>

                {/* Main Foreground Card */}
                <div className="absolute w-40 h-36 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-xl z-10 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="absolute -top-3 left-6 text-[#1976d2]">
                    <Bookmark size={24} fill="currentColor" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#fdecec] flex items-center justify-center mt-2 border-2 border-white shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-[#de4f5b]"></div>
                  </div>
                  <div className="w-24 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                </div>

                {/* Floating Phone Icon */}
                <div className="absolute -bottom-4 -left-4 z-20 w-12 h-12 bg-[#de4f5b] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <Phone size={20} className="text-white" fill="currentColor" />
                </div>
              </div>
            </div>
            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              <span className="text-[#de4f5b] mr-1">03.</span> Send Interests & Connect
            </h3>
          </div>

        </div>

        {/* CTA Button */}
        <div className="mt-16 flex justify-center">
          <button className="bg-[#de4f5b] hover:bg-[#c9414d] text-white font-medium py-3 px-12 rounded shadow-md transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
