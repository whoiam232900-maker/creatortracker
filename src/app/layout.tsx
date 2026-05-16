import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import '../styles/tailwind.css';
import '../styles/theme-cinematic.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastContainer } from '@/components/ui/Toast';

import SplashScreen from '@/components/SplashScreen';
import PurchaseModal from '@/components/PurchaseModal';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-numbers',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CreatorTracker — Daily Productivity Tracking for Creators',
  description:
    'CreatorTracker helps students, freelancers, and business owners define custom fields, log daily work, and visualize progress with powerful analytics.',
  icons: {
    icon: [{ url: '/assets/creatortracker-logo.png', type: 'image/png' }],
    apple: [{ url: '/assets/creatortracker-logo.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} dark`}>
      <body className={montserrat.className}>
        <SettingsProvider>
          <SplashScreen />
          {children}
          <PurchaseModal />
          <ToastContainer />
        </SettingsProvider>
      </body>
    </html>
  );
}
