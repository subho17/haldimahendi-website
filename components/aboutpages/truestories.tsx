import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const stories = [
  {
    name: "Vaibhav & Alka",
    story: "Alka and Me met via Shaadi.com in 2021. We both liked good conversations & connected over common interests like reading & traveling. I was impressed with Alka's clear",
    image: "/story1.png"
  },
  {
    name: "Shweta & Prateek",
    story: "Thanks Shaadi.com as I could find my partner here and got married on 29th November 2023.",
    image: "/story2.png"
  },
  {
    name: "Harsh & Himanshi",
    story: "I created my profile here on suggestion of my very close friend who also got her partner from this platform. I also met my partner Harsh here. I am grateful to Shaadi.com",
    image: "/story3.png"
  },
  {
    name: "Piyas & Anindita",
    story: "Thanks to you (This App) My life has settled through this App.",
    image: "/story2.png" // Reusing due to image gen limits
  },
  {
    name: "Devesh & Jyoti",
    story: "I am very thankful to Shaadi.com Application where I've found my love for Life. It was the time when we both were struggling to find out a good Life Partner to spend",
    image: "/story3.png" // Reusing due to image gen limits
  },
  {
    name: "Akash & Rani",
    story: "We connected through Shaadi.com and met in person. Then we shared each other's profile with our parents, and came to know that it was already shared but was",
    image: "/story1.png" // Reusing due to image gen limits
  }
];

export default function TrueStories() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-8">True Stories - Shaadi.com</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {stories.filter((_, i) => i % 2 === 0).map((s, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full">
                <Image 
                  src={s.image}
                  alt={s.name}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#253252] mb-3">{s.name}</h3>
                <p className="text-gray-700 leading-relaxed text-[15px] mb-5">
                  {s.story}
                </p>
                <button className="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Read more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {stories.filter((_, i) => i % 2 !== 0).map((s, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full">
                <Image 
                  src={s.image}
                  alt={s.name}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#253252] mb-3">{s.name}</h3>
                <p className="text-gray-700 leading-relaxed text-[15px] mb-5">
                  {s.story}
                </p>
                <button className="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Read more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
