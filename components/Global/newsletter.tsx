"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    text: "My buying experience is so nice, and received me very politely. Riding experience is also very good. Very good performance. I never experienced such a kind of performance. Very good service.",
    name: "Karan",
    time: "1 week ago",
    avatar: "https://i.pravatar.cc/150?u=karan"
  },
  {
    id: 2,
    text: "I love my e-bike and the customer service is excellent. They respond in a timely manner with loads of information about e-bikes, accessories and maintenance information.",
    name: "Catherine",
    time: "10 days ago",
    avatar: "https://i.pravatar.cc/150?u=catherine"
  },
  {
    id: 3,
    text: "Visited to EO store. Product particularly welds, looks good. My wife and I took small test ride in parking lot area. We bought one with customization after test ride. We went over all the options and are satisfied.",
    name: "Peter",
    time: "2 weeks ago",
    avatar: "https://i.pravatar.cc/150?u=peter"
  },
  {
    id: 4,
    text: "Excellent e-bike and great customer service. Highly recommend!",
    name: "Alice",
    time: "3 weeks ago",
    avatar: "https://i.pravatar.cc/150?u=alice"
  }
];

export default function Newsletter() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Read reviews,<br />ride with confidence.
          </h2>
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <span className="font-semibold text-gray-900">4.2/5</span>
            <div className="flex items-center text-[#00b67a]">
               <Star className="w-6 h-6 fill-current" />
            </div>
            <span className="font-semibold text-gray-900 text-xl">Trustpilot</span>
            <span className="text-gray-500 ml-2">Based on 5210 reviews</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left section */}
          <div className="lg:w-1/4 shrink-0 flex flex-col justify-between h-full sticky top-8 pt-8">
            <div>
              <Quote className="w-16 h-16 text-gray-400 mb-6 fill-current" />
              <h3 className="text-3xl md:text-4xl font-medium text-gray-900 leading-tight">
                What our<br />customers are<br />saying
              </h3>
            </div>

            <div className="flex items-center gap-4 mt-16">
              <button onClick={() => scroll('left')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="h-0.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gray-900 rounded-full animate-pulse"></div>
              </div>
              <button onClick={() => scroll('right')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Right section - Scrollable cards */}
          <div
            ref={scrollRef}
            className="lg:w-3/4 flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="shrink-0 w-[350px] md:w-[400px] bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 snap-start flex flex-col justify-between min-h-[350px]"
              >
                <div>
                  <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                    {review.text}
                  </p>
                </div>

                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#00b67a] text-[#00b67a]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Image src={review.avatar} alt={review.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
