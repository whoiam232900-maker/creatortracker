'use client';
import React from 'react';
import { Sparkles, Brain, ArrowUpRight, Target as TargetIcon, Zap } from 'lucide-react';
import { AppState, DailyEntry } from '@/lib/store';
import { generateAIRecommendations, Recommendation } from '@/lib/ai-engine';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumUnlockModal from './PremiumUnlockModal';
import { Lock } from 'lucide-react';

export default function AIInsightsPanel({ state }: { state: AppState }) {
  const { canUseFeature } = useSubscription();
  const [showUnlockModal, setShowUnlockModal] = React.useState(false);
  const recommendations = generateAIRecommendations(state);

  // Deduplicate recommendations by type + title
  const seenRecKeys = new Set<string>();
  const deduplicatedRecommendations = recommendations.filter(rec => {
    const key = `${rec.type}:${rec.title}`;
    if (seenRecKeys.has(key)) return false;
    seenRecKeys.add(key);
    return true;
  });

  const isLocked = !canUseFeature('hasPremiumAI');

  // If locked, we show placeholder data to give a "peek" at the value
  const displayRecommendations = isLocked 
    ? [
        { id: 'p1', title: 'Peak Performance Detection', description: 'Analyze which hours of the day yield your highest focus scores and output density.', type: 'performance', impact: 'high' },
        { id: 'p2', title: 'Burnout Risk Analysis', description: 'Early detection of declining consistency patterns before they impact your delivery pipeline.', type: 'burnout', impact: 'normal' },
        { id: 'p3', title: 'Operational Consistency', description: 'Correlation between your sleep cycles and daily task completion efficiency.', type: 'consistency', impact: 'normal' }
      ] as Recommendation[]
    : deduplicatedRecommendations;

  if (!isLocked && deduplicatedRecommendations.length === 0) {
    return (
      <div className="card p-8 border border-border/40 bg-card/20 backdrop-blur-md relative overflow-hidden group">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/[0.03] flex items-center justify-center text-primary/40 border border-primary/[0.05]">
            <Sparkles size={18} strokeWidth={1.2} />
          </div>
          <div>
            <h2 className="text-[17px] font-light tracking-tight text-foreground/80 leading-tight">
              Personal Intelligence
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground/25 uppercase tracking-[0.25em] mt-1.5">
              Establishing behavioral baseline
            </p>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground/60 italic ml-15 mt-4">
          Log at least 5 sessions to unlock deep behavioral pattern matching and operational insights.
        </p>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`card p-8 border border-border/40 bg-card/20 backdrop-blur-md relative overflow-hidden group transition-all duration-700 ${isLocked ? 'cursor-pointer hover:border-primary/20' : 'hover:border-border/60'}`}
        onClick={() => isLocked && setShowUnlockModal(true)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-primary/[0.03] flex items-center justify-center text-primary/40 border border-primary/[0.05] transition-all duration-700 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/10">
              <Sparkles size={18} strokeWidth={1.2} />
            </div>
            <div>
              <h2 className="text-[17px] font-light tracking-tight text-foreground/80 leading-tight">
                Personal Intelligence
              </h2>
              <p className="text-[10px] font-medium text-muted-foreground/25 uppercase tracking-[0.25em] mt-1.5">
                Behavioral patterns and observations
              </p>
            </div>
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/10 text-primary animate-pulse">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Pro Intelligence</span>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 relative ${isLocked ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`}>
          {displayRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.01] border transition-all duration-500 group/item ${
                rec.impact === 'high' 
                  ? 'border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.04]' 
                  : 'border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${
                  rec.type === 'performance' ? 'bg-emerald-500/10 text-emerald-400' :
                  rec.type === 'burnout' ? 'bg-amber-500/10 text-amber-400' :
                  rec.type === 'consistency' ? 'bg-blue-500/10 text-blue-400' :
                  rec.type === 'optimization' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-primary/10 text-primary'
                }`}>
                  {rec.type === 'performance' && <ArrowUpRight size={14} />}
                  {rec.type === 'burnout' && <Zap size={14} />}
                  {rec.type === 'consistency' && <TargetIcon size={14} />}
                  {rec.type === 'optimization' && <Brain size={14} />}
                  {rec.type === 'milestone' && <Sparkles size={14} />}
                </div>
                {rec.impact === 'high' && (
                  <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest px-1.5 py-0.5 rounded border border-primary/10">
                    Critical
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-foreground/90 mb-1.5">{rec.title}</h4>
                <p className="text-[12px] font-medium leading-relaxed text-muted-foreground/60 group-hover/item:text-muted-foreground/80 transition-colors">
                  {rec.description}
                </p>
                {rec.actionLabel && (
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/80 group-hover/item:text-primary transition-colors cursor-pointer">
                    {rec.actionLabel}
                    <ArrowUpRight size={10} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Atmospheric depth */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-primary/[0.04] transition-colors duration-1000" />
      </div>

      <PremiumUnlockModal 
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title="Unlock Personal Intelligence"
        description="Deep behavioral analysis requires Pro-tier processing to correlate patterns across your entire history."
        featureName="Intelligence"
        benefits={[
          "Identify your peak productivity windows",
          "Early warning system for burnout risk",
          "Correlate sleep and mood with output",
          "Predictive consistency modeling"
        ]}
      />
    </>
  );
}
