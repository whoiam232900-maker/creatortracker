'use client';

import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Plus, 
  Zap, 
  Shield, 
  Settings2,
  Lock,
  Globe,
  Database
} from 'lucide-react';
import { getPlanConfigs, savePlanConfigs, PlanConfig } from '@/lib/admin-store';
import { showToast } from '@/components/ui/Toast';

export default function PlanManagement() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  useEffect(() => {
    setPlans(getPlanConfigs());
  }, []);

  const handleToggleLimit = (planId: string, limitKey: string) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          limits: {
            ...p.limits,
            [limitKey]: !((p.limits as any)[limitKey])
          }
        };
      }
      return p;
    });
    setPlans(updated);
  };

  const handleSave = () => {
    savePlanConfigs(plans);
    showToast({ type: 'success', title: 'Plan Configuration Updated', description: 'Systems updated across all nodes.' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Economic Policy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Architecture</h1>
          <p className="text-muted-foreground/60 text-sm">
            Configure feature flags, usage limits, and pricing tiers for the ecosystem.
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl text-[13px] font-bold hover:bg-white/90 transition-all active:scale-95"
        >
          <Database size={16} />
          Sync Configurations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 space-y-8 hover:border-white/10 transition-all relative overflow-hidden group">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{plan.id} Tier</p>
                {plan.id !== 'Free' && <Zap size={14} className="text-primary animate-pulse" />}
              </div>
              <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">/ month</span>
              </div>
            </div>

            {/* Limits Section */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
                <Settings2 size={12} />
                Operational Limits
              </p>
              <div className="space-y-3">
                <LimitItem label="Custom Fields" value={plan.limits.maxFields === 999 ? 'Unlimited' : plan.limits.maxFields.toString()} />
                <LimitItem label="Active Workflows" value={plan.limits.maxWorkflows === 999 ? 'Unlimited' : plan.limits.maxWorkflows.toString()} />
                <LimitItem label="Daily Targets" value={plan.limits.maxTargets === 999 ? 'Unlimited' : plan.limits.maxTargets.toString()} />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
                <Shield size={12} />
                Feature Flags
              </p>
              <div className="space-y-2">
                <FlagToggle 
                  label="AI Intelligence Engine" 
                  active={plan.limits.aiInsights} 
                  onToggle={() => handleToggleLimit(plan.id, 'aiInsights')}
                />
                <FlagToggle 
                  label="Advanced Analytics" 
                  active={plan.limits.advancedAnalytics} 
                  onToggle={() => handleToggleLimit(plan.id, 'advancedAnalytics')}
                />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Marketing Features</p>
              <ul className="space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] text-white/60 font-medium">
                    <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LimitItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
      <span className="text-[11px] font-medium text-muted-foreground/60">{label}</span>
      <span className="text-[11px] font-bold text-white/90">{value}</span>
    </div>
  );
}

function FlagToggle({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 rounded-2xl border transition-all group/toggle text-left"
      style={{
        backgroundColor: active ? 'rgba(37,99,235,0.05)' : 'rgba(255,255,255,0.01)',
        borderColor: active ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)'
      }}
    >
      <span className={`text-[11px] font-bold ${active ? 'text-primary' : 'text-muted-foreground/40'}`}>
        {label}
      </span>
      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${active ? 'bg-primary' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? 'left-4.5' : 'left-0.5'}`} />
      </div>
    </button>
  );
}
