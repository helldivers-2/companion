import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/config/site";
import "@/app/globals.css";

import { Header } from "@/components/header";
import Footer from "@/components/footer";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Companion" />
      </head>
      <body
        className={`${spaceGrotesk.variable} h-lvh font-[family-name:var(--font-space-grotesk)] antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="container mx-auto flex flex-col sm:px-4 sm:pt-12">
            {children}
          </main>
          <Footer />
          <div className="pb-24 sm:pb-0" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
