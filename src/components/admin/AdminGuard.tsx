'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AdminGuard wraps protected admin routes.
 * If no valid session is found OR user is not an admin, redirects.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const sessionString = localStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        if (session && session.isLoggedIn === true && session.role === 'admin') {
          setIsAuthorized(true);
          return;
        }
      }
    } catch (error) {
      console.error('[AdminGuard] Error parsing userSession:', error);
    }

    // Not an admin or not logged in — redirect to dashboard or auth
    console.debug('[AdminGuard] Not authorized — redirecting away');
    router.replace('/dashboard');
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
