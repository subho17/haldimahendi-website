import React from 'react';
import { Check, Plus } from 'lucide-react';

export default function MembershipPlans() {
  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Membership Plans</h1>

      {/* Benefits Box */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-8 bg-slate-50">
        <h3 className="text-amber-700 font-bold text-[16px] mb-4">Benefits of a Premium Membership:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">View verified contact details</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">Special offers from verified partners</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">Write direct messages &amp; voice notes</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">Discounts on Haldimehendi events</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">Connect instantly via Haldimehendi Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            <span className="text-gray-700 text-sm">Priority customer support &amp; guidance</span>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="border border-gray-300 w-full mb-8 flex flex-col text-center bg-white">
        {/* Headers */}
        <div className="bg-[#de3b49] text-white py-2 text-[15px] text-left pl-4">
          6 Convenient Premium Packages to Choose From!
        </div>
        <div className="grid grid-cols-3 bg-[#ef8991] text-white py-2 font-semibold text-[15px]">
          <div>3 months</div>
          <div>6 months</div>
          <div>12 months</div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-3">
          {/* Column 1 */}
          <div className="flex flex-col border-r border-gray-200">
            {/* Top Cell */}
            <div className="p-6 border-b border-gray-200 flex-1 flex flex-col items-center min-h-[220px]">
              <h4 className="text-gray-500 text-[17px] mb-4">Gold</h4>
              <ul className="text-gray-500 text-[13px] space-y-1.5 text-left">
                <li>- Connect directly with Matches</li>
                <li>- View detailed Profile information</li>
              </ul>
            </div>
            {/* Bottom Cell */}
            <div className="p-6 flex-1 flex flex-col items-center min-h-[220px]">
              <h4 className="text-gray-500 text-[17px] mb-4">Gold Plus</h4>
              <ul className="text-gray-500 text-[13px] space-y-1.5 text-left">
                <li>- Connect directly with Matches</li>
                <li>- View detailed Profile information</li>
                <li>- Be featured under Spotlight</li>
                <li>- Standout with Bold Listing</li>
              </ul>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col border-r border-gray-200 relative">
            {/* Top Cell */}
            <div className="p-6 border-b border-gray-200 flex-1 flex flex-col items-center min-h-[220px]">
              <h4 className="text-gray-500 text-[17px] mb-4">Diamond</h4>
              <ul className="text-gray-500 text-[13px] space-y-1.5 text-left">
                <li>- Connect directly with Matches</li>
                <li>- View detailed Profile information</li>
              </ul>
            </div>
            {/* Bottom Cell */}
            <div className="p-6 flex-1 flex flex-col items-center relative min-h-[220px]">
              <div 
                className="absolute top-2 left-0 bg-[#fa4c56] text-white text-[11px] font-bold px-3 py-1 pr-6 tracking-wide"
                style={{ clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)' }}
              >
                TOP SELLER
              </div>
              <h4 className="text-gray-500 text-[17px] mb-4 flex items-center gap-1 mt-6">
                Diamond Plus <Plus className="w-5 h-5 text-[#3ac6d5] stroke-[4]" />
              </h4>
              <ul className="text-gray-500 text-[13px] space-y-1.5 text-left">
                <li>- Connect directly with Matches</li>
                <li>- View detailed Profile information</li>
                <li>- Be featured under Spotlight</li>
                <li>- Standout with Bold Listing</li>
              </ul>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col">
            <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[220px]">
              <h4 className="text-gray-500 text-[17px] mb-4 flex items-center gap-1">
                Platinum Plus <Plus className="w-5 h-5 text-[#3ac6d5] stroke-[4]" />
              </h4>
              <ul className="text-gray-500 text-[13px] space-y-1.5 text-left">
                <li>- Connect directly with Matches</li>
                <li>- View detailed Profile information</li>
                <li>- Be featured under Spotlight</li>
                <li>- Standout with Bold Listing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-col items-center justify-center gap-4 mt-8">
        <a href="/pricing" className="text-[15px] text-gray-700 underline hover:text-amber-700 flex items-center">
          Compare plans in detail
        </a>
        <a href="/pricing" className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-sm px-8 py-3 rounded-full shadow-sm transition-all text-center">
          Upgrade Now
        </a>
      </div>
    </div>
  );
}
