import type { Metadata } from "next";
import "../globals.css";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import ChatbotWidget from "@/components/ChatbotWidget";
import { cardConfig } from "@/lib/ai-questions";
const Footer = dynamic(() => import("@/components/layout/footer/Footer"));
const Header = dynamic(() => import("@/components/layout/header/Header"));

export const metadata: Metadata = {
  title: "TrueScholar | Find Your Perfect College & Scholarships in India",
  description:
    "TrueScholar helps students discover the best colleges, programs, and scholarships in India. Compare courses, check eligibility, and plan your academic future with ease.",
  keywords: [
    "TrueScholar",
    "college search India",
    "scholarships in India",
    "college comparison",
    "best colleges in India",
    "study guidance",
  ],
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in",
  },
  openGraph: {
    title: "TrueScholar | Find Your Perfect College & Scholarships in India",
    description:
      "Discover top colleges and scholarships in India with TrueScholar. Make informed decisions for your academic journey.",
    url: "https://www.truescholar.in",
    siteName: "TrueScholar",
    type: "website",
    images: [
      {
        url: "https://www.truescholar.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TrueScholar - Find Your Perfect College",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueScholar | Find Your Perfect College & Scholarships in India",
    description:
      "Explore the best colleges and scholarships in India with TrueScholar. Compare, plan, and succeed.",
    images: ["https://www.truescholar.in/og-image.png"],
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow min-h-screen">{children}</main>
      <ChatbotWidget cardConfig={cardConfig} />

      <Toaster />
      <Footer />
    </div>
  );
}
