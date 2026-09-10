"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Hero, Features, Testimonals, Faqsection, Footer, Downloadapp, Blog, Steps } from "@/components/Global";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
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
      <Faqsection />
      <Footer />
    </div>
  );
}
