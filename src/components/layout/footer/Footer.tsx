"use client";

import dynamic from "next/dynamic";
import Words from "./Words";
import Link from "next/link";
const FooterList = dynamic(() => import("./FooterList"));
const NewsletterSignup = dynamic(() => import("./NewsletterSignup"));

const Footer = () => {
  return (
    <footer className="bg-[#141A21] container-body flex flex-col py-8">
      <Words />
      <FooterList />
      <NewsletterSignup />
      <footer className="border-t border-gray-3/20 pt-8 mb-5 flex flex-col md:flex-row items-center justify-center md:justify-between">
        <Link
          href="/"
          prefetch
          className="bg-[#141A21] text-white px-4 py-1 rounded-full font-bold text-2xl font-public"
        >
          True<span className="text-primary-main">Scholar</span>
        </Link>
        <span className="text-gray-400 text-sm font-normal">
          © {new Date().getFullYear()} Truescholar. All rights reserved.
        </span>
      </footer>
    </footer>
  );
};

export default Footer;
