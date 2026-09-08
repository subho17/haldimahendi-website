import React from 'react';
import Image from 'next/image';

export default function WeCare() {
  return (
    <main className="flex-1 max-w-4xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">We Care</h1>
          
          <div className="relative w-full h-[360px] rounded-lg overflow-hidden mb-8">
            <Image 
              src="/wecare_banner.png" 
              alt="We Care" 
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              Shaadi.com, a part of the People Group, recognizes our social responsibility and use every opportunity to share with the community. One aspect of the People Group corporate mission is - &quot;to elevate the collective efficiency, knowledge and joy of the world in general and our communities in particular.&quot; People Group has always supported philanthropic activities in the past. During the Mumbai Marathon in 2005, People Group contributed Rs.10 lakhs towards the Prime Minister&apos;s Relief Fund for Tsunami Relief.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Some of the activities we were actively involved in are:
            </h3>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
              Communicate Effectively
            </h4>
            <p>
              In a unique bid to help hearing impaired women find their life partner, Shaadi.com teamed up with Delhi Foundation of Deaf Women (DFDW) to extend support for &apos;Pranay Milan Sammelan&apos;, an annual Swayamvar for the hearing impaired. Shaadi.com supported the NGO by promoting it online as well as on ground.{' '}
              <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-2">
              The Foundation of Blood Ailments - Thalassemia Awareness Campaign
            </h4>
            <p>
              The Foundation for Blood Ailments is an organization dedicated to fighting blood disorders through the dissemination of knowledge. It was started in 2007 by people whose friends and families were affected by blood diseases.{' '}
              <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-2">
              GiveIndia - Gift a Donation
            </h4>
            <p>
              GiveIndia is a trusted donation platform that enables you to support a cause of your choice from about 100 NGOs that have been certified for transparency & credibility. Shaadi.com actively encourages its members to donate cash to a cause of their choice through the GiveIndia platform.{' '}
              <a href="#" className="underline text-gray-800 hover:text-gray-600 font-medium">Read more</a>
            </p>
          </div>
    </main>
  );
}
