import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeLangProvider } from '@/components/ThemeLangProvider';
import { ToastProvider } from '@/components/Toast';
import { OfflineBanner } from '@/components/OfflineBanner';

export const metadata: Metadata = {
  title: 'USDT Earn — Daily USDT Yield Plans',
  description:
    'USDT Earn: invest USDT TRC-20, claim daily earnings, earn 20% referral commissions. Start free with 3 USDT.',
  openGraph: {
    title: 'USDT Earn',
    description: 'Invest USDT. Claim daily. Grow with referrals.',
    url: 'https://usdtearn.pages.dev',
    siteName: 'USDT Earn',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased mesh-bg bg-slate-950 text-slate-100">
        <ThemeLangProvider>
          <ToastProvider>
            {children}
            <OfflineBanner />
          </ToastProvider>
        </ThemeLangProvider>
      </body>
    </html>
  );
}
