import type { Metadata } from "next";
import "./globals.css";
// import BuyMeCoffee from "../components/common/BuyMeCoffee";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/pages/auth/AuthInitializer";
import ConsoleProtection from "@/components/common/ConsoleProtection";
import FloatingButton from "@/components/common/FloatingButton";
import Head from "next/head";
import React from "react";
import "@/lib/env-check"; // Validate environment variables

export const metadata: Metadata = {
  metadataBase: new URL("http://entry.reactbd.com"),
  title: {
    default:
      "Entry Ecommerce Platform - Your All-in-One Online Shopping Destination",
    template: "%s | Entry Ecommerce",
  },
  description:
    "Shop amazing products at Entry Ecommerce Platform. Trusted brands, safe products, fast delivery. Your one-stop shop for all needs.",
  keywords: [
    "baby products",
    "baby essentials",
    "baby strollers",
    "baby toys",
    "baby clothing",
    "baby feeding",
    "baby care",
    "online shop",
    "entry ecommerce",
    "entry",
    "shopping online",
    "best deals",
  ],
  authors: [{ name: "Entry Team" }],
  creator: "Entry Ecommerce",
  publisher: "Entry Ecommerce",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://entry.reactbd.com",
    siteName: "Entry Ecommerce Platform",
    title:
      "Entry Ecommerce Platform - Your All-in-One Online Shopping Destination",
    description:
      "Shop top quality products, electronics, clothing, & more. Trusted brands, safe products, fast delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Entry Ecommerce - Your trusted store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Entry Ecommerce Platform - Your All-in-One Online Shopping Destination",
    description:
      "Shop top quality products with trusted brands and fast delivery.",
    images: ["/og-image.jpg"],
    creator: "@entryecommerce",
  },
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
  verification: {
    google: "your-google-site-verification-code",
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: "http://entry.reactbd.com",
  },
};

import { Albert_Sans } from "next/font/google";
import BuyMeCoffee from "@/components/common/BuyMeCoffee";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GADSENSE_CLIENT_ID = "ca-pub-6542623777003381";
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${albertSans.variable} antialiased font-sans`}>
        <ConsoleProtection />
        <AuthInitializer />
        {children}
        <Toaster
          position="bottom-left"
          toastOptions={{
            className: "rounded-lg shadow-lg border",
            duration: 4000,
          }}
        />
        {/* <FloatingButton /> */}
        <BuyMeCoffee
          turboLink={process.env.NEXT_PUBLIC_TURBO_PURCHASE_LINK}
          normalLink={process.env.NEXT_PUBLIC_NORMAL_PURCHASE_LINK}
          githubLink={process.env.NEXT_PUBLIC_GITHUB_REPO_LINK}
        />
      </body>
    </html>
  );
}
