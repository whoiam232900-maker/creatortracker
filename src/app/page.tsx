'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sparkles, Settings2, ShieldCheck, UserCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSession(parsed);
        
        if (parsed?.isLoggedIn === true && parsed?.isNewAccount !== true) {
          // Fully set up user — go to dashboard
          console.debug('[landing] Already logged in, onboarding complete — to /dashboard');
          router.replace('/dashboard');
        }
      }
    } catch (e) {
      console.error('[landing] Session load error:', e);
    }
  }, [router]);

  const handleSetupChoice = (path: 'ai' | 'manual') => {
    console.debug('[landing] handleSetupChoice:', path);
    try {
      // Check if user is already logged in (e.g. after an app reset or mid-flow)
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const currentSession = JSON.parse(raw);
        if (currentSession?.isLoggedIn === true) {
          // Already authenticated, just update path and go
          const updatedSession = { 
            ...currentSession, 
            isNewAccount: true, // Force onboarding mode
            onboardingPath: path 
          };
          localStorage.setItem('userSession', JSON.stringify(updatedSession));
          localStorage.removeItem('pendingSetupPath');
          
          const target = path === 'manual' ? '/onboarding/manual' : '/onboarding/ai';
          console.debug('[landing] Existing session: routing to', target);
          window.location.href = target;
          return;
        }
      }
    } catch (e) {
      console.error('[landing] Setup choice error:', e);
    }

    // Normal new-user flow: store chosen path, then go to signup
    try {
      localStorage.setItem('pendingSetupPath', path);
      console.debug('[landing] New user: stored pendingSetupPath:', path);
    } catch (e) {
      // ignore
    }
    
    // Use window.location.href as a robust fallback if router is stuck
    const authTarget = '/auth?mode=signup';
    console.debug('[landing] routing to', authTarget);
    window.location.href = authTarget;
  };

  const handleSignOut = () => {
    try {
      if(typeof window !== 'undefined') { import('@/lib/supabase/client').then(m => m.supabase.auth.signOut().catch(console.error)); } localStorage.removeItem('userSession');
      localStorage.removeItem('pendingSetupPath');
      setSession(null);
      console.debug('[landing] User signed out and session cleared');
      // Force full reload to reset all states
      window.location.href = '/';
    } catch (e) {
      console.error('[landing] Sign out error:', e);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#030305]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 32%, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 24%, transparent 52%)'
      }}
    >
      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.45)_72%,rgba(0,0,0,0.85)_100%)]" />

      <div className="w-full max-w-[420px] flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Premium Masked Logo Frame */}
        <div className="relative mb-8 flex items-center justify-center group">
          <div className="pointer-events-none absolute h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative h-[78px] w-[78px] overflow-hidden rounded-2xl border border-white/20 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_40px_rgba(0,0,0,0.32)] transition-all duration-200 group-hover:border-white/30 group-hover:scale-[1.015]">
            <img
              src="/assets/creatortracker-logo.png"
              alt="CreatorTracker"
              className="h-full w-full object-cover opacity-95 transition-all duration-300 group-hover:opacity-100"
            />
          </div>
        </div>

        {/* Premium Typography Area */}
        <div className="flex flex-col mb-10">
          <h1 className="text-[34px] font-bold tracking-tight text-white/95 leading-tight">
            CreatorTracker
          </h1>
          <p className="text-[13px] font-medium tracking-wide uppercase text-white/50 mt-1.5">
            Precision Operational Software
          </p>
        </div>

        {/* User Context Area (If logged in but stuck) */}
        {session?.isLoggedIn && (
          <div className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-4 mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/80">
                <UserCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90 truncate max-w-[120px]">
                  {session.fullName || 'User'}
                </span>
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  Session Active
                </span>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white/80 transition-all group"
              title="Sign Out"
            >
              <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Setup Choices */}
        <div className="flex flex-col gap-3 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35 mb-2">
            INITIALIZE ENVIRONMENT
          </p>

          <button
            className="h-[46px] w-full rounded-xl bg-white/[0.92] text-[13px] font-semibold text-black shadow-[0_18px_50px_rgba(255,255,255,0.08)] transition-all duration-200 hover:bg-white hover:-translate-y-px flex items-center justify-center gap-3"
            onClick={() => handleSetupChoice('ai')}
          >
            <Sparkles size={15} className="text-black/70" />
            <span>Set up with AI</span>
          </button>

          <button
            className="h-[46px] w-full rounded-xl bg-transparent border border-white/10 text-[13px] font-medium text-white/80 transition-all duration-200 hover:bg-white/[0.06] flex items-center justify-center gap-3 group"
            onClick={() => handleSetupChoice('manual')}
          >
            <Settings2 size={15} className="text-white/50 group-hover:text-white/80 transition-colors" />
            <span>Set up Manually</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-6 w-full mt-8">
          {!session?.isLoggedIn && (
            <button
              className="text-[11px] font-semibold text-white/45 hover:text-white/80 transition-colors uppercase tracking-widest"
              onClick={() => window.location.href = '/auth?mode=signin'}
            >
              Access Existing Account
            </button>
          )}

          {session?.isLoggedIn && (
            <button
              className="text-[10px] font-bold text-red-500/40 hover:text-red-500 transition-all uppercase tracking-widest"
              onClick={handleSignOut}
            >
              Sign Out & Reset Session
            </button>
          )}
          
          <p className="text-[10px] font-medium text-white/20 flex items-center justify-center gap-1.5 uppercase tracking-widest mt-2">
            <ShieldCheck size={12} className="opacity-70" />
            Encrypted Operational Space
          </p>
        </div>
      </div>
    </div>
  );
}

