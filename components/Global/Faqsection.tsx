'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Heart } from 'lucide-react';

export default function Faqsection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Haldimehendi Matrimonial?",
      answer: "Haldimehendi is India's most trusted matchmaking platform designed to help you find your perfect life partner through verified profiles, advanced matching algorithms, and secure communication."
    },
    {
      question: "How does the matchmaking process work?",
      answer: "Simply create a free profile, add your details and preferences, and our advanced algorithm will suggest highly compatible matches. You can then upgrade to a premium plan to connect and chat with them directly."
    },
    {
      question: "Is my data and profile secure?",
      answer: "Yes, we use industry-standard encryption, strict profile verification processes (including government ID checks), and robust privacy controls so you have complete control over who sees your photos and information."
    },
    {
      question: "Do you offer astrological or Kundli matching?",
      answer: "Absolutely. We offer comprehensive astrological compatibility reports (Kundli Milan) integrated directly into our platform, allowing you to filter matches by Rashi, Nakshatra, and Manglik status."
    }
  ];

  return (
    <section className="py-20 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Column: Heading and Text */}
          <div className="flex flex-col pr-0 lg:pr-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 w-fit mb-8 border border-amber-100">
              <Heart size={14} className="fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold tracking-wide uppercase">Frequently asked questions</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Frequently asked <br />
              <span className="text-amber-500">questions</span>
            </h2>

            {/* Description */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md font-medium">
              Find answers to the most common questions about our matchmaking services, profile verification, and premium memberships. We&apos;re here to help you on your journey.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="flex flex-col gap-8">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`border rounded-2xl p-6 transition-all duration-200 ${isOpen ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 'bg-white border-gray-200 hover:border-amber-300'}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left focus:outline-hidden group"
                  >
                    <span className={`text-lg font-bold pr-4 ${isOpen ? 'text-amber-600' : 'text-gray-900 group-hover:text-amber-600'} transition-colors`}>
                      {faq.question}
                    </span>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-700 group-hover:bg-green-100'}`}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 text-gray-600 font-medium text-sm sm:text-base leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
