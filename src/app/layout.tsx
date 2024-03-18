import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/nav";
import Footer from "@/components/footer";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import "./globals.css";

const BodyFont = localFont({
  src: "../components/fonts/spacegrotesk.ttf",
});

export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: "Helldivers Info",
    template: "%s | Helldivers Info",
  },
  description: "Relevant information for the democratic game Helldivers 2.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
          <main className="container flex flex-col px-4 py-12 md:min-h-screen md:px-8 md:py-20">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <TailwindIndicator />
        <Analytics />
      </body>
    </html>
  );
}
