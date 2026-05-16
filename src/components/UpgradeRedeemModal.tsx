'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlanType } from '@/lib/subscription';
import { X, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { showToast } from './ui/Toast';
import { validateAndRedeemCode, getRedeemCodes } from '@/lib/admin-store';

interface UpgradeRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: PlanType;
}

export function UpgradeRedeemModal({ isOpen, onClose, targetPlan }: UpgradeRedeemModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      const runDiagnostics = async () => {
        console.log('[UpgradeRedeemModal] System Diagnostics on Open:');
        console.log(' - Target Plan:', targetPlan);
        const codes = await getRedeemCodes();
        console.log(' - Dynamic Codes in Store:', codes.length);
      };
      runDiagnostics();
    }
  }, [isOpen, targetPlan]);

  if (!isOpen || !mounted) return null;

  const handleRedeem = async () => {
    setError('');
    
    const rawInput = code.trim();
    if (!rawInput) {
      setError('Please enter a redeem code.');
      return;
    }

    setIsSubmitting(true);
    console.log(`[UpgradeRedeemModal] User triggered redemption for: "${rawInput}"`);

    try {
      // Simulated network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Resolve user email from session
      const sessionRaw = localStorage.getItem('userSession') || '{}';
      const session = JSON.parse(sessionRaw);
      const userEmail = session.email || 'anonymous';

      // Execute unified validation & activation pipeline
      const result = await validateAndRedeemCode(rawInput, userEmail);

      if (!result.success) {
        console.warn(`[UpgradeRedeemModal] Redemption Failed: ${result.error}`);
        setError(result.error || 'Invalid access code.');
        setIsSubmitting(false);
        return;
      }

      const activatedPlan = result.plan as PlanType;
      console.log(`[UpgradeRedeemModal] Success! Activated: ${activatedPlan}`);

      showToast({
        type: 'success',
        title: 'Access Unlocked',
        description: `Welcome to the ${activatedPlan} plan. All features are now available.`,
      });
      
      onClose();
    } catch (err) {
      console.error('[UpgradeRedeemModal] CRITICAL ERROR:', err);
      setError('System error: Failed to process redemption.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      <div 
        className="relative w-full max-w-md bg-card border border-white/[0.05] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{ animation: 'enter 0.3s ease-out forwards' }}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/[0.05] border border-primary/[0.1] flex items-center justify-center text-primary mb-4">
              <KeyRound size={24} strokeWidth={1.5} />
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-light text-foreground mb-2 tracking-tight">
            Redeem Access
          </h2>
          <p className="text-sm text-muted-foreground/80 mb-8 leading-relaxed">
            Enter your early access or partner code to unlock {targetPlan} tier features instantly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 block">
                Access Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder={`e.g. ${targetPlan.toUpperCase()}_ACCESS_2026`}
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-primary/[0.02] transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRedeem();
                }}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-xs font-medium text-danger/90 px-1 animate-in slide-in-from-top-1 fade-in">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleRedeem}
              disabled={isSubmitting || !code.trim()}
              className="w-full relative group overflow-hidden rounded-xl bg-primary text-primary-foreground py-3.5 font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Unlock {targetPlan}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-white/[0.01] border-t border-white/[0.03] p-4 text-center">
          <p className="text-[11px] text-muted-foreground/40 font-medium">
            This is an early-access redemption system. <br/>Billing integration arriving in future updates.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
