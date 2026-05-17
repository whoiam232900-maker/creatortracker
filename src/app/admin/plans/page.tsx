'use client';

import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Shield, 
  Settings2,
  Globe,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { getPlanConfigs, PlanConfig } from '@/lib/admin-store';
import { showToast } from '@/components/ui/Toast';
import { formatPlanPrice } from '@/lib/plan-config';

export default function PlanManagement() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await getPlanConfigs();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load configs:', err);
      showToast({ type: 'error', title: 'Fetch Failed', description: 'Could not load configurations from Supabase.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Economic Policy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Architecture</h1>
          <p className="text-muted-foreground/60 text-sm font-medium">
            Pricing and limits are managed from Supabase.
          </p>
        </div>

        <button 
          onClick={loadConfigs}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[13px] font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={isLoading ? "animate-spin" : ""} size={16} />
          Refresh from Database
        </button>
      </div>

      {isLoading && plans.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Synchronizing nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.plan} 
              className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 space-y-8 transition-all relative overflow-hidden group hover:border-white/10"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{plan.plan} Tier</p>
                  {plan.plan !== 'Free' && <Zap size={14} className="text-primary animate-pulse" />}
                </div>
                <h3 className="text-xl font-bold tracking-tight">{plan.display_name}</h3>
                
                {plan.plan !== 'Free' ? (
                  <div className="space-y-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <ReadOnlyPrice label="Monthly (USD)" value={plan.price_monthly_usd} currency="USD" period="Monthly" />
                      <ReadOnlyPrice label="Yearly (USD)" value={plan.price_yearly_usd} currency="USD" period="Yearly" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ReadOnlyPrice label="Monthly (INR)" value={plan.price_monthly_inr} currency="INR" period="Monthly" />
                      <ReadOnlyPrice label="Yearly (INR)" value={plan.price_yearly_inr} currency="INR" period="Yearly" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">/ forever</span>
                  </div>
                )}
              </div>

              {/* Limits Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
                  <Settings2 size={12} />
                  Operational Limits
                </p>
                <div className="space-y-3">
                  <ReadOnlyLimit label="Custom Fields" value={plan.custom_fields_limit} />
                  <ReadOnlyLimit label="Active Workflows" value={plan.workflows_limit} />
                  <ReadOnlyLimit label="Daily Targets" value={plan.daily_targets_limit} />
                </div>
              </div>

              {/* Feature Flags */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
                  <Shield size={12} />
                  Feature Flags
                </p>
                <div className="space-y-2">
                  <ReadOnlyFlag label="AI Intelligence Engine" active={plan.ai_enabled} />
                  <ReadOnlyFlag label="Advanced Analytics" active={plan.advanced_analytics_enabled} />
                </div>
              </div>

              {/* Background Accent */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl transition-all duration-700 bg-primary/5 group-hover:bg-primary/10" />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-start gap-4 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 max-w-2xl">
        <AlertCircle size={20} className="text-primary/60 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] text-white/80 leading-relaxed font-bold uppercase tracking-wider">
            Operational Stability Lock
          </p>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
            Pricing edits have been restricted to the Supabase dashboard to ensure node integrity. Changes to <code>plan_configs</code> will propagate automatically on next sync.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyPrice({ label, value, currency, period }: { label: string, value: number, currency: string, period: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest ml-1">{label}</p>
      <div className="bg-white/5 border border-white/[0.03] rounded-xl px-3 py-2.5">
        <p className="text-[13px] font-bold text-white/90">
          {formatPlanPrice(value, currency, period)}
        </p>
      </div>
    </div>
  );
}

function ReadOnlyLimit({ label, value }: { label: string, value: number }) {
  const isInf = value >= 999 || value === -1;
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
      <span className="text-[11px] font-medium text-muted-foreground/60">{label}</span>
      <span className={`text-[11px] font-bold ${isInf ? 'text-primary/60' : 'text-white/90'}`}>
        {isInf ? 'UNLIMITED' : value}
      </span>
    </div>
  );
}

function ReadOnlyFlag({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl opacity-80">
      <span className={`text-[11px] font-bold ${active ? 'text-white/90' : 'text-muted-foreground/20'}`}>
        {label}
      </span>
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-muted-foreground/20'}`}>
        <span className="text-[8px] font-bold uppercase tracking-wider">{active ? 'Enabled' : 'Disabled'}</span>
      </div>
    </div>
  );
}
