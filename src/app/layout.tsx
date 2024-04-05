import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/nav";
import Footer from "@/components/footer";
import AppDownload from "@/components/appDownload";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import "./globals.css";

const BodyFont = localFont({
  src: "../components/fonts/spacegrotesk.ttf",
});

export const metadata = {
  metadataBase: new URL(`https://www.helldiverscompanion.app/`),
  title: {
    default: "Helldivers Companion",
    template: "%s | Helldivers Companion",
  },
  description:
    "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icons/favicon-16x16.png",
    apple: "/icons/apple-touch-icon.png",
    android: "/icons/android-chrome-192x192.png",
  },
  manifest: "https://www.helldiverscompanion.app/manifest.json",
  authors: [{ name: "Michael Wagner", url: "https://michaelwagner.cc" }],
  keywords: [
    "Helldivers 2",
    "Galactic War",
    "attack targets",
    "major orders",
    "maps",
    "patch notes",
    "dispatches",
    "galaxy stats",
    "information hub",
  ],
  openGraph: {
    title: "Helldivers Companion",
    description:
      "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
    url: "https://www.helldiverscompanion.app/",
    siteName: "Helldivers Companion",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.helldiverscompanion.app/opengraph-image.jpg",
        width: 800,
        height: 600,
        alt: "Helldivers Companion Thumbnail",
      },
    ],
  },
  twitter: {
    title: "Helldivers 2 Galactic War Hub",
    description:
      "Stay up-to-date with the latest Helldivers 2 information. Check current attack targets, major orders, maps, patch notes, dispatches, and galaxy stats. Your one-stop hub for all things Helldivers 2.",
    images: [
      {
        url: "https://www.helldiverscompanion.app/opengraph-image.jpg",
        width: 800,
        height: 600,
        alt: "Helldivers Companion Thumbnail",
      },
    ],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={BodyFont.className}>
      <body className="antialiased ">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pwachildren container flex flex-col px-4 py-12 md:min-h-screen md:py-20 2xl:px-8">
            {children}
          </main>
          <AppDownload />
          <Footer />
        </ThemeProvider>
        <TailwindIndicator />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
