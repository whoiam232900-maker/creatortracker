'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { loadState, AppState, getFieldTotal, getCurrentStreak } from '@/lib/store';
import {
  TrendingUp,
  Award,
  Flame,
  Activity,
  ChevronDown,
  BarChart2,
  Lightbulb,
  Zap,
  Target,
  Crown,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

const FieldTrendChart = dynamic(() => import('./FieldTrendChart'), { ssr: false });
const WeeklyComparisonChart = dynamic(() => import('./WeeklyComparisonChart'), { ssr: false });
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { useSettings } from '@/contexts/SettingsContext';

type DateRange = '7d' | '14d' | '30d' | '90d';

export default function AnalyticsContent() {
  const { settings } = useSettings();
  const [state, setState] = useState<AppState | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadState().then(s => {
      setState(s);
      const firstNum = s.fields.find((f) => f.type === 'number');
      if (firstNum) setSelectedFieldId(firstNum.id);
    });
  }, []);

  const numberFields = useMemo(
    () => (state?.fields ?? []).filter((f) => f.type === 'number'),
    [state]
  );

  const selectedField = useMemo(
    () => numberFields.find((f) => f.id === selectedFieldId) ?? null,
    [numberFields, selectedFieldId]
  );

  const rangeDays: Record<DateRange, number> = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };

  const rangeEntries = useMemo(() => {
    if (!state) return [];
    const days = rangeDays[dateRange];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    cutoff.setHours(0, 0, 0, 0);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return state.entries.filter((e) => e.date >= cutoffStr);
  }, [state, dateRange]);

  const rangeTotal = useMemo(() => {
    if (!selectedFieldId) return 0;
    return getFieldTotal(rangeEntries, selectedFieldId);
  }, [rangeEntries, selectedFieldId]);

  const avgPerDay = useMemo(() => {
    if (!selectedFieldId || rangeEntries.length === 0) return 0;
    const total = getFieldTotal(rangeEntries, selectedFieldId);
    return Math.round((total / rangeDays[dateRange]) * 100) / 100;
  }, [rangeEntries, selectedFieldId, dateRange]);

  const bestDay = useMemo<{ date: string; value: number } | null>(() => {
    if (!selectedFieldId || rangeEntries.length === 0) return null;
    let best: { date: string; value: number } | null = null;
    rangeEntries.forEach((e) => {
      const val = e.values.find((v) => v.fieldId === selectedFieldId);
      if (!val) return;
      const n = parseFloat(val.value);
      if (isNaN(n)) return;
      if (!best || n > best.value) best = { date: e.date, value: n };
    });
    return best;
  }, [rangeEntries, selectedFieldId]);

  const peakSession = useMemo(() => (bestDay ? bestDay.value : 0), [bestDay]);

  const consistencyScore = useMemo(() => {
    if (rangeEntries.length === 0) return 0;
    const activeDays = rangeEntries.filter((e) => {
      const v = e.values.find((vv) => vv.fieldId === selectedFieldId);
      return v && parseFloat(v.value) > 0;
    }).length;
    return Math.round((activeDays / rangeDays[dateRange]) * 100);
  }, [rangeEntries, selectedFieldId, dateRange]);

  const streak = useMemo(() => (state ? getCurrentStreak(state.entries) : 0), [state]);

  const trendData = useMemo(() => {
    if (!selectedFieldId) return [];
    const days = rangeDays[dateRange];
    const result: { date: string; value: number; label: string }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = rangeEntries.find((e) => e.date === dateStr);
      const val = entry?.values.find((v) => v.fieldId === selectedFieldId);
      const n = val ? parseFloat(val.value) : 0;
      const parts = dateStr.split('-');
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
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
      result.push({
        date: dateStr,
        value: isNaN(n) ? 0 : n,
        label: `${months[month]} ${day}`,
      });
    }
    return result;
  }, [rangeEntries, selectedFieldId, dateRange]);

  const comparisonData = useMemo(() => {
    if (!selectedFieldId || !state) return [];
    const today = new Date();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // This week (Mon–Sun)
    const thisWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    thisWeekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    thisWeekStart.setHours(0, 0, 0, 0);

    // Last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    return [1, 2, 3, 4, 5, 6, 0].map((dow, i) => {
      const thisDate = new Date(thisWeekStart);
      thisDate.setDate(thisWeekStart.getDate() + i);
      const thisStr = thisDate.toISOString().split('T')[0];

      const lastDate = new Date(lastWeekStart);
      lastDate.setDate(lastWeekStart.getDate() + i);
      const lastStr = lastDate.toISOString().split('T')[0];

      const thisEntry = state.entries.find((e) => e.date === thisStr);
      const lastEntry = state.entries.find((e) => e.date === lastStr);

      const thisVal = thisEntry?.values.find((v) => v.fieldId === selectedFieldId);
      const lastVal = lastEntry?.values.find((v) => v.fieldId === selectedFieldId);

      return {
        day: days[i],
        fullDay: fullDays[i],
        thisWeek: thisVal ? parseFloat(thisVal.value) || 0 : 0,
        lastWeek: lastVal ? parseFloat(lastVal.value) || 0 : 0,
      };
    });
  }, [state, selectedFieldId]);

  const strongestDay = useMemo(() => {
    if (comparisonData.length === 0) return '—';
    const sorted = [...comparisonData].sort(
      (a, b) => b.thisWeek + b.lastWeek - (a.thisWeek + a.lastWeek)
    );
    return sorted[0].fullDay;
  }, [comparisonData]);

  const mostImprovedDay = useMemo(() => {
    if (comparisonData.length === 0) return '—';
    let best = comparisonData[0];
    let maxDiff = -Infinity;
    comparisonData.forEach((d) => {
      const diff = d.thisWeek - d.lastWeek;
      if (diff > maxDiff) {
        maxDiff = diff;
        best = d;
      }
    });
    return maxDiff > 0 ? best.fullDay : '—';
  }, [comparisonData]);

  const weeklyMomentum = useMemo(() => {
    if (comparisonData.length === 0) return 0;
    const thisTotal = comparisonData.reduce((s, d) => s + d.thisWeek, 0);
    const lastTotal = comparisonData.reduce((s, d) => s + d.lastWeek, 0);
    if (lastTotal === 0) return thisTotal > 0 ? 100 : 0;
    return Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
  }, [comparisonData]);

  if (!state) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 fade-in pb-20 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12">
        <div className="space-y-1.5">
          <h1 className="text-[26px] font-[450] tracking-[-0.025em] text-foreground/85 leading-tight">
            Performance Insights
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/25">
            {selectedField?.name ?? 'Select a field'} &middot; {dateRange} analysis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Field Dropdown */}
          <div className="relative" style={{ zIndex: 60 }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 h-9 bg-card border border-border/50 rounded-xl text-[12px] font-medium shadow-sm hover:bg-accent/5 hover:border-border transition-all duration-500 min-w-[200px] group active:scale-[0.98]"
            >
              <span className="truncate text-foreground/70 group-hover:text-foreground transition-colors duration-400 tracking-[-0.01em] font-[450]">
                {selectedField?.name ?? 'Choose field'}
              </span>
              <ChevronDown
                size={11}
                className={`shrink-0 transition-transform duration-500 text-muted-foreground/50 group-hover:text-muted-foreground ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 w-full overflow-hidden rounded-[14px] border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-300 ease-out"
                style={{
                  zIndex: 70,
                }}
              >
                <div className="p-1.5 space-y-px">
                  {numberFields.map((f) => {
                    const isSelected = selectedFieldId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSelectedFieldId(f.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-[12px] rounded-[10px] flex items-center justify-between group/item relative overflow-hidden transition-colors duration-200 ease-out ${
                          isSelected
                            ? 'text-foreground font-[500] bg-accent/10'
                            : 'text-muted-foreground font-[450] hover:bg-accent/5 hover:text-foreground'
                        }`}
                      >
                        <span className="relative z-10 truncate pr-4 tracking-[-0.01em]">
                          {f.name}
                        </span>
                        {isSelected && (
                          <span className="w-[5px] h-[5px] rounded-full bg-primary relative z-10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Segmented Date Range Control */}
          <div className="flex p-[3px] bg-white/[0.015] border border-white/[0.06] rounded-xl h-9 relative isolate min-w-[240px]">
            {/* Sliding pill */}
            <div
              className="absolute inset-y-[3px] bg-white/[0.05] border border-white/[0.07] rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out pointer-events-none"
              style={{
                width: 'calc(25% - 6px)',
                left: `calc(${['7d', '14d', '30d', '90d'].indexOf(dateRange) * 25}% + 3px)`,
                zIndex: 0,
              }}
            />
            {(['7d', '14d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`flex-1 text-[10px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center relative transition-colors duration-300 ease-out ${
                  dateRange === r
                    ? 'text-foreground/80'
                    : 'text-foreground/20 hover:text-foreground/45'
                }`}
                style={{ zIndex: 1 }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <MetricCard
          label="Range Total"
          value={formatNumber(rangeTotal)}
          unit={selectedField?.unit ?? ''}
          icon={<Activity size={16} strokeWidth={1.5} />}
          color="#3b82f6"
          atmosphere="blue"
        />
        <MetricCard
          label="Best Day"
          value={formatNumber(bestDay?.value ?? 0)}
          unit={selectedField?.unit ?? ''}
          sub={bestDay ? formatShortDate(bestDay.date) : '—'}
          icon={<Crown size={16} strokeWidth={1.5} />}
          color="#f59e0b"
          atmosphere="gold"
        />
        <MetricCard
          label="Daily Average"
          value={formatNumber(avgPerDay)}
          unit={selectedField?.unit ?? ''}
          icon={<TrendingUp size={16} strokeWidth={1.5} />}
          color="#06b6d4"
          atmosphere="cyan"
        />
        <MetricCard
          label="Peak Session"
          value={formatNumber(peakSession)}
          unit={selectedField?.unit ?? ''}
          icon={<Zap size={16} strokeWidth={1.5} />}
          color="#a855f7"
          atmosphere="purple"
        />
        <MetricCard
          label="Consistency"
          value={`${consistencyScore}%`}
          unit="score"
          icon={<Target size={16} strokeWidth={1.5} />}
          color="#10b981"
          atmosphere="emerald"
        />
        <MetricCard
          label="Streak"
          value={String(streak)}
          unit="days"
          icon={<Flame size={16} strokeWidth={1.5} />}
          color="#f97316"
          atmosphere="orange"
          isStreak
        />
      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-10 border border-white/[0.02] bg-[#ffffff01] backdrop-blur-3xl shadow-sm transition-all duration-700 hover:border-white/[0.05] relative overflow-hidden group rounded-[24px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex flex-col mb-12 relative z-10">
            <h2 className="text-[13px] font-[500] text-foreground/75 tracking-[-0.01em]">
              Activity Trend
            </h2>
            <p className="text-[10px] font-semibold text-muted-foreground/22 uppercase tracking-[0.22em] mt-2">
              Historical volume analysis
            </p>
          </div>
          <div className="h-[360px] relative z-10">
            <FieldTrendChart
              data={trendData}
              fieldName={selectedField?.name ?? ''}
              unit={selectedField?.unit ?? ''}
              color={selectedField?.color ?? 'var(--primary)'}
            />
          </div>
        </div>

        <div className="card p-10 border border-white/[0.02] bg-[#ffffff01] backdrop-blur-3xl shadow-sm transition-all duration-700 hover:border-white/[0.05] flex flex-col relative overflow-hidden group rounded-[24px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 mb-12 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center text-muted-foreground/15 border border-white/[0.03]">
              <BarChart2 size={14} strokeWidth={1.2} />
            </div>
            <div>
              <h2 className="text-[13px] font-[500] text-foreground/75 tracking-[-0.01em]">
                Weekly Pulse
              </h2>
              <p className="text-[10px] font-semibold text-muted-foreground/22 uppercase tracking-[0.22em] mt-1">
                Momentum tracking
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] relative z-10">
            <WeeklyComparisonChart
              data={comparisonData}
              color={selectedField?.color ?? 'var(--primary)'}
              unit={selectedField?.unit ?? ''}
            />
          </div>

          <div className="mt-12 pt-12 border-t border-white/[0.04] space-y-5 relative z-10">
            <div className="flex justify-between items-center group/item">
              <span className="text-[11px] font-[450] text-muted-foreground/25 group-hover/item:text-muted-foreground/45 tracking-[-0.005em] transition-colors duration-300">
                Strongest day
              </span>
              <span className="text-[11px] font-[500] text-foreground/55 tracking-[-0.01em]">
                {strongestDay}
              </span>
            </div>
            <div className="flex justify-between items-center group/item">
              <span className="text-[11px] font-[450] text-muted-foreground/25 group-hover/item:text-muted-foreground/45 tracking-[-0.005em] transition-colors duration-300">
                Most improved
              </span>
              <span className="text-[11px] font-[500] text-foreground/55 tracking-[-0.01em]">
                {mostImprovedDay}
              </span>
            </div>
            <div className="flex justify-between items-center group/item">
              <span className="text-[11px] font-[450] text-muted-foreground/25 group-hover/item:text-muted-foreground/45 tracking-[-0.005em] transition-colors duration-300">
                Weekly momentum
              </span>
              <span
                className={`text-[10px] font-[600] tracking-[-0.01em] tabular-nums ${
                  weeklyMomentum >= 0 ? 'text-emerald-400/45' : 'text-red-400/45'
                }`}
              >
                {weeklyMomentum > 0 ? '+' : ''}
                {weeklyMomentum}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {settings.showAIInsights && (
        <div className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-1000">
          <AIInsightsPanel state={state} />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  sub,
  isStreak,
  icon,
  color,
  atmosphere,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  isStreak?: boolean;
  icon: React.ReactElement;
  color: string;
  atmosphere?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="card p-6 border border-white/[0.02] bg-[#ffffff01] backdrop-blur-3xl shadow-sm transition-all duration-700 hover:border-white/[0.05] group relative overflow-hidden flex flex-col justify-between min-h-[140px] rounded-[24px]"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.005] group-hover:opacity-[0.015] transition-opacity duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}, transparent 80%)`,
        }}
      />

      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.02] transition-all duration-700 group-hover:border-white/[0.05] bg-white/[0.01]"
            style={{ color: color }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 14, strokeWidth: 1.5 })}
          </div>
          {isStreak && parseInt(value) >= 7 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/[0.02] border border-orange-500/[0.06]">
              <span className="w-[5px] h-[5px] rounded-full bg-orange-500/25 animate-pulse" />
              <span className="text-[9px] font-[600] text-orange-500/30 uppercase tracking-[0.12em]">
                Active
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[9.5px] font-[600] uppercase tracking-[0.2em] text-muted-foreground/22 group-hover:text-muted-foreground/42 transition-colors duration-300">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-[22px] font-[350] tracking-[-0.02em] text-foreground/78 tabular-nums leading-none">
              {value}
            </span>
            <span className="text-[10px] font-[500] text-muted-foreground/20 tracking-wide">
              {unit}
            </span>
          </div>
          {sub && (
            <p className="text-[9px] font-[450] mt-1.5 text-muted-foreground/18 tracking-[-0.005em]">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-10 w-64 rounded-2xl bg-muted/20" />
          <div className="h-4 w-48 rounded bg-muted/10" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-[220px] rounded-2xl bg-muted/20" />
          <div className="h-12 w-48 rounded-2xl bg-muted/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/10 border border-border/20" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 h-[480px] rounded-2xl bg-muted/5 border border-border/20" />
        <div className="h-[480px] rounded-2xl bg-muted/5 border border-border/20" />
      </div>

      <div className="h-64 rounded-2xl bg-muted/5 border border-border/20" />
    </div>
  );
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
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
  return `${months[month]} ${day}`;
}
