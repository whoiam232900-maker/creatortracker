'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { AppState, getCurrentStreak, DailyEntry } from '@/lib/store';

interface AIInsightsPanelProps {
  state: AppState | null;
}

export default function AIInsightsPanel({ state }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state || state.entries.length === 0) {
      setInsights([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    // Simulate AI generation delay
    setTimeout(() => {
      if (!isMounted) return;
      
      const generated = generateAIInsights(state);
      setInsights(generated);
      setLoading(false);
    }, 1500);

    return () => {
      isMounted = false;
    };
  }, [state]);

  if (!state) return null;

  return (
    <div className="card p-5 shadow-card h-full flex flex-col relative overflow-hidden group">
      {/* Background glow effect for AI */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700" style={{ backgroundColor: 'var(--primary)' }} />
      
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
        <h2 className="text-sm font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>
          AI Insights
        </h2>
      </div>
      
      <div className="flex-1 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
            <Loader2 className="animate-spin w-6 h-6" style={{ color: 'var(--primary)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Analyzing tracking data...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <Lightbulb size={24} className="mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Log more entries to unlock personalized AI insights.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {insights.map((insight, i) => (
              <li 
                key={i} 
                className="flex items-start gap-3 text-sm transition-all animate-in fade-in slide-in-from-bottom-2" 
                style={{ 
                  animationDelay: `${i * 150}ms`, 
                  animationFillMode: 'both',
                  color: 'var(--foreground)' 
                }}
              >
                <span 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm" 
                  style={{ 
                    backgroundColor: 'rgba(37,99,235,0.1)', // Primary tint
                    color: 'var(--primary)',
                    border: '1px solid rgba(37,99,235,0.2)'
                  }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed font-medium opacity-90">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Modular function to generate AI insights based on current tracking state.
 * This function analyzes entries, targets, and trends locally.
 * Can be replaced or augmented by an external LLM API in the future.
 */
function generateAIInsights(state: AppState): string[] {
  const msgs: string[] = [];
  const entries = state.entries;
  
  if (entries.length < 3) {
    return ["Log a few more days of data to unlock behavioral insights."];
  }

  // Sort entries chronologically by date
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  // Find numeric fields
  const numFields = state.fields.filter(f => f.type === 'number');
  if (numFields.length === 0) return ["Add numeric tracking fields to generate productivity insights."];
  
  const primaryField = numFields[0];
  const dailyTargets = state.targets.filter(t => t.type === 'daily' && t.fieldId === primaryField.id);
  const targetVal = dailyTargets.length > 0 ? dailyTargets[0].targetValue : null;

  // Helper to get primary value
  const getPrimaryVal = (e: DailyEntry) => {
    const v = e.values.find(v => v.fieldId === primaryField.id);
    return v ? parseFloat(v.value) || 0 : 0;
  };

  // 1. Momentum / Day-after-drop analysis
  if (sorted.length > 5) {
    let drops = 0;
    let bounceBacks = 0;
    let slumps = 0;

    for (let i = 1; i < sorted.length - 1; i++) {
      const prev = getPrimaryVal(sorted[i-1]);
      const curr = getPrimaryVal(sorted[i]);
      const next = getPrimaryVal(sorted[i+1]);
      
      const avg = (prev + curr + next) / 3 || 1;
      
      // If today is a significant drop
      if (curr < prev * 0.6 && curr < avg * 0.6) {
        drops++;
        if (next >= prev * 0.8 || next > curr * 1.5) {
          bounceBacks++;
        } else {
          slumps++;
        }
      }
    }
    
    if (drops >= 2) {
      if (slumps > bounceBacks) {
        msgs.push(`Data shows you often miss targets for 2-3 days following a low-work day. Focus on resetting quickly tomorrow.`);
      } else if (bounceBacks >= slumps) {
        msgs.push(`Strong recovery pattern detected: you reliably hit above-average ${primaryField.name.toLowerCase()} immediately after rest days.`);
      }
    }
  }

  // 2. Logging time analysis (Morning vs Evening)
  let morningCount = 0;
  let eveningCount = 0;
  let morningTotal = 0;
  let eveningTotal = 0;

  sorted.forEach(e => {
    const val = getPrimaryVal(e);
    if (val > 0 && e.createdAt) {
      try {
        const hour = new Date(e.createdAt).getHours();
        if (hour < 17 && hour > 4) {
          morningCount++;
          morningTotal += val;
        } else {
          eveningCount++;
          eveningTotal += val;
        }
      } catch (err) {}
    }
  });

  if (morningCount >= 3 && eveningCount >= 3) {
    const morningAvg = morningTotal / morningCount;
    const eveningAvg = eveningTotal / eveningCount;
    if (morningAvg > eveningAvg * 1.15) {
      msgs.push(`Your consistency improves by ${Math.round((morningAvg / eveningAvg - 1) * 100)}% when you log entries before evening.`);
    } else if (eveningAvg > morningAvg * 1.15) {
      msgs.push(`You tend to record ${Math.round((eveningAvg / morningAvg - 1) * 100)}% higher ${primaryField.name.toLowerCase()} when logging later in the day.`);
    }
  }

  // 3. Compare this week vs last week (Moving average)
  if (sorted.length >= 14) {
    const last7 = sorted.slice(-7).reduce((sum, e) => sum + getPrimaryVal(e), 0);
    const prev7 = sorted.slice(-14, -7).reduce((sum, e) => sum + getPrimaryVal(e), 0);
    
    if (prev7 > 0) {
      const change = ((last7 - prev7) / prev7) * 100;
      if (change > 15) {
        msgs.push(`Your 7-day rolling average for ${primaryField.name.toLowerCase()} is up ${Math.round(change)}% compared to the previous week.`);
      } else if (change < -15) {
        msgs.push(`Recent volume for ${primaryField.name.toLowerCase()} is tracking ${Math.abs(Math.round(change))}% lower than your 14-day baseline.`);
      }
    }
  }

  // 4. Target completion patterns
  if (targetVal && sorted.length >= 3) {
    const recent = sorted.slice(-3);
    const allHit = recent.every(e => getPrimaryVal(e) >= targetVal);
    const allMissed = recent.every(e => getPrimaryVal(e) > 0 && getPrimaryVal(e) < targetVal);
    
    if (allHit) {
      msgs.push(`You've exceeded your daily ${primaryField.name.toLowerCase()} target for ${recent.length} consecutive days.`);
    } else if (allMissed) {
      msgs.push(`You've missed your ${primaryField.name.toLowerCase()} target for ${recent.length} consecutive days. Consider temporarily lowering the target to rebuild momentum.`);
    }
  }

  // 5. Day of week variances
  if (sorted.length > 10) {
    const dowTotals: Record<number, { total: number, count: number }> = {0:{total:0,count:0}, 1:{total:0,count:0}, 2:{total:0,count:0}, 3:{total:0,count:0}, 4:{total:0,count:0}, 5:{total:0,count:0}, 6:{total:0,count:0}};
    
    sorted.forEach(e => {
      const [year, month, day] = e.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dow = dateObj.getDay();
      
      const val = getPrimaryVal(e);
      if (val > 0) {
        dowTotals[dow].total += val;
        dowTotals[dow].count++;
      }
    });

    let bestDow = -1;
    let worstDow = -1;
    let bestAvg = 0;
    let worstAvg = Infinity;
    
    Object.keys(dowTotals).forEach(dowStr => {
      const dow = parseInt(dowStr);
      const { total, count } = dowTotals[dow];
      if (count >= 2) { // Need at least 2 data points for the day
        const avg = total / count;
        if (avg > bestAvg) { bestAvg = avg; bestDow = dow; }
        if (avg < worstAvg) { worstAvg = avg; worstDow = dow; }
      }
    });

    const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    if (bestDow !== -1 && worstDow !== -1 && bestDow !== worstDow && bestAvg > worstAvg * 1.5) {
      msgs.push(`Historical data flags ${days[worstDow]} as your lowest output day, averaging ${Math.round(worstAvg * 10) / 10} ${primaryField.unit || ''} compared to ${Math.round(bestAvg * 10) / 10} on ${days[bestDow]}.`);
    }
  }

  // Fallbacks if we still don't have enough insights
  if (msgs.length === 0) {
    const streak = getCurrentStreak(sorted);
    if (streak > 0) {
      msgs.push(`Current tracking streak is at ${streak} days.`);
    }
    const totalPrimary = sorted.reduce((acc, e) => acc + getPrimaryVal(e), 0);
    msgs.push(`Total lifetime ${primaryField.name.toLowerCase()} tracked: ${Math.round(totalPrimary * 10)/10} ${primaryField.unit || ''}.`);
  }

  // Ensure unique messages and limit to 4
  const uniqueMsgs = Array.from(new Set(msgs));
  return uniqueMsgs.slice(0, 4);
}
