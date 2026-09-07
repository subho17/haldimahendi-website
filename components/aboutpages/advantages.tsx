import React from 'react';
import { Users, ScanFace, UserSearch, ShieldCheck, MessageCircle, Smartphone, Crown } from 'lucide-react';

export default function Advantages() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-8">Advantage Shaadi.com</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Millions of Members</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            With over 35 million members in our database, you have a wide choice from all the communities and a large NRI database so you can find your life partner with the assistance of the World&apos;s Largest Matchmaking Service.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <ScanFace className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Strict Profile Screening Systems</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Our CRM team is committed to ensure that every profile put up on Shaadi.com is screened to ensure you continue to have a smooth partner search experience.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <UserSearch className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Search Technology</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Our customization, filtering, and blocking systems strive to build technology that will only bring you matches that are relevant to you.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Security & Privacy Controls</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            At Shaadi.com, safety and privacy, of the member is top priority. Being the First ISO 9001:2008 certified matchmaking portal in the world, we let you decide who to give your contact information to. <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
          </p>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <MessageCircle className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Communicate Effectively</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Get in touch with Members directly via Email, Phone and Chat! Connect instantly with online Members via Shaadi Chat - identify and chat with your prospective life partners, making your entire match making experience better.
          </p>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <Smartphone className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Shaadi.com on the move</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            You don&apos;t always have to be near a computer to get updates of your activity on Shaadi.com. Simply log on to www.shaadi.com from your mobile phone or download the Shaadi.com App on your Andriod, iOS or Windows device and find your life partner anywhere. <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
          </p>
        </div>

        {/* Card 7 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 rounded-full bg-[#e6f4f8] flex items-center justify-center mb-6">
            <Crown className="w-8 h-8 text-[#0a8296]" />
          </div>
          <h3 className="text-xl font-semibold text-[#253252] mb-4">Premium Membership</h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            To directly contact someone you like, choose a premium membership. Our Premium Membership Plans have been created to ensure you meet your life partner soon as you connect with people you like in various convenient ways. <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
          </p>
        </div>
      </div>
    </main>
  );
}
