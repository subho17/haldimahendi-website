import React from 'react';
import Image from 'next/image';

export default function WeCare() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">We Care</h1>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-sm" style={{ height: "300px", minHeight: "240px" }}>
        <Image 
          src="/wecare_banner.png" 
          alt="We Care" 
          fill
          sizes="(max-width: 768px) 100vw, 850px"
          className="object-cover"
        />
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[15px] sm:text-base">
        <p>
          Haldimehendi.com recognizes our deep social responsibility and uses every opportunity to share meaningful value with our communities. One foundational aspect of our mission is &quot;to elevate the collective joy, empathy, and social progress of the communities we touch.&quot; Haldimehendi actively supports community welfare, inclusive matchmaking, and philanthropic causes that bring lasting positive change.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          Some of the initiatives and causes we actively champion:
        </h3>

        <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          Inclusive Matchmaking &amp; Community Support
        </h4>
        <p>
          In a dedicated effort to help differently-abled individuals find their life partners, Haldimehendi collaborates with community foundations to extend support for accessible matrimonial forums. Haldimehendi supports NGO partners by promoting awareness online and on-ground.
        </p>

        <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-2">
          Health &amp; Wellness Awareness Campaigns
        </h4>
        <p>
          We believe healthy families make happy marriages. Haldimehendi collaborates with healthcare awareness advocates to disseminate vital medical and genetic screening information, promoting informed and healthy family planning.
        </p>

        <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-2">
          Transparent Community Giving
        </h4>
        <p>
          Haldimehendi actively encourages our member community to participate in certified social causes, funding education, women empowerment, and child healthcare through verified non-profit partner networks.
        </p>
      </div>
    </div>
  );
}
