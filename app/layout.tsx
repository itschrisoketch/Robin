import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

// Display / wordmark / Robin's voice — a distinctive contemporary grotesque.
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base so the share image resolves for social scrapers.
  metadataBase: new URL("https://buildwithrobin.vercel.app"),
  title: "Robin — a path into Bitcoin open source",
  description: "Get to learn how to make your first open source contribution.",
  openGraph: {
    title: "Robin",
    description: "Get to learn how to make your first open source contribution.",
    url: "/",
    siteName: "Robin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robin",
    description: "Get to learn how to make your first open source contribution.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
