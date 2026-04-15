import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Phonora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <div className="shell">
          <SiteHeader />
          <main className="pageContainer">{children}</main>
        </div>
      </body>
    </html>
  );
}
