import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GoogleAuthWrapper from "@/context/GoogleAuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matrimonial - Find Your Perfect Life Partner",
  description: "Trusted Matrimonial & Matchmaking Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-white`}
    >
      <body className="min-h-screen flex flex-col bg-white text-[#111827] m-0 p-0">
        <GoogleAuthWrapper>
          <AuthProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </AuthProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}
