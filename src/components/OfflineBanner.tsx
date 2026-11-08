'use client';

import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    setOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
      You are offline — some actions may fail
    </div>
  );
}
