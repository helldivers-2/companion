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
  metadataBase: new URL(`https://helldiverscompanion.app/`),
  title: {
    default: "Helldivers Companion",
    template: "%s | Helldivers Companion",
  },
  description:
    "Dive into your comprehensive companion for Helldivers 2. Explore current targets, plan deployments on the galaxy map, and access a vast item database and see the item shop. Stay updated with patch notes, participate in major orders, and engage with the community.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icons/favicon-16x16.png",
    apple: "/icons/apple-touch-icon.png",
    android: "/icons/android-chrome-192x192.png",
  },
  manifest: "https://helldiverscompanion.app/manifest.json",
  authors: [
    { name: "Michael Wagner", url: "https://michaelwagner.vercel.app" },
  ],
  openGraph: {
    title: "Helldivers Companion",
    description: "Relevant information for the democratic game Helldivers 2.",
    url: "https://helldiverscompanion.app/",
    siteName: "Helldivers Companion",
    locale: "en_US",
    type: "website",
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
