'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TestimonialItem {
  id: number;
  coupleName: string;
  location: string;
  marriedYear: string;
  rating: number;
  title: string;
  review: string;
  avatar: string;
  verified: boolean;
}

const SUCCESS_STORIES: TestimonialItem[] = [
  {
    id: 1,
    coupleName: "Rohan & Ananya",
    location: "Mumbai, Maharashtra",
    marriedYear: "Married Dec 2024",
    rating: 5,
    title: "Found my soulmate in just 3 weeks!",
    review: "HaldiMehendi's verified profile system gave our families 100% peace of mind. The matchmaking algorithm suggested incredibly compatible matches based on our cultural values.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 2,
    coupleName: "Vikram & Sneha",
    location: "Delhi NCR",
    marriedYear: "Married Oct 2024",
    rating: 5,
    title: "Seamless family connection & Kundli match",
    review: "Our families connected so smoothly! The integrated Kundli Milan feature and background-verified profiles made the entire process transparent, respectful, and delightful.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 3,
    coupleName: "Arjun & Meera",
    location: "Bengaluru, Karnataka",
    marriedYear: "Married Jan 2025",
    rating: 5,
    title: "Complete privacy control & verified profiles",
    review: "The photo privacy and phone number controls were crucial for us. We only revealed contact details when both families were completely comfortable. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 4,
    coupleName: "Dev & Ishita",
    location: "Kolkata, West Bengal",
    marriedYear: "Married Nov 2024",
    rating: 5,
    title: "Respectful, warm & modern matrimony",
    review: "We were skeptical about online matchmaking initially, but HaldiMehendi exceeded all expectations. It felt like a modern yet traditional bridge between two loving families.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 5,
    coupleName: "Karan & Pooja",
    location: "Pune, Maharashtra",
    marriedYear: "Married Aug 2024",
    rating: 5,
    title: "Best decision of our lives!",
    review: "From first chat to the Haldi and Mehendi ceremonies, everything felt destined. Thank you HaldiMehendi.com for bringing our worlds together so perfectly!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 6,
    coupleName: "Rahul & Kavya",
    location: "Hyderabad, Telangana",
    marriedYear: "Married Feb 2025",
    rating: 5,
    title: "Beautiful experience with family blessings",
    review: "Outstanding privacy features and verified member profiles. Both our families bonded over shared traditions and common family values. Thank you HaldiMehendi!",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: 7,
    coupleName: "Abhishek & Tanvi",
    location: "Ahmedabad, Gujarat",
    marriedYear: "Married Sep 2024",
    rating: 5,
    title: "100% Genuine & Trustworthy Platform",
    review: "The best matrimony portal for genuine matches. The verified badge system ensured zero fake profiles, making our search safe, pleasant, and quick.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
];

export default function Testimonals() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SUCCESS_STORIES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length);
  };

  // Auto scroll every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Display 4 cards at a time on wider screens
  const visibleStories = [
    SUCCESS_STORIES[currentIndex % SUCCESS_STORIES.length],
    SUCCESS_STORIES[(currentIndex + 1) % SUCCESS_STORIES.length],
    SUCCESS_STORIES[(currentIndex + 2) % SUCCESS_STORIES.length],
    SUCCESS_STORIES[(currentIndex + 3) % SUCCESS_STORIES.length],
  ];

  return (
    <section className="py-16 sm:py-24 bg-white w-full overflow-hidden relative">
      
      {/* Full-width container with minimized side margins */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header & Trustpilot Style Rating Banner */}
        <div className="flex flex-col items-start text-left mb-12">
          
          {/* Haldi & Mehendi Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-md border border-amber-200/80 mb-5 transition-transform hover:scale-105">
            <span className="flex items-center -space-x-1">
              <span className="w-3 h-3 rounded-full border-2 border-[#d97706] bg-transparent" />
              <span className="w-3 h-3 rounded-full border-2 border-[#15803d] bg-transparent" />
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-gray-800">
              Verified Success Stories
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            Read reviews, <br className="hidden sm:inline" />
            <span className="text-[#15803d]">
              marry with confidence.
            </span>
          </h2>

          {/* Trust Score Rating Row */}
          <div className="mt-2 inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/80">
            <span className="text-base font-extrabold text-gray-900">4.9 / 5</span>
            <div className="flex items-center gap-1 text-[#f59e0b]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-500 border-l border-gray-200 pl-3">
              <span className="font-bold text-[#15803d]">Trustpilot & Google</span> Verified • 12,500+ Happy Marriages
            </span>
          </div>
        </div>

        {/* Layout Grid: Left Sidebar Quote + Right Carousel 4 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Big Quote Callout */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-lg border border-amber-100/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Haldi-Mehendi Themed Quote Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-[#d97706] text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5">
                <Quote className="w-6 h-6 rotate-180" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug mb-3">
                What our <br />
                <span className="text-[#d97706]">happily married</span> <br />
                <span className="text-[#15803d]">couples</span> are saying
              </h3>

              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Over 6 million happy matches start with trust. Explore how real families met their life partners on HaldiMehendi.com.
              </p>
            </div>

            {/* Navigation & Progress Controls */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
              
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: SUCCESS_STORIES.length }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex ? 'w-6 bg-[#d97706]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous testimonial"
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-[#d97706] hover:text-[#d97706] hover:bg-amber-50 transition flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next testimonial"
                  className="w-9 h-9 rounded-full bg-[#d97706] text-white hover:bg-[#b45309] transition flex items-center justify-center shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: 4 Review Cards Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {visibleStories.map((story, idx) => (
              <div
                key={`${story.id}-${idx}`}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100/60 border border-gray-100 hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5 text-[#f59e0b]">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Match</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#d97706] transition-colors leading-snug line-clamp-2">
                    &quot;{story.title}&quot;
                  </h4>

                  {/* Review Text */}
                  <p className="text-gray-600 text-xs leading-relaxed mb-5 line-clamp-4">
                    {story.review}
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-200 shadow-xs shrink-0">
                    <Image
                      src={story.avatar}
                      alt={story.coupleName}
                      fill
                      sizes="40px"
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h5 className="text-xs font-bold text-gray-900 truncate">{story.coupleName}</h5>
                      <CheckCircle2 className="w-3 h-3 text-[#15803d] shrink-0" />
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">
                      {story.location} • <span className="text-[#d97706] font-medium">{story.marriedYear}</span>
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
