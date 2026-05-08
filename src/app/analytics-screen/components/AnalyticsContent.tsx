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
import Badge from '@/components/ui/Badge';

const FieldTrendChart = dynamic(() => import('./FieldTrendChart'), { ssr: false });
const WeeklyComparisonChart = dynamic(() => import('./WeeklyComparisonChart'), { ssr: false });
import AIInsightsPanel from '@/components/AIInsightsPanel';

type DateRange = '7d' | '14d' | '30d' | '90d';

export default function AnalyticsContent() {
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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Track trends, spot patterns, and understand your output
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Field selector */}
          <div className="relative">
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="input-field pr-8 text-sm appearance-none cursor-pointer"
              style={{ minWidth: '160px' }}
            >
              {numberFields.map((f) => (
                <option key={`field-opt-${f.id}`} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>

          {/* Date range */}
          <div
            className="flex items-center rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['7d', '14d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={`range-${r}`}
                onClick={() => setDateRange(r)}
                className="px-3 py-2 text-xs font-medium transition-colors duration-150"
                style={{
                  backgroundColor: dateRange === r ? 'var(--primary)' : 'var(--card)',
                  color: dateRange === r ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards — 4 cards → grid-cols-2 lg:grid-cols-4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          label="All-Time Total"
          value={String(Math.round(allTimeTotal * 10) / 10)}
          unit={selectedField?.unit ?? ''}
          icon={<TrendingUp size={18} style={{ color: 'var(--primary)' }} />}
          bg="rgba(37,99,235,0.08)"
        />
        <AnalyticsStatCard
          label={`Total in ${dateRange}`}
          value={String(Math.round(rangeTotal * 10) / 10)}
          unit={selectedField?.unit ?? ''}
          icon={<Activity size={18} style={{ color: 'var(--accent)' }} />}
          bg="rgba(14,165,233,0.08)"
        />
        <AnalyticsStatCard
          label="Daily Average"
          value={String(avgPerDay)}
          unit={selectedField?.unit ?? ''}
          icon={<BarChart2 size={18} style={{ color: '#9333EA' }} />}
          bg="rgba(147,51,234,0.08)"
        />
        <AnalyticsStatCard
          label="Best Single Day"
          value={bestDay ? String(Math.round(bestDay.value * 10) / 10) : '—'}
          unit={bestDay ? (selectedField?.unit ?? '') : ''}
          sub={bestDay ? formatShortDate(bestDay.date) : 'no data'}
          icon={<Award size={18} style={{ color: '#D97706' }} />}
          bg="var(--warning-bg)"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Trend chart — takes 3 cols */}
        <div className="card p-5 shadow-card xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {selectedField?.name} — Daily Trend
            </h2>
            <Badge variant="neutral">{dateRange}</Badge>
          </div>
          <FieldTrendChart
            data={trendData}
            fieldName={selectedField?.name ?? ''}
            unit={selectedField?.unit ?? ''}
            color={selectedField?.color ?? 'var(--primary)'}
          />
        </div>

        {/* Weekly comparison — 2 cols */}
        <div className="card p-5 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              This Week vs Last Week
            </h2>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: selectedField?.color ?? 'var(--primary)' }}
                />
                This week
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: 'var(--border)' }}
                />
                Last week
              </span>
            </div>
          </div>
          <WeeklyComparisonChart
            data={weeklyData}
            color={selectedField?.color ?? 'var(--primary)'}
            unit={selectedField?.unit ?? ''}
          />
        </div>
      </div>

      {/* Streak + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak card */}
        <div
          className="card p-5 shadow-card flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: streak >= 7 ? 'var(--warning-bg)' : 'var(--card)',
          }}
        >
          <Flame
            size={32}
            className="mb-3"
            style={{ color: streak >= 7 ? 'var(--warning)' : 'var(--muted-foreground)' }}
          />
          <div
            className="text-5xl font-bold tabular-nums mb-1"
            style={{ color: streak >= 7 ? 'var(--warning)' : 'var(--foreground)' }}
          >
            {streak}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Day Streak
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {streak >= 7
              ? 'Excellent consistency!'
              : streak >= 3
                ? 'Building momentum'
                : streak === 0
                  ? 'Start a streak today'
                  : 'Keep it going!'}
          </p>
        </div>

        {/* AI Insights panel */}
        <div className="lg:col-span-2">
          <AIInsightsPanel state={state} />
        </div>
      </div>

      {/* Per-field summary table */}
      {numberFields.length > 1 && (
        <div className="card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              All Fields — Summary
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    'Field',
                    'Unit',
                    'All-Time Total',
                    `Total (${dateRange})`,
                    'Daily Avg',
                    'Best Day',
                  ].map((h) => (
                    <th
                      key={`analytics-th-${h}`}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
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
                    <tr
                      key={`summary-row-${field.id}`}
                      className="transition-colors duration-100"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          'transparent';
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: field.color }}
                          />
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {field.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="neutral">{field.unit || '—'}</Badge>
                      </td>
                      <td className="px-5 py-3 tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {Math.round(total * 10) / 10}
                      </td>
                      <td className="px-5 py-3 tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {Math.round(rangeT * 10) / 10}
                      </td>
                      <td
                        className="px-5 py-3 tabular-nums"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {avg}
                      </td>
                      <td
                        className="px-5 py-3 tabular-nums font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {best !== null ? Math.round(best * 10) / 10 : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsStatCard({
  label,
  value,
  unit,
  sub,
  icon,
  bg,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          {icon}
        </div>
      </div>
      <div
        className="text-2xl font-bold tabular-nums mb-0.5"
        style={{ color: 'var(--foreground)' }}
      >
        {value}
        {unit && (
          <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {sub}
        </p>
      )}
      <p className="text-xs font-medium mt-1" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`askel-${i}`}
            className="card h-24"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="card h-72 xl:col-span-3" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="card h-72 xl:col-span-2" style={{ backgroundColor: 'var(--muted)' }} />
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
