import React from 'react';

export default function MoneyBackGuarantee() {
  return (
    <main className="flex-1 max-w-4xl font-sans">
      <h1 className="text-3xl font-semibold text-[#253252] mb-8">Money Back Guarantee</h1>

      {/* Banner Image Placeholder */}
      <div className="w-full h-[300px] mb-8 relative rounded-sm overflow-hidden bg-gradient-to-r from-[#e3d5c5] to-[#ece1d3] flex items-center justify-center">
        {/* Abstract circles */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[20px] border-white/20 rounded-full"></div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[300px] h-[300px] border-[10px] border-white/30 rounded-full border-dashed"></div>
        
        {/* Money Sack Placeholder (Left) */}
        <div className="absolute left-20 bottom-8 flex flex-col items-center">
            <div className="w-32 h-40 bg-[#d9ba88] rounded-b-[2.5rem] rounded-t-xl relative flex items-center justify-center shadow-lg border border-[#c9aa79]">
                <div className="absolute -top-6 w-16 h-8 bg-[#d9ba88] rounded-t-xl border-t border-l border-r border-[#c9aa79]"></div>
                <div className="absolute -top-1 w-20 h-3 bg-[#b59567] rounded-full"></div> {/* string tying the sack */}
                <div className="text-6xl font-black text-[#5c3e1e] opacity-80">₹</div>
            </div>
            {/* Hand placeholder */}
            <div className="w-56 h-12 bg-[#f3cbb4] rounded-full -mt-6 ml-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-2 left-4 w-40 h-1 bg-white/20 rounded-full"></div>
            </div>
        </div>

        {/* 30-Day Badge (Center) */}
        <div className="relative z-10 w-56 h-56 bg-[#2bb47e] rounded-full border-[10px] border-white/40 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <div className="w-48 h-48 bg-[#2ba371] rounded-full border-[6px] border-white flex flex-col items-center justify-center shadow-inner">
                <div className="text-white font-bold text-2xl tracking-wide">30-DAY</div>
                <div className="text-white font-black text-4xl my-1">MONEY</div>
                <div className="text-white font-bold text-2xl tracking-wide">BACK</div>
            </div>
        </div>
      </div>

      {/* Paragraph */}
      <p className="text-gray-700 leading-relaxed text-[16px] mb-8">
        Millions of members have successfully found their matches on Shaadi.com (<a href="#" className="underline text-gray-800">read</a> the latest success stories!). Our track record of success gives us the confidence to give you this unique guarantee.
      </p>

      {/* Guarantee Card */}
      <div className="bg-[#fcfaf2] rounded-xl p-6 shadow-sm border border-[#f5f1e1] mb-10">
        <h3 className="text-[17px] font-bold text-[#475569] mb-2">Money Back Guarantee</h3>
        <p className="text-gray-700 text-[15.5px] leading-relaxed">
          If you have sent at least 10 Interests to members and you don&apos;t have a single Accept within the first 30 days of becoming a Premium Member, we will refund your entire fee, no questions asked!
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-6 text-[#334155] text-[15.5px] leading-relaxed pb-12">
        <div>
          <h4 className="font-bold text-[#1e293b] mb-4">Accepted members are:</h4>
          <p>Members who expressed interest in you and you responded positively</p>
          <p className="my-2">OR</p>
          <p>Members who responded positively to your interest expressed.</p>
        </div>

        <p>
          30-Day Money Back Guarantee is applicable only once during the lifetime of a Shaadi.com profile, and only to online Premium memberships. It does not apply to personalised memberships, including VIP Shaadi.com.
        </p>

        <p>
          *Premium features will no longer be available once a refund is issued.
        </p>

        <p>
          All we expect you to do is fill in all details in your profile, create a partner profile, upload your photo and actively communicate with members.
        </p>

        <p>
          Can you ask for more? Do <a href="#" className="underline text-gray-800">write to us</a>.
        </p>
      </div>
    </main>
  );
}
