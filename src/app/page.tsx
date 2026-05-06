'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

export default function IntroPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl" style={{ backgroundColor: 'var(--primary)' }}>
          <AppLogo className="w-9 h-9" />
        </div>

        {/* App name */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            CreatorTracker
          </h1>
          <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
            Track your work like a pro
          </p>
        </div>

        {/* CTA */}
        <button
          className="btn-primary w-full py-3 text-base font-semibold mt-2"
          onClick={() => router?.push('/onboarding')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}