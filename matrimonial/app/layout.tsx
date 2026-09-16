import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PWA from "@/components/PWA";

export const metadata: Metadata = {
  metadataBase: new URL("https://haldimehendi.example.com"),
  title: {
    default: "Haldimehendi - Find Your Perfect Life Partner",
    template: "%s | Haldimehendi",
  },
  description: "India's trusted matrimonial platform for meaningful connections. Verified profiles, astrological matching, and premium features.",
  keywords: ["matrimonial", "matchmaking", "marriage", "haldimehendi", "life partner", "wedding", "horoscope matching", "kundli"],
  authors: [{ name: "Haldimehendi" }],
  creator: "Haldimehendi",
  publisher: "Haldimehendi",
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
    url: "https://haldimehendi.example.com",
    siteName: "Haldimehendi",
    title: "Haldimehendi - Find Your Perfect Life Partner",
    description: "India's trusted matrimonial platform for meaningful connections.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Haldimehendi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haldimehendi",
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
    "apple-mobile-web-app-title": "Haldimehendi",
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
      className="h-full antialiased bg-white"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#166534" />
      </head>
        <body className="min-h-screen flex flex-col bg-white text-[#111827] m-0 p-0 font-sans">
        <AuthProvider>
          <main className="flex-1 flex flex-col">{children}</main>
          <PWA />
        </AuthProvider>
      </body>
    </html>
  );
}
