import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GoogleAuthWrapper from "@/context/GoogleAuthWrapper";
import PWA from "@/components/PWA";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shaadi.example.com"),
  title: {
    default: "Shaadi Matrimonial - Find Your Perfect Life Partner",
    template: "%s | Shaadi Matrimonial",
  },
  description: "India's trusted matrimonial platform for meaningful connections. Verified profiles, astrological matching, and premium features.",
  keywords: ["matrimonial", "matchmaking", "marriage", "shaadi", "life partner", "wedding", "horoscope matching", "kundli"],
  authors: [{ name: "Shaadi Matrimonial" }],
  creator: "Shaadi Matrimonial",
  publisher: "Shaadi Matrimonial",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://shaadi.example.com",
    siteName: "Shaadi Matrimonial",
    title: "Shaadi Matrimonial - Find Your Perfect Life Partner",
    description: "India's trusted matrimonial platform for meaningful connections.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shaadi Matrimonial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaadi Matrimonial",
    description: "Find your perfect life partner on India's trusted matrimonial platform.",
    images: ["/images/og-image.jpg"],
  },
  verification: {
    google: "google-site-verification-code",
  },
  other: {
    "theme-color": "#e53238",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Shaadi",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-white`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#e53238" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#111827] m-0 p-0">
        <GoogleAuthWrapper>
          <AuthProvider>
            <main className="flex-1 flex flex-col">{children}</main>
            <PWA />
          </AuthProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}
