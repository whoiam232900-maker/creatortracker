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

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  Free: 0,
  Pro: 1,
  Studio: 2,
};

export const REDEEM_CODES_KEY = 'creatortracker_redeem_codes';
export const CURRENT_PLAN_KEY = 'creatortracker_current_plan';
export const REDEEM_HISTORY_KEY = 'creatortracker_redeem_history';

export type Plan = 'free' | 'pro' | 'studio';

export interface RedeemCode {
  id: string;
  code: string;
  plan: Exclude<Plan, 'free'>;
  status: 'active' | 'disabled' | 'expired';
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  createdAt: string;
  usedBy?: string[];
  notes?: string;
}

// Ensure migration happens if needed
function migrateOldCodes() {
  if (typeof window === 'undefined') return;
  const rawCodes = localStorage.getItem(REDEEM_CODES_KEY);
  if (rawCodes && JSON.parse(rawCodes).length > 0) return; // already migrated

  const OLD_KEYS = [
    'redeemCodes',
    'creatortracker_codes',
    'admin_redeem_codes',
    'promo_codes',
    'creatortracker_access_codes'
  ];

  for (const key of OLD_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize to new shape
          const migrated: RedeemCode[] = parsed.map(c => ({
            id: c.id || `code-${Date.now()}`,
            code: c.code,
            plan: (c.plan?.toLowerCase() || 'pro') as 'pro' | 'studio',
            status: c.status === 'active' || c.isActive ? 'active' : (c.status || 'disabled'),
            maxUses: c.maxUses || 100,
            usedCount: c.usedCount || c.currentUses || 0,
            expiresAt: c.expiresAt || null,
            createdAt: c.createdAt || new Date().toISOString(),
            notes: c.notes
          }));
          localStorage.setItem(REDEEM_CODES_KEY, JSON.stringify(migrated));
          break;
        }
      } catch (e) {}
    }
  }
}

if (typeof window !== 'undefined') {
  migrateOldCodes();
}

export function normalizePlan(input: any): PlanType {
  if (!input || typeof input !== 'string') return 'Free';
  const s = input.toLowerCase();
  if (s === 'pro') return 'Pro';
  if (s === 'studio') return 'Studio';
  return 'Free';
}

export function getPlanFeatures(plan?: PlanType): PlanFeatures {
  const p = normalizePlan(plan);
  return PLAN_LIMITS[p] || PLAN_LIMITS['Free'];
}

export function hasFeature(plan: PlanType, feature: keyof PlanFeatures): boolean {
  const normalized = normalizePlan(plan);
  const features = getPlanFeatures(normalized);
  const val = features[feature];
  return typeof val === 'boolean' ? val : val !== 0;
}

export function hasPlan(currentPlan: PlanType, requiredPlan: PlanType): boolean {
  return PLAN_HIERARCHY[normalizePlan(currentPlan)] >= PLAN_HIERARCHY[normalizePlan(requiredPlan)];
}

export function checkLimit(plan: PlanType, limitType: keyof PlanFeatures, currentCount: number): boolean {
  const features = getPlanFeatures(normalizePlan(plan));
  const limit = features[limitType];
  if (typeof limit === 'number') {
    if (limit === -1) return true;
    return currentCount < limit;
  }
  return false;
}

export function getCurrentPlan(): PlanType {
  if (typeof window === 'undefined') return 'Free';
  try {
    // 1. localStorage.userSession.plan (Priority)
    const sessionRaw = localStorage.getItem('userSession');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.plan) return normalizePlan(parsed.plan);
    }
    
    // 2. localStorage.creatortracker_current_plan
    const raw = localStorage.getItem(CURRENT_PLAN_KEY);
    if (raw) return normalizePlan(raw);

  } catch {
    // ignore
  }
  return 'Free';
}

export function setCurrentPlan(plan: PlanType) {
  if (typeof window === 'undefined') return;
  const normalized = normalizePlan(plan);
  
  // Consistency: keep CURRENT_PLAN_KEY lowercase if it was before, 
  // but normalizePlan handles reading it.
  localStorage.setItem(CURRENT_PLAN_KEY, normalized.toLowerCase());

  try {
    // Also update session
    const sessionRaw = localStorage.getItem('userSession');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      parsed.plan = normalized; 
      localStorage.setItem('userSession', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }

  // Notify listeners
  window.dispatchEvent(new Event('userSessionUpdated'));
  window.dispatchEvent(new Event('subscriptionUpdated'));
  window.dispatchEvent(new Event('creatortracker-plan-updated'));
  window.dispatchEvent(new Event('plan-updated')); // legacy
  window.dispatchEvent(new Event('storage'));
}

export function upgradeToPlan(plan: PlanType) {
  setCurrentPlan(plan);
}

export function triggerUpgrade(targetPlan?: PlanType | string | unknown) {
  let normalizedPlan = 'pro';
  if (typeof targetPlan === 'string') {
    const s = targetPlan.toLowerCase();
    if (s === 'studio' || s === 'pro' || s === 'free') {
      normalizedPlan = s;
    }
  }

  window.dispatchEvent(
    new CustomEvent('open-purchase-modal', {
      detail: { targetPlan: normalizedPlan }
    })
  );
}

export function redeemCode(inputCode: string, targetPlan?: Plan): { success: boolean; message: string; plan?: Plan } {
  if (typeof window === 'undefined') return { success: false, message: 'Environment error' };
  
  const normalizedInput = inputCode.trim().toUpperCase();
  if (!normalizedInput) return { success: false, message: 'Code cannot be empty' };

  try {
    migrateOldCodes();
    const rawCodes = localStorage.getItem(REDEEM_CODES_KEY);
    const codes: RedeemCode[] = rawCodes ? JSON.parse(rawCodes) : [];

    if (process.env.NODE_ENV === 'development') {
      console.log('[Redeem Debug]', {
        input: normalizedInput,
        targetPlan,
        storageKey: REDEEM_CODES_KEY,
        codes,
      });
    }

    const codeIndex = codes.findIndex(c => String(c.code).trim().toUpperCase() === normalizedInput);
    if (codeIndex === -1) {
      return { success: false, message: 'Code not found' };
    }

    const code = codes[codeIndex];

    if (code.status !== 'active') {
      return { success: false, message: `Code ${code.status}` };
    }

    if (code.usedCount >= code.maxUses) {
      return { success: false, message: 'Code usage limit reached' };
    }

    if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) {
      code.status = 'expired';
      codes[codeIndex] = code;
      localStorage.setItem(REDEEM_CODES_KEY, JSON.stringify(codes));
      return { success: false, message: 'Code expired' };
    }

    if (targetPlan && code.plan !== targetPlan) {
      return { success: false, message: `This code is for ${code.plan === 'studio' ? 'Studio' : 'Pro'}, not ${targetPlan === 'studio' ? 'Studio' : 'Pro'}` };
    }

    // Process redemption
    code.usedCount += 1;
    if (code.usedCount >= code.maxUses) {
      code.status = 'disabled'; // or used
    }
    
    // Attempt to get user info
    let userEmail = 'unknown';
    try {
      const sessionRaw = localStorage.getItem('userSession');
      if (sessionRaw) {
        userEmail = JSON.parse(sessionRaw).email || 'unknown';
      }
    } catch {}

    code.usedBy = code.usedBy || [];
    code.usedBy.push(userEmail);
    
    codes[codeIndex] = code;
    localStorage.setItem(REDEEM_CODES_KEY, JSON.stringify(codes));

    // Save history
    const rawHistory = localStorage.getItem(REDEEM_HISTORY_KEY);
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    history.push({
      code: code.code,
      plan: code.plan,
      redeemedBy: userEmail,
      redeemedAt: new Date().toISOString()
    });
    localStorage.setItem(REDEEM_HISTORY_KEY, JSON.stringify(history));

    const capitalPlan = code.plan === 'studio' ? 'Studio' : 'Pro';
    upgradeToPlan(capitalPlan);

    return { success: true, message: `${capitalPlan} activated successfully`, plan: code.plan };
  } catch (error) {
    console.error('Redeem error:', error);
    return { success: false, message: 'An error occurred processing the code' };
  }
}
