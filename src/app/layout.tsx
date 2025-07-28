import JsonLd from "@/lib/jsonld";
import { orgLD, websiteLD } from "@/lib/schema";
import { Barlow, Public_Sans } from "next/font/google";
import Script from "next/script";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLD) }}
        />
      </head>
      <body className={`${publicSans.variable} ${barlow.variable} antialiased`}>
        <GTMScript gtmId="G-5CMGT07LVZ" />
        {children}
      </body>
    </html>
  );
}
