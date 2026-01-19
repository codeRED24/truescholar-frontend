import JsonLd from "@/lib/jsonld";
import { Barlow, Public_Sans } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = buildOrganizationSchema();
  const websiteData = buildWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <JsonLd data={organizationData} />
        <JsonLd data={websiteData} />
      </head>
      <body className={`${publicSans.variable} ${barlow.variable} antialiased`}>
        <GTMScript gtmId="G-5CMGT07LVZ" />
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
