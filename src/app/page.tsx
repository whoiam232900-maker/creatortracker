'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

export default function LandingPage() {
  const router = useRouter();

  // If user is already logged in AND has finished onboarding, skip straight to dashboard
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.isLoggedIn === true && session?.isNewAccount !== true) {
          // Fully set up user — go to dashboard
          console.debug('[landing] Already logged in, onboarding complete — to /dashboard');
          router.replace('/dashboard');
        }
        // If isNewAccount is true, stay on landing so user can re-choose setup path
        // (this happens after an app reset)
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  const handleSetupChoice = (path: 'ai' | 'manual') => {
    try {
      // Check if user is already logged in (e.g. after an app reset)
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.isLoggedIn === true && session?.isNewAccount === true) {
          // Already authenticated but needs to re-onboard (post-reset)
          const updatedSession = { ...session, onboardingPath: path };
          localStorage.setItem('userSession', JSON.stringify(updatedSession));
          localStorage.removeItem('pendingSetupPath');
          console.debug('[landing] Post-reset: routing directly to /onboarding/', path);
          router.push(path === 'manual' ? '/onboarding/manual' : '/onboarding/ai');
          return;
        }
      }
    } catch (e) {
      // fall through to normal new-user flow
    }
    // Normal new-user flow: store chosen path, then go to signup
    try {
      localStorage.setItem('pendingSetupPath', path);
      console.debug('[landing] New user: chose setup path:', path);
    } catch (e) {
      // ignore
    }
    router.push('/auth?mode=signup');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
        {/* Logo */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <AppLogo className="w-9 h-9" />
        </div>

        {/* App name & tagline */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            CreatorTracker
          </h1>
          <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
            Track your work, hit your goals, stay consistent.
          </p>
        </div>

        {/* Setup choices */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--muted-foreground)' }}
          >
            How would you like to set up?
          </p>

          <button
            className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
            onClick={() => handleSetupChoice('ai')}
          >
            <span>✨</span>
            Set up with AI
          </button>

          <button
            className="btn-secondary w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
            onClick={() => handleSetupChoice('manual')}
          >
            <span>🛠️</span>
            Set up Manually
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Sign in */}
        <button
          className="text-sm font-medium hover:underline transition-all"
          style={{ color: 'var(--primary)' }}
          onClick={handleSignIn}
        >
          Already have an account? Sign in →
        </button>
      </div>
    </div>
  );
}
