'use client';

import React, { useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { 
  Building2,
  ClipboardList, 
  Rocket, 
  HeartHandshake, 
  PartyPopper, 
  Smile, 
  CheckCircle2, 
  Trophy, 
  Heart,
  CircleHelp,
  Crown,
  BadgeCheck,
  ShieldCheck
} from 'lucide-react';

import AboutUs from '@/components/aboutpages/aboutus';
import LetterFromCEO from '@/components/aboutpages/letterfromceo';
import MissionAndPromise from '@/components/aboutpages/mission&promises';
import WeCare from '@/components/aboutpages/wecare';
import Celebrating30Years from '@/components/aboutpages/celebrating30years';
import HappyMarriages from '@/components/aboutpages/6csofhappymarriages';
import Advantages from '@/components/aboutpages/advantages';
import Awards from '@/components/aboutpages/awards';
import TrueStories from '@/components/aboutpages/truestories';
import HowToUse from '@/components/aboutpages/howtouse';
import MembershipPlans from '@/components/aboutpages/membershipplan';
import MoneyBackGuarantee from '@/components/aboutpages/moneybackgurantee';
import Secure from '@/components/aboutpages/secure';

const sidebarLinks = [
  { name: 'About Us', icon: Building2, id: 'aboutus' },
  { name: 'Letter From CEO', icon: ClipboardList, id: 'ceo' },
  { name: 'Mission & Promise', icon: Rocket, id: 'mission' },
  { name: 'We Care', icon: HeartHandshake, id: 'wecare' },
  { name: 'Celebrating Love Stories', icon: PartyPopper, id: '30years' },
  { name: '6 Cs of Happy Marriages', icon: Smile, id: '6cs' },
  { name: 'Advantage Haldimehendi', icon: CheckCircle2, id: 'advantage' },
  { name: 'Awards & Recognition', icon: Trophy, id: 'awards' },
  { name: 'True Stories', icon: Heart, id: 'truestories' },
  { name: 'How to use Haldimehendi', icon: CircleHelp, id: 'howtouse' },
  { name: 'Membership Plans', icon: Crown, id: 'membershipplans' },
  { name: 'Money Back Guarantee', icon: BadgeCheck, id: 'moneyback' },
  { name: '100% Secure', icon: ShieldCheck, id: 'secure' },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('aboutus');

  const renderContent = () => {
    switch (activeTab) {
      case 'aboutus':
        return <AboutUs />;
      case 'ceo':
        return <LetterFromCEO />;
      case 'mission':
        return <MissionAndPromise />;
      case 'wecare':
        return <WeCare />;
      case '30years':
        return <Celebrating30Years />;
      case '6cs':
        return <HappyMarriages />;
      case 'advantage':
        return <Advantages />;
      case 'awards':
        return <Awards />;
      case 'truestories':
        return <TrueStories />;
      case 'howtouse':
        return <HowToUse />;
      case 'membershipplans':
        return <MembershipPlans />;
      case 'moneyback':
        return <MoneyBackGuarantee />;
      case 'secure':
        return <Secure />;
      default:
        return <AboutUs />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Top Header Banner */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-gray-50 border-b border-amber-100/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-[#d97706] text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>About Haldimehendi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Connecting Hearts, Building Lifelong Bonds
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Discover our journey, leadership vision, trust mandates, and why thousands of families rely on Haldimehendi for their sacred matchmaking journey.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Mobile / Tablet Horizontal Scrolling Nav Tabs */}
        <div className="md:hidden mb-6 sticky top-20 z-30 bg-white/95 backdrop-blur-md -mx-3 px-3 py-2.5 border-y border-gray-100 shadow-xs">
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(link.id);
                  }}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#d97706] text-white shadow-xs font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop 2-Column Layout */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-8 md:flex md:gap-8 lg:gap-10 items-start">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-gray-100 pr-5 lg:pr-6 sticky top-24 self-start">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 pl-3">
              About Haldimehendi
            </h2>
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(link.id);
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left w-full cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 text-[#d97706] font-bold border border-amber-200/70 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d97706]' : 'text-gray-400'}`} />
                    <span className="text-xs lg:text-[13px] truncate">{link.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Viewport */}
          <div className="flex-1 min-w-0 w-full overflow-hidden animate-in fade-in duration-200">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
