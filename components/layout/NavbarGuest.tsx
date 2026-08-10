'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ForgetPasswordModal from '@/components/Forgetpassword/ForgetPasswordModal';
import LoginModal from '@/components/ui/Login/LoginModal';
import SignupModal from '@/components/ui/Signup/SignupModal';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener to toggle compact mode
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-md'
          : 'h-20 sm:h-24 bg-white border-b border-gray-100 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between transition-all duration-300">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center group focus:outline-hidden transform transition-all duration-300 hover:scale-102"
        >
          <div className="flex items-center gap-1 select-none">
            <span className="relative flex items-center">
              <span
                className={`font-extrabold text-[#e53238] tracking-tight font-serif italic transition-all duration-300 ${
                  isScrolled ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
                }`}
              >
                shaadi
              </span>
              
              {/* Interlocking Rings Emblem over 'aa' */}
              <span
                className={`absolute left-7 sm:left-10 flex items-center -space-x-1 transition-all duration-300 ${
                  isScrolled ? '-top-1 sm:-top-1.5' : '-top-2 sm:-top-2.5'
                }`}
              >
                <span
                  className={`rounded-full border-2 border-[#e53238] bg-transparent transition-all duration-300 ${
                    isScrolled ? 'w-2.5 h-2.5 border-2' : 'w-3.5 h-3.5 border-2'
                  }`}
                ></span>
                <span
                  className={`rounded-full border-2 border-[#00aed6] bg-transparent transition-all duration-300 ${
                    isScrolled ? 'w-2.5 h-2.5 border-2' : 'w-3.5 h-3.5 border-2'
                  }`}
                ></span>
              </span>
            </span>

            {/* .com Tag */}
            <span
              className={`font-bold text-[#00aed6] self-end transition-all duration-300 ${
                isScrolled ? 'text-xs sm:text-sm mb-1 ml-0.5' : 'text-base sm:text-lg mb-2 ml-1'
              }`}
            >
              .com
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center transition-all duration-300 space-x-6 lg:space-x-10">
          <Link
            href="/about"
            className={`relative font-semibold text-gray-700 hover:text-[#e53238] transition-all duration-300 group py-1 ${
              isScrolled ? 'text-sm' : 'text-lg lg:text-xl'
            }`}
          >
            <span>About us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e53238] transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/help"
            className={`relative font-semibold text-gray-700 hover:text-[#e53238] transition-all duration-300 group py-1 ${
              isScrolled ? 'text-sm' : 'text-lg lg:text-xl'
            }`}
          >
            <span>Help</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e53238] transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* Login Pill Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`rounded-full border font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer outline-hidden transform active:scale-95 ${
                isScrolled
                  ? 'px-4 py-1.5 text-sm'
                  : 'px-6 py-2.5 text-base sm:text-lg shadow-sm hover:shadow-md'
              } ${
                isDropdownOpen
                  ? 'border-[#e53238] text-[#e53238] bg-red-50/50 shadow-inner'
                  : 'border-gray-300 text-gray-700 hover:border-[#e53238] hover:text-[#e53238] hover:bg-red-50/20'
              }`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span>Login</span>
              <svg
                className={`transition-transform duration-300 ${
                  isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
                } ${isDropdownOpen ? 'rotate-180 text-[#e53238]' : 'text-gray-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95 slide-in-from-top-3">
                <div className="px-5 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Member Access
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-3.5 px-5 py-3 text-sm text-gray-700 hover:bg-red-50/80 hover:text-[#e53238] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-red-100/60 text-gray-500 group-hover:text-[#e53238] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Member Login</div>
                    <div className="text-xs text-gray-400">Login with Profile ID / Email</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsSignupModalOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-3.5 px-5 py-3 text-sm text-gray-700 hover:bg-red-50/80 hover:text-[#e53238] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-red-100/60 text-gray-500 group-hover:text-[#e53238] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Create New Profile</div>
                    <div className="text-xs text-gray-400">Register Free Today</div>
                  </div>
                </button>

                <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Forgot Password / Need Help?</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`font-semibold rounded-full border border-gray-300 text-gray-700 transition-all duration-300 flex items-center gap-1 cursor-pointer ${
              isScrolled ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
            }`}
          >
            <span>Login</span>
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-lg px-4 pt-4 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-lg font-semibold text-gray-800 hover:bg-red-50 hover:text-[#e53238] transition-colors"
          >
            About us
          </Link>

          <Link
            href="/help"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-lg font-semibold text-gray-800 hover:bg-red-50 hover:text-[#e53238] transition-colors"
          >
            Help
          </Link>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#e53238] text-white font-semibold text-base shadow-md hover:bg-[#c92429] active:scale-98 transition-all cursor-pointer"
            >
              Member Login
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSignupModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#e53238] text-[#e53238] font-semibold text-base shadow-sm hover:bg-red-50 active:scale-98 transition-all cursor-pointer"
            >
              Create New Profile
            </button>
          </div>
        </div>
      )}

      {/* Popups / Modals */}
      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
        onOpenSignup={() => setIsSignupModalOpen(true)}
      />

      <SignupModal
        open={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <ForgetPasswordModal
        open={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </header>
  );
}
