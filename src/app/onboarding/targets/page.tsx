'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, saveState } from '@/lib/store';
import { LogOut, Target, CheckCircle2 } from 'lucide-react';

type Targets = { dailyTarget: string; weeklyConsistency: string; monthlyGoal: string };

export default function TargetsSetupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [targets, setTargets] = useState<Targets>({
    dailyTarget: '',
    weeklyConsistency: '',
    monthlyGoal: '',
  });

  // ── Guard: only new accounts may run onboarding ────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) {
        console.debug('[onboarding/targets] No session — redirecting to /');
        router.replace('/');
        return;
      }
      const session = JSON.parse(raw);
      if (!session?.isNewAccount) {
        console.debug(
          '[onboarding/targets] isNewAccount is false for',
          session?.email,
          '— redirecting to /dashboard'
        );
        router.replace('/dashboard');
      } else {
        console.debug(
          '[onboarding/targets] New account — showing targets setup for',
          session?.email
        );
      }
    } catch (e) {
      console.error('[onboarding/targets] Session read error:', e);
      router.replace('/');
    }
  }, [router]);

  const handleContinue = () => {
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) return;
      const session = JSON.parse(raw);

      // Double-check guard
      if (!session?.isNewAccount) {
        console.warn('[onboarding/targets] isNewAccount is false mid-flow — aborting');
        router.replace('/dashboard');
        return;
      }

      const userId = session.email;
      console.debug('[onboarding/targets] Saving user targets for user:', userId);

      // Persist user-facing targets metadata scoped to user
      localStorage.setItem(`userTargets_${userId}`, JSON.stringify(targets));

      // ── Clear isNewAccount flag — onboarding is complete ─────────────────
      const updatedSession = { ...session, isNewAccount: false };
      localStorage.setItem('userSession', JSON.stringify(updatedSession));
      console.debug('[onboarding/targets] isNewAccount cleared for user:', userId);
    } catch (e) {
      console.error('[onboarding/targets] Error saving targets:', e);
    }

    window.location.href = '/dashboard';
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Sign Out Fallback */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            if(typeof window !== 'undefined') { import('@/lib/supabase/client').then(m => m.supabase.auth.signOut().catch(console.error)); } localStorage.removeItem('userSession');
            router.replace('/');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 transition-all"
        >
          <LogOut size={14} />
          Abort & Sign Out
        </button>
      </div>

      <div
        className="w-full max-w-md flex flex-col gap-8 relative z-10 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Set Your Targets
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Optional goals to keep you consistent
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div
            className="p-6 rounded-xl border flex flex-col gap-6"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Daily Target
              </label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Optional: E.g., &quot;4 hours&quot; or &quot;5 tasks&quot;
              </p>
              <input
                type="text"
                placeholder="e.g. 4 hours"
                value={targets.dailyTarget}
                onChange={(e) => setTargets({ ...targets, dailyTarget: e.target.value })}
                className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Weekly Consistency
              </label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Optional: E.g., &quot;5 days a week&quot;
              </p>
              <input
                type="text"
                placeholder="e.g. 5 days"
                value={targets.weeklyConsistency}
                onChange={(e) => setTargets({ ...targets, weeklyConsistency: e.target.value })}
                className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Monthly Goal
              </label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Optional: A bigger milestone
              </p>
              <input
                type="text"
                placeholder="e.g. $5000 revenue"
                value={targets.monthlyGoal}
                onChange={(e) => setTargets({ ...targets, monthlyGoal: e.target.value })}
                className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex mt-2">
          <button
            onClick={handleContinue}
            className="btn-primary w-full py-3 rounded-xl text-base font-medium transition-all duration-150 active:scale-[0.98]"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
