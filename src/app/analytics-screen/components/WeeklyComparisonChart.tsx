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
  fullDay: string;
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
  payload?: Array<{ name: string; value: number; color: string; payload: WeeklyDataPoint }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  
  return (
    <div className="card shadow-2xl border border-border/40 px-5 py-4 min-w-[180px] animate-in fade-in zoom-in-95 duration-200 bg-card/90 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-3 text-muted-foreground/40">
        {data.fullDay}
      </p>
      <div className="space-y-3">
        {payload.map((p, i) => (
          <div key={`tt-${i}`} className="flex items-center justify-between gap-6 group">
            <div className="flex items-center gap-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.color, opacity: 0.6 }}
              />
              <span className="text-[11px] font-medium text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">{p.name}</span>
            </div>
            <span className="text-xs font-medium tabular-nums font-numbers text-foreground/80">
              {p.value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyComparisonChart({ data, color, unit }: WeeklyComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[11px] font-medium text-muted-foreground/20 uppercase tracking-[0.2em]">
        No Comparison Data
      </div>
    );
  }

  return (
    <div style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 0, bottom: 0, left: -25 }}
          barCategoryGap="30%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500, opacity: 0.4 }}
            tickLine={false}
            axisLine={false}
            dy={15}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500, opacity: 0.4 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ fill: 'var(--foreground)', opacity: 0.02 }}
          />
          <Bar dataKey="lastWeek" name="Last Week" radius={[2, 2, 0, 0]} fill="var(--border)" fillOpacity={0.2}>
            {data.map((_, i) => (
              <Cell key={`lw-cell-${i}`} fill="var(--border)" fillOpacity={0.2} />
            ))}
          </Bar>
          <Bar dataKey="thisWeek" name="Current Week" radius={[2, 2, 0, 0]} fill={color} fillOpacity={0.5}>
            {data.map((_, i) => (
              <Cell key={`tw-cell-${i}`} fill={color} fillOpacity={0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

