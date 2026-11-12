import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default for pages outside the website languages (e.g. the admin panel);
// the website pages get theirs from app/[locale]/layout.tsx
export const metadata: Metadata = {
  // Full addresses for social previews and canonical links (set NEXT_PUBLIC_SITE_URL online)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Acacia Safaris",
  description:
    "Acacia Safaris Ltd is a Rwandan tour operator based in Kigali: gorilla trekking, wildlife safaris and luxury lodges across Rwanda and East Africa.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The page's language (fr, sw, en) for screen readers, translation tools and search engines
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
