import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";
import SignupPageView from "@/components/ui/Signup/SignupPage";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50/70 via-slate-50 to-pink-50/60 overflow-hidden">
        {/* Ambient background decorative glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-2xl">
          <Suspense fallback={<div className="flex h-64 items-center justify-center">Loading...</div>}>
            <SignupPageView />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
