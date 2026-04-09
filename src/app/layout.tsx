import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OnboardingModal from "@/components/OnboardingModal";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Caveat, Bricolage_Grotesque } from 'next/font/google';
const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
});

const playful = Bricolage_Grotesque({
  variable: '--font-playful',
  subsets: ['latin'],
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
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${playful.variable} antialiased`}
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
