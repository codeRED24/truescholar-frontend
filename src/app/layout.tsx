import JsonLd from "@/lib/jsonld";
import { Barlow, Public_Sans } from "next/font/google";
import Script from "next/script";
import BreadcrumbProvider from "@/components/providers/BreadcrumbProvider";
import { Toaster } from "@/components/ui/sonner";

// Define website schema data
const websiteLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TrueScholar",
  url: "https://truescholar.in",
  description: "Find and compare the best colleges in India",
  potentialAction: {
    "@type": "SearchAction",
    target: `${process.env.NEXT_PUBLIC_BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const publicSans = Public_Sans({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  subsets: ["latin"],
  display: "swap",
});

function GTMScript({ gtmId }: { gtmId: string }) {
  if (!gtmId) return null;
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtmId}');
          `,
        }}
        strategy="afterInteractive"
      />
    </>
  );
}

function OrganizationSchema({
  name = "TrueScholar",
  url = "https://truescholar.in",
  logo = "https://truescholar.in/favicon.ico",
  description = "Find and compare the best colleges in India",
  sameAs = [
    "https://facebook.com/truescholar",
    "https://twitter.com/truescholar",
    "https://linkedin.com/company/truescholar",
  ],
  contactPoint = {
    contactType: "customer service",
    availableLanguage: "English",
  },
}: any) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      ...contactPoint,
    },
  };

  return <JsonLd data={organizationData} />;
}

function WebsiteSchema({
  name = "PickMyUni",
  url = "https://pickmyuni.com",
  description = "Discover and compare top Indian colleges",
}: any) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
  };

  return <JsonLd data={websiteData} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLD) }}
        />
      </head>
      <body className={`${publicSans.variable} ${barlow.variable} antialiased`}>
        <GTMScript gtmId="G-5CMGT07LVZ" />
        <BreadcrumbProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
