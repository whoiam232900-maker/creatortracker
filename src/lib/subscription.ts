export type PlanType = 'Free' | 'Pro' | 'Studio';

export interface PlanFeatures {
  workflowsLimit: number; // -1 for unlimited
  targetsLimit: number;
  historyDaysLimit: number; // e.g., 30 for free, -1 for unlimited
  hasAdvancedAnalytics: boolean;
  hasPremiumAI: boolean;
  canCustomizeDashboard: boolean;
  hasPremiumThemes: boolean;
  hasTeamFeatures: boolean;
  hasEcosystemIntegrations: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanFeatures> = {
  Free: {
    workflowsLimit: 3,
    targetsLimit: 5,
    historyDaysLimit: 30,
    hasAdvancedAnalytics: false,
    hasPremiumAI: false,
    canCustomizeDashboard: false,
    hasPremiumThemes: false,
    hasTeamFeatures: false,
    hasEcosystemIntegrations: false,
  },
  Pro: {
    workflowsLimit: -1, // Unlimited
    targetsLimit: -1,
    historyDaysLimit: -1,
    hasAdvancedAnalytics: true,
    hasPremiumAI: true,
    canCustomizeDashboard: true,
    hasPremiumThemes: true,
    hasTeamFeatures: false,
    hasEcosystemIntegrations: false,
  },
  Studio: {
    workflowsLimit: -1,
    targetsLimit: -1,
    historyDaysLimit: -1,
    hasAdvancedAnalytics: true,
    hasPremiumAI: true,
    canCustomizeDashboard: true,
    hasPremiumThemes: true,
    hasTeamFeatures: true,
    hasEcosystemIntegrations: true,
  },
};

export function getPlanFeatures(plan?: PlanType): PlanFeatures {
  const p = plan || 'Free';
  return PLAN_LIMITS[p] || PLAN_LIMITS['Free'];
}

/**
 * Checks if a plan has access to a specific boolean feature.
 */
export function hasFeature(plan: PlanType, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  const val = features[feature];
  return typeof val === 'boolean' ? val : val !== 0;
}

/**
 * Checks if a user has hit a quantitative limit for their plan.
 * Returns true if they are allowed to create/add more, false if limit reached.
 */
export function checkLimit(plan: PlanType, limitType: keyof PlanFeatures, currentCount: number): boolean {
  const features = getPlanFeatures(plan);
  const limit = features[limitType];
  if (typeof limit === 'number') {
    if (limit === -1) return true;
    return currentCount < limit;
  }
  return false;
}

/**
 * Helper to get the current plan directly from localStorage in non-react environments
 * or during initialization.
 */
export function getCurrentPlan(): PlanType {
  if (typeof window === 'undefined') return 'Free';
  try {
    const raw = localStorage.getItem('userSession');
    if (!raw) return 'Free';
    const parsed = JSON.parse(raw);
    return parsed?.plan || 'Free';
  } catch {
    return 'Free';
  }
}
