'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallToast() {
  useEffect(() => {
    console.log('[PWA] Component mounted, setting up...');

    const deferredPrompt = { current: null as BeforeInstallPromptEvent | null };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt fired!');
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const timer = setTimeout(() => {
      console.log('[PWA] Showing toast, prompt available:', !!deferredPrompt.current);

      toast.custom((t) => (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-[340px] sm:w-[360px]">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base">Install TrueScholar</h3>
                {deferredPrompt.current ? (
                  <p className="text-sm text-gray-500 mt-0.5">Add to home screen for the best experience</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-0.5">Tap the install icon in the address bar to install</p>
                )}
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                  toast.dismiss(t);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {deferredPrompt.current ? (
              <button
                onClick={async () => {
                  console.log('[PWA] Install button clicked');
                  try {
                    await deferredPrompt.current!.prompt();
                    const { outcome } = await deferredPrompt.current!.userChoice;
                    console.log('[PWA] Outcome:', outcome);
                    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                    toast.dismiss(t);
                  } catch (err) {
                    console.error('[PWA] Install error:', err);
                  }
                }}
                className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Install App
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                  toast.dismiss(t);
                }}
                className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      ));
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
