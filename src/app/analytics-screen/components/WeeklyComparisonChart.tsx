'use client';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface WeeklyDataPoint {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

interface WeeklyComparisonChartProps {
  data: WeeklyDataPoint[];
  color: string;
  unit: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border/80 rounded-lg shadow-elevated px-3 py-2 text-xs space-y-1.5">
      <p className="font-bold mb-1 text-foreground">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={`tt-${i}`} className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground/60">{p.name}:</span>
          <span className="tabular-nums font-semibold text-foreground">
            {p.value} <span className="text-[10px] text-muted-foreground/40 font-medium ml-0.5">{unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyComparisonChart({ data, color, unit }: WeeklyComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-56 text-sm"
        style={{ color: 'var(--muted-foreground)' }}
      >
        No weekly data available
      </div>
    );
  }

  return (
    <div style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
          />
          <Bar dataKey="lastWeek" name="Last week" radius={[3, 3, 0, 0]} fill="var(--border)">
            {data.map((_, i) => (
              <Cell key={`lw-cell-${i}`} fill="var(--border)" />
            ))}
          </Bar>
          <Bar dataKey="thisWeek" name="This week" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={`tw-cell-${i}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
