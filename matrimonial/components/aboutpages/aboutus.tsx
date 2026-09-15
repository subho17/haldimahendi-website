import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">About Us</h1>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-sm" style={{ height: "300px", minHeight: "240px" }}>
        <Image 
          src="/aboutus_banner.png" 
          alt="About Haldimehendi" 
          fill
          sizes="(max-width: 768px) 100vw, 850px"
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight lowercase">
              haldimehendi
            </h2>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[15px] sm:text-base">
        <p>
          <strong>Haldimehendi</strong> was founded with a singular, heartfelt objective: to provide a joyful, modern, and deeply trustworthy matchmaking experience for singles and families in India and worldwide. We believe that finding a life partner is one of life&apos;s most sacred decisions. Our platform blends cutting-edge technology, verified trust algorithms, and rich cultural appreciation to help every individual discover true companionship with absolute confidence.
        </p>

        <div className="flex flex-col lg:flex-row gap-10 mt-12 items-center not-prose">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Haldimehendi.com</h2>
            <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
              Haldimehendi.com redefines the way modern Indians discover companionship. Designed for today&apos;s aspirational generation and supported by family values, the platform combines intelligent match preferences, strict profile verification, and intuitive communication features. From privacy controls to AI-assisted matchmaking, we put members in complete control of their matrimonial journey.
            </p>
          </div>
          
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
        <Image 
          src="/shaadi_mockup.png" 
          alt="Haldimehendi Web Platform" 
          width={600}
          height={500}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 500px"
          className="w-full h-auto object-cover"
        />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 mt-16 items-center not-prose">
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white order-2 lg:order-1">
            <Image 
              src="/vipshaadi_mockup.png" 
              alt="Haldimehendi Elite" 
              width={600}
              height={500}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Haldimehendi Elite</h2>
            <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
              Haldimehendi Elite is our bespoke, high-touch matchmaking tier designed for accomplished professionals, entrepreneurs, and discerning families who value utmost discretion and exclusivity. Supported by experienced relationship managers, Haldimehendi Elite curates handpicked introductions aligned with lifestyle, shared values, and long-term marital goals.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 mt-16 items-center not-prose">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Community Matrimony</h2>
            <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
              Rooted in Indian traditions, our platform respects the diversity of cultural backgrounds, languages, and regional customs. Members can seamlessly explore profiles within their specific community while enjoying modern search filters, horoscope matching, and lifestyle criteria that ensure holistic compatibility.
            </p>
          </div>
          
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
            <Image 
              src="/sangam_mockup.png" 
              alt="Community Matrimony" 
              width={600}
              height={500}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 mt-16 items-center not-prose pb-6">
          <div className="flex-1 w-full lg:w-auto relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white order-2 lg:order-1">
            <Image 
              src="/astrochat_mockup.png" 
              alt="Kundali & Compatibility" 
              width={600}
              height={500}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Kundali &amp; Horoscope Compatibility</h2>
            <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
              For families and individuals who consider Vedic astrology an important milestone in finding a match, Haldimehendi offers built-in Kundali Milan tools and expert astrological consultations. Receive instant Guna Milan scores, Manglik analysis, and deep compatibility reports in an intuitive, transparent digital environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
