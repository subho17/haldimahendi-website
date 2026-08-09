'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    category: 'Relationship Advice',
    title: 'Make a better connection with your partner.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 2,
    category: 'Wedding Planning',
    title: 'The Science of Color Contrast - An Expert Guide',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 3,
    category: 'Dating Tips',
    title: 'Finding Your Match: A Step by Step Guide for 2024',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 4,
    category: 'Success Stories',
    title: 'How Haldi Mehendi helped them find true love.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 5,
    category: 'Matrimony Guide',
    title: 'Essential tips for your first meeting.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600&h=400',
  },
];

export default function Blog() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#fdf9f9] py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight max-w-sm">
            Our Latest <br /> <span className="font-medium">Blogs</span>
          </h2>
          
          {/* Navigation Arrows */}
          <div className="flex gap-2 mt-6 md:mt-0">
            <button 
              onClick={scrollLeft}
              className="w-12 h-12 flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Previous blogs"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <button 
              onClick={scrollRight}
              className="w-12 h-12 flex items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors"
              aria-label="Next blogs"
            >
              <ChevronRight size={24} className="text-white" />
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
                className="min-w-[280px] md:min-w-[340px] max-w-[340px] flex-shrink-0 snap-start bg-white rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">{post.category}</p>
                  <h3 className="text-lg font-medium text-gray-900 leading-snug mb-6 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-black transition-colors">
                    Read Blog <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-900"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>

      </div>
    </section>
  );
}
