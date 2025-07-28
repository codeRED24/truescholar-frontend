import { CourseDTO } from "@/api/@types/course-type";
import { getCourses } from "@/api/list/getCourses";
import ContactForm from "@/components/forms/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | TrueScholar - Get in Touch",
  description:
    "Have questions or need assistance? Contact TrueScholar today. We're here to help with college guidance, scholarships, and more.",
  keywords:
    "TrueScholar contact, get in touch, support, help, education guidance, student support",
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in/contact-us",
  },
  openGraph: {
    title: "Contact Us | TrueScholar - Get in Touch",
    description:
      "Reach out to TrueScholar for assistance with college admissions, scholarships, and student support.",
    url: "https://www.truescholar.in/contact-us",
    siteName: "TrueScholar",
    images: [
      {
        url: "https://www.truescholar.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact TrueScholar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | TrueScholar - Get in Touch",
    description:
      "Need help or have questions? Contact TrueScholar today for expert guidance on education and scholarships.",
    images: ["https://www.truescholar.in/og-image.png"],
  },
};

export default async function Contact() {
  let courses: CourseDTO[] = await getCourses();

  return <ContactForm courseData={courses} />;
}
