import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";

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
  description: "Learn English phonetics, transcription, and reading rules with structured audio practice.",
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
          <header className="siteHeader">
            <Link href="/" className="brand">
              <span className="brandMark">Ph</span>
              <span>
                <strong>Phonora</strong>
                <small>English phonetics trainer</small>
              </span>
            </Link>
            <nav className="siteNav">
              <Link href="/">Course</Link>
            </nav>
          </header>
          <main className="pageContainer">{children}</main>
        </div>
      </body>
    </html>
  );
}
