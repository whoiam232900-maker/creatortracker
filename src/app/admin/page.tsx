'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Ticket, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getAdminStats, AdminStats } from '@/lib/admin-store';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    setStats(getAdminStats());
  }, []);

  if (!stats) return null;

  const planData = [
    { name: 'Free', value: stats.planCounts.Free },
    { name: 'Pro', value: stats.planCounts.Pro },
    { name: 'Studio', value: stats.planCounts.Studio },
  ];

  const activityData = [
    { time: '00:00', users: 12 },
    { time: '04:00', users: 8 },
    { time: '08:00', users: 45 },
    { time: '12:00', users: 82 },
    { time: '16:00', users: 64 },
    { time: '20:00', users: 38 },
    { time: '23:59', users: 24 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Overview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Operational Intelligence</h1>
        <p className="text-muted-foreground/60 text-sm max-w-2xl">
          Real-time monitoring of CreatorTracker ecosystem, user distribution, and platform health.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Entities" 
          value={stats.totalUsers.toString()} 
          icon={Users} 
          trend="+4.2%" 
          description="Total registered accounts"
        />
        <StatCard 
          label="Active Upgrades" 
          value={stats.activeUpgrades.toString()} 
          icon={TrendingUp} 
          trend="+12.5%" 
          description="Pro & Studio subscriptions"
          highlight
        />
        <StatCard 
          label="Redeem Activity" 
          value={stats.totalRedeems.toString()} 
          icon={Ticket} 
          trend="Stable" 
          description="Total codes processed"
        />
        <StatCard 
          label="System Health" 
          value="99.9%" 
          icon={Activity} 
          trend="Nominal" 
          description="Operational uptime"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Distribution */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40">Plan Distribution</h3>
            <div className="p-2 bg-white/5 rounded-lg">
              <CreditCard size={14} className="text-primary" />
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {planData.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-[11px] font-medium text-muted-foreground/60">{p.name} Plan</span>
                <span className="text-xs font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40">Network Activity</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
                Live Monitoring
              </p>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <Zap size={14} className="text-primary" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, description, highlight }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 group hover:translate-y-[-4px] ${
      highlight 
        ? 'bg-primary/[0.03] border-primary/20 shadow-[0_0_40px_rgba(37,99,235,0.05)]' 
        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-xl ${highlight ? 'bg-primary/10' : 'bg-white/5'}`}>
          <Icon size={18} className={highlight ? 'text-primary' : 'text-muted-foreground/40'} strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <ArrowUpRight size={10} />
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">{label}</p>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        <p className="text-[10px] text-muted-foreground/40 font-medium">{description}</p>
      </div>
    </div>
  );
}
