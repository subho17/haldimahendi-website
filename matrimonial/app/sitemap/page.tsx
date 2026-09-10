"use client";

import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Site Map</h1>
        <p className="text-gray-600 text-lg">Navigate our site easily. Full sitemap coming soon.</p>
      </div>
      <Footer />
    </div>
  );
}
