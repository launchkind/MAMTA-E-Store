import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/pages/auth/AuthInitializer";
import ConsoleProtection from "@/components/common/ConsoleProtection";
import Head from "next/head";
import React from "react";
import "@/lib/env-check"; // Validate environment variables

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mamtaestore.in"),
  title: {
    default:
      "Mamta E-Store - Your One-Stop Online Electronics Shopping Destination",
    template: "%s | Mamta E-Store",
  },
  description:
    "Shop the latest smartphones, laptops, TVs, appliances, and more at Mamta E-Store. Trusted brands, genuine products, fast delivery.",
  keywords: [
    "electronics",
    "smartphones",
    "laptops",
    "televisions",
    "home appliances",
    "audio",
    "online shop",
    "mamta e-store",
    "shopping online",
    "best deals",
  ],
  authors: [{ name: "Mamta E-Store" }],
  creator: "Mamta E-Store",
  publisher: "Mamta E-Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.mamtaestore.in",
    siteName: "Mamta E-Store",
    title:
      "Mamta E-Store - Your One-Stop Online Electronics Shopping Destination",
    description:
      "Shop top quality electronics, smartphones, laptops, TVs & more. Trusted brands, genuine products, fast delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mamta E-Store - Your trusted electronics store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Mamta E-Store - Your One-Stop Online Electronics Shopping Destination",
    description:
      "Shop top quality electronics with trusted brands and fast delivery.",
    images: ["/og-image.jpg"],
    creator: "@mamtaestore",
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
    canonical: "https://www.mamtaestore.in",
  },
};

import { Albert_Sans } from "next/font/google";

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
      </body>
    </html>
  );
}
