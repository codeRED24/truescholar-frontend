import "../globals.css";

import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("@/components/layout/footer/Footer"));
const Header = dynamic(() => import("@/components/layout/header/Header"));


export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
    <Header />
    {children}
    <Toaster />
    <Footer />
  </main>
  );
}
