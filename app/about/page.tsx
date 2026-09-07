'use client';
import React, { useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { 
  ClipboardList, 
  HeartHandshake, 
  Rocket, 
  Building2, 
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

import LetterFromCEO from '@/components/aboutpages/letterfromceo';
import WeCare from '@/components/aboutpages/wecare';
import MissionAndPromise from '@/components/aboutpages/mission&promises';
import AboutUs from '@/components/aboutpages/aboutus';
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
  { name: 'Letter From CEO', icon: ClipboardList, id: 'ceo' },
  { name: 'We Care', icon: HeartHandshake, id: 'wecare' },
  { name: 'Mission & Promise', icon: Rocket, id: 'mission' },
  { name: 'About Us', icon: Building2, id: 'aboutus' },
  { name: 'Celebrating 30 years', icon: PartyPopper, id: '30years' },
  { name: '6 Cs of happy marriages', icon: Smile, id: '6cs' },
  { name: 'Advantage Shaadi.com', icon: CheckCircle2, id: 'advantage' },
  { name: 'Awards', icon: Trophy, id: 'awards' },
  { name: 'True Stories', icon: Heart, id: 'truestories' },
  { name: 'How to use Shaadi.com', icon: CircleHelp, id: 'howtouse' },
  { name: 'Membership Plans', icon: Crown, id: 'membershipplans' },
  { name: 'Money Back Guarantee', icon: BadgeCheck, id: 'moneyback' },
  { name: '100% Secure', icon: ShieldCheck, id: 'secure' },
];

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState('ceo');

    const renderContent = () => {
        switch(activeTab) {
            case 'ceo':
                return <LetterFromCEO />;
            case 'wecare':
                return <WeCare />;
            case 'mission':
                return <MissionAndPromise />;
            case 'aboutus':
                return <AboutUs />;
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
                return <LetterFromCEO />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 bg-white flex-1 w-full mt-4 rounded-xl shadow-sm mb-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-72 shrink-0 md:border-r border-gray-200 pr-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-8 pl-4">Help Topics</h2>
                        <nav className="flex flex-col gap-2">
                            {sidebarLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = activeTab === link.id;
                                return (
                                    <button
                                        key={link.name}
                                        onClick={() => setActiveTab(link.id)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left w-full
                                            ${isActive 
                                                ? 'bg-gray-100 text-gray-900 font-medium' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-gray-700' : 'text-gray-500'}`} />
                                        <span className="text-[15px]">{link.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                    
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </div>
    );
}
