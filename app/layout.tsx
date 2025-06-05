import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "@/app/globals.css";

import Header from "@/components/header";
import Footer from "@/components/footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Helldivers Companion",
    template: "%s | Helldivers Companion",
  },
  description:
    "Your essential companion for Helldivers 2 - track missions, view galactic war progress and access stratagems, weapons and planetary data to maximize your democratic efficiency.",
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
        className={`${spaceGrotesk.variable} font-[family-name:var(--font-space-grotesk)] antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="pwachildren container flex flex-col px-4 py-12 md:min-h-screen md:py-20 2xl:px-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
