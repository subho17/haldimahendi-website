import React from 'react';
import Image from 'next/image';

export default function Awards() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Awards &amp; Recognition</h1>
      
      <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-10">
        More and more people and families trust our services to find lasting happiness. We are honored to be recognized by prestigious industry bodies for innovation, security, and human-first technology.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Best Use of Analytics in Matchmaking</h2>
          <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-4">
            Our Data Science and Engineering team has been honored with the &quot;Best Use of Analytics in Matchmaking&quot; award by Technophiles India. 🏆 This recognition highlights our commitment to innovation and excellence, showcasing how data-driven insights and AI algorithms create real value for couples finding love.
          </p>
          <a href="#" className="underline text-amber-700 hover:text-amber-800 font-medium text-sm">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <Image 
            src="/awards_photo.png" 
            alt="Awards Ceremony" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center mt-16">
        <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white order-2 lg:order-1">
          <Image 
            src="/gender_award.png" 
            alt="Gender Sensitivity Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1 order-1 lg:order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Gender Sensitivity &amp; Inclusivity Award</h2>
          <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-4">
            We&apos;re proud that our initiatives championing respectful partner search and women&apos;s autonomy won honors at the South Asia Media and Advertising Awards, supported by UNFPA. 🏆 This recognition celebrates our team&apos;s commitment to driving conversations that inspire gender equality and mutual respect in marriage.
          </p>
          <a href="#" className="underline text-amber-700 hover:text-amber-800 font-medium text-sm">Read More</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center mt-16">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Best Data Operations in AI/ML Integration</h2>
          <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-4">
            We&apos;re thrilled to announce that Team Haldimehendi won the &quot;Best Data Operations in AI/ML Integration&quot; award by Technophiles India! 🏆 💖 This recognition celebrates the intelligent data frameworks, verified identity protocols, and dedicated minds behind every match.
          </p>
          <a href="#" className="underline text-amber-700 hover:text-amber-800 font-medium text-sm">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <Image 
            src="/data_award.png" 
            alt="Data Operations Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center mt-16">
        <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white order-2 lg:order-1">
          <Image 
            src="/devops_award.png" 
            alt="DevOps Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1 order-1 lg:order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Excellence in Security &amp; Uptime Automation</h2>
          <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-4">
            Proud to announce that Team Haldimehendi won the &quot;Best Team Project in Platform Automation (Internet Services)&quot; at the India DevOps Show! 🏆 This award honors our tech team&apos;s relentless focus on reliability, user privacy, and scalability.
          </p>
          <a href="#" className="underline text-amber-700 hover:text-amber-800 font-medium text-sm">Read More</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center mt-16 pb-6">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Best Use of AI in Member Engagement</h2>
          <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-4">
            Haldimehendi was awarded &quot;Best Use of AI in Member Engagement&quot; at the Data &amp; AI Future First Confex &amp; Awards! 🏆 This award celebrates our team&apos;s work in making AI truly meaningful—powering personalized recommendations and intuitive interactions that put human connection at the heart of finding a life partner.
          </p>
          <a href="#" className="underline text-amber-700 hover:text-amber-800 font-medium text-sm">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <Image 
            src="/ai_award.png" 
            alt="AI Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}
