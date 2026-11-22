
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";


import "./globals.css";
import Footer from "./components/common/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PATO",
    template: "%s | PATO",
  },
  description:
    "Discover everyday fashion with PATO. Explore styles for your everyday wardrobe.",
  applicationName: "PATO",
  openGraph: {
    type: "website",
    title: "PATO",
    description:
      "Discover everyday fashion with PATO. Explore styles for your everyday wardrobe.",
    siteName: "PATO",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#041005",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-dvh antialiased">
        <div className="flex min-h-dvh flex-col">
          <div className="flex-1">
            {children}
          </div>

          <Footer />
        </div>
      </body>
    </html>
  );
}
