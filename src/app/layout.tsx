import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeLangProvider } from '@/components/ThemeLangProvider';
import { ToastProvider } from '@/components/Toast';
import { OfflineBanner } from '@/components/OfflineBanner';

export const metadata: Metadata = {
  title: 'USDT Earn — Daily USDT Plans',
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}var l=localStorage.getItem('lang');if(l==='en'||l==='fr')document.documentElement.lang=l;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased mesh-bg">
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
