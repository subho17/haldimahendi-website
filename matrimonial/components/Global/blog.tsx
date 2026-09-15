'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    category: 'Relationship Advice',
    title: 'Building deep emotional connection with your partner.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 2,
    category: 'Wedding Planning',
    title: 'Essential guide to traditional Haldi & Mehendi rituals.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 3,
    category: 'Matchmaking Tips',
    title: 'Finding Your Perfect Life Partner: Guide for 2025.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 4,
    category: 'Success Stories',
    title: 'How HaldiMehendi helped Rohan & Ananya find true love.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 5,
    category: 'Family Alignment',
    title: 'Essential tips for your family’s first official meeting.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600&h=400',
  },
];

export default function Blog() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#d97706] font-bold text-xs mb-3 border border-amber-200/80">
              <BookOpen size={14} className="text-[#d97706]" />
              <span>Matrimony Guides & Insights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Our Latest <span className="text-[#d97706]">Matrimony Blogs</span>
            </h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-2.5 mt-6 md:mt-0">
            <button 
              onClick={scrollLeft}
              className="w-11 h-11 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:bg-amber-50 hover:border-[#d97706] hover:text-[#d97706] transition-all cursor-pointer shadow-xs"
              aria-label="Previous blogs"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button 
              onClick={scrollRight}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[#d97706] hover:bg-[#b45309] transition-all cursor-pointer shadow-md shadow-amber-500/20"
              aria-label="Next blogs"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Blog List */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {BLOG_POSTS.map((post) => (
              <div 
                key={post.id} 
                className="min-w-[280px] md:min-w-[340px] max-w-[340px] flex-shrink-0 snap-start bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:border-amber-200 overflow-hidden group cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    sizes="(max-width: 768px) 280px, 340px"
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#15803d] border border-emerald-100 shadow-xs">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-6 group-hover:text-[#d97706] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-xs font-bold text-[#d97706] group-hover:text-[#b45309] transition-colors">
                    <span>Read Full Guide</span>
                    <ArrowRight size={14} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
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
