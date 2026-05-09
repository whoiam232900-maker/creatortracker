'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import AppButton from '@/components/ui/AppButton';
import { useUser } from '@/contexts/UserContext';
import { Sparkles, Settings2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    console.log('[LandingPage] Check redirect:', { hasUser: !!user });
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSetupChoice = (path: 'ai' | 'manual') => {
    try {
      localStorage.setItem('pendingSetupPath', path);
    } catch (e) {}
    router.push('/auth?mode=signup');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col items-center gap-10 text-center max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="p-3 rounded-2xl bg-card border border-white/5 shadow-2xl">
          <AppLogo size={48} className="drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]" />
        </div>

        {/* App name & tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            CreatorTracker
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-sm">
            The intelligent workspace for high-performance creators.
          </p>
        </div>

        {/* Setup choices */}
        <div className="flex flex-col gap-4 w-full">
          <AppButton
            size="lg"
            fullWidth
            icon={Sparkles}
            onClick={() => handleSetupChoice('ai')}
          >
            Configure with AI
          </AppButton>

          <AppButton
            variant="secondary"
            size="lg"
            fullWidth
            icon={Settings2}
            onClick={() => handleSetupChoice('manual')}
          >
            Manual Configuration
          </AppButton>
        </div>

        {/* Sign in */}
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="flex items-center gap-3 w-32">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          
          <button
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-all flex items-center gap-2 group"
            onClick={handleSignIn}
          >
            Already have an account? Sign in 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
