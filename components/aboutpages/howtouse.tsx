import React from 'react';

export default function HowToUse() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-6">How to use Shaadi.com</h1>
      
      <p className="text-gray-700 leading-relaxed text-[16px] mb-12">
        Finding your dream life partner on Shaadi.com is easy. All you need to do is explore, connect, and interact. Here are a few easy steps to help you make the most of your Shaadi.com experience:
      </p>

      {/* Step 1 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-12">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">1. Create Your Profile</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            Sign up with your email or phone, add basic details, upload a clear photo, and complete your profile. The more complete and honest it is, the better your matches.
          </p>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-pink-50/50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-gradient-to-b from-[#e3424d] to-[#9e1c25] rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col items-center justify-center p-4 relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl"></div>
                <div className="w-full space-y-3 mt-auto mb-6">
                    <div className="h-8 bg-white/90 rounded-full w-full flex items-center px-3 gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-8 bg-white/90 rounded-full w-full flex items-center px-3 gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-8 bg-white/90 rounded-full w-full flex items-center px-3 gap-2">
                        <div className="w-4 h-4 bg-blue-100 rounded-full"></div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-cyan-50/50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-white rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col p-4 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl"></div>
                
                <div className="mt-8 space-y-6">
                    <div className="w-full">
                        <div className="h-2 bg-gray-200 w-1/2 mb-3 rounded-full"></div>
                        <div className="h-1 bg-teal-400 w-full rounded-full relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-2 w-3 h-3 bg-teal-600 rounded-full shadow-sm"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-2 w-3 h-3 bg-teal-600 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="h-2 bg-gray-200 w-1/2 mb-3 rounded-full"></div>
                        <div className="h-1 bg-teal-400 w-full rounded-full relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-6 w-3 h-3 bg-teal-600 rounded-full shadow-sm"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-3 h-3 bg-teal-600 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="h-2 bg-gray-200 w-1/3 mb-2 rounded-full"></div>
                        <div className="h-6 border border-gray-200 rounded-md w-full flex items-center px-2">
                            <div className="h-2 bg-gray-300 w-1/2 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">2. Set Match Preferences</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            Define what you&apos;re looking for in a partner — age, location, religion, education, etc. This helps tailor your matches so you see profiles that align with your expectations.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-24">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">3. Browse Matches</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            Explore your daily match recommendations and use filters to refine results. You can view profiles, photos, bio details, and interests to decide who to connect with.
          </p>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-pink-50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-gray-100 rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col p-0 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl z-10"></div>
                
                {/* Image Placeholder */}
                <div className="w-full h-[70%] bg-pink-200"></div>
                
                {/* Info Area */}
                <div className="w-full h-[30%] bg-white p-3 flex flex-col justify-end">
                    <div className="h-4 bg-gray-300 w-3/4 rounded-sm mb-2"></div>
                    <div className="h-2 bg-gray-200 w-1/2 rounded-sm mb-1"></div>
                    <div className="h-2 bg-gray-200 w-2/3 rounded-sm"></div>
                </div>
                
                {/* Floating buttons */}
                <div className="absolute bottom-[25%] right-2 w-10 h-10 bg-teal-500 rounded-full border-2 border-white shadow flex items-center justify-center">
                    <div className="w-4 h-4 text-white font-bold text-xs">✓</div>
                </div>
            </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-cyan-50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-gray-100 rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col p-0 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl z-10"></div>
                
                {/* Image Placeholder full screen */}
                <div className="w-full h-full bg-cyan-100 relative">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 p-2 rounded-full backdrop-blur-sm">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">✕</div>
                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">✓</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">4. Express Interest</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            When you find someone you like, send a connect request or &quot;interest.&quot; You can also send a thoughtful message to increase the chance of a response.
          </p>
        </div>
      </div>

      {/* Step 5 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-24">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">5. Chat and Connect</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            Once interest is accepted, start a conversation. Keep it respectful and authentic. This is your opportunity to know each other better and decide next steps.
          </p>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-pink-50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-white rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col p-0 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl z-10"></div>
                
                {/* Header */}
                <div className="w-full h-12 bg-white border-b border-gray-100 flex items-end justify-between px-3 pb-2 pt-6">
                    <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                    <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                </div>
                
                {/* Chat List */}
                <div className="flex-1 w-full p-2 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                        <div className="flex-1">
                            <div className="h-2 w-16 bg-gray-300 rounded-full mb-1"></div>
                            <div className="h-1.5 w-24 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100"></div>
                        <div className="flex-1">
                            <div className="h-2 w-12 bg-gray-300 rounded-full mb-1"></div>
                            <div className="h-1.5 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100"></div>
                        <div className="flex-1">
                            <div className="h-2 w-20 bg-gray-300 rounded-full mb-1"></div>
                            <div className="h-1.5 w-28 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Step 6 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center mt-24 mb-12">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden bg-cyan-50 flex items-center justify-center p-8 min-h-[300px]">
            <div className="w-48 h-80 bg-gray-50 rounded-[2rem] border-[6px] border-gray-900 shadow-xl flex flex-col p-0 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl z-10"></div>
                
                {/* Header */}
                <div className="w-full h-12 bg-white border-b border-gray-100 flex items-end justify-center pb-2 pt-6">
                    <div className="h-2 w-24 bg-gray-300 rounded-full"></div>
                </div>
                
                {/* Pricing Card */}
                <div className="flex-1 w-full p-3 flex flex-col items-center">
                    <div className="w-full h-auto bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center">
                        <div className="w-16 h-4 bg-green-100 rounded-full mb-3 flex items-center justify-center">
                            <div className="w-10 h-1.5 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full mb-2 flex items-center justify-center border-4 border-yellow-50"></div>
                        <div className="h-2 w-20 bg-gray-300 rounded-full mb-1"></div>
                        <div className="h-4 w-16 bg-gray-800 rounded-full mb-4 mt-2"></div>
                        <div className="w-full space-y-2">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
                            <div className="h-1.5 w-5/6 bg-gray-100 rounded-full"></div>
                            <div className="h-1.5 w-4/6 bg-gray-100 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">6. Upgrade to Premium</h2>
          <p className="text-gray-700 leading-relaxed text-[16px]">
            If you&apos;re serious about faster responses and more reach, consider upgrading to Premium. Premium members get benefits like seeing who viewed or liked you, sending unlimited messages, higher search visibility, and priority support. It can speed up your search and help you connect with the right matches sooner.
          </p>
        </div>
      </div>
    </main>
  );
}
