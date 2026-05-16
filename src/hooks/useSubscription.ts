import { useState, useEffect } from 'react';
import { PlanType, PlanFeatures, getPlanFeatures, hasFeature, checkLimit, getCurrentPlan, hasPlan, triggerUpgrade as centralTriggerUpgrade } from '../lib/subscription';

export function useSubscription() {
  const [plan, setPlan] = useState<PlanType>('Free');
  const [features, setFeatures] = useState<PlanFeatures>(getPlanFeatures('Free'));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentPlan = getCurrentPlan();
    setPlan(currentPlan);
    setFeatures(getPlanFeatures(currentPlan));
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'userSession' || e.key === 'creatortracker_current_plan') {
        const newPlan = getCurrentPlan();
        setPlan(newPlan);
        setFeatures(getPlanFeatures(newPlan));
      }
    };

    const handlePlanUpdate = () => {
      const newPlan = getCurrentPlan();
      setPlan(newPlan);
      setFeatures(getPlanFeatures(newPlan));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('plan-updated', handlePlanUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plan-updated', handlePlanUpdate);
    };
  }, []);

  const canUseFeature = (feature: keyof PlanFeatures) => {
    return hasFeature(plan, feature);
  };

  const withinLimit = (limitType: keyof PlanFeatures, currentCount: number) => {
    return checkLimit(plan, limitType, currentCount);
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
    hasPlan: (requiredPlan: PlanType) => hasPlan(plan, requiredPlan),
    isFree: plan === 'Free',
    isPro: plan === 'Pro',
    isStudio: plan === 'Studio',
  };
}
