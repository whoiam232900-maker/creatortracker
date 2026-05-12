'use client';
import React from 'react';
import { Sparkles, Brain } from 'lucide-react';
import { AppState, DailyEntry } from '@/lib/store';

function generateAIInsights(state: AppState): string[] {
  const msgs: string[] = [];
  const entries = state.entries;
  
  if (entries.length < 5) {
    return ["Track at least 5 sessions to establish baseline behavioral patterns."];
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const numFields = state.fields.filter(f => f.type === 'number');
  if (numFields.length === 0) return ["Numeric fields are required for behavioral analysis."];
  
  const primaryField = numFields[0];
  const getPrimaryVal = (e: DailyEntry) => {
    const v = e.values.find(v => v.fieldId === primaryField.id);
    return v ? parseFloat(v.value) || 0 : 0;
  };

  const dateMap = new Map<string, number>();
  sorted.forEach(e => {
    dateMap.set(e.date, getPrimaryVal(e));
  });

  const getValForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return dateMap.get(dStr) || 0;
  };

  // 1. Burnout & Volatility Analysis
  if (sorted.length >= 10) {
    const last14Vals: number[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last14Vals.push(getValForDate(d));
    }
    
    const nonZero14 = last14Vals.filter(v => v > 0);
    if (nonZero14.length > 3) {
      const avg = nonZero14.reduce((a,b) => a+b, 0) / nonZero14.length;
      const max = Math.max(...nonZero14);
      const isHighlyVolatile = max > avg * 2.5;
      
      let zerosAfterMax = 0;
      let foundMax = false;
      for (const v of last14Vals) {
        if (v === max && !foundMax) foundMax = true;
        else if (foundMax && v === 0) zerosAfterMax++;
        else if (foundMax && v > 0) break;
      }

      if (isHighlyVolatile && zerosAfterMax >= 2) {
        msgs.push("Your recent pattern suggests burnout risk from irregular peaks.");
      } else if (!isHighlyVolatile && nonZero14.length >= 10) {
        msgs.push("Smaller daily sessions are producing better long-term consistency.");
      } else if (isHighlyVolatile) {
        msgs.push("Momentum has become unstable over the last 14 days.");
      }
    }
  }

  // 2. Inactivity & Recovery Impact
  if (sorted.length >= 7) {
    let outputAfter2PlusDayGap = [];
    let outputConsecutive = [];

    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i-1].date);
      const d2 = new Date(sorted[i].date);
      const gapDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) - 1;
      const val = getPrimaryVal(sorted[i]);
      
      if (val > 0) {
        if (gapDays === 0) outputConsecutive.push(val);
        else if (gapDays >= 2) outputAfter2PlusDayGap.push(val);
      }
    }

    const avgConsecutive = outputConsecutive.length ? outputConsecutive.reduce((a,b) => a+b, 0) / outputConsecutive.length : 0;
    const avgAfter2 = outputAfter2PlusDayGap.length ? outputAfter2PlusDayGap.reduce((a,b) => a+b, 0) / outputAfter2PlusDayGap.length : 0;

    if (avgAfter2 > 0 && avgAfter2 < avgConsecutive * 0.5 && outputAfter2PlusDayGap.length >= 2) {
      msgs.push("Your productivity drops sharply after 2 or more inactive days.");
    } else if (avgAfter2 > 0 && avgAfter2 >= avgConsecutive * 0.9 && outputAfter2PlusDayGap.length >= 2) {
      msgs.push("You tend to recover productivity quickly after short sessions or missed days.");
    }
  }

  // 3. Work Rhythm (Mid-week vs others)
  if (sorted.length >= 14) {
    let midWeekVals = [];
    let otherVals = [];
    
    sorted.forEach(e => {
      const val = getPrimaryVal(e);
      if (val > 0) {
        const [y, m, d] = e.date.split('-').map(Number);
        const day = new Date(y, m - 1, d).getDay();
        if (day >= 2 && day <= 4) midWeekVals.push(val);
        else otherVals.push(val);
      }
    });

    const midAvg = midWeekVals.length ? midWeekVals.reduce((a,b) => a+b, 0) / midWeekVals.length : 0;
    const otherAvg = otherVals.length ? otherVals.reduce((a,b) => a+b, 0) / otherVals.length : 0;

    if (midAvg > otherAvg * 1.3 && midWeekVals.length >= 4) {
      msgs.push("Your strongest work rhythm appears mid-week.");
    }
  }

  // 4. Session Size Sustainability
  if (sorted.length >= 10) {
    const nonZero = sorted.map(getPrimaryVal).filter(v => v > 0);
    if (nonZero.length >= 5) {
      const sortedNonZero = [...nonZero].sort((a,b) => a-b);
      const median = sortedNonZero[Math.floor(sortedNonZero.length / 2)];
      
      let nextDayAfterLarge = [];
      let nextDayAfterModerate = [];

      for (let i = 0; i < sorted.length - 1; i++) {
        const val1 = getPrimaryVal(sorted[i]);
        const val2 = getPrimaryVal(sorted[i+1]);
        
        const d1 = new Date(sorted[i].date);
        const d2 = new Date(sorted[i+1].date);
        const isConsecutive = (d2.getTime() - d1.getTime()) / (1000*3600*24) === 1;

        if (val1 > median * 1.5) {
          nextDayAfterLarge.push(isConsecutive ? val2 : 0);
        } else if (val1 > 0 && val1 <= median * 1.5) {
          nextDayAfterModerate.push(isConsecutive ? val2 : 0);
        }
      }

      const dropOffAfterLarge = nextDayAfterLarge.filter(v => v === 0).length / (nextDayAfterLarge.length || 1);
      const dropOffAfterModerate = nextDayAfterModerate.filter(v => v === 0).length / (nextDayAfterModerate.length || 1);

      if (dropOffAfterLarge > dropOffAfterModerate * 1.5 && nextDayAfterLarge.length >= 3) {
        msgs.push("Consistency improves when daily sessions stay within moderate boundaries.");
      }
    }
  }

  // 5. Focus Timing
  let morningVal = 0;
  let nightVal = 0;
  let morningCount = 0;
  let nightCount = 0;

  sorted.forEach(e => {
    if (!e.createdAt) return;
    const hour = new Date(e.createdAt).getHours();
    const val = getPrimaryVal(e);
    if (hour >= 5 && hour < 12) {
      morningVal += val;
      morningCount++;
    } else if (hour >= 18 || hour < 3) {
      nightVal += val;
      nightCount++;
    }
  });

  if (morningCount >= 3 && nightCount >= 3) {
    const mAvg = morningVal / morningCount;
    const nAvg = nightVal / nightCount;
    if (mAvg > nAvg * 1.4) {
      msgs.push("You perform best when sessions are logged before noon.");
    } else if (nAvg > mAvg * 1.4) {
      msgs.push("Your deepest focus capacity typically emerges during evening sessions.");
    }
  }

  if (msgs.length === 0) {
    msgs.push("Maintaining a daily baseline will reveal clearer behavioral patterns over time.");
  }

  // Return max 3 high-value insights
  return Array.from(new Set(msgs)).slice(0, 3);
}

export default function AIInsightsPanel({ state }: { state: AppState }) {
  const insights = generateAIInsights(state);
  
  return (
    <div className="card p-8 border border-border/40 bg-card/20 backdrop-blur-md relative overflow-hidden group transition-all duration-700 hover:border-border/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-primary/[0.03] flex items-center justify-center text-primary/40 border border-primary/[0.05] transition-all duration-700 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/10">
            <Sparkles size={18} strokeWidth={1.2} />
          </div>
          <div>
            <h2 className="text-[17px] font-light tracking-tight text-foreground/80 leading-tight">Personal Intelligence</h2>
            <p className="text-[10px] font-medium text-muted-foreground/25 uppercase tracking-[0.25em] mt-1.5">Behavioral patterns and observations</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-5 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-500 group/item"
          >
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/item:bg-primary/40 transition-all duration-500 flex-shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed text-foreground/60 group-hover/item:text-foreground/80 transition-colors">{insight}</p>
          </div>
        ))}
      </div>

      {/* Atmospheric depth */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-primary/[0.04] transition-colors duration-1000" />
    </div>
  );
}
