'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-100">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-red-500/40 mb-2">500</p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-sm mb-8">
          An unexpected error occurred. You can try again or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-3 rounded-xl border border-white/15 font-semibold text-sm hover:bg-white/5 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
