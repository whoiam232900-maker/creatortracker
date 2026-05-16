'use client';
import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function PremiumIntroPopup() {
  const { isFree, triggerUpgrade } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isFree) return;

    // Logic: show if not shown in the last 7 days
    const lastShown = localStorage.getItem('ct_premium_intro_last_shown');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (!lastShown || now - parseInt(lastShown) > sevenDays) {
      // Delay it slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('ct_premium_intro_last_shown', now.toString());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFree]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[400] w-80 animate-in slide-in-from-bottom-8 duration-700">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 shadow-2xl">
        {/* Background Atmosphere */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted/50 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles size={14} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Premium Intelligence</span>
        </div>

        <h4 className="text-[13px] font-semibold text-foreground mb-1.5">
          Upgrade to Pro for advanced operational intelligence.
        </h4>
        
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed mb-4">
          Unlock predictive burnout tracking, peak focus analytics, and unlimited workflows.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerUpgrade();
              setIsVisible(false);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 group"
          >
            Upgrade <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-2 rounded-lg text-[11px] font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
