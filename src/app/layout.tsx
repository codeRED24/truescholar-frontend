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
  const isProduction = process.env.NODE_ENV === "production";
  const enablePwaDev = process.env.NEXT_PUBLIC_ENABLE_PWA_DEV === "true";
  const enablePwaDebug = process.env.NEXT_PUBLIC_PWA_DEBUG === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrueScholar" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <JsonLd data={organizationData} />
        <JsonLd data={websiteData} />
        <Script
          id="pwa-install-capture"
          dangerouslySetInnerHTML={{
            __html: `
              if (!window.__TS_PWA_PROMPT_LISTENER_BOUND__) {
                window.__TS_PWA_PROMPT_LISTENER_BOUND__ = true;
                window.__TS_PWA_DEFERRED_PROMPT__ = null;
                window.__TS_PWA_UI_READY__ = false;
                const DEBUG = ${enablePwaDebug ? "true" : "false"};
                const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
                const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7;

                const debugLog = (...args) => {
                  if (DEBUG) {
                    console.log('[PWA]', ...args);
                  }
                };

                const isPWAInstalled = () => {
                  const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
                  const isIOSStandalone = Boolean(window.navigator.standalone);
                  const isTwa = document.referrer.startsWith('android-app://');
                  return isStandaloneMode || isIOSStandalone || isTwa;
                };

                const wasDismissedRecently = () => {
                  try {
                    const dismissedAt = window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY);
                    if (!dismissedAt) return false;
                    const dismissedAtMs = Number(dismissedAt);
                    if (Number.isNaN(dismissedAtMs)) return false;
                    return Date.now() - dismissedAtMs < DISMISS_COOLDOWN_MS;
                  } catch {
                    return false;
                  }
                };

                window.addEventListener('beforeinstallprompt', (event) => {
                  const shouldCaptureForCustomUi =
                    !isPWAInstalled() &&
                    !wasDismissedRecently();

                  if (!shouldCaptureForCustomUi) {
                    debugLog('beforeinstallprompt: allowing browser default UI (ineligible for custom)');
                    window.__TS_PWA_DEFERRED_PROMPT__ = null;
                    return;
                  }

                  event.preventDefault();
                  window.__TS_PWA_DEFERRED_PROMPT__ = event;
                  debugLog('beforeinstallprompt: captured for custom UI');
                  window.dispatchEvent(new Event('ts-pwa-install-available'));
                });

                window.addEventListener('appinstalled', () => {
                  debugLog('appinstalled: clearing deferred prompt');
                  window.__TS_PWA_DEFERRED_PROMPT__ = null;
                  window.dispatchEvent(new Event('ts-pwa-installed'));
                });
              }
            `,
          }}
          strategy="beforeInteractive"
        />
        <Script
          id="pwa-sw-register"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                const DEBUG = ${enablePwaDebug ? "true" : "false"};
                const ENABLE_PWA_DEV = ${enablePwaDev ? "true" : "false"};
                const IS_PRODUCTION = ${isProduction ? "true" : "false"};
                const isLocalhost =
                  location.hostname === 'localhost' ||
                  location.hostname === '127.0.0.1' ||
                  location.hostname === '[::1]';
                const isHttps = location.protocol === 'https:';
                const shouldRegisterByDefault = IS_PRODUCTION && isHttps && !isLocalhost;
                const shouldRegisterInDev = ENABLE_PWA_DEV && (isHttps || isLocalhost);
                const shouldRegister = shouldRegisterByDefault || shouldRegisterInDev;

                const debugLog = (...args) => {
                  if (DEBUG) {
                    console.log('[PWA]', ...args);
                  }
                };

                if (!shouldRegister) {
                  debugLog('Skipping SW registration', {
                    IS_PRODUCTION,
                    isHttps,
                    isLocalhost,
                    ENABLE_PWA_DEV,
                  });
                } else {
                  // Chromium installability checklist:
                  // 1) Secure context (HTTPS or localhost)
                  // 2) Active service worker for the current scope
                  // 3) Valid manifest at /manifest.webmanifest
                  // 4) User engagement before beforeinstallprompt is fired
                  const registerServiceWorker = () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((reg) => debugLog('SW registered:', reg.scope))
                      .catch((err) => console.error('SW registration failed:', err));
                  };

                  if (document.readyState === 'complete') {
                    registerServiceWorker();
                  } else {
                    window.addEventListener('load', registerServiceWorker, { once: true });
                  }
                }
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
