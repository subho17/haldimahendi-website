import React from 'react';
import { Users, ScanFace, UserSearch, ShieldCheck, MessageCircle, Smartphone, Crown } from 'lucide-react';

export default function Advantages() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Advantage Haldimehendi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <Users className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Vast Verified Community</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Explore thousands of authentic profiles across all Indian communities, professions, and global locations to find the life partner whose vision aligns with yours.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <ScanFace className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Strict Profile Screening</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Every profile uploaded to Haldimehendi is verified and screened with government ID checks and selfie audits to keep your matchmaking journey safe and trustworthy.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <UserSearch className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Intelligent Match Preferences</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Advanced matchmaking algorithms that take into account mutual expectations, family values, education, lifestyle, and horoscope alignment.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Privacy &amp; Contact Controls</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            At Haldimehendi, your safety is paramount. You have complete control over who views your phone number, photos, and horoscope.
          </p>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <MessageCircle className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Direct &amp; Meaningful Conversations</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Connect in real-time with verified prospective matches via instant chat, voice notes, and secure audio/video calls within the Haldimehendi platform.
          </p>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <Smartphone className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Haldimehendi On The Move</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Stay connected anywhere on any device. Experience lightning-fast notifications and responsive search on your phone, tablet, or laptop.
          </p>
        </div>

        {/* Card 7 */}
        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow md:col-span-2">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
            <Crown className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Premium Memberships</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px]">
            Unlock direct contact access, standout spotlight visibility, and premium priority matching designed to help you find the one faster and with ease.
          </p>
        </div>
      </div>
    </div>
  );
}
