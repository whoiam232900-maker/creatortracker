'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Targets = { dailyTarget: string; weeklyConsistency: string; monthlyGoal: string };

export default function TargetsSetupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [targets, setTargets] = useState<Targets>({
    dailyTarget: '',
    weeklyConsistency: '',
    monthlyGoal: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    localStorage.setItem('userTargets', JSON.stringify(targets));
    router.push('/auth');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="w-full max-w-md flex flex-col gap-8 transition-all duration-700 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)'
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
          <div className="p-6 rounded-xl border flex flex-col gap-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Daily Target</label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Optional: E.g., "4 hours" or "5 tasks"</p>
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
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Weekly Consistency</label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Optional: E.g., "5 days a week"</p>
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
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Monthly Goal</label>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Optional: A bigger milestone</p>
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
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
