'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import AppCard from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import { 
  Plus,
  Zap,
  Timer as TimerIcon,
  Flame,
  CheckCircle2,
  Circle,
  BarChart3,
  Sparkles,
  History,
  Target,
  ZapOff,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        
        {/* Workspace Header - Cinematic & Dense */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              <Activity size={12} className="text-white/40" />
              <span>Workspace / Overview</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">
              Creator Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end px-4 border-r border-white/[0.05]">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Session</span>
              <span className="text-xs font-semibold text-white/60">None</span>
            </div>
            <AppButton variant="primary" size="sm" icon={Plus} className="bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]">
              New Entry
            </AppButton>
          </div>
        </div>

        {/* Professional Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Focus & Summary (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* COMPACT TIMER MODULE */}
            <AppCard noPadding className="relative overflow-hidden group bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/[0.03] border border-white/[0.05]">
                      <TimerIcon size={14} className="text-white/40" />
                    </div>
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Focus Timer</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-white/[0.05] animate-pulse" />
                </div>

                <div className="flex flex-col items-center py-4 relative">
                  {/* Integrated Compact Ring */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle 
                        cx="64" cy="64" r="60" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        className="text-white/[0.03]"
                      />
                      <circle 
                        cx="64" cy="64" r="60" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeDasharray="377" 
                        strokeDashoffset="377" 
                        className="text-slate-400/40"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-2xl font-bold tracking-tighter tabular-nums text-white/80">00:00</span>
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 text-center px-4">
                    <p className="text-[11px] text-white/30 font-medium leading-relaxed">
                      Select a project to begin your focus session.
                    </p>
                  </div>
                  <AppButton variant="glow" size="md" fullWidth icon={Zap} className="bg-white/[0.03] border-white/[0.06] text-white/70 shadow-none hover:bg-white/[0.05] rounded-lg">
                    Start Session
                  </AppButton>
                </div>
              </div>
            </AppCard>

            {/* SESSION SUMMARY */}
            <AppCard title="Today's Metrics" className="bg-transparent border-white/[0.02]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Tracked</span>
                  <p className="text-lg font-bold text-white/70">0.0h</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Sessions</span>
                  <p className="text-lg font-bold text-white/70">0</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Avg Depth</span>
                  <p className="text-lg font-bold text-white/70">--</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Streak</span>
                  <p className="text-lg font-bold text-white/70">0d</p>
                </div>
              </div>
            </AppCard>
          </div>

          {/* MIDDLE COLUMN: Activity & Analytics (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* RECENT ENTRIES / WORKFLOW */}
            <AppCard noPadding className="h-full flex flex-col">
              <div className="p-5 border-b border-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-white/30" />
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Recent Sessions</span>
                </div>
                <button className="text-[10px] font-bold text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest">View History</button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10">
                  <Plus size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white/40">No activity logged today</p>
                  <p className="text-[10px] text-white/20 max-w-[180px]">Your work sessions will be organized here by project and depth.</p>
                </div>
              </div>
            </AppCard>

            {/* ANALYTICS PREVIEW / HEATMAP placeholder */}
            <AppCard title="Workflow Consistency" className="bg-transparent border-white/[0.02]">
              <div className="h-24 w-full flex items-end gap-1.5 px-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-white/[0.02] rounded-t-sm transition-all hover:bg-white/[0.06]" 
                    style={{ height: `${Math.random() * 40 + 10}%` }} 
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">00:00</span>
                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Last 24 Hours</span>
                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">23:59</span>
              </div>
            </AppCard>
          </div>

          {/* RIGHT COLUMN: Goals & Insights (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* ACTIVE TARGETS */}
            <AppCard noPadding>
              <div className="p-5 border-b border-white/[0.02] flex items-center gap-2">
                <Target size={14} className="text-white/30" />
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Active Targets</span>
              </div>
              <div className="p-5 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/10 group-hover:border-white/20 transition-all">
                      <Circle size={14} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-full bg-white/[0.04] rounded overflow-hidden">
                        <div className="h-full w-0 bg-slate-500/40 rounded" />
                      </div>
                      <div className="h-1.5 w-16 bg-white/[0.02] rounded" />
                    </div>
                  </div>
                ))}
                <button className="w-full py-2 border border-dashed border-white/[0.05] rounded text-[10px] font-bold text-white/10 hover:text-white/30 hover:bg-white/[0.01] transition-all uppercase tracking-widest">
                  Set New Target
                </button>
              </div>
            </AppCard>

            {/* CREATIVE INSIGHTS */}
            <AppCard className="bg-slate-900/10 border-white/[0.02]">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-slate-400/60" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Creative Insights</span>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] text-white/40 leading-relaxed italic">
                    "Peak creative focus usually occurs after 40 minutes of deep work."
                  </p>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Tip</span>
                      <span className="text-[9px] font-medium text-white/20">Try Pomodoro</span>
                    </div>
                  </div>
                </div>
              </div>
            </AppCard>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

