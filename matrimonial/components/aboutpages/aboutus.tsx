import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">About Us</h1>
      
      <div className="relative w-full h-[320px] rounded-lg overflow-hidden mb-8">
        <Image 
          src="/aboutus_banner.png" 
          alt="About Us Banner" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tight lowercase">people</h2>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[16px]">
        <p>
          People Interactive was founded in 1997 to help architect India&apos;s Internet landscape. Today it is one of India&apos;s leading Internet companies and boasts of brands such as Shaadi.com, VIPShaadi.com, Sangam.com and Astrochat.com. The company is focused on discovering and developing scalable Internet business models around communities and classifieds. It prides itself in being a pioneer of Indo-centric Internet business models and believes in innovation led growth. People Interactive is a WestBridge backed company and is part of the Anupam Mittal led People Group.
        </p>

        <div className="flex flex-col lg:flex-row gap-12 mt-16 items-start not-prose">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-[#253252] mb-6">Shaadi.com</h2>
            <p className="text-gray-700 leading-loose text-[17px]">
              Shaadi.com, the world&apos;s largest online matchmaking site was founded with one simple objective - to provide a superior matchmaking experience to Indians all over the world. The company pioneered online matchmaking when it launched in 1996 and continues to lead the exciting matchmaking category after more than a decade. Shaadi.com has redefined the way people meet for marriage and has touched the lives of 3.5 crore (35 million) people all over the world and helped over millions of people find their matches. Amongst many other awards Shaadi.com was recently recognized amongst the world&apos;s 50 Most Innovative Companies by Fast Company and received the Best Matrimonial Site - Reader&apos;s Choice Award by About.com.
            </p>
          </div>
          
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
            <Image 
              src="/shaadi_mockup.png" 
              alt="Shaadi.com Mockup" 
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mt-24 items-start not-prose">
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
            <Image 
              src="/vipshaadi_mockup.png" 
              alt="VIPShaadi.com Mockup" 
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-[#253252] mb-6">VIPShaadi.com</h2>
            <p className="text-gray-700 leading-loose text-[17px]">
              VIPShaadi.com is the premium matchmaking service by Shaadi.com, designed to help accomplished individuals and families find the right life partner through a highly personalized and discreet approach. Built on decades of Shaadi.com&apos;s matchmaking expertise, it blends human intelligence with deep cultural understanding to deliver curated matches aligned on values, lifestyle, and aspirations. Each member is supported by a dedicated Relationship Manager who represents their preferences thoughtfully throughout the journey. Trusted by professionals, entrepreneurs, and families across India and globally, VIPShaadi.com focuses on quality, compatibility, and meaningful outcomes over volume—ensuring a confident, private, and credible path to marriage.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mt-24 items-start not-prose">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-[#253252] mb-6">Sangam.com</h2>
            <p className="text-gray-700 leading-loose text-[17px]">
              Sangam.com was founded to help individuals and families find meaningful matrimonial matches within their specific communities, cultures, and traditions. Backed by the trusted legacy and technology of Shaadi.com, it brings together diverse regional, linguistic, and community groups on dedicated platforms that reflect their unique values. Since its launch, Sangam.com has helped lakhs of members in India and globally connect with compatible partners through detailed profiles, community-specific matchmaking, and a strong focus on trust and authenticity—combining modern matchmaking with cultural understanding and family involvement.
            </p>
          </div>
          
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
            <Image 
              src="/sangam_mockup.png" 
              alt="Sangam.com Mockup" 
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mt-24 items-start not-prose">
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 bg-white">
            <Image 
              src="/astrochat_mockup.png" 
              alt="Astrochat.com Mockup" 
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-[#253252] mb-6">Astrochat.com</h2>
            <p className="text-gray-700 leading-loose text-[17px]">
              Astrochat.com was founded to make authentic astrology guidance easily accessible for those seeking clarity, direction, and confidence in life. As a modern, digital-first platform, it connects users with experienced astrologers across Vedic astrology, numerology, tarot, and more through convenient chat-based consultations. Since its launch, Astrochat.com has helped millions gain insights into relationships, career, finance, and personal well-being in a private, judgment-free environment—combining traditional astrological wisdom with seamless technology to deliver trusted guidance anytime, anywhere.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
