import React from 'react';
import Image from 'next/image';

export default function Awards() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-6">Awards</h1>
      
      <p className="text-gray-700 leading-relaxed text-[16px] mb-12">
        More and more people are using our services to find happiness. We are now officially certified as the <strong className="font-semibold text-gray-900">most visited, trusted and successful matchmaking website</strong> by prestigious organisations from India and abroad.
      </p>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Best Use of Analytics in Database Management</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            Our Data Science and Engineering team has been honored with the &quot;Best Use of Analytics in Database Management&quot; award by Technophiles India. 🏆 This recognition highlights our commitment to innovation and excellence, showcasing how data-driven insights and collaboration can create real impact in today&apos;s technology-led world.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/awards_photo.png" 
            alt="Awards Ceremony" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/gender_award.png" 
            alt="Gender Sensitivity Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Gender Sensitivity Award 2024</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re proud to share that our #RevolutionNaaris Independence Day film has won the Gender Sensitivity 2024 award at the South Asia Laadli Media and Advertising Awards, supported by UNFPA. 🏆 This recognition celebrates our marketing team&apos;s creativity and our ongoing commitment to driving conversations that inspire gender equality.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Best Data Operations in AI/ML Integration</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re thrilled to announce that Team Shaadi.com has won the &quot;Best Data Operations in AI/ML Integration&quot; award by Technophiles India! 🏆 💖 This recognition celebrates the seamless systems, intelligent data frameworks, and dedicated minds behind every match—making innovation and precision come alive at scale.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/data_award.png" 
            alt="Data Operations Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/devops_award.png" 
            alt="DevOps Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Best Team Project in DevOps Automation (Internet Services)</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            Proud to announce that Team Shaadi has won the &quot;Best Team Project in DevOps Automation (Internet Services)&quot; at the 7th India DevOps Show by Quantic! 🏆 This award honors our tech team&apos;s relentless focus on reliability, security, and scalability—the invisible backbone that keeps millions of love stories running seamlessly every day.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Excellence in Data Innovation</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re proud to share that Shaadi.com has won the &quot;Excellence in Data Innovation&quot; award at Dine with DevOps IV by Technophiles India! 🏆 This recognition celebrates our team&apos;s dedication to building data-driven frameworks and systems that inform decisions for millions, powered by collaboration, problem-solving, and relentless innovation.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/data_innovation_award.png" 
            alt="Data Innovation Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/ai_award.png" 
            alt="AI Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Best Use of AI in Customer Engagement</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re proud to announce that Shaadi.com has won the &quot;Best Use of AI in Customer Engagement&quot; at the 3rd Edition of Data & AI Future First Confex & Awards 2025! 🏆 This award celebrates our team&apos;s relentless work in making AI truly meaningful—powering personalized recommendations and intuitive interactions that put human connection at the heart of finding a life partner.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">DevOps Leadership Award</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re proud to share that Shaadi.com has been recognized for DevOps Leadership at the 7th Edition of the DevOps Conclave & Awards 2025! 🏆 This award honors the discipline, collaboration, and problem-solving of our teams—the unseen force that keeps our products running seamlessly for millions every day.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/devops_leadership_award.png" 
            alt="DevOps Leadership Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mt-24">
        <div className="flex-1 w-full lg:w-auto relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
          <Image 
            src="/customer_engagement_award.png" 
            alt="Customer Engagement Strategy Award" 
            width={500}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-[#253252] mb-4">Customer Engagement Strategy Award</h2>
          <p className="text-gray-700 leading-relaxed text-[16px] mb-4">
            We&apos;re excited to announce that Shaadi.com has won the &quot;Customer Engagement Strategy&quot; award from MoEngage! 🏆 This recognition celebrates our efforts to turn everyday communication into meaningful connections—every message, ping, and in-app moment crafted to engage and connect with our members.
          </p>
          <a href="#" className="underline text-gray-500 hover:text-gray-700 font-medium text-[15px]">Read More</a>
        </div>
      </div>
    </main>
  );
}
