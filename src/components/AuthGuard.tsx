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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        // Hard safety timeout for the entire auth check
        const authPromise = (async () => {
          const { data: { session: supabaseSession } } = await supabase.auth.getSession();
          if (supabaseSession) {
            console.log('[AuthGuard] session found');
            try {
              // Internal timeout for profile sync specifically
              const syncPromise = syncUserSessionFromSupabase(supabaseSession.user);
              const syncTimeout = new Promise(resolve => setTimeout(resolve, 3000));
              await Promise.race([syncPromise, syncTimeout]);
            } catch (syncError) {
              console.error('[AuthGuard] Profile sync failed:', syncError);
            }
          }
          return supabaseSession;
        })();

        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => {
            console.warn('[AuthGuard] Auth check timed out');
            resolve(null);
          }, 5000)
        );

        const supabaseSession = await Promise.race([authPromise, timeoutPromise]);

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
        } else {
          console.debug('[AuthGuard] No valid session — redirecting to /auth');
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('[AuthGuard] Error checking session:', error);
        if (mounted) window.location.href = '/auth';
      } finally {
        if (mounted) setIsLoading(false);
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

  if (isLoading || isAuthorized !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
