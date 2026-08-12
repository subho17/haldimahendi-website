import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Hero, Features, Testimonals, Faqsection, Footer, Downloadapp, Blog, Steps, Newsletter } from '@/components/Global';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      <Steps />
      <Features />
      <Testimonals />
      <Downloadapp />
      <Blog />
      <Newsletter />
      <Faqsection />
      <Footer />
    </div>
  );
}
