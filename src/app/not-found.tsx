import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-100">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-emerald-500/40 mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The page you requested does not exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-xl border border-white/15 font-semibold text-sm hover:bg-white/5 transition"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
