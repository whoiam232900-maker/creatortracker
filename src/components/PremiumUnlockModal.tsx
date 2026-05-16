'use client';
import React from 'react';
import Modal from './ui/Modal';
import { Sparkles, ArrowRight, X, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  benefits?: string[];
  featureName: string;
}

export default function PremiumUnlockModal({
  isOpen,
  onClose,
  title,
  description,
  benefits = [],
  featureName,
}: PremiumUnlockModalProps) {
  const { triggerUpgrade } = useSubscription();

  const handleUpgrade = () => {
    triggerUpgrade();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader
      maxWidth="max-w-md"
    >
      <div className="p-8 flex flex-col items-center text-center">
        {/* Cinematic Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-primary/[0.05] border border-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Zap size={32} strokeWidth={1.5} />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">
            {featureName} Tier
          </span>
        </div>
        
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-4">
          {title}
        </h2>
        
        <p className="text-[13px] text-muted-foreground/70 leading-relaxed mb-8">
          {description}
        </p>

        {/* Operational Benefits */}
        {benefits.length > 0 && (
          <div className="w-full space-y-3 mb-8 text-left bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={14} className="text-primary/40 mt-0.5" />
                <span className="text-[12px] text-muted-foreground/80 font-medium leading-snug">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
          >
            Upgrade to Pro
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl text-[12px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </Modal>
  );
}
