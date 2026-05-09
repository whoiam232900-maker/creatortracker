'use client';
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
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
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border/80 rounded-lg shadow-elevated px-3 py-2 text-xs" style={{ minWidth: '100px' }}>
      <p className="font-bold mb-1 text-foreground">
        {label}
      </p>
      <p className="tabular-nums font-semibold text-primary">
        {payload[0].value} <span className="text-[10px] text-muted-foreground/60 ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

export default function FieldTrendChart({ data, fieldName, unit, color }: FieldTrendChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-56 text-sm"
        style={{ color: 'var(--muted-foreground)' }}
      >
        No data for this period
      </div>
    );
  }

  const avg = data.reduce((s, d) => s + d.value, 0) / Math.max(data.length, 1);
  const avgRounded = Math.round(avg * 10) / 10;

  // Show every Nth label to avoid crowding
  const totalPoints = data.length;
  const labelInterval = totalPoints <= 14 ? 1 : totalPoints <= 30 ? 4 : 9;

  return (
    <div style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={`grad-${fieldName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            interval={labelInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <ReferenceLine
            y={avgRounded}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: `Avg ${avgRounded}`,
              position: 'insideTopRight',
              fontSize: 10,
              fill: 'var(--muted-foreground)',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${fieldName})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
