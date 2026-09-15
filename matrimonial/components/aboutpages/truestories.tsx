import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const stories = [
  {
    name: "Vaibhav & Alka",
    story: "Alka and I connected on Haldimehendi.com in 2021. We both bonded over meaningful conversations, literature, and travel. Today, we are happily married!",
    image: "/story1.png"
  },
  {
    name: "Shweta & Prateek",
    story: "Thanks to Haldimehendi.com, I found my true life partner here and we tied the knot on 29th November 2023. Couldn't have asked for a smoother journey.",
    image: "/story2.png"
  },
  {
    name: "Harsh & Himanshi",
    story: "I created my profile on the recommendation of my close friend who also met her spouse on Haldimehendi. We connected instantly and our families clicked right away.",
    image: "/story3.png"
  },
  {
    name: "Piyas & Anindita",
    story: "Haldimehendi's intuitive filters and verified profiles made finding someone with shared cultural roots seamless. We are so grateful!",
    image: "/story2.png"
  },
  {
    name: "Devesh & Jyoti",
    story: "We are incredibly thankful to the Haldimehendi platform where I found the love of my life. The privacy controls and direct chat made the initial icebreaking effortless.",
    image: "/story3.png"
  },
  {
    name: "Akash & Rani",
    story: "We connected through Haldimehendi.com and after thoughtful conversations, met in person. Our vision of family and life matched completely.",
    image: "/story1.png"
  }
];

export default function TrueStories() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">True Stories — Haldimehendi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {stories.filter((_, i) => i % 2 === 0).map((s, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="relative w-full">
                <Image 
                  src={s.image}
                  alt={s.name}
                  width={500}
                  height={500}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.name}</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-[15px] mb-4">
                  {s.story}
                </p>
                <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Read story <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {stories.filter((_, i) => i % 2 !== 0).map((s, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="relative w-full">
                <Image 
                  src={s.image}
                  alt={s.name}
                  width={500}
                  height={500}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.name}</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-[15px] mb-4">
                  {s.story}
                </p>
                <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Read story <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
