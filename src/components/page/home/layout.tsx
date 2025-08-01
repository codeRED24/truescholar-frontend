import { Barlow } from "next/font/google";
import React from "react";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-barlow",
  display: "swap",
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={barlow.className}>{children}</div>;
}
