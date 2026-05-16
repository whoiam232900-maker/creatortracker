import { supabase } from './supabase/client';

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
  const s = input.trim().toLowerCase();
  if (s === 'pro') return 'Pro';
  if (s === 'studio') return 'Studio';
  if (s === 'free') return 'Free';
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
  const current = normalizePlan(currentPlan);
  const required = normalizePlan(requiredPlan);
  return PLAN_HIERARCHY[current] >= PLAN_HIERARCHY[required];
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
      if (parsed?.plan) {
        const p = normalizePlan(parsed.plan);
        if (process.env.NODE_ENV === 'development') {
          console.debug('[subscription] getCurrentPlan from userSession:', p);
        }
        return p;
      }
    }
    
    // 2. localStorage.creatortracker_current_plan
    const raw = localStorage.getItem(CURRENT_PLAN_KEY);
    if (raw) {
      const p = normalizePlan(raw);
      if (process.env.NODE_ENV === 'development') {
        console.debug('[subscription] getCurrentPlan from CURRENT_PLAN_KEY:', p);
      }
      return p;
    }

  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[subscription] getCurrentPlan failure:', e);
    }
  }
  return 'Free';
}

export function setCurrentPlan(plan: PlanType) {
  if (typeof window === 'undefined') return;
  const normalized = normalizePlan(plan);
  
  // Consistency: write normalized plan to both places
  localStorage.setItem(CURRENT_PLAN_KEY, normalized.toLowerCase());

  try {
    // Also update session
    const sessionRaw = localStorage.getItem('userSession');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      parsed.plan = normalized; 
      localStorage.setItem('userSession', JSON.stringify(parsed));
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[subscription] setCurrentPlan session update failure:', e);
    }
  }

  // Notify listeners
  window.dispatchEvent(new Event('userSessionUpdated'));
  window.dispatchEvent(new Event('subscriptionUpdated'));
  window.dispatchEvent(new Event('creatortracker-plan-updated')); // legacy
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

export async function redeemCode(inputCode: string, targetPlan?: Plan): Promise<{ success: boolean; message: string; plan?: Plan }> {
  if (typeof window === 'undefined') return { success: false, message: 'Environment error' };
  
  const normalizedInput = inputCode.trim().toUpperCase();
  if (!normalizedInput) return { success: false, message: 'Code cannot be empty' };

  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: 'Please log in before redeeming a code.' };
    }

    // 2. Query Supabase for the code
    const { data: dbCode, error: codeError } = await supabase
      .from('redeem_codes')
      .select('*')
      .eq('code', normalizedInput)
      .maybeSingle();

    if (codeError) {
      console.warn('[Redeem] Supabase error, trying localStorage fallback:', codeError);
      return syncRedeemCodeFallback(normalizedInput, targetPlan, user.email || 'unknown');
    }

    if (!dbCode) {
      return { success: false, message: 'Code not found' };
    }

    // 3. Validate Code
    if (dbCode.status !== 'active') {
      return { success: false, message: `Code is ${dbCode.status}` };
    }

    if (dbCode.used_count >= dbCode.max_uses) {
      return { success: false, message: 'Code usage limit reached' };
    }

    if (dbCode.expires_at && new Date(dbCode.expires_at).getTime() < Date.now()) {
      return { success: false, message: 'Code has expired' };
    }

    const dbCodePlan = dbCode.plan?.toLowerCase();
    if (targetPlan && dbCodePlan !== targetPlan.toLowerCase()) {
      return { 
        success: false, 
        message: `This code is for ${dbCodePlan === 'studio' ? 'Studio' : 'Pro'}, not ${targetPlan === 'studio' ? 'Studio' : 'Pro'}` 
      };
    }

    // 4. Check for duplicate redemption by this user
    const { data: existingRedemption } = await supabase
      .from('redeem_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('code_id', dbCode.id)
      .maybeSingle();

    if (existingRedemption) {
      return { success: false, message: 'You have already redeemed this code.' };
    }

    // 5. Process Redemption
    const currentPlan = getCurrentPlan();
    const newPlanNormalized = normalizePlan(dbCodePlan);
    
    // A) Update Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        plan: newPlanNormalized.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('[Redeem] Profile update error:', profileError);
      return { success: false, message: 'Could not update your plan. Please try again.' };
    }

    // B) Insert Redemption Record
    await supabase
      .from('redeem_redemptions')
      .insert({
        code_id: dbCode.id,
        code: dbCode.code,
        user_id: user.id,
        user_email: user.email,
        previous_plan: currentPlan.toLowerCase(),
        new_plan: newPlanNormalized.toLowerCase(),
        redeemed_at: new Date().toISOString()
      });

    // C) Increment used_count
    await supabase
      .from('redeem_codes')
      .update({ 
        used_count: (dbCode.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbCode.id);

    // 6. Update Local State
    const capitalPlan = newPlanNormalized;
    upgradeToPlan(capitalPlan);

    return { success: true, message: `${capitalPlan} activated successfully`, plan: dbCodePlan as Plan };

  } catch (error) {
    console.error('Redeem error:', error);
    return { success: false, message: 'An error occurred processing the code' };
  }
}

/**
 * Legacy/Fallback logic for offline/network issues
 */
function syncRedeemCodeFallback(normalizedInput: string, targetPlan: Plan | undefined, userEmail: string): { success: boolean; message: string; plan?: Plan } {
  try {
    const rawCodes = localStorage.getItem(REDEEM_CODES_KEY);
    const codes: RedeemCode[] = rawCodes ? JSON.parse(rawCodes) : [];
    const codeIndex = codes.findIndex(c => String(c.code).trim().toUpperCase() === normalizedInput);
    
    if (codeIndex === -1) return { success: false, message: 'Code not found' };

    const code = codes[codeIndex];
    if (code.status !== 'active') return { success: false, message: `Code ${code.status}` };
    if (code.usedCount >= code.maxUses) return { success: false, message: 'Code usage limit reached' };

    if (targetPlan && code.plan !== targetPlan) {
      return { success: false, message: `This code is for ${code.plan === 'studio' ? 'Studio' : 'Pro'}, not ${targetPlan === 'studio' ? 'Studio' : 'Pro'}` };
    }

    code.usedCount += 1;
    code.usedBy = code.usedBy || [];
    code.usedBy.push(userEmail);
    codes[codeIndex] = code;
    localStorage.setItem(REDEEM_CODES_KEY, JSON.stringify(codes));

    const capitalPlan = code.plan === 'studio' ? 'Studio' : 'Pro';
    upgradeToPlan(capitalPlan);
    return { success: true, message: `${capitalPlan} activated successfully (local fallback)`, plan: code.plan };
  } catch (e) {
    return { success: false, message: 'Local redemption failed' };
  }
}
