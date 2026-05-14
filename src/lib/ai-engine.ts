import { AppState, DailyEntry, TargetConfig, TrackingField, getFieldTotal, getTodayString, getWeekDates, generateId } from './store';

export interface Recommendation {
  id: string;
  type: 'performance' | 'consistency' | 'optimization' | 'burnout' | 'milestone';
  title: string;
  description: string;
  actionLabel?: string;
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Generates analytical, behavior-driven recommendations based on real user data.
 * Focuses on operational usefulness over motivational filler.
 */
export function generateAIRecommendations(state: AppState): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const entries = [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
  
  if (entries.length < 3) {
    return [
      {
        id: 'rec-init-001',
        type: 'consistency',
        title: 'Establish Baseline',
        description: 'Continue logging for 3 more days to enable behavioral pattern analysis.',
        impact: 'low'
      }
    ];
  }

  const last14Days = entries.slice(0, 14);
  const last7Days = entries.slice(0, 7);

  // 1. Consistency Analysis
  const gaps = detectConsistencyGaps(last14Days);
  if (gaps > 2) {
    recommendations.push({
      id: 'rec-cons-001',
      type: 'consistency',
      title: 'Consistency Drop Detected',
      description: `Logging frequency decreased by ${Math.round((gaps / 14) * 100)}% over the last 14 days. Maintaining a daily record is critical for reliable intelligence.`,
      impact: 'high'
    });
  }

  // 2. Target Performance Analysis
  state.targets.forEach(target => {
    const field = state.fields.find(f => f.id === target.fieldId);
    if (!field) return;

    const targetHistory = entries.map(e => {
      const val = e.values.find(v => v.fieldId === target.fieldId);
      return val ? parseFloat(val.value) || 0 : 0;
    }).slice(0, 7);

    const completionCount = targetHistory.filter(v => v >= target.targetValue).length;
    
    if (completionCount === 7) {
      recommendations.push({
        id: `rec-perf-high-${target.fieldId}`,
        type: 'performance',
        title: `Target Calibration: ${field.name}`,
        description: `You have met your ${target.type} ${field.name} goal 7 times in a row. Consider increasing the target by 15% to drive further progress.`,
        actionLabel: 'Increase Target',
        impact: 'medium'
      });
    } else if (completionCount <= 2 && targetHistory.length === 7) {
      recommendations.push({
        id: `rec-perf-low-${target.fieldId}`,
        type: 'performance',
        title: `Goal Realism: ${field.name}`,
        description: `Current ${target.type} ${field.name} target has a <30% completion rate. Adjusted, realistic goals foster better long-term momentum.`,
        impact: 'medium'
      });
    }
  });

  // 3. Workflow Efficiency (if enabled)
  if (state.workflows && state.workflows.length > 0) {
    const activeWorkflows = state.workflows.filter(w => !w.archived && w.status !== 'Completed' && w.status !== 'Delivered');
    if (activeWorkflows.length > 5) {
      recommendations.push({
        id: 'rec-opt-001',
        type: 'optimization',
        title: 'Workflow Congestion',
        description: `${activeWorkflows.length} active workflows detected. Parallel execution often leads to "switching tax". Consider closing 2-3 workflows before starting new ones.`,
        impact: 'high'
      });
    }
  }

  // 4. Burnout/Balance Analysis (Hours vs Tasks)
  const hoursField = state.fields.find(f => f.name.toLowerCase().includes('hour') || f.unit === 'hrs');
  const tasksField = state.fields.find(f => f.name.toLowerCase().includes('task'));
  
  if (hoursField && tasksField) {
    const avgHours = getAverageValue(entries, hoursField.id, 7);
    const avgTasks = getAverageValue(entries, tasksField.id, 7);
    
    if (avgHours > 10) {
      recommendations.push({
        id: 'rec-burn-001',
        type: 'burnout',
        title: 'High Volume Warning',
        description: `Averaging ${avgHours.toFixed(1)}h/day. Sustained high-intensity sessions without recovery days typically correlate with a 40% drop in creative output in week 3.`,
        impact: 'high'
      });
    }

    if (avgHours > 0 && avgTasks > 0) {
      const efficiency = avgTasks / avgHours;
      if (efficiency < 0.5) {
        recommendations.push({
          id: 'rec-opt-002',
          type: 'optimization',
          title: 'Low Throughput Detected',
          description: `Current task completion rate is ${efficiency.toFixed(2)} tasks/hour. Consider implementing 90-minute deep work blocks to improve focus density.`,
          impact: 'medium'
        });
      }
    }
  }

  return recommendations;
}

/**
 * Generates realistic, achievable target suggestions based on historical volume.
 */
export function generateSuggestedTargets(state: AppState): TargetConfig[] {
  const suggestions: TargetConfig[] = [];
  const entries = state.entries;
  
  if (entries.length < 5) return [];

  state.fields.filter(f => f.type === 'number').forEach(field => {
    // Check if a daily target already exists
    const hasDaily = state.targets.some(t => t.fieldId === field.id && t.type === 'daily');
    if (hasDaily) return;

    const history = entries.map(e => {
      const val = e.values.find(v => v.fieldId === field.id);
      return val ? parseFloat(val.value) || 0 : 0;
    }).filter(v => v > 0);

    if (history.length < 5) return;

    // Calculate median to avoid outlier distortion
    const sorted = [...history].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Suggest a target that is 20% above median (achievable but challenging)
    const suggestedValue = Math.round(median * 1.2 * 10) / 10;

    if (suggestedValue > 0) {
      suggestions.push({
        id: generateId('target-suggested'),
        fieldId: field.id,
        targetValue: suggestedValue,
        type: 'daily'
      });
    }
  });

  return suggestions;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectConsistencyGaps(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = new Date(sorted[0].date);
  const oldest = new Date(sorted[sorted.length - 1].date);
  const totalDays = Math.ceil((latest.getTime() - oldest.getTime()) / (1000 * 3600 * 24)) + 1;
  return totalDays - entries.length;
}

function getAverageValue(entries: DailyEntry[], fieldId: string, days: number): number {
  const slice = entries.slice(0, days);
  if (slice.length === 0) return 0;
  const total = slice.reduce((sum, e) => {
    const val = e.values.find(v => v.fieldId === fieldId);
    return sum + (val ? parseFloat(val.value) || 0 : 0);
  }, 0);
  return total / slice.length;
}

/**
 * Historical performance analysis
 */
export function analyzePerformanceTrend(entries: DailyEntry[], fieldId: string): 'up' | 'down' | 'stable' {
  if (entries.length < 10) return 'stable';
  const recent = getAverageValue(entries.slice(0, 5), fieldId, 5);
  const previous = getAverageValue(entries.slice(5, 10), fieldId, 5);
  
  const diff = recent - previous;
  const threshold = previous * 0.1; // 10% change for significance
  
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}
