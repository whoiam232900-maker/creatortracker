'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthGuard wraps protected pages.
 * If no valid session is found, redirects to /auth (login page).
 * If the user is logged in but hasn't finished onboarding (isNewAccount = true),
 * they're sent to the correct onboarding page rather than being allowed into the dashboard.
 */
import { supabase } from '@/lib/supabase/client';
import { syncUserSessionFromSupabase } from '@/lib/profile';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        if (supabaseSession) {
          console.log('[AuthGuard] session found');
          await syncUserSessionFromSupabase(supabaseSession.user);
        } else {
          console.log('[AuthGuard] no session');
        }

        const sessionString = localStorage.getItem('userSession');
        let legacySession = null;
        if (sessionString) {
          try {
            legacySession = JSON.parse(sessionString);
          } catch (e) {}
        }

        if (supabaseSession || (legacySession && legacySession.isLoggedIn === true)) {
          if (legacySession?.isNewAccount === true) {
            console.debug('[AuthGuard] isNewAccount=true — redirecting to onboarding');
            const path = legacySession.onboardingPath ?? 'ai';
            window.location.href = path === 'manual' ? '/onboarding/manual' : '/onboarding/ai';
            return;
          }
          if (mounted) setIsAuthorized(true);
          return;
        }

        console.debug('[AuthGuard] No valid session — redirecting to /auth');
        window.location.href = '/auth';
      } catch (error) {
        console.error('[AuthGuard] Error checking session:', error);
        window.location.href = '/auth';
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('[AuthGuard] logout success');
        window.location.href = '/auth';
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        await syncUserSessionFromSupabase(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isAuthorized !== true) {
    return null;
  }

  return <>{children}</>;
}
