'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The /onboarding route is no longer the setup-choice page.
 * Setup choices (AI vs Manual) are now on the landing page (/).
 * This page simply redirects to the right place:
 *   - Logged-in new accounts → should already be on /onboarding/ai or /onboarding/manual
 *   - Not logged in → landing page
 *   - Existing accounts → dashboard
 */
export default function OnboardingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) {
        console.debug('[onboarding/index] No session — to landing');
        router.replace('/');
        return;
      }
      const session = JSON.parse(raw);
      if (!session?.isLoggedIn) {
        router.replace('/');
        return;
      }
      if (session?.isNewAccount) {
        // Resume onboarding from the correct path
        const path = session?.onboardingPath ?? 'ai';
        console.debug('[onboarding/index] isNewAccount=true, resuming:', path);
        router.replace(path === 'manual' ? '/onboarding/manual' : '/onboarding/ai');
      } else {
        // Existing user — go to dashboard
        console.debug('[onboarding/index] Existing user — to dashboard');
        router.replace('/dashboard');
      }
    } catch (e) {
      router.replace('/');
    }
  }, [router]);

  return null;
}
