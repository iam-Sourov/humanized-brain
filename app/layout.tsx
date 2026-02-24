import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({

  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "HumanizedBrain | Premium AI Document Humanizer",
  description: "Bypass AI detection with 100% format preservation using advanced linguistic models.",
  keywords: ["AI Humanizer", "Bypass AI Detection", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "Document Refinement"],
  authors: [{ name: "HumanizedBrain Team" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "HumanizedBrain | Premium AI Document Humanizer",
    description: "Give your AI text a human soul with 100% format preservation.",
    type: "website",
    locale: "en_US",
    siteName: "HumanizedBrain",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
