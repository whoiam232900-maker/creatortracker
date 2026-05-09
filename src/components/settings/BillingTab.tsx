'use client';

import React, { useState } from 'react';
import { CreditCard, Check, Zap, Sparkles, Shield } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import AppButton from '@/components/ui/AppButton';

const PLANS = [
  {
    name: 'Free' as const,
    price: '$0',
    priceYearly: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic tracking.',
    icon: Shield,
    features: ['Up to 3 active trackers', 'Basic analytics dashboard', '7-day data history', 'Community support'],
    color: 'var(--muted-foreground)',
  },
  {
    name: 'Pro' as const,
    price: '$12',
    priceYearly: '$9',
    period: 'per month',
    description: 'Advanced analytics and unlimited tracking for creators.',
    icon: Zap,
    isRecommended: true,
    features: ['Unlimited trackers & targets', 'Advanced AI behavioral insights', 'Unlimited data history', 'Priority email support'],
    color: 'var(--primary)',
  },
  {
    name: 'Max' as const,
    price: '$29',
    priceYearly: '$24',
    period: 'per month',
    description: 'The ultimate toolkit for agency teams and power users.',
    icon: Sparkles,
    features: ['Everything in Pro', 'Multiple workspaces', 'Team collaboration', 'Dedicated account manager'],
    color: '#8b5cf6',
  },
];

export default function BillingTab() {
  const { activeWorkspace, updateWorkspace } = useWorkspace();
  const [billingInterval, setBillingInterval] = useState<'Monthly' | 'Yearly'>('Monthly');

  if (!activeWorkspace) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Plans</h1>
        <p className="text-muted-foreground text-base">Manage your subscription and workspace usage.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-[32px] border border-border/60 p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-muted/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <CreditCard size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Plan</p>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-foreground">{activeWorkspace.plan} Plan</h2>
            {activeWorkspace.plan !== 'Free' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary uppercase tracking-widest border border-primary/20">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-md leading-relaxed">
            {activeWorkspace.plan === 'Free' 
              ? 'Upgrade to unlock advanced AI insights and collaboration.'
              : 'Your subscription is active. Billing cycle resets on the 1st of every month.'}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto relative z-10">
          {activeWorkspace.plan !== 'Free' && (
            <AppButton variant="secondary" size="sm">Manage Billing</AppButton>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Plans</h3>
          <div className="flex p-1 rounded-xl bg-muted/40 border border-border/40">
            {(['Monthly', 'Yearly'] as const).map((interval) => (
              <button
                key={interval}
                onClick={() => setBillingInterval(interval)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  billingInterval === interval ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = activeWorkspace.plan === plan.name;
            const price = billingInterval === 'Monthly' ? plan.price : plan.priceYearly;
            const Icon = plan.icon;
            
            return (
              <div key={plan.name} className={`relative p-8 rounded-[32px] border-2 transition-all flex flex-col hover:scale-[1.02] duration-300 ${
                plan.isRecommended ? 'border-primary shadow-2xl shadow-primary/10 bg-primary/[0.02]' : 'border-border/60 bg-card'
              }`}>
                {plan.isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-widest shadow-lg">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 border border-white/[0.05]">
                    <Icon size={24} style={{ color: plan.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className="text-xs text-muted-foreground">/{billingInterval === 'Monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingInterval === 'Yearly' && plan.name !== 'Free' && (
                    <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tighter">Save 25% yearly</p>
                  )}
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                        <Check size={10} className="text-green-500" />
                      </div>
                      <span className="text-xs font-medium text-foreground/80 leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <AppButton 
                  variant={isCurrent ? 'secondary' : plan.isRecommended ? 'primary' : 'outline'}
                  fullWidth
                  disabled={isCurrent}
                  onClick={() => updateWorkspace(activeWorkspace.id, { plan: plan.name })}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </AppButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
