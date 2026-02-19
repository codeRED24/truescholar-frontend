import JsonLd from "@/lib/jsonld";
import { Barlow, Public_Sans } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import BreadcrumbProvider from "@/components/providers/BreadcrumbProvider";
import { NotificationProvider } from "@/providers/notification-provider";
import { PWAInstallToast } from "@/components/ui/pwa-install-toast";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrueScholar" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <JsonLd data={organizationData} />
        <JsonLd data={websiteData} />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('SW registered:', reg.scope))
                    .catch((err) => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
          strategy="afterInteractive"
        />
      </head>
      <body className={`${publicSans.variable} ${barlow.variable} antialiased`}>
        <GTMScript gtmId="G-5CMGT07LVZ" />
        <BreadcrumbProvider />
        <QueryProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </QueryProvider>
        <Toaster />
        <PWAInstallToast />
      </body>
    </html>
  );
}
