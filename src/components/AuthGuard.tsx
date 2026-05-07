'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const sessionString = localStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        if (session && session.isLoggedIn === true) {
          setIsAuthorized(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error parsing userSession', error);
    }
    
    // Not authorized, redirect
    router.replace('/auth');
  }, [router]);

  // Prevent hydration mismatch and flash of unauthorized content
  if (isAuthorized !== true) {
    return null;
  }

  return <>{children}</>;
}
