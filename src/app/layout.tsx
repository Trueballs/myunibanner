import type { Metadata } from "next";
// Removed unused Geist_Mono import
import "./globals.css";
import OnboardingModal from "@/components/OnboardingModal";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { Geist, Lexend } from "next/font/google";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Myunibanner — Create your custom LinkedIn banner",
  description: "Create a professional LinkedIn background banner for your university in seconds. Free, one-click download.",
  openGraph: {
    title: "Myunibanner — Create your custom LinkedIn banner",
    description: "Personalized LinkedIn banners for students and alumni.",
    type: "website",
    url: "https://myunibanner.vercel.app",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2231701309996004"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geist.variable} ${lexend.variable} font-lexend antialiased`}
      >
        <OnboardingModal />
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
