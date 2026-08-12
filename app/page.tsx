"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { Hero, Features, Testimonals, Faqsection, Footer, Downloadapp, Blog, Steps, Newsletter } from '@/components/Global';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

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
