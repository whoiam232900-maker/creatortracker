'use client';
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

interface FieldTrendChartProps {
  data: TrendDataPoint[];
  fieldName: string;
  unit: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
  maxVal
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: string;
  maxVal: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0].value;
  const isPeak = val === maxVal && val > 0;

  return (
    <div className="card shadow-2xl border border-border/40 px-5 py-4 min-w-[160px] animate-in fade-in zoom-in-95 duration-200 bg-card/90 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-3 text-muted-foreground/40">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium tabular-nums font-numbers text-foreground/90 tracking-tight">
          {val}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground/30 uppercase">
          {unit}
        </span>
      </div>
      {isPeak && (
        <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-wider text-primary/80 mt-4 py-1 px-2 bg-primary/5 rounded-md border border-primary/10">
          <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
          Peak Output
        </div>
      )}
    </div>
  );
}

export default function FieldTrendChart({ data, fieldName, unit, color }: FieldTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-[11px] font-medium text-muted-foreground/20 uppercase tracking-[0.2em]">
        No Activity Data
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value));
  const avg = data.reduce((s, d) => s + d.value, 0) / Math.max(data.length, 1);
  const avgRounded = Math.round(avg * 10) / 10;

  const totalPoints = data.length;
  const labelInterval = totalPoints <= 14 ? 1 : totalPoints <= 30 ? 4 : 9;

  return (
    <div style={{ height: '320px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`grad-${fieldName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500, opacity: 0.4 }}
            tickLine={false}
            axisLine={false}
            interval={labelInterval}
            dy={15}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500, opacity: 0.4 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} maxVal={maxVal} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.2 }}
          />
          <ReferenceLine
            y={avgRounded}
            stroke="var(--muted-foreground)"
            strokeDasharray="6 6"
            strokeWidth={1}
            strokeOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeOpacity={0.6}
            fill={`url(#grad-${fieldName})`}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: color, 
              stroke: 'var(--background)', 
              strokeWidth: 2,
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

