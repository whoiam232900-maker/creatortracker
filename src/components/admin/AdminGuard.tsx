'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AdminGuard wraps protected admin routes.
 * If no valid session is found OR user is not an admin, redirects.
 */
import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/auth-utils';
import { syncUserSessionFromSupabase } from '@/lib/profile';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const authPromise = (async () => {
          const { data: { session: supabaseSession } } = await supabase.auth.getSession();
          if (supabaseSession) {
            try {
              const syncPromise = syncUserSessionFromSupabase(supabaseSession.user);
              const syncTimeout = new Promise(resolve => setTimeout(resolve, 3000));
              await Promise.race([syncPromise, syncTimeout]);
            } catch (syncError) {
              console.error('[AdminGuard] Profile sync failed:', syncError);
            }
          }
          return supabaseSession;
        })();

        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => {
            console.warn('[AdminGuard] Admin auth check timed out');
            resolve(null);
          }, 5000)
        );

        const supabaseSession = await Promise.race([authPromise, timeoutPromise]);
        
        const sessionString = localStorage.getItem('userSession');
        let legacySession = null;
        if (sessionString) {
          try {
            legacySession = JSON.parse(sessionString);
          } catch (error) {}
        }

        const isLegacyAdmin = legacySession && legacySession.isLoggedIn === true && legacySession.role === 'admin';
        const isSupabaseAdmin = supabaseSession && supabaseSession.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (isLegacyAdmin || isSupabaseAdmin) {
          if (mounted) setIsAuthorized(true);
          return;
        }

        console.debug('[AdminGuard] Not authorized — redirecting away');
        if (mounted) router.replace('/dashboard');
      } catch (error) {
        console.error('[AdminGuard] Error checking session:', error);
        if (mounted) router.replace('/dashboard');
      }
    }

    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [router]);

  if (isAuthorized !== true) {
    // Show a loading state or nothing while checking
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
            Validating Credentials
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
