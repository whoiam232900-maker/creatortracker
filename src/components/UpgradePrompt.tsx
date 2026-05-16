import React from 'react';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface UpgradePromptProps {
  title: string;
  description: string;
  featureName?: string;
  isInline?: boolean; // If true, rendering a smaller inline banner instead of a full block
}

export function UpgradePrompt({ title, description, featureName, isInline = false }: UpgradePromptProps) {
  const { triggerUpgrade } = useSubscription();

  if (isInline) {
    return (
      <button
        onClick={triggerUpgrade}
        className="flex items-center justify-between w-full p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] transition-all hover:bg-white/[0.03] group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/[0.03] text-primary/40 group-hover:text-primary/60 transition-colors">
            <Lock size={14} strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold text-foreground/80">{title}</p>
            <p className="text-[10px] text-muted-foreground/30 font-medium">{description}</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-muted-foreground/20 group-hover:text-primary/40 group-hover:translate-x-0.5 transition-all" />
      </button>
    );
  }

  return (
    <div className="relative p-8 rounded-2xl border border-white/[0.03] bg-white/[0.01] overflow-hidden group/prompt">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-primary/40">
          <Sparkles size={14} strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
            {featureName ? `${featureName}` : 'Pro Feature'}
          </span>
        </div>
        
        <h3 className="text-lg font-light tracking-tight text-foreground/90 mb-2">{title}</h3>
        <p className="text-[13px] text-muted-foreground/40 leading-relaxed mb-8 max-w-md">
          {description}
        </p>
        
        <button
          onClick={triggerUpgrade}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors group"
        >
          Enable Premium Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Atmospheric detail */}
      <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none group-hover/prompt:text-primary/10 transition-colors">
        <Sparkles size={80} strokeWidth={1} />
      </div>
    </div>
  );
}
