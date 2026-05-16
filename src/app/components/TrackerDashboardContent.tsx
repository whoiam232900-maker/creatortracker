'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadState,
  saveState,
  initializeStarterData,
  getTodayString,
  getWeekDates,
  getFieldTotal,
  getCurrentStreak,
  generateId,
  getUserStorageKey,
  AppState,
  TrackingField,
  DailyEntry,
  EntryValue,
} from '@/lib/store';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Flame,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  PlusCircle,
  Settings,
  Sparkles,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import Link from 'next/link';
import EntryFormModal from './EntryFormModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { useSettings } from '@/contexts/SettingsContext';
import WorkflowModule from '@/components/WorkflowModule';
import { generateSuggestedTargets } from '@/lib/ai-engine';
import { TargetConfig } from '@/lib/store';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumUnlockModal from '@/components/PremiumUnlockModal';
import PremiumIntroPopup from '@/components/PremiumIntroPopup';
import { Lock } from 'lucide-react';


export default function TrackerDashboardContent() {
  const { settings, openSettings } = useSettings();
  const { plan, canUseFeature, withinLimit, triggerUpgrade } = useSubscription();
  const [state, setState] = useState<AppState | null>(null);
  const [showAnalyticsUnlock, setShowAnalyticsUnlock] = useState(false);
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [addToFieldId, setAddToFieldId] = useState<string>('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load state — per user, with new-account seeding
  const loadAppState = useCallback((resolvedUserId?: string) => {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        const email = resolvedUserId || session?.email;

        if (session?.isNewAccount && email) {
          const seeded = initializeStarterData(email);
          setState(seeded);
          const updatedSession = { ...session, isNewAccount: false };
          localStorage.setItem('userSession', JSON.stringify(updatedSession));
          return seeded;
        } else {
          const s = loadState(email);
          setState(s);
          return s;
        }
      }
    } catch (e) {
      console.error('[dashboard] State load failure:', e);
    }
    const fallback = loadState();
    setState(fallback);
    return fallback;
  }, []);

  useEffect(() => {
    let resolvedUserId: string | undefined;
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.email) {
          resolvedUserId = session.email;
          setUserId(session.email);
        }
      }
    } catch (e) {}

    const loadedState = loadAppState(resolvedUserId);
    if (loadedState && loadedState.fields.length > 0) {
      const numField = loadedState.fields.find((f) => f.type === 'number');
      if (numField) setAddToFieldId(numField.id);
    }

    // Sync state across tabs / after settings changes
    const handleStorageSync = (e: StorageEvent) => {
      const currentSessionRaw = localStorage.getItem('userSession');
      let currentEmail: string | undefined;
      try {
        if (currentSessionRaw) currentEmail = JSON.parse(currentSessionRaw)?.email;
      } catch {}

      const key = getUserStorageKey(currentEmail);
      if (e.key === key || e.key === 'userSession' || e.key === 'app_settings') {
        loadAppState(currentEmail);
      }
    };

    window.addEventListener('storage', handleStorageSync);

    // Restore timer from sessionStorage
    try {
      const timerRaw = sessionStorage.getItem('ct_timer');
      if (timerRaw) {
        const t = JSON.parse(timerRaw);
        setTimerElapsed(t.elapsed ?? 0);
        setTimerRunning(t.running ?? false);
        setTimerStartedAt(t.startedAt ?? null);
      }
    } catch {
      // ignore
    }

    return () => window.removeEventListener('storage', handleStorageSync);
  }, [loadAppState]);

  // Timer tick
  useEffect(() => {
    if (timerRunning && timerStartedAt !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const base = timerElapsed;
        setTimerElapsed(base + Math.floor((now - timerStartedAt) / 1000));
        setTimerStartedAt(now);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerStartedAt]);

  // Persist timer to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'ct_timer',
        JSON.stringify({ elapsed: timerElapsed, running: timerRunning, startedAt: timerStartedAt })
      );
    } catch {
      // ignore
    }
  }, [timerElapsed, timerRunning, timerStartedAt]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!settings.enableShortcuts || !state) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      )
        return;

      if (e.key === 'n' && !entryModalOpen) {
        e.preventDefault();
        setEditingEntry(null);
        setEntryModalOpen(true);
        if (settings.focusTimerAutoStart && !timerRunning) {
          setTimerStartedAt(Date.now());
          setTimerRunning(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enableShortcuts, settings.focusTimerAutoStart, entryModalOpen, timerRunning, state]);

  const handleTimerToggle = useCallback(() => {
    if (!timerRunning) {
      setTimerStartedAt(Date.now());
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
      setTimerStartedAt(null);
    }
  }, [timerRunning]);

  const handleTimerReset = useCallback(() => {
    setTimerRunning(false);
    setTimerElapsed(0);
    setTimerStartedAt(null);
  }, []);

  const handleAddTimerToField = useCallback(() => {
    if (!state || !addToFieldId || timerElapsed === 0) return;
    const hours = timerElapsed / 3600;
    const roundedHours = Math.round(hours * 100) / 100;
    const today = getTodayString();
    const newState = { ...state, entries: [...state.entries] };
    const existingIdx = newState.entries.findIndex((e) => e.date === today);

    if (existingIdx >= 0) {
      const entry = { ...newState.entries[existingIdx] };
      const vals = [...entry.values];
      const valIdx = vals.findIndex((v) => v.fieldId === addToFieldId);
      if (valIdx >= 0) {
        const existing = parseFloat(vals[valIdx].value) || 0;
        vals[valIdx] = {
          ...vals[valIdx],
          value: String(Math.round((existing + roundedHours) * 100) / 100),
        };
      } else {
        vals.push({ fieldId: addToFieldId, value: String(roundedHours) });
      }
      newState.entries[existingIdx] = { ...entry, values: vals };
    } else {
      const values: EntryValue[] = state.fields.map((f) => ({
        fieldId: f.id,
        value: f.id === addToFieldId ? String(roundedHours) : f.defaultValue,
      }));
      newState.entries.push({
        id: generateId('entry'),
        date: today,
        values,
        createdAt: new Date().toISOString(),
      });
    }

    saveState(newState, userId);
    setState(newState);
    handleTimerReset();
    showToast({
      type: 'success',
      title: 'Time logged',
      description: `Added ${roundedHours}h to ${state.fields.find((f) => f.id === addToFieldId)?.name}`,
    });
  }, [state, addToFieldId, timerElapsed, handleTimerReset, userId]);

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = {
          ...prev,
          entries: prev.entries.filter((e) => e.id !== entryId),
        };
        saveState(newState, userId);
        return newState;
      });
      setDeleteConfirm(null);
      showToast({ type: 'success', title: 'Entry deleted' });
    },
    [userId]
  );

  const handleSaveEntry = useCallback(
    (entry: DailyEntry) => {
      setState((prev) => {
        if (!prev) return prev;
        const existing = prev.entries.findIndex((e) => e.id === entry.id);
        let newEntries: DailyEntry[];
        if (existing >= 0) {
          newEntries = prev.entries.map((e) => (e.id === entry.id ? entry : e));
        } else {
          newEntries = [...prev.entries, entry];
        }
        const newState = { ...prev, entries: newEntries };
        saveState(newState, userId);
        return newState;
      });
      setEntryModalOpen(false);
      setEditingEntry(null);
      showToast({ type: 'success', title: editingEntry ? 'Entry updated' : 'Entry logged' });
    },
    [editingEntry, userId]
  );

  const handleSaveTarget = useCallback(
    (target: TargetConfig) => {
      setState((prev) => {
        if (!prev) return prev;
        const existing = prev.targets.findIndex(
          (t) => t.fieldId === target.fieldId && t.type === target.type
        );
        let newTargets: TargetConfig[];
        if (existing >= 0) {
          newTargets = prev.targets.map((t, idx) => (idx === existing ? target : t));
        } else {
          if (!withinLimit('targetsLimit', prev.targets.length)) {
            triggerUpgrade();
            return prev;
          }
          newTargets = [...prev.targets, target];
        }
        const newState = { ...prev, targets: newTargets };
        saveState(newState, userId);
        return newState;
      });
    },
    [userId]
  );

  const handleDeleteTarget = useCallback(
    (fieldId: string, type: 'daily' | 'weekly') => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = {
          ...prev,
          targets: prev.targets.filter((t) => !(t.fieldId === fieldId && t.type === type)),
        };
        saveState(newState, userId);
        return newState;
      });
      showToast({ type: 'info', title: 'Target removed' });
    },
    [userId]
  );

  if (!state) {
    return <DashboardSkeleton />;
  }

  const today = getTodayString();
  const weekDates = getWeekDates();
  const todayEntry = state.entries.find((e) => e.date === today);
  const recentEntries = [...state.entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  // Streak
  const streak = getCurrentStreak(state.entries);

  // Daily completion rate
  const numFields = state.fields.filter((f) => f.type === 'number');
  const targetsToday = state.targets.filter((t) => t.type === 'daily');
  const metTargets = targetsToday.filter((t) => {
    const val = getFieldValueForEntry(todayEntry, t.fieldId);
    return val >= t.targetValue;
  });
  const completionRate =
    targetsToday.length > 0 ? Math.round((metTargets.length / targetsToday.length) * 100) : null;

  // Weekly totals
  const weeklyTotals: Record<string, number> = {};
  numFields.forEach((f) => {
    weeklyTotals[f.id] = getFieldTotal(state.entries, f.id, weekDates);
  });

  const formattedTime = formatSeconds(timerElapsed);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Daily Tracker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {formatDisplayDate(today)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openSettings('Dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
          >
            <Settings size={14} className="text-muted-foreground/60" />
            Customize Layout
          </button>
          <button
            onClick={() => {
              setEditingEntry(null);
              setEntryModalOpen(true);
              if (settings.focusTimerAutoStart && !timerRunning) {
                setTimerStartedAt(Date.now());
                setTimerRunning(true);
              }
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            Log Entry
          </button>
        </div>
      </div>

      {/* No fields state */}
      {state.fields.length === 0 && (
        <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(37,99,235,0.08)' }}
          >
            <PlusCircle size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No tracking fields yet
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Define what you want to track — hours worked, tasks completed, revenue earned — then log
            daily entries here.
          </p>
          <Link href="/settings-screen" className="btn-primary inline-flex">
            <Plus size={16} />
            Create Your First Field
          </Link>
        </div>
      )}

      {state.fields.length > 0 && (
        <>
          {/* Bento grid: 4 stat cards */}
          {settings.showAnalyticsCards && (
            <div 
              className={`relative grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${!canUseFeature('hasAdvancedAnalytics') ? 'cursor-pointer group/stats' : ''}`}
              onClick={() => !canUseFeature('hasAdvancedAnalytics') && setShowAnalyticsUnlock(true)}
            >
              {/* Lock Indicator overlay for non-pro */}
              {!canUseFeature('hasAdvancedAnalytics') && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/10 text-primary opacity-0 group-hover/stats:opacity-100 transition-opacity">
                  <Lock size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Analytics Pro</span>
                </div>
              )}

              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 contents ${!canUseFeature('hasAdvancedAnalytics') ? 'opacity-40 blur-[1px] pointer-events-none' : ''}`}>
                {/* Streak */}
                {settings.showStreaks && (
                  <StatCard
                    label="Current Streak"
                    value={String(streak)}
                    unit="days"
                    icon={<Flame size={18} style={{ color: '#D97706' }} />}
                    color="#D97706"
                    bg="var(--warning-bg)"
                    trend={streak >= 7 ? 'up' : undefined}
                  />
                )}
                {/* Today completion */}
                <StatCard
                  label="Today's Targets"
                  value={completionRate !== null ? `${completionRate}%` : '—'}
                  unit={
                    completionRate !== null
                      ? `${metTargets.length}/${targetsToday.length} met`
                      : 'no targets set'
                  }
                  icon={
                    <Target
                      size={18}
                      style={{
                        color:
                          completionRate === 100
                            ? 'var(--success)'
                            : completionRate !== null && completionRate < 50
                              ? 'var(--danger)'
                              : 'var(--primary)',
                      }}
                    />
                  }
                  color={
                    completionRate === 100
                      ? 'var(--success)'
                      : completionRate !== null && completionRate < 50
                        ? 'var(--danger)'
                        : 'var(--primary)'
                  }
                  bg={
                    completionRate === 100
                      ? 'var(--success-bg)'
                      : completionRate !== null && completionRate < 50
                        ? 'var(--danger-bg)'
                        : 'rgba(37,99,235,0.06)'
                  }
                />
                {/* Weekly total for top number field */}
                {numFields.length > 0 && (
                  <StatCard
                    label={`This Week — ${numFields[0].name}`}
                    value={String(Math.round(weeklyTotals[numFields[0].id] * 10) / 10)}
                    unit={numFields[0].unit}
                    icon={<TrendingUp size={18} style={{ color: 'var(--accent)' }} />}
                    color="var(--accent)"
                    bg="rgba(14,165,233,0.08)"
                  />
                )}
                {/* Total entries */}
                <StatCard
                  label="Total Entries"
                  value={String(state.entries.length)}
                  unit="logged"
                  icon={<Calendar size={18} style={{ color: 'var(--muted-foreground)' }} />}
                  color="var(--muted-foreground)"
                  bg="var(--muted)"
                />
              </div>
            </div>
          )}

          {/* Weekly Pulse (Alternative specialized view if enabled) */}

          {settings.showWeeklyPulse && !settings.showAnalyticsCards && (
            <div className="card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-4">
                Weekly Pulse
              </h3>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {Math.round(Object.values(weeklyTotals).reduce((a, b) => a + b, 0) * 10) / 10}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight mt-1">
                    Total Units This Week
                  </p>
                </div>
                <div className="h-12 w-px bg-border/40" />
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {state.entries.filter((e) => weekDates.includes(e.date)).length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight mt-1">
                    Days Tracked
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timer + Target Progress */}
          {(settings.showFocusTimer || settings.showTargets) && (
            <div
              className={`grid grid-cols-1 ${settings.showFocusTimer && settings.showTargets ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4`}
            >
              {/* Timer widget */}
              {settings.showFocusTimer && (
                <div className="card p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} style={{ color: 'var(--muted-foreground)' }} />
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      Focus Timer
                    </h2>
                  </div>

                  <div
                    className="text-4xl font-bold tabular-nums font-numbers text-center py-4 mb-4 rounded-lg"
                    style={{
                      color: timerRunning ? 'var(--primary)' : 'var(--foreground)',
                      backgroundColor: timerRunning ? 'rgba(37,99,235,0.06)' : 'var(--muted)',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {formattedTime}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={handleTimerToggle}
                      className={timerRunning ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                    >
                      {timerRunning ? <Pause size={15} /> : <Play size={15} />}
                      {timerRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={handleTimerReset}
                      className="btn-ghost px-3 py-2"
                      aria-label="Reset timer"
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>

                  {timerElapsed > 0 && numFields.length > 0 && (
                    <div
                      className="border rounded-lg p-3 space-y-2"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <p
                        className="text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Add {formatSeconds(timerElapsed)} to field
                      </p>
                      <select
                        value={addToFieldId}
                        onChange={(e) => setAddToFieldId(e.target.value)}
                        className="input-field text-xs py-1.5"
                      >
                        {numFields.map((f) => (
                          <option key={`timer-field-${f.id}`} value={f.id}>
                            {f.name} ({f.unit})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddTimerToField}
                        className="btn-primary w-full text-xs py-1.5"
                      >
                        <Plus size={13} />
                        Add to Entry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Target progress cards */}
              {settings.showTargets && (
                <div
                  className={`${settings.showFocusTimer ? 'lg:col-span-2' : ''} card p-5 shadow-card`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target size={16} style={{ color: 'var(--muted-foreground)' }} />
                      <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        Target Progress
                      </h2>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Today
                    </span>
                  </div>

                  {state.targets.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                        No targets configured yet
                      </p>
                      <Link href="/settings-screen" className="btn-secondary text-xs">
                        Set Targets
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.targets.map((target) => {
                        const field = state.fields.find((f) => f.id === target.fieldId);
                        if (!field) return null;
                        const current =
                          target.type === 'weekly'
                            ? getFieldTotal(state.entries, field.id, weekDates)
                            : getFieldValueForEntry(todayEntry, field.id);
                        const pct = Math.min(100, Math.round((current / target.targetValue) * 100));
                        const met = current >= target.targetValue;
                        return (
                          <TargetProgressRow
                            key={`target-${target.fieldId}-${target.type}`}
                            field={field}
                            target={target}
                            current={current}
                            pct={pct}
                            met={met}
                            onDelete={() => handleDeleteTarget(target.fieldId, target.type)}
                          />
                        );
                      })}
                      
                      {/* AI Goal Suggestion */}
                      {(() => {
                        const suggestions = generateSuggestedTargets(state);
                        if (suggestions.length === 0) return null;
                        
                        // Just show the first suggestion for now
                        const suggestion = suggestions[0];
                        const field = state.fields.find(f => f.id === suggestion.fieldId);
                        if (!field) return null;
                        
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-primary/[0.03] border border-primary/10 border-dashed group/ai">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-primary/60" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Behavioral Goal</span>
                              </div>
                              <Badge variant="default" className="text-[9px] py-0">Performance Data</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4">
                              Based on your last 14 sessions, a {suggestion.type} target of <span className="text-foreground font-semibold">{suggestion.targetValue}{field.unit}</span> for <span className="text-foreground font-semibold">{field.name}</span> is your next logical performance milestone.
                            </p>
                            <button 
                              onClick={() => {
                                handleSaveTarget(suggestion);
                                showToast({ type: 'success', title: 'Goal Adopted', description: `New ${suggestion.type} target set for ${field.name}.` });
                              }}
                              className="w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Adopt Suggested Goal
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Specialized Tracking Placeholders */}
          {(settings.showStudyTracker || settings.showEarningsTracker) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.showStudyTracker && (
                <div className="card p-5 border-indigo-500/10 bg-indigo-500/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-indigo-400" />
                    <h2 className="text-sm font-semibold text-indigo-100/90">Study Tracker</h2>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-muted-foreground/60 leading-relaxed italic">
                      Academic session monitoring active. Log study fields to see behavioral
                      patterns here.
                    </p>
                  </div>
                </div>
              )}
              {settings.showEarningsTracker && (
                <div className="card p-5 border-emerald-500/10 bg-emerald-500/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <h2 className="text-sm font-semibold text-emerald-100/90">Earnings Tracker</h2>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-muted-foreground/60 leading-relaxed italic">
                      Revenue streams monitored. Set financial targets to visualize income momentum.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Insights Panel */}
          {settings.showAIInsights && (
            <div>
              <AIInsightsPanel state={state} />
            </div>
          )}

          {/* Productivity Summary */}
          {settings.showProductivitySummary && (
            <div className="card p-4 border-primary/5 bg-primary/[0.01]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary/60" />
                  <h2 className="text-[13px] font-bold uppercase tracking-widest text-foreground/70">
                    Productivity Summary
                  </h2>
                </div>
                <Badge variant="neutral" className="text-[10px] opacity-60">
                  Real-time
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{metTargets.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight mt-0.5">
                    Wins Today
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {Math.round((timerElapsed / 3600) * 10) / 10}h
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight mt-0.5">
                    Focus Time
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{streak}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight mt-0.5">
                    Day Streak
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Module */}
          {settings.enableWorkflowTracking && (
            <WorkflowModule state={state} setState={setState} userId={userId} />
          )}

          {/* Recent Entries Table */}
          {settings.showRecentEntries && (
            <div className="card shadow-card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'var(--border-subtle, var(--border))' }}
              >
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Recent Entries
                </h2>
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setEntryModalOpen(true);
                    if (settings.focusTimerAutoStart && !timerRunning) {
                      setTimerStartedAt(Date.now());
                      setTimerRunning(true);
                    }
                  }}
                  className="btn-ghost text-xs px-2 py-1.5"
                >
                  <Plus size={13} />
                  New Entry
                </button>
              </div>

              {recentEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <Calendar size={20} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    No entries logged yet
                  </p>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    Start tracking your daily work by logging your first entry.
                  </p>
                  <button
                    onClick={() => {
                      setEntryModalOpen(true);
                      if (settings.focusTimerAutoStart && !timerRunning) {
                        setTimerStartedAt(Date.now());
                        setTimerRunning(true);
                      }
                    }}
                    className="btn-primary text-sm"
                  >
                    <Plus size={14} />
                    Log Your First Entry
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th
                          className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Date
                        </th>
                        {state.fields.map((f) => (
                          <th
                            key={`th-${f.id}`}
                            className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {f.name}
                            {f.unit && (
                              <span className="ml-1 normal-case font-normal">({f.unit})</span>
                            )}
                          </th>
                        ))}
                        <th className="px-4 py-3 w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map((entry) => (
                        <EntryRow
                          key={entry.id}
                          entry={entry}
                          fields={state.fields}
                          targets={state.targets}
                          isToday={entry.date === today}
                          onEdit={() => {
                            setEditingEntry(entry);
                            setEntryModalOpen(true);
                          }}
                          onDelete={() => setDeleteConfirm(entry.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Entry Modal */}
      {entryModalOpen && (
        <EntryFormModal
          fields={state.fields}
          existingEntry={editingEntry}
          existingEntryForDate={
            !editingEntry ? state.entries.find((e) => e.date === today) || null : null
          }
          onSave={handleSaveEntry}
          onClose={() => {
            setEntryModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteConfirm !== null}
        title="Delete this entry?"
        description="This entry and all its logged values will be permanently removed. This cannot be undone."
        confirmLabel="Delete Entry"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDeleteEntry(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      <PremiumUnlockModal 
        isOpen={showAnalyticsUnlock}
        onClose={() => setShowAnalyticsUnlock(false)}
        title="Unlock Advanced Analytics"
        description="Get high-level statistics, weekly comparisons, and deep metric breakdowns to optimize your operational performance."
        featureName="Analytics"
        benefits={[
          "Historical performance trending",
          "Advanced behavioral streak analysis",
          "Multi-metric correlation matrices",
          "Custom goal tracking & suggestions"
        ]}
      />

      <PremiumIntroPopup />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  icon,
  color,
  bg,
  trend,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="card p-4 shadow-card hover-lift" style={{ cursor: 'default' }}>
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: bg,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {icon}
        </div>
        {trend === 'up' && <TrendingUp size={14} style={{ color: 'var(--success)', opacity: 0.8 }} />}
      </div>
      <div
        className="text-2xl font-bold tabular-nums font-numbers mb-0.5"
        style={{ color: 'var(--foreground)' }}
      >
        {value}
      </div>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {unit}
      </p>
      <p className="text-xs font-medium mt-1 truncate" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
        {label}
      </p>
    </div>
  );
}

function TargetProgressRow({
  field,
  target,
  current,
  pct,
  met,
  onDelete,
}: {
  field: TrackingField;
  target: { targetValue: number; type: string };
  current: number;
  pct: number;
  met: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="group/row">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: field.color }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {field.name}
          </span>
          <Badge variant="neutral" className="text-xs">
            {target.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 mr-1">
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-danger/10 text-muted-foreground/40 hover:text-danger transition-colors"
              title="Remove target"
            >
              <Trash2 size={12} />
            </button>
          </div>
          {met ? (
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
          ) : pct < 40 ? (
            <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
          ) : null}
          <span
            className="text-xs font-semibold tabular-nums font-numbers"
            style={{ color: 'var(--foreground)' }}
          >
            {Math.round(current * 10) / 10} / {target.targetValue} {field.unit}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: met ? 'var(--success)' : pct < 40 ? 'var(--danger)' : field.color,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {pct}% complete
        </span>
        {met && (
          <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
            Target met!
          </span>
        )}
        {!met && pct < 40 && (
          <span className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
            Behind target
          </span>
        )}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  fields,
  targets,
  isToday,
  onEdit,
  onDelete,
}: {
  entry: DailyEntry;
  fields: TrackingField[];
  targets: { fieldId: string; targetValue: number; type: string }[];
  isToday: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr
      className="group transition-colors duration-100"
      style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--surface-raised, var(--muted))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
      }}
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {formatDisplayDate(entry.date)}
          </span>
          {isToday && <Badge variant="default">Today</Badge>}
        </div>
      </td>
      {fields.map((field) => {
        const val = entry.values.find((v) => v.fieldId === field.id);
        const displayVal = val?.value || (field.type === 'number' ? '0' : '—');
        const numVal = field.type === 'number' ? parseFloat(displayVal) : null;
        const target = targets.find((t) => t.fieldId === field.id && t.type === 'daily');
        const metTarget = target && numVal !== null ? numVal >= target.targetValue : false;
        return (
          <td key={`cell-${entry.id}-${field.id}`} className="px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm tabular-nums font-numbers"
                style={{
                  color: metTarget ? 'var(--success)' : 'var(--foreground)',
                  fontWeight: metTarget ? 600 : 400,
                }}
              >
                {displayVal}
              </span>
              {field.unit && field.type === 'number' && (
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {field.unit}
                </span>
              )}
              {metTarget && <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />}
            </div>
          </td>
        );
      })}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={onEdit}
            className="btn-ghost p-1.5"
            aria-label="Edit entry"
            title="Edit this entry"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="btn-ghost p-1.5"
            aria-label="Delete entry"
            title="Delete this entry — cannot be undone"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="h-4 w-28 rounded mt-1.5" style={{ backgroundColor: 'var(--muted)' }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`skel-stat-${i}`}
            className="card p-4 h-28"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card h-56" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="card lg:col-span-2 h-56" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
      <div className="card h-64" style={{ backgroundColor: 'var(--muted)' }} />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${day}`;
}

function getFieldValueForEntry(entry: DailyEntry | undefined, fieldId: string): number {
  if (!entry) return 0;
  const val = entry.values.find((v) => v.fieldId === fieldId);
  if (!val) return 0;
  const n = parseFloat(val.value);
  return isNaN(n) ? 0 : n;
}
