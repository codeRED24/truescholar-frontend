'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __TS_PWA_DEFERRED_PROMPT__?: BeforeInstallPromptEvent | null;
    __TS_PWA_UI_READY__?: boolean;
  }
}

const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const IS_PWA_DEBUG = process.env.NEXT_PUBLIC_PWA_DEBUG === 'true';

function debugLog(...args: unknown[]) {
  if (!IS_PWA_DEBUG) return;
  console.log('[PWA]', ...args);
}

function isPWAInstalled(): boolean {
  const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  );
  const isTwa = document.referrer.startsWith('android-app://');

  return isStandaloneMode || isIOSStandalone || isTwa;
}

function wasDismissedRecently(): boolean {
  const dismissedAt = window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY);
  if (!dismissedAt) return false;

  const dismissedAtMs = Number(dismissedAt);
  if (Number.isNaN(dismissedAtMs)) return false;

  return Date.now() - dismissedAtMs < DISMISS_COOLDOWN_MS;
}

export function PWAInstallToast() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const canShowCustomUi = useMemo(
    () => !isInstalled && !isDismissed,
    [isInstalled, isDismissed]
  );

  useEffect(() => {
    const installed = isPWAInstalled();
    const dismissedRecently = wasDismissedRecently();
    setIsInstalled(installed);
    setIsDismissed(dismissedRecently);

    window.__TS_PWA_UI_READY__ = !installed && !dismissedRecently;

    debugLog('UI readiness changed', {
      installed,
      dismissedRecently,
      uiReady: window.__TS_PWA_UI_READY__,
    });

    return () => {
      window.__TS_PWA_UI_READY__ = false;
    };
  }, []);

  useEffect(() => {
    if (!canShowCustomUi) {
      setDeferredPrompt(null);
      return;
    }

    const handlePromptAvailable = () => {
      if (!canShowCustomUi) {
        return;
      }

      const capturedEvent = window.__TS_PWA_DEFERRED_PROMPT__;
      if (!capturedEvent) {
        return;
      }

      setDeferredPrompt(capturedEvent);
      debugLog('Custom install prompt became available');
    };

    const handleInstalled = () => {
      debugLog('App installed event received');
      window.__TS_PWA_DEFERRED_PROMPT__ = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsDismissed(false);
      window.__TS_PWA_UI_READY__ = false;
    };

    handlePromptAvailable();

    window.addEventListener('ts-pwa-install-available', handlePromptAvailable);
    window.addEventListener('ts-pwa-installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('ts-pwa-install-available', handlePromptAvailable);
      window.removeEventListener('ts-pwa-installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [canShowCustomUi]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt;
    if (!promptEvent) {
      return;
    }

    debugLog('Install button clicked');
    let outcome: 'accepted' | 'dismissed' | null = null;

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      outcome = choice.outcome;
      debugLog('Prompt outcome', choice.outcome);
    } finally {
      window.__TS_PWA_DEFERRED_PROMPT__ = null;
      setDeferredPrompt(null);

      // Do not write cooldown on install click.
      // Only explicit banner dismiss ("X") should suppress future prompts.
      if (outcome === 'accepted') {
        setIsInstalled(true);
        window.__TS_PWA_UI_READY__ = false;
      } else {
        window.__TS_PWA_UI_READY__ = !isPWAInstalled() && !wasDismissedRecently();
      }
    }
  };

  const handleDismiss = () => {
    window.localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
    setDeferredPrompt(null);
    window.__TS_PWA_DEFERRED_PROMPT__ = null;
    window.__TS_PWA_UI_READY__ = false;
    debugLog('Install banner dismissed by user');
  };

  if (!canShowCustomUi || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[min(94vw,380px)]">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <svg
                className="h-4 w-4 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-neutral-900">Install TrueScholar app</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Save time with quick desktop access and faster load.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Dismiss install prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="h-8 rounded-full px-3 text-xs"
          >
            Not now
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInstallClick}
            className="h-8 rounded-full px-3 text-xs"
          >
            Install app
          </Button>
        </div>
      </div>
    </div>
  );
}
