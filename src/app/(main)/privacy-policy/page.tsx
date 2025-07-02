import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "Privacy Policy - TrueScholar : top colleges: courses, admission, ranking, fee, placement",
  keywords: "",
  description:
    "Find the perfect academic goals & budget. Explore colleges, institutions & program opportunities.",
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in/privacy-policy",
    languages: { "en-US": "/en-US", "de-DE": "/de-DE" },
  },
};

const PrivacySection = ({
  title,
  content,
}: {
  title: string;
  content: string[];
}) => (
  <>
    <li className="text-black font-semibold text-base">{title}</li>
    <div className="my-2">
      {content.map((paragraph, idx) => (
        <p
          key={idx}
          className="text-gray-5 text-base leading-6 tracking-wide mb-1"
        >
          {paragraph}
        </p>
      ))}
    </div>
  </>
);

const Privacy = () => {
  const paragraphClasses = "text-gray-5 text-base leading-6 tracking-wide mb-1";

  const privacySections = [
    {
      title: "Eligibility",
      content: [
        "The Services are not directed towards, nor intended for use by, anyone under the age of 13. By using the Services, you represent and warrant that you are at least 13 years of age. If you are under 13, you may not, under any circumstances or for any reason, use the Services. Notwithstanding the foregoing, if you are a resident of the European Union, United Kingdom, Lichtenstein, Norway, or Iceland, you must be at least 16 years of age to use the Services. You are solely responsible for ensuring that these Terms comply with all applicable laws, and your right to use the Services is revoked wherever these Terms or your use of the Services conflicts with any laws.",
        "In other words: You MUST be at least 13 years old to use the Services (or at least 16 years old if you are a resident of certain European countries as described above). Do not use the Services if it would mean breaking the law.",
      ],
    },
    {
      title: "Your Account",
      content: [
        "You may need to sign up for an account on Giphy in order to use parts of the Services. You must provide accurate and up to date information for your account. You promise not to (i) intentionally impersonate another person by using their name or email address, (ii) use an offensive name or email address, or (iii) use a name or email address for which you do not have proper authorization. We reserve the right to require that you change your username or use another email address. You are prohibited from using another person’s account or registration information for the Services without their permission. You are responsible for all activity that occurs on your account, and for keeping your password secure. You promise to immediately let us know if there is any unauthorized use of your account. You can delete your account at any time, either directly or through a request to us.",
        "In other words: If you sign up for an account on the Services, you are responsible for all activity on your account. Be mindful about protecting your account password and let us know immediately if you think there are any issues.",
      ],
    },
    {
      title: "Use of the Platform",
      content: [
        "The Platform and the services and products offered via the Platform are meant for only legitimate and lawful uses which fall within the scope of the Purpose...",
        "You are expressly prohibited from using or exploiting the Platform for (a) any commercial purposes without prior written consent from the Company.",
      ],
    },
    {
      title: "Use to be in Conformity with the Purpose",
      content: [
        "The Platform (including the Platform and related products) or Service or Product that you subscribe to or use is meant for the Purpose and only your exclusive use...",
        "In the event you are found to be copying or misusing any data or photographs or graphics available on the Platform, we reserve the right to take such action...",
      ],
    },
  ];

  return (
    <div className="container-body bg-gray-2 py-12">
      <div className="bg-white rounded-2xl p-2 md:p-6 shadow-card2">
        <h1 className="font-semibold text-2xl">Privacy <span className="text-primary-main">Policy</span></h1>
        <div>
          <p className={paragraphClasses}>
            Please read these Terms fully and carefully before using the
            Services, because these Terms form a legally binding contract
            between you and Giphy for your use of the Services. As described in
            Section 13, you agree that unless you opt out, all disputes between
            you and Giphy will be resolved by individual arbitration, and you
            waive your right to trial by jury, or to participate in a class
            action lawsuit or class-wide arbitration. By using the Services, you
            agree to be bound by these Terms. From time to time, we may modify
            or update these Terms, effective upon posting through the Services.
            If you use the Services after any such change, you accept these
            Terms as modified. In other words: By using anything offered by
            Giphy, you automatically agree to this legal agreement. You also
            accept any updated version of this agreement by continuing to use
            the Services.{" "}
          </p>
        </div>
        <div>
          <ol className="list-decimal ml-4 my-3">
            {privacySections.map((section, idx) => (
              <PrivacySection
                key={idx}
                title={section.title}
                content={section.content}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Privacy;