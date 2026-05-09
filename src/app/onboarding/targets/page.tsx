'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, saveState } from '@/lib/store';
import { useUser, SESSION_KEY } from '@/contexts/UserContext';
import AppButton from '@/components/ui/AppButton';

type Targets = { dailyTarget: string; weeklyConsistency: string; monthlyGoal: string };

export default function TargetsSetupPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [mounted, setMounted] = useState(false);
  const [targets, setTargets] = useState<Targets>({
    dailyTarget: '',
    weeklyConsistency: '',
    monthlyGoal: '',
  });

  // ── Guard: only new accounts may run onboarding ────────────────────────────
  useEffect(() => {
    setMounted(true);
    console.log('[TargetsSetup] Mounting, user:', user?.email);
    if (!user) {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        console.log('[TargetsSetup] No session, redirecting to landing');
        router.replace('/');
      }
    } else if (!user.isNewAccount) {
      console.log('[TargetsSetup] Not a new account, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleContinue = () => {
    try {
      if (!user) return;

      // Double-check guard
      if (!user.isNewAccount) {
        console.warn('[TargetsSetup] isNewAccount is false mid-flow — aborting');
        router.replace('/dashboard');
        return;
      }

      const userId = user.email;
      console.log('[TargetsSetup] Saving user targets for:', userId);

      // Persist user-facing targets metadata scoped to user
      localStorage.setItem(`userTargets_${userId}`, JSON.stringify(targets));

      // ── Clear isNewAccount flag — onboarding is complete ─────────────────
      updateUser({ isNewAccount: false });
      console.log('[TargetsSetup] isNewAccount cleared via updateUser');
    } catch (e) {
      console.error('[TargetsSetup] Error saving targets:', e);
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div
        className="w-full max-w-md flex flex-col gap-8 relative z-10 animate-in fade-in duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Set Your Targets
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Optional goals to keep you consistent
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-xl border border-border bg-card flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Daily Target
              </label>
              <p className="text-[11px] text-muted-foreground font-medium mb-1">
                Optional: E.g., &quot;4 hours&quot; or &quot;5 tasks&quot;
              </p>
              <input
                type="text"
                placeholder="e.g. 4 hours"
                value={targets.dailyTarget}
                onChange={(e) => setTargets({ ...targets, dailyTarget: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Weekly Consistency
              </label>
              <p className="text-[11px] text-muted-foreground font-medium mb-1">
                Optional: E.g., &quot;5 days a week&quot;
              </p>
              <input
                type="text"
                placeholder="e.g. 5 days"
                value={targets.weeklyConsistency}
                onChange={(e) => setTargets({ ...targets, weeklyConsistency: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Monthly Goal
              </label>
              <p className="text-[11px] text-muted-foreground font-medium mb-1">
                Optional: A bigger milestone
              </p>
              <input
                type="text"
                placeholder="e.g. $5000 revenue"
                value={targets.monthlyGoal}
                onChange={(e) => setTargets({ ...targets, monthlyGoal: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex mt-2">
          <AppButton
            onClick={handleContinue}
            fullWidth
            size="lg"
          >
            Save &amp; Continue
          </AppButton>
        </div>
      </div>
    </div>
  );
}
