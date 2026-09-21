import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-gray-700">
      
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Need Help? */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">
              Need Help?
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link href="/auth/login" className="hover:text-[#d97706] transition-colors">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-[#d97706] transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#d97706] transition-colors">
                  Partner Search
                </Link>
              </li>
              <li>
                <Link href="/how-to-use" className="hover:text-[#d97706] transition-colors">
                  How to Use Haldimehendi.com
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-[#d97706] transition-colors">
                  Premium Memberships
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#d97706] transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-[#d97706] transition-colors">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link href="/about" className="hover:text-[#d97706] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#d97706] transition-colors">
                  Haldimehendi Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#d97706] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/awards" className="hover:text-[#d97706] transition-colors">
                  Awards & Recognition
                </Link>
              </li>
              <li>
                <Link href="/biodata-maker" className="hover:text-[#d97706] transition-colors">
                  Marriage Biodata Maker
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#d97706] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Privacy & You */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">
              Privacy & You
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link href="/terms" className="hover:text-[#d97706] transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#d97706] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safe-online" className="hover:text-[#d97706] transition-colors">
                  Be Safe Online
                </Link>
              </li>
              <li>
                <Link href="/report-misuse" className="hover:text-[#d97706] transition-colors">
                  Report Misuse
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: More */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">
              More
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link href="/vip-shaadi" className="hover:text-[#d97706] transition-colors">
                  VIP Haldimehendi
                </Link>
              </li>
              <li>
                <Link href="/sangam" className="hover:text-[#d97706] transition-colors">
                  Sangam
                </Link>
              </li>
              <li>
                <Link href="/centres" className="hover:text-[#d97706] transition-colors">
                  Haldimehendi Centres
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-[#d97706] transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-[#d97706] transition-colors">
                  Haldimehendi Live
                </Link>
              </li>
              <li>
                <Link href="/elite" className="hover:text-[#d97706] transition-colors">
                  Elite Matrimony by Haldimehendi.com
                </Link>
              </li>
              <li>
                <Link href="/astrochat" className="hover:text-[#d97706] transition-colors">
                  Astrochat.com
                </Link>
              </li>
              <li>
                <Link href="/astrologers" className="hover:text-[#d97706] transition-colors">
                  Chat with Astrologers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Links & App Download */}
          <div className="space-y-6">
            
            {/* Find us on: */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-3 tracking-tight">
                Find us on:
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/50 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/50 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/50 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/50 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-[#d97706] hover:text-[#d97706] hover:bg-red-50/50 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Get the Shaadi App */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-3 tracking-tight">
Get the Haldimehendi App
              </h3>
              
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5">
                {/* App Store */}
                <a
                  href="https://apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-fit"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.17.67-2.88 1.5-.64.74-1.2 1.9-1.05 3.01 1.12.09 2.28-.67 2.94-1.47z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-wider text-gray-300">Download on the</div>
                    <div className="text-xs font-semibold">App Store</div>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-fit"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3 20.5v-17c0-.55.45-1 1-1h.5l9.5 9.5-9.5 9.5H4c-.55 0-1-.45-1-1zm12.5-7.5L13 10.5 4.5 2h1c.3 0 .6.15.8.4l9.2 10.6zM4.5 22L13 13.5l2.5 2.5-9.2 10.6c-.2.25-.5.4-.8.4h-1zM21.5 12l-4.5 2.5-3-3 3-3 4.5 2.5c.7.4.7 1.1 0 1.5z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-wider text-gray-300">GET IT ON</div>
                    <div className="text-xs font-semibold">Google Play</div>
                  </div>
                </a>
              </div>

              {/* Trademark Fine Print */}
              <div className="mt-3 text-[10px] text-gray-400 leading-tight space-y-0.5">
                <p>Apple and the Apple logo are trademarks of Apple Inc.</p>
                <p>Google Play and the Google Play logo are trademarks of Google LLC.</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Dark Footer Bottom Bar */}
      <div className="bg-[#1e1e24] text-gray-400 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © 1996–{new Date().getFullYear()} Haldimehendi.com, The World&apos;s Leading Matchmaking Service™
          </div>
          <div className="flex items-center gap-1 font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
            <span>Passionately created by People Group</span>
            <span className="text-[#d97706] font-bold">➤</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
