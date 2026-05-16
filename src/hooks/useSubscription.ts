import { useState, useEffect } from 'react';
import { PlanType, PlanFeatures, getPlanFeatures, hasFeature, checkLimit, getCurrentPlan } from '../lib/subscription';

export function useSubscription() {
  const [plan, setPlan] = useState<PlanType>('Free');
  const [features, setFeatures] = useState<PlanFeatures>(getPlanFeatures('Free'));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // In a real SaaS, this would sync with a backend/auth context.
    // For now, we read from our local session.
    const currentPlan = getCurrentPlan();
    setPlan(currentPlan);
    setFeatures(getPlanFeatures(currentPlan));
    setIsLoaded(true);

    // Add a simple listener for plan upgrades (if done via local storage)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'userSession') {
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

  const triggerUpgrade = () => {
    // Ideally this opens the Settings modal on the 'Billing & Plans' tab
    const event = new CustomEvent('open-settings', { detail: { tab: 'Billing & Plans' } });
    window.dispatchEvent(event);
  };

  return {
    plan,
    features,
    isLoaded,
    canUseFeature,
    withinLimit,
    triggerUpgrade,
    isFree: plan === 'Free',
    isPro: plan === 'Pro',
    isStudio: plan === 'Studio',
  };
}
