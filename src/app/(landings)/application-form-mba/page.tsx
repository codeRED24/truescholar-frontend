import MBALandingPage from '@/components/page/landing/MBALandingPage';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
    title:
      "MBA Application Form - TrueScholar : top colleges: courses, admission, ranking, fee, placement",
    keywords: "",
    description:
      "Find the perfect academic goals & budget. Explore colleges, institutions & program opportunities.",
    metadataBase: new URL("https://www.truescholar.in"),
    alternates: {
      canonical: "https://www.truescholar.in/application-form-mba",
      languages: { "en-US": "/en-US", "de-DE": "/de-DE" },
    },
  };

const MBAForm = () => {
  return (
    <div><MBALandingPage /></div>
  )
}

export default MBAForm