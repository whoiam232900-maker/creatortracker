import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/tailwind.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { WorkspaceDataProvider } from '@/contexts/WorkspaceDataContext';
import { UserProvider } from '@/contexts/UserContext';

const inter = Inter({
  subsets: ['latin'],
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
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className={inter.className}>
        <SettingsProvider>
          <UserProvider>
            <WorkspaceProvider>
              <WorkspaceDataProvider>
                {children}
              </WorkspaceDataProvider>
            </WorkspaceProvider>
          </UserProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
