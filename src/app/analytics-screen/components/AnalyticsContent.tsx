'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import AppBadge from '@/components/ui/AppBadge';
import AppSelect from '@/components/ui/AppSelect';
import AppButton from '@/components/ui/AppButton';
import AppCard from '@/components/ui/AppCard';

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

  useEffect(() => {
    const s = loadState();
    setState(s);
    const firstNum = s.fields.find((f) => f.type === 'number');
    if (firstNum) setSelectedFieldId(firstNum.id);
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
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return state.entries.filter((e) => e.date >= cutoffStr);
  }, [state, dateRange]);

  const allTimeTotal = useMemo(() => {
    if (!state || !selectedFieldId) return 0;
    return getFieldTotal(state.entries, selectedFieldId);
  }, [state, selectedFieldId]);

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

  const weeklyData = useMemo(() => {
    if (!selectedFieldId) return [];
    const today = new Date();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // This week (Mon–Sun)
    const thisWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    thisWeekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    // Last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    return days.map((day, i) => {
      const thisDate = new Date(thisWeekStart);
      thisDate.setDate(thisWeekStart.getDate() + i);
      const thisStr = thisDate.toISOString().split('T')[0];

      const lastDate = new Date(lastWeekStart);
      lastDate.setDate(lastWeekStart.getDate() + i);
      const lastStr = lastDate.toISOString().split('T')[0];

      const thisEntry = state?.entries.find((e) => e.date === thisStr);
      const lastEntry = state?.entries.find((e) => e.date === lastStr);

      const thisVal = thisEntry?.values.find((v) => v.fieldId === selectedFieldId);
      const lastVal = lastEntry?.values.find((v) => v.fieldId === selectedFieldId);

      const thisN = thisVal ? parseFloat(thisVal.value) : 0;
      const lastN = lastVal ? parseFloat(lastVal.value) : 0;

      return {
        day,
        thisWeek: isNaN(thisN) ? 0 : thisN,
        lastWeek: isNaN(lastN) ? 0 : lastN,
      };
    });
  }, [state, selectedFieldId]);



  if (!state) return <AnalyticsSkeleton />;

  if (numberFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(37,99,235,0.08)' }}
        >
          <BarChart2 size={24} style={{ color: 'var(--primary)' }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          No numeric fields to analyze
        </h2>
        <p className="text-sm text-center max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
          Analytics requires at least one numeric tracking field. Add fields in Settings, then start
          logging entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1.5">Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium">Track trends, spot patterns, and understand your performance.</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <AppSelect 
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            options={numberFields.map(f => ({ value: f.id, label: f.name }))}
            className="min-w-[180px]"
          />

          <div className="flex p-1 rounded-lg bg-muted/40 border border-border/60">
            {(['7d', '14d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={`range-${r}`}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  dateRange === r ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard
          label="All-Time Total"
          value={String(Math.round(allTimeTotal * 10) / 10)}
          unit={selectedField?.unit ?? ''}
          icon={<TrendingUp size={16} />}
          variant="primary"
        />
        <AnalyticsStatCard
          label={`Total in ${dateRange}`}
          value={String(Math.round(rangeTotal * 10) / 10)}
          unit={selectedField?.unit ?? ''}
          icon={<Activity size={16} />}
          variant="accent"
        />
        <AnalyticsStatCard
          label="Daily Average"
          value={String(avgPerDay)}
          unit={selectedField?.unit ?? ''}
          icon={<BarChart2 size={16} />}
          variant="info"
        />
        <AnalyticsStatCard
          label="Best Day"
          value={bestDay ? String(Math.round(bestDay.value * 10) / 10) : '—'}
          unit={bestDay ? (selectedField?.unit ?? '') : ''}
          sub={bestDay ? formatShortDate(bestDay.date) : 'no data'}
          icon={<Award size={16} />}
          variant="warning"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <AppCard className="xl:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-bold tracking-tight">
              {selectedField?.name} <span className="text-muted-foreground font-medium ml-1">— Daily Trend</span>
            </h2>
            <AppBadge variant="neutral" className="text-[10px] uppercase font-bold tracking-wider">{dateRange}</AppBadge>
          </div>
          <FieldTrendChart
            data={trendData}
            fieldName={selectedField?.name ?? ''}
            unit={selectedField?.unit ?? ''}
            color={selectedField?.color ?? 'var(--primary)'}
          />
        </AppCard>

        <AppCard className="xl:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-bold tracking-tight">Week-over-Week</h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider mb-6 px-0.5">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedField?.color || 'var(--primary)' }} />
                <span className="text-foreground">This week</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-border" />
                <span className="text-muted-foreground">Last week</span>
             </div>
          </div>
          <WeeklyComparisonChart
            data={weeklyData}
            color={selectedField?.color ?? 'var(--primary)'}
            unit={selectedField?.unit ?? ''}
          />
        </AppCard>
      </div>

      {/* Streak + Insights */}
      {(settings.showStreaks || settings.showAIInsights) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {settings.showStreaks && (
            <AppCard 
              className={`flex flex-col items-center justify-center text-center ${!settings.showAIInsights ? 'lg:col-span-3' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border transition-all ${streak >= 7 ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-muted/40 border-border/40 text-muted-foreground'}`}>
                <Flame size={28} />
              </div>
              <div className={`text-5xl font-bold tabular-nums mb-1 tracking-tight ${streak >= 7 ? 'text-warning' : 'text-foreground'}`}>
                {streak}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Day Streak</p>
              <p className="text-xs mt-4 text-muted-foreground/40 max-w-[200px] leading-relaxed italic">
                {streak >= 7 ? 'Excellent consistency! You are on fire.' : streak >= 3 ? 'Building momentum. Keep it up!' : streak === 0 ? 'Start a streak today.' : 'Keep the momentum going!'}
              </p>
            </AppCard>
          )}

          {settings.showAIInsights && (
            <div className={`${!settings.showStreaks ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <AIInsightsPanel state={state} />
            </div>
          )}
        </div>
      )}

      {/* Per-field summary table */}
      {numberFields.length > 1 && (
        <AppCard noPadding>
          <div className="px-6 py-5 border-b border-border/50">
            <h2 className="text-base font-bold tracking-tight">Summary Overview</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50">
                  {['Field', 'Unit', 'All-Time', `Total (${dateRange})`, 'Daily Avg', 'Best'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {numberFields.map((field) => {
                  const total = getFieldTotal(state.entries, field.id);
                  const rangeT = getFieldTotal(rangeEntries, field.id);
                  const days = rangeDays[dateRange];
                  const avg = Math.round((rangeT / days) * 100) / 100;
                  let best: number | null = null;
                  rangeEntries.forEach((e) => {
                    const v = e.values.find((vv) => vv.fieldId === field.id);
                    if (!v) return;
                    const n = parseFloat(v.value);
                    if (!isNaN(n) && (best === null || n > best)) best = n;
                  });
                  return (
                    <tr key={field.id} className="group hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full border shadow-sm" style={{ backgroundColor: field.color, borderColor: `${field.color}40` }} />
                          <span className="font-semibold text-foreground">{field.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <AppBadge variant="neutral" className="text-[10px] font-medium">{field.unit || '—'}</AppBadge>
                      </td>
                      <td className="px-6 py-5 tabular-nums font-semibold">{Math.round(total * 10) / 10}</td>
                      <td className="px-6 py-5 tabular-nums font-semibold">{Math.round(rangeT * 10) / 10}</td>
                      <td className="px-6 py-5 tabular-nums text-muted-foreground/80 font-medium">{avg}</td>
                      <td className="px-6 py-5 tabular-nums font-bold text-primary">{best !== null ? Math.round(best * 10) / 10 : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AppCard>
      )}
    </div>
  );
}

function AnalyticsStatCard({ label, value, unit, sub, icon, variant = 'primary' }: { label: string; value: string; unit: string; sub?: string; icon: React.ReactNode; variant?: 'primary' | 'accent' | 'info' | 'warning' }) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    info: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <AppCard className="group hover:bg-card-hover transition-all duration-300">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-5 border transition-all ${variants[variant]}`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide mb-1.5">{sub}</p>}
      <p className="text-xs font-semibold text-muted-foreground/60 tracking-wide uppercase">{label}</p>
    </AppCard>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted/40 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card border border-border/40 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="h-[350px] bg-card border border-border/40 rounded-xl xl:col-span-3" />
        <div className="h-[350px] bg-card border border-border/40 rounded-xl xl:col-span-2" />
      </div>
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
