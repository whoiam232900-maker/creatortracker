'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function OnboardingIndexPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    console.log('[OnboardingIndex] Checking state...', { hasUser: !!user, isNew: user?.isNewAccount });
    if (!user) {
      router.replace('/');
      return;
    }

    if (user.isNewAccount) {
      const setupChoice = localStorage.getItem('pendingSetupPath');
      router.replace(setupChoice === 'manual' ? '/onboarding/manual' : '/onboarding/ai');
    } else {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
       <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
