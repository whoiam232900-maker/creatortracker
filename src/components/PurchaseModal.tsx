'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Plan, redeemCode } from '@/lib/subscription';

function normalizePlan(input: unknown): Plan {
  if (input === 'pro' || input === 'studio' || input === 'free') return input;
  if (
    input &&
    typeof input === 'object' &&
    'targetPlan' in input &&
    ((input as any).targetPlan === 'pro' || (input as any).targetPlan === 'studio' || (input as any).targetPlan === 'free')
  ) {
    return (input as any).targetPlan;
  }
  if (
    input &&
    typeof input === 'object' &&
    'plan' in input &&
    ((input as any).plan === 'pro' || (input as any).plan === 'studio' || (input as any).plan === 'free')
  ) {
    return (input as any).plan;
  }
  return 'pro';
}

export default function PurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan>('pro');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const plan = normalizePlan(customEvent.detail);
      setTargetPlan(plan);
      setCode('');
      setStatus('idle');
      setMessage('');
      setIsOpen(true);
    };

    window.addEventListener('open-purchase-modal', handleOpen);
    return () => window.removeEventListener('open-purchase-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === 'validating') return;
    setIsOpen(false);
  };

  const handleActivate = async () => {
    if (!code.trim()) {
      setStatus('error');
      setMessage('Please enter a redeem code.');
      return;
    }

    setStatus('validating');
    setMessage('');

    // Simulate slight network delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = redeemCode(code, targetPlan);

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  const planTitle = targetPlan === 'studio' ? 'Studio' : 'Pro';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          disabled={status === 'validating'}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Sparkles size={20} className="text-white/80" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Upgrade to {planTitle}
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Enter your access code to activate this plan.
              </p>
            </div>
          </div>

          {/* Body */}
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in slide-in-from-bottom-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-medium text-white mb-1">{message}</h3>
              <p className="text-xs text-white/50">Your account has been upgraded.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Redeem Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.toUpperCase());
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="e.g. PRO-XXXX-XXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono tracking-wider uppercase"
                  disabled={status === 'validating'}
                  onKeyDown={e => e.key === 'Enter' && handleActivate()}
                />
                {status === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1 animate-in fade-in">
                    <AlertCircle size={12} />
                    <span>{message}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleClose}
                  disabled={status === 'validating'}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={status === 'validating' || !code}
                  className="flex-[2] py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === 'validating' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Validating...
                    </>
                  ) : (
                    `Activate ${planTitle}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
