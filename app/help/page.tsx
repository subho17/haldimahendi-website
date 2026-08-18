"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import { Headphones, Mail, Phone, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I find a match?",
    a: "Fill in your partner preferences on the Preferences page. The matching engine ranks members by compatibility (religion, age, education, city, etc.) and shows your best matches first.",
  },
  {
    q: "How do I connect with someone?",
    a: "Open a member's profile and send an interest. When they accept it, you become connected and can start chatting in real time.",
  },
  {
    q: "Why can't I message a member?",
    a: "Chat is available only between accepted connections. Send an interest first; once the other member accepts, the Message button unlocks.",
  },
  {
    q: "How do I change my profile photo?",
    a: "Go to My Photos, upload a new image, and set it as your main photo. Your first upload automatically becomes your profile photo.",
  },
  {
    q: "Is my phone number visible to others?",
    a: "No. Other members only see your profile ID and the details you choose. Your mobile number stays private.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#e53238] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Headphones className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Help & Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Answers to common questions and ways to reach our support team.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-lg mb-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-4">Frequently Asked Questions</h2>
          <div className="divide-y divide-gray-100">
            {FAQS.map((f, i) => (
              <div key={i} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between text-left cursor-pointer py-2"
                >
                  <span className="font-bold text-gray-900 text-sm">{f.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                {open === i && (
                  <p className="text-xs text-gray-600 leading-relaxed pr-6">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-xs">
            <Phone className="w-6 h-6 text-[#e53238] mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm">Call Us</h3>
            <p className="text-xs text-gray-500 mt-1">1800-123-4567 (toll free)</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-xs">
            <Mail className="w-6 h-6 text-[#e53238] mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm">Email Us</h3>
            <p className="text-xs text-gray-500 mt-1">support@shaadi.com</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-xs">
            <Headphones className="w-6 h-6 text-[#e53238] mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm">Live Chat</h3>
            <p className="text-xs text-gray-500 mt-1">Mon–Sat, 9 AM – 8 PM</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}