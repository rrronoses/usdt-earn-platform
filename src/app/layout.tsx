import type { Metadata } from 'next';
import './globals.css';
import { ThemeLangProvider } from '@/components/ThemeLangProvider';

export const metadata: Metadata = {
  title: 'USDT Yield Platform',
  description: 'Invest USDT. Earn daily. Edge-deployed on Cloudflare Pages + KV.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-slate-950 text-slate-100">
        <ThemeLangProvider>{children}</ThemeLangProvider>
      </body>
    </html>
  );
}
