import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Terms & Conditions - TrueScholar : top colleges, courses, admission, ranking, fee, placement",
  keywords: "",
  description: "Read the Terms & Conditions of TrueScholar before using our platform for educational insights.",
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in/terms-and-conditions",
    languages: { "en-US": "/en-US", "de-DE": "/de-DE" },
  },
};

const TermsSection = ({ title, content }: { title: string; content: string[] }) => (
  <>
    <li className="text-black font-semibold text-base">{title}</li>
    <div className="my-2">
      {content.map((paragraph, idx) => (
        <p key={idx} className="text-gray-5 text-base leading-6 tracking-wide mb-1">{paragraph}</p>
      ))}
    </div>
  </>
);

const TermsAndConditions = () => {
  const paragraphClasses = "text-gray-5 text-base leading-6 tracking-wide mb-1";

  const termsSections = [
    {
      title: "Acceptance of Terms",
      content: [
        "By accessing and using our platform, you agree to abide by these terms and conditions.",
        "If you do not agree with any part of these terms, you must discontinue use immediately.",
      ],
    },
    {
      title: "User Responsibilities",
      content: [
        "Users must provide accurate and updated information when registering an account.",
        "You are responsible for maintaining the confidentiality of your login credentials.",
      ],
    },
    {
      title: "Intellectual Property",
      content: [
        "All content on this platform, including text, images, and graphics, is the intellectual property of TrueScholar.",
        "Unauthorized use, reproduction, or distribution of our content is strictly prohibited.",
      ],
    },
    {
      title: "Limitation of Liability",
      content: [
        "TrueScholar is not responsible for any direct or indirect damages arising from the use of our services.",
        "We do not guarantee the accuracy or completeness of the information provided on the platform.",
      ],
    },
    {
      title: "Amendments to Terms",
      content: [
        "We reserve the right to modify these terms at any time.",
        "Users will be notified of significant changes through our platform.",
      ],
    },
  ];

  return (
    <div className="container-body bg-gray-2 py-12">
      <div className="bg-white rounded-2xl p-2 md:p-6 shadow-card2">
        <h1 className="font-semibold text-2xl">Terms & <span className="text-primary-main">Conditions</span></h1>
        <div>
          <p className={paragraphClasses}>
            Please read these Terms carefully before using TrueScholar. By accessing our platform, you agree to these terms, which may be updated periodically.
          </p>
        </div>
        <div>
          <ol className="list-decimal ml-4 my-3">
            {termsSections.map((section, idx) => (
              <TermsSection key={idx} title={section.title} content={section.content} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
