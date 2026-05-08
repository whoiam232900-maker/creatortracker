'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthGuard wraps protected pages.
 * If no valid session is found, redirects to /auth (login page).
 * If the user is logged in but hasn't finished onboarding (isNewAccount = true),
 * they're sent to the correct onboarding page rather than being allowed into the dashboard.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const sessionString = localStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        if (session && session.isLoggedIn === true) {
          // If the user is mid-onboarding, push them back to the right onboarding step
          // instead of letting them directly access the dashboard
          if (session.isNewAccount === true) {
            console.debug('[AuthGuard] isNewAccount=true — redirecting to onboarding');
            const path = session.onboardingPath ?? 'ai';
            router.replace(path === 'manual' ? '/onboarding/manual' : '/onboarding/ai');
            return;
          }
          setIsAuthorized(true);
          return;
        }
      }
    } catch (error) {
      console.error('[AuthGuard] Error parsing userSession:', error);
    }

    // Not authenticated — redirect to auth
    console.debug('[AuthGuard] No valid session — redirecting to /auth');
    router.replace('/auth');
  }, [router]);

  if (isAuthorized !== true) {
    return null;
  }

  return <>{children}</>;
}
