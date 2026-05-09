'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getTodayString, getWeekDates, generateId,
  DailyEntry, EntryValue
} from '@/lib/store';
import {
  Play, Pause, RotateCcw, Plus, Edit2, Trash2, Clock, 
  Flame, Target, TrendingUp, Calendar, PlusCircle, 
  Activity, Shield, Zap
} from 'lucide-react';
import { useWorkspaceData } from '@/contexts/WorkspaceDataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

import AppBadge from '@/components/ui/AppBadge';
import AppButton from '@/components/ui/AppButton';
import AppCard from '@/components/ui/AppCard';
import AppSelect from '@/components/ui/AppSelect';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';

import EntryFormModal from './EntryFormModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';

export default function TrackerDashboardContent() {
  console.log('[TrackerDashboardContent] Rendering...');
  const { settings } = useSettings();
  const { activeWorkspace } = useWorkspace();
  const { data, isLoading, updateEntries } = useWorkspaceData();

  useEffect(() => {
    console.log('[TrackerDashboardContent] Mounted');
  }, []);

  console.log('[TrackerDashboardContent] State:', { isLoading, hasData: !!data, workspace: activeWorkspace?.name });

  if (isLoading) {
    console.log('[TrackerDashboardContent] Loading skeleton...');
    return <DashboardSkeleton />;
  }

  const entries = data?.entries || [];
  const today = getTodayString();

  return (
    <div className="p-10 border border-blue-500 rounded-xl bg-blue-500/10">
      <h1 className="text-2xl font-bold text-white mb-4">Dashboard Isolation Mode</h1>
      <p className="text-white/70">If you see this, the core hooks and providers are stable.</p>
      <div className="mt-6 p-4 bg-black/20 rounded-lg space-y-2 text-xs font-mono text-blue-300">
        <div>Workspace: {activeWorkspace?.name || 'None'}</div>
        <div>Entries: {entries.length}</div>
        <div>Today: {today}</div>
      </div>
    </div>
  );
}

/*
export default function TrackerDashboardContentFull() {
...
*//*
return (
...
    <div className="space-y-8 animate-in fade-in duration-700">
...
  );
  */
}
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, variant, trend }: { label: string; value: string; unit: string; icon: React.ReactNode; variant: string; trend?: 'up' | 'down'; }) {
  const variants: any = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    accent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    neutral: 'bg-muted/40 text-muted-foreground border-border/40'
  };

  return (
    <AppCard className="group hover:bg-card-hover transition-all duration-300 relative overflow-hidden">
       <div className="flex items-center justify-between mb-5 relative z-10">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm ${variants[variant]}`}>
             {icon}
          </div>
          {trend === 'up' && (
            <div className="flex items-center gap-1 text-green-500 px-2 py-0.5 rounded bg-green-500/10 text-[10px] font-bold border border-green-500/20">
               <TrendingUp size={10} /> 
               Growth
            </div>
          )}
       </div>
       <div className="text-3xl font-bold tabular-nums tracking-tight text-foreground relative z-10">{value}</div>
       <div className="flex items-center justify-between mt-1 relative z-10">
          <p className="text-[11px] font-medium text-muted-foreground/60 tracking-wide uppercase">{label}</p>
          <span className="text-[10px] font-semibold text-muted-foreground/40">{unit}</span>
       </div>
    </AppCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
           <Skeleton className="h-8 w-48 rounded-lg" />
           <Skeleton className="h-4 w-32 rounded-lg opacity-40" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] lg:col-span-2 rounded-xl" />
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  try {
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function getFieldValueForEntry(entry: DailyEntry | undefined, fieldId: string): number {
  if (!entry || !entry.values) return 0;
  const val = entry.values.find(v => v.fieldId === fieldId);
  if (!val) return 0;
  const n = parseFloat(val.value);
  return isNaN(n) ? 0 : n;
}

function computeStreak(entries: DailyEntry[]): number {
  if (!entries || entries.length === 0) return 0;
  const todayStr = getTodayString();
  let streak = 0;
  
  // Use a safer date iteration
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dStr = checkDate.toISOString().split('T')[0];
    
    const hasEntry = entries.some(e => 
      e.date === dStr && 
      e.values && 
      e.values.some(v => v.value !== '' && v.value !== '0' && v.value !== undefined)
    );

    if (!hasEntry) {
      if (i === 0) continue; // Allow missing entry for today
      break;
    }
    streak++;
  }
  return streak;
}

function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}
