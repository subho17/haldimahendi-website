import React from 'react';
import { ShieldCheck, ChevronRight, AlertTriangle, Settings, Heart, Phone, Mail } from 'lucide-react';

export default function Secure() {
  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Safety Centre</h1>
      <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-10">
        Your safety matters deeply at Haldimehendi.com. Our team works with advanced tools and multi-tier verification to ensure your matchmaking journey remains secure, respectful, and private.
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
            <span className="text-lg sm:text-xl font-bold text-gray-900">
                Find out how Haldimehendi builds a safer space for love.
            </span>
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-300 transition-colors">
                <ChevronRight className="w-5 h-5 text-amber-600" />
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
        
        {/* Haldimehendi Support */}
        <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Haldimehendi Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-[15px]">
                <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-amber-600" />
                    <span><span className="font-semibold text-gray-900">Helpline:</span> +91-8095031111</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <span><span className="font-semibold text-gray-900">Email:</span> <a href="mailto:support@haldimehendi.com" className="text-amber-700 hover:underline">support@haldimehendi.com</a></span>
                </div>
            </div>
        </div>

        {/* Cyber Crime Reporting */}
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">National Cyber Crime Reporting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-[15px]">
                <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span><span className="font-semibold text-gray-900">Cyber Crime Portal:</span> <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-amber-700 hover:underline">cybercrime.gov.in</a></span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span><span className="font-semibold text-gray-900">National Helpline:</span> 1930</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span><span className="font-semibold text-gray-900">Women&apos;s Helpline:</span> 181</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
