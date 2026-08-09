'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Grip } from 'lucide-react';

export default function Faqsection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Nicepay?",
      answer: "Nicepay is an all-in-one financial management platform designed to simplify payments, automate invoicing, track expenses in real-time, and ensure secure transactions for businesses of all sizes."
    },
    {
      question: "How does Nicepay work?",
      answer: "Nicepay streamlines your financial operations by providing a unified interface to manage all your payments, invoices, and accounting tasks efficiently."
    },
    {
      question: "Is Nicepay secure?",
      answer: "Yes, we use industry-standard encryption and security protocols to ensure that all your financial data and transactions are completely protected."
    },
    {
      question: "Can Nicepay integrate with other accounting software?",
      answer: "Absolutely. Nicepay offers seamless integrations with popular accounting tools to keep your financial records synced effortlessly."
    }
  ];

  return (
    <section className="py-20 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading and Text */}
          <div className="flex flex-col pr-0 lg:pr-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3efff] text-[#7c4dff] w-fit mb-8">
              <Grip size={14} className="text-[#7c4dff]" />
              <span className="text-xs font-semibold tracking-wide">Frequently asked questions</span>
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mb-6 leading-tight">
              Frequently asked <br />
              <span className="text-[#7c4dff]">questions</span>
            </h2>
            
            {/* Description */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
              Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-6 transition-all duration-200 ${isOpen ? 'bg-[#faf9ff] border-gray-100 shadow-xs' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left focus:outline-hidden group"
                  >
                    <span className="text-lg font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-[#f3efff] text-[#7c4dff] group-hover:bg-[#e9e2ff]'}`}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
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
