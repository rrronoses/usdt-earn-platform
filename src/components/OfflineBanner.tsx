'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Reliable offline indicator.
 * navigator.onLine + online/offline events alone are unreliable on mobile
 * (banner can stick after reconnect). We also poll and probe the origin.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [justOnline, setJustOnline] = useState(false);
  const onlineToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markOnline = useCallback(() => {
    setOffline((wasOffline) => {
      if (wasOffline) {
        setJustOnline(true);
        if (onlineToastTimer.current) clearTimeout(onlineToastTimer.current);
        onlineToastTimer.current = setTimeout(() => setJustOnline(false), 2000);
      }
      return false;
    });
  }, []);

  const markOffline = useCallback(() => {
    setJustOnline(false);
    setOffline(true);
  }, []);

  const probe = useCallback(async () => {
    // Fast path: browser says offline
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      markOffline();
      return;
    }

    // Confirm real connectivity with a same-origin request
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);
      // cache-bust so the browser does not serve a stale cached response offline
      const res = await fetch(`/favicon.ico?_=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      // Any response (including 404) means the network path works
      if (res || true) {
        markOnline();
      }
    } catch {
      // Fetch failed — if browser also reports offline, show banner
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        markOffline();
      } else {
        // Browser thinks online but probe failed (flaky network) — hide banner
        // so we don't stick on false "offline" forever
        markOnline();
      }
    }
  }, [markOffline, markOnline]);

  useEffect(() => {
    const goOffline = () => markOffline();
    const goOnline = () => {
      markOnline();
      // Double-check after a short delay (mobile often needs this)
      setTimeout(() => {
        void probe();
      }, 300);
    };

    // Initial state
    if (typeof navigator !== 'undefined') {
      setOffline(!navigator.onLine);
    }

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    // Tab becomes visible again — re-check (common after mobile sleep)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void probe();
    };
    document.addEventListener('visibilitychange', onVisible);

    // Poll — catches missed online events on Android WebView / Chrome
    const poll = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        markOnline();
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        markOffline();
      }
    }, 2000);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(poll);
      if (onlineToastTimer.current) clearTimeout(onlineToastTimer.current);
    };
  }, [markOffline, markOnline, probe]);

  if (justOnline) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
        Back online
      </div>
    );
  }

  if (!offline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
      You are offline — some actions may fail
    </div>
  );
}
