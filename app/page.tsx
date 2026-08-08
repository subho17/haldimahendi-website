import React from 'react';
import { Navbar, Hero, Features, Footer } from '@/components/Global';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
