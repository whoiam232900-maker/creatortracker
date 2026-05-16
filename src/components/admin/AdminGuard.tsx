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
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        if (supabaseSession) {
          await syncUserSessionFromSupabase(supabaseSession.user);
        }
        
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
        router.replace('/dashboard');
      } catch (error) {
        console.error('[AdminGuard] Error checking session:', error);
        router.replace('/dashboard');
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
