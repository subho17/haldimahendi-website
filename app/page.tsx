import React from 'react';
import { Navbar, Hero, Features, Testimonals, Faqsection, Footer, Downloadapp, Blog, Steps } from '@/components/Global';

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
      <Faqsection />
      <Footer />
    </div>
  );
}
