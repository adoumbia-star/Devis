import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "SUD CONTRACTORS — Information et devis",
  description:
    "Consultez les solutions SUD CONTRACTORS en bref, puis envoyez une demande d'information ou de devis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} ${newsreader.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
