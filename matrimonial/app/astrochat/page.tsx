import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/Global";

export default function AstrochatPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Astrochat</h1>
        <p className="text-gray-600 text-lg">Connect with astrologers for matchmaking guidance. Coming soon.</p>
      </div>
      <Footer />
    </div>
  );
}
