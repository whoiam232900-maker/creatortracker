'use client';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

interface PatternDataPoint {
  day: string;
  value: number;
  fullDay: string;
}

interface ProductivityPatternProps {
  data: PatternDataPoint[];
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
  payload?: Array<{ value: number; payload: PatternDataPoint }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="card shadow-2xl border border-border/40 px-5 py-4 min-w-[160px] animate-in fade-in zoom-in-95 duration-200 bg-card/90 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-3 text-muted-foreground/40">
        {data.fullDay}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-medium tabular-nums font-numbers text-foreground/90 tracking-tight">
          {payload[0].value}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground/30 uppercase">{unit}</span>
      </div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-primary/80 mt-4 py-1 px-2 bg-primary/5 rounded-md border border-primary/10 w-fit">
        Daily Strength
      </p>
    </div>
  );
}

export default function ProductivityPattern({ data, color, unit }: ProductivityPatternProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[11px] font-medium text-muted-foreground/20 uppercase tracking-[0.2em]">
        No pattern data
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ height: '240px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -25 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.2}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500, opacity: 0.4 }}
            tickLine={false}
            axisLine={false}
            dy={10}
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
          <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={color}
                fillOpacity={entry.value === maxVal ? 0.6 : 0.2 + (entry.value / maxVal) * 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
