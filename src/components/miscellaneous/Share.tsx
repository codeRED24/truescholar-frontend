"use client";

import { useState } from "react";
import {
  LuFacebook as Facebook,
  LuInstagram as Instagram,
  LuLinkedin as Linkedin,
  LuMessageCircle as MessageCircle,
  LuShare2 as Share2,
} from "react-icons/lu";
import Link from "next/link";

const ShareButton = ({
  href,
  icon: Icon,
  bgColor,
}: {
  href: string;
  icon: React.ComponentType<{ size?: string | number | undefined }>;
  bgColor: string;
}) => (
  <Link
    href={href}
    passHref
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center ${bgColor} p-2 rounded-full text-white hover:brightness-110 transition`}
  >
    <Icon size={16} />
  </Link>
);

const Share: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  let hideTimeout: NodeJS.Timeout;

  const toggleShareOptions = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setShowOptions(true);

    setTimeout(() => setIsCopied(false), 2000);

    hideTimeout = setTimeout(() => setShowOptions(false), 3000);
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout);
    setShowOptions(true);
  };

  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => setShowOptions(false), 3000);
  };

  const shareLinks = [
    {
      href: `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
      icon: MessageCircle,
      bgColor: "bg-green-500",
    },
    {
      href: `https://www.instagram.com/`,
      icon: Instagram,
      bgColor: "bg-pink-500",
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      icon: Facebook,
      bgColor: "bg-blue-700",
    },
    {
      href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
        currentUrl
      )}`,
      icon: Linkedin,
      bgColor: "bg-blue-500",
    },
  ];

  return (
    <div className="flex items-center space-x-2 relative">
      <button
        onClick={toggleShareOptions}
        className="flex items-center gap-2 text-primary-1 hover:bg-transparent hover:text-white"
      >
        <Share2 size={14} />
        {isCopied ? "Copied!" : "Share"}
      </button>

      {showOptions && (
        <div
          className="flex space-x-4 absolute -top-[50px] right-0 bg-white p-2 rounded-lg shadow-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {shareLinks.map(({ href, icon, bgColor }, index) => (
            <ShareButton
              key={index}
              href={href}
              icon={icon}
              bgColor={bgColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Share;
