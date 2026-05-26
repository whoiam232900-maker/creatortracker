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

export const CURRENT_PLAN_KEY = 'creatortracker_current_plan';

export type Plan = 'free' | 'pro' | 'studio';

export interface RedeemCode {
  id: string;
  code: string;
  plan: Exclude<Plan, 'free'>;
  status: 'active' | 'disabled' | 'expired';
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  durationType?: string | null;
  durationDays?: number | null;
  createdAt: string;
  usedBy?: string[];
  notes?: string;
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

export interface SubscriptionStatus {
  effectivePlan: PlanType;
  storedPlan: PlanType;
  isActive: boolean;
  isExpired: boolean;
  isLifetime: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  label: string;
}

export function getSubscriptionStatus(profileOrSession: any): SubscriptionStatus {
  const defaultStatus: SubscriptionStatus = {
    effectivePlan: 'Free',
    storedPlan: 'Free',
    isActive: true,
    isExpired: false,
    isLifetime: true,
    expiresAt: null,
    daysLeft: null,
    label: 'Free Plan',
  };

  if (!profileOrSession) return defaultStatus;
  
  const plan = profileOrSession.plan || profileOrSession.current_plan;
  const storedPlan = normalizePlan(plan);
  const expiryStr = profileOrSession.premiumExpiresAt || profileOrSession.premium_expires_at;
  
  if (storedPlan === 'Free') {
    return { ...defaultStatus, storedPlan: 'Free', effectivePlan: 'Free' };
  }

  // If it's Pro/Studio but no expiry date, it's a Lifetime plan
  if (!expiryStr) {
    return {
      effectivePlan: storedPlan,
      storedPlan: storedPlan,
      isActive: true,
      isExpired: false,
      isLifetime: true,
      expiresAt: null,
      daysLeft: null,
      label: `${storedPlan} (Lifetime)`,
    };
  }

  try {
    const expiry = new Date(expiryStr).getTime();
    if (!Number.isFinite(expiry)) {
      return { ...defaultStatus, storedPlan, effectivePlan: 'Free', isExpired: true, expiresAt: expiryStr, label: 'Invalid Expiry' };
    }
    
    const now = Date.now();
    const isExpired = expiry < now;
    const diff = expiry - now;
    const daysLeft = isExpired ? 0 : Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    
    return {
      effectivePlan: isExpired ? 'Free' : storedPlan,
      storedPlan: storedPlan,
      isActive: !isExpired,
      isExpired,
      isLifetime: false,
      expiresAt: expiryStr,
      daysLeft: isExpired ? 0 : daysLeft,
      label: isExpired ? 'Free (Premium Expired)' : `${storedPlan} (${daysLeft} days left)`,
    };
  } catch (e) {
    return {
      effectivePlan: 'Free',
      storedPlan: storedPlan,
      isActive: false,
      isExpired: true,
      isLifetime: false,
      expiresAt: expiryStr,
      daysLeft: 0,
      label: 'Expired',
    };
  }
}

export function normalizeDurationType(input: string): string {
  const s = input.toLowerCase();
  if (s.includes('trial') || s.includes('7')) return 'trial_7_days';
  if (s.includes('month') || s === 'monthly') return 'monthly';
  if (s.includes('year') || s === 'yearly') return 'yearly';
  if (s.includes('lifetime')) return 'lifetime';
  if (s.includes('custom')) return 'custom_days';
  return 'monthly';
}

export function calculatePremiumExpiry(durationType: string, durationDays?: number): string | null {
  const normalized = normalizeDurationType(durationType);
  const now = new Date();
  
  switch (normalized) {
    case 'trial_7_days':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setDate(now.getDate() + 30);
      break;
    case 'yearly':
      now.setDate(now.getDate() + 365);
      break;
    case 'lifetime':
      return null;
    case 'custom_days':
      if (durationDays) {
        now.setDate(now.getDate() + durationDays);
      } else {
        now.setDate(now.getDate() + 30); // fallback
      }
      break;
    default:
      now.setDate(now.getDate() + 30);
  }
  
  return now.toISOString();
}

export function getCurrentPlan(): PlanType {
  if (typeof window === 'undefined') return 'Free';
  try {
    // 1. localStorage.userSession.plan (Priority)
    const sessionRaw = localStorage.getItem('userSession');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      const plan = parsed?.plan || parsed?.current_plan;
      
      if (plan) {
        const normalized = normalizePlan(plan);
        if (normalized === 'Free') return 'Free';

        // --- EXPIRATION CHECK ---
        const status = getSubscriptionStatus(parsed);
        if (status.isExpired) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[subscription] Plan expired in session, treating as Free');
          }
          return 'Free';
        }

        return normalized;
      }
    }
    
    // 2. localStorage.creatortracker_current_plan
    const raw = localStorage.getItem(CURRENT_PLAN_KEY);
    if (raw) return normalizePlan(raw);

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
      console.error('[Redeem] Supabase query failed:', codeError);
      return { success: false, message: 'Unable to verify code right now. Please try again online.' };
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

    // Fetch user profile to get previous_plan
    const { data: userProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('plan, premium_started_at, premium_expires_at, premium_source')
      .eq('id', user.id)
      .single();

    if (profileFetchError) {
      console.error('[Redeem] Failed to fetch user profile:', profileFetchError);
      return { success: false, message: 'Could not fetch your profile data.' };
    }

    const previousPlan = normalizePlan(userProfile?.plan || 'Free').toLowerCase();

    // 4. Check for duplicate redemption by this user
    const { data: existingRedemption, error: duplicateError } = await supabase
      .from('redeem_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('code_id', dbCode.id)
      .maybeSingle();

    if (duplicateError) {
      console.error('[Redeem] Duplicate check error:', duplicateError);
    }

    if (existingRedemption) {
      return { success: false, message: 'You have already redeemed this code.' };
    }

    // 5. Process Redemption (Atomic sequence)
    const newPlanNormalized = normalizePlan(dbCodePlan);
    const grantedPlan = newPlanNormalized.toLowerCase();
    
    // Calculate Expiry
    const premiumStartedAt = new Date().toISOString();
    const premiumExpiresAt = calculatePremiumExpiry(dbCode.duration_type || 'lifetime', dbCode.duration_days);

    // A) Insert Redemption Record
    const redemptionPayload: Record<string, any> = {
      code_id: dbCode.id,
      user_id: user.id,
      previous_plan: previousPlan,
      new_plan: grantedPlan,
      plan: grantedPlan,
      code_snapshot: dbCode.code,
      user_email_snapshot: user.email,
      redeemed_at: premiumStartedAt,
      premium_started_at: premiumStartedAt,
      premium_expires_at: premiumExpiresAt,
      duration_type: dbCode.duration_type || 'lifetime',
      duration_days: dbCode.duration_days || null
    };

    const { data: redemptionRecord, error: redemptionInsertError } = await supabase
      .from('redeem_redemptions')
      .insert(redemptionPayload)
      .select()
      .single();

    if (redemptionInsertError) {
      console.error('[Redeem] Failed to insert redemption record:', redemptionInsertError);
      return { 
        success: false, 
        message: `Redemption tracking failed: ${redemptionInsertError.message || redemptionInsertError.code || 'Unknown Supabase error'}` 
      };
    }

    // B) Update Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        plan: grantedPlan,
        premium_started_at: premiumStartedAt,
        premium_expires_at: premiumExpiresAt,
        premium_source: 'redeem_code',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('[Redeem] Profile update error:', profileError);
      // ROLLBACK: Delete redemption record
      await supabase.from('redeem_redemptions').delete().eq('id', redemptionRecord.id);
      return { success: false, message: 'Could not update your plan. Please try again.' };
    }

    // C) Increment used_count
    const { error: countError } = await supabase
      .from('redeem_codes')
      .update({ 
        used_count: (dbCode.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbCode.id);

    if (countError) {
      console.error('[Redeem] Count increment error:', countError);
      // ROLLBACK: Reset profile plan and delete redemption record
      await supabase.from('profiles').update({ 
        plan: previousPlan,
        premium_started_at: userProfile.premium_started_at || null,
        premium_expires_at: userProfile.premium_expires_at || null,
        premium_source: userProfile.premium_source || null
      }).eq('id', user.id);
      await supabase.from('redeem_redemptions').delete().eq('id', redemptionRecord.id);
      return { success: false, message: 'Redemption failed during finalization. Please try again.' };
    }

    // 6. Update Local State (Only after full database success)
    upgradeToPlan(newPlanNormalized);

    let successMsg = `${newPlanNormalized} activated successfully`;
    if (premiumExpiresAt) {
      const datePart = premiumExpiresAt.split('T')[0];
      successMsg += ` until ${datePart}`;
    } else {
      successMsg += ` (Lifetime)`;
    }

    return { success: true, message: successMsg, plan: dbCodePlan as Plan };

  } catch (error) {
    console.error('Redeem error:', error);
    return { success: false, message: 'An error occurred processing the code' };
  }
}

