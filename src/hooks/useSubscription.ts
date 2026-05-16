import { useState, useEffect, useCallback } from 'react';
import { PlanType, PlanFeatures, getPlanFeatures, hasFeature, checkLimit, getCurrentPlan, hasPlan, triggerUpgrade as centralTriggerUpgrade } from '../lib/subscription';

export function useSubscription() {
  const [plan, setPlan] = useState<PlanType>('Free');
  const [features, setFeatures] = useState<PlanFeatures>(getPlanFeatures('Free'));
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshPlan = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (process.env.NODE_ENV === 'development') {
      console.debug('[useSubscription] Refreshing plan state:', currentPlan);
    }
    setPlan(currentPlan);
    setFeatures(getPlanFeatures(currentPlan));
  }, []);

  useEffect(() => {
    refreshPlan();
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'userSession' || e.key === 'creatortracker_current_plan') {
        refreshPlan();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('userSessionUpdated', refreshPlan);
    window.addEventListener('subscriptionUpdated', refreshPlan);
    window.addEventListener('plan-updated', refreshPlan); // legacy
    window.addEventListener('creatortracker-plan-updated', refreshPlan);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userSessionUpdated', refreshPlan);
      window.removeEventListener('subscriptionUpdated', refreshPlan);
      window.removeEventListener('plan-updated', refreshPlan);
      window.removeEventListener('creatortracker-plan-updated', refreshPlan);
    };
  }, [refreshPlan]);

  const canUseFeature = (feature: keyof PlanFeatures) => {
    // Always use fresh normalized plan from source of truth
    return hasFeature(getCurrentPlan(), feature);
  };

  const withinLimit = (limitType: keyof PlanFeatures, currentCount: number) => {
    // Always use fresh normalized plan from source of truth
    return checkLimit(getCurrentPlan(), limitType, currentCount);
  };

  const triggerUpgrade = (targetPlan?: PlanType) => {
    centralTriggerUpgrade(targetPlan);
  };

  return {
    plan,
    features,
    isLoaded,
    canUseFeature,
    withinLimit,
    triggerUpgrade,
    hasPlan: (requiredPlan: PlanType) => hasPlan(getCurrentPlan(), requiredPlan),
    isFree: normalizePlanCheck(getCurrentPlan(), 'Free'),
    isPro: normalizePlanCheck(getCurrentPlan(), 'Pro'),
    isStudio: normalizePlanCheck(getCurrentPlan(), 'Studio'),
  };
}

// Internal helper for clean booleans
function normalizePlanCheck(current: string, target: string): boolean {
  return current.toLowerCase() === target.toLowerCase();
}
