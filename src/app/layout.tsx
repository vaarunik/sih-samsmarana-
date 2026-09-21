import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { MotionConfig } from "framer-motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Samsmarana — Memory & Cognitive Engagement",
  description:
    "Samsmarana creates personalized, culturally familiar cognitive activities that help older adults stay engaged, connected and curious.",
  keywords: [
    "Samsmarana",
    "cognitive engagement",
    "elderly care",
    "memory",
    "caregiver",
    "North East India",
  ],
  authors: [{ name: "Samsmarana" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Samsmarana — Memory & Cognitive Engagement",
    description:
      "Personalized, culturally familiar cognitive activities for older adults.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased bg-background text-foreground`}
      >
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
          <SonnerToaster richColors closeButton position="top-center" />
        </MotionConfig>
      </body>
    </html>
  );
}
