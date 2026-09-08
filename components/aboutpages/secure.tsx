import React from 'react';
import { ShieldCheck, ChevronRight, AlertTriangle, Settings, Heart, Phone, Mail } from 'lucide-react';

export default function Secure() {
  return (
    <main className="flex-1 max-w-4xl font-sans">
      <h1 className="text-3xl font-semibold text-[#253252] mb-6">Safety Centre</h1>
      <p className="text-gray-700 leading-relaxed text-[16px] mb-10">
        Your safety matters deeply at Shaadi.com. Our team works with advanced tools to ensure your matchmaking journey remains secure and safe.
      </p>

      {/* The 100% Secure Button / Card that opens in a new tab */}
      <a 
        href="#" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full max-w-3xl rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
      >
        <div className="w-full h-[350px] relative flex items-center justify-center overflow-hidden bg-gray-100">
            {/* Mockup of the couple image */}
            <div className="absolute inset-0 flex">
                <div className="flex-1 bg-[#d8b8a8]"></div>
                <div className="flex-1 bg-[#5b8c8d]"></div>
            </div>
            
            {/* The shield icon overlay */}
            <div className="relative z-10 w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl">
                <ShieldCheck className="w-16 h-16 text-white fill-[#00a859]" />
            </div>
        </div>
        
        <div className="bg-white p-6 flex justify-between items-center">
            <span className="text-[22px] font-semibold text-[#253252]">
                Find out how Shaadi builds a safer space for love.
            </span>
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-6 h-6 text-cyan-500" />
            </div>
        </div>
      </a>

      {/* Safety Features List */}
      <div className="mt-16 space-y-12">
        {/* Safety Tips */}
        <div className="flex gap-6 items-start">
            <ShieldCheck className="w-7 h-7 text-gray-700 shrink-0 mt-1" />
            <div>
                <h3 className="text-xl font-semibold text-[#253252] mb-3">Safety Tips</h3>
                <p className="text-gray-600 leading-relaxed text-[15.5px] mb-3">
                    Follow these practical guidelines to protect yourself while connecting with potential Matches.
                </p>
                <a href="#" className="text-cyan-500 font-medium hover:text-cyan-600 transition-colors">Know More</a>
            </div>
        </div>

        {/* Report a Profile */}
        <div className="flex gap-6 items-start">
            <AlertTriangle className="w-7 h-7 text-gray-700 shrink-0 mt-1" />
            <div>
                <h3 className="text-xl font-semibold text-[#253252] mb-3">Report a Profile</h3>
                <p className="text-gray-600 leading-relaxed text-[15.5px] mb-3">
                    Report any suspicious or inappropriate behavior immediately—especially requests for money, unsolicited contact, or blackmail threats.
                </p>
                <a href="#" className="text-cyan-500 font-medium hover:text-cyan-600 transition-colors">Know More</a>
            </div>
        </div>

        {/* Privacy Settings */}
        <div className="flex gap-6 items-start">
            <Settings className="w-7 h-7 text-gray-700 shrink-0 mt-1" />
            <div>
                <h3 className="text-xl font-semibold text-[#253252] mb-3">Privacy Settings</h3>
                <p className="text-gray-600 leading-relaxed text-[15.5px] mb-3">
                    Manage who sees your photos, contact info, & profile and always be in control.
                </p>
                <a href="#" className="text-cyan-500 font-medium hover:text-cyan-600 transition-colors">Know More</a>
            </div>
        </div>

        {/* Mental Wellbeing */}
        <div className="flex gap-6 items-start">
            <Heart className="w-7 h-7 text-gray-700 shrink-0 mt-1" />
            <div>
                <h3 className="text-xl font-semibold text-[#253252] mb-3">Mental Wellbeing</h3>
                <p className="text-gray-600 leading-relaxed text-[15.5px] mb-3">
                    Here&apos;s how you can prioritize your mental well-being while making this life-changing decision.
                </p>
                <a href="#" className="text-cyan-500 font-medium hover:text-cyan-600 transition-colors">Know More</a>
            </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-20 mb-12">
        <h2 className="text-[28px] font-semibold text-[#3b475c] mb-10">We&apos;re Here For You!</h2>
        
        {/* Shaadi Support */}
        <div className="mb-12">
            <h3 className="text-xl text-gray-500 mb-6">Shaadi.com Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-[16.5px]">
                <div className="flex items-center gap-3 text-[#334155]">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span><span className="font-medium text-gray-700">Helpline:</span> +91-8095031111</span>
                </div>
                <div className="flex items-center gap-3 text-[#334155]">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span><span className="font-medium text-gray-700">Email:</span> <a href="mailto:help@shaadi.com" className="text-cyan-600 hover:underline">help@shaadi.com</a></span>
                </div>
            </div>
        </div>

        {/* Cyber Crime Reporting */}
        <div>
            <h3 className="text-xl text-gray-500 mb-6">Cyber Crime Reporting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-[16.5px]">
                <div className="flex items-center gap-3 text-[#334155]">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span><span className="font-medium text-gray-700">Cyber Crime Portal:</span> <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">cybercrime.gov.in</a></span>
                </div>
                <div className="flex items-center gap-3 text-[#334155]">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span><span className="font-medium text-gray-700">Helpline:</span> 1930</span>
                </div>
                <div className="flex items-center gap-3 text-[#334155]">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span><span className="font-medium text-gray-700">Women&apos;s Helpline:</span> 181</span>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
