import React from 'react';

export default function MoneyBackGuarantee() {
  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Money Back Guarantee</h1>

      {/* Banner */}
      <div className="w-full h-[220px] sm:h-[280px] mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/50 flex items-center justify-center shadow-xs">
        {/* Abstract circles */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] border-[20px] border-amber-200/30 rounded-full"></div>
        
        {/* 30-Day Badge */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 bg-emerald-600 rounded-full border-[8px] border-white flex items-center justify-center shadow-lg">
            <div className="w-36 h-36 sm:w-44 sm:h-44 bg-emerald-700 rounded-full border-[4px] border-white flex flex-col items-center justify-center">
                <div className="text-white font-bold text-lg sm:text-xl tracking-wide">30-DAY</div>
                <div className="text-white font-black text-2xl sm:text-3xl my-0.5">MONEY</div>
                <div className="text-white font-bold text-lg sm:text-xl tracking-wide">BACK</div>
            </div>
        </div>
      </div>

      {/* Paragraph */}
      <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-6">
        Thousands of members have found their life partners on Haldimehendi.com. Our verified member community and high match acceptance rate give us full confidence to offer you our unique 30-day guarantee.
      </p>

      {/* Guarantee Card */}
      <div className="bg-amber-50/70 rounded-2xl p-6 sm:p-8 shadow-xs border border-amber-200/60 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Our 30-Day Commitment</h3>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          If you have sent at least 10 connect requests to compatible members and you don&apos;t receive a single positive response within your first 30 days of becoming a Premium Member, we will refund your entire subscription fee, no questions asked!
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4 text-gray-700 text-sm sm:text-[15px] leading-relaxed pb-8">
        <div>
          <h4 className="font-bold text-gray-900 mb-2">Accepted responses include:</h4>
          <p className="text-gray-600">1. Members who expressed interest in your profile and you accepted.</p>
          <p className="text-gray-600">2. Members who accepted interest requests initiated by you.</p>
        </div>

        <p className="text-gray-600 pt-2">
          The 30-Day Money Back Guarantee is applicable once during the lifetime of a Haldimehendi profile, and applies to online self-serve Premium memberships.
        </p>

        <p className="text-gray-600">
          All we ask is that you fill in your profile details authentically, upload a verified photo, and set clear partner expectations.
        </p>

        <p className="text-gray-700 font-medium">
          Have questions? Feel free to <a href="/contact" className="underline text-amber-700 hover:text-amber-800">reach out to our support team</a> anytime.
        </p>
      </div>
    </div>
  );
}
