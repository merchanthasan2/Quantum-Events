import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aaj Ka Scene - Your City's Best Events",
  description: "Discover the best activities, concerts, workshops, and more across Mumbai, Delhi, Bangalore and beyond.",
  keywords: "events in india, mumbai events, delhi events, bangalore events, book tickets, workshops, concerts, aaj ka scene",
  manifest: "/manifest.json",
  openGraph: {
    title: "Aaj Ka Scene",
    description: "AI-powered events discovery platform for India's major cities.",
    url: "https://aajkascene.com",
    siteName: "Aaj Ka Scene",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aaj Ka Scene",
    description: "Discover the best of your city with Aaj Ka Scene.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
