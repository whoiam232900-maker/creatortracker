'use client';

/**
 * REDEEM SYSTEM - Centralized Architecture
 * 
 * This file is the SINGLE SOURCE OF TRUTH for:
 * 1. Redeem Code Storage (localStorage: 'admin_redeem_codes')
 * 2. Code Normalization (stripping special chars, uppercase)
 * 3. Validation Logic (checking dynamic + fallback codes)
 * 4. Plan Activation Pipeline (updating session + subscription records)
 */

import { PlanType } from './subscription';
export type { PlanType };

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY_CODES = 'admin_redeem_codes';
const STORAGE_KEY_SESSION = 'userSession';
const SUB_PREFIX = 'subscription_';

export interface RedeemCode {
  id: string;
  code: string;
  planType: PlanType;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  notes: string;
  createdAt: string;
}

// ─── Normalization ───────────────────────────────────────────────────────────

/**
 * The EXACT same normalization must be used for saving and comparing.
 */
export function normalizeRedeemCode(c: string): string {
  if (!c || typeof c !== 'string') return '';
  const result = c.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  console.log(`[Redeem-Trace] Normalizing: "${c}" -> "${result}"`);
  return result;
}

// ─── Fallback Codes ──────────────────────────────────────────────────────────

export const FALLBACK_REDEEM_CODES: Record<string, PlanType> = {
  'PRO_ACCESS_2026': 'Pro',
  'STUDIO_ACCESS_2026': 'Studio',
};

// ─── Store Core ──────────────────────────────────────────────────────────────

export function getRedeemCodes(): RedeemCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CODES);
    if (!raw) {
      console.log(`[Redeem-Trace] [STORAGE] Key "${STORAGE_KEY_CODES}" is empty.`);
      return [];
    }
    const parsed = JSON.parse(raw);
    console.log(`[Redeem-Trace] [STORAGE] Loaded ${parsed.length} codes from "${STORAGE_KEY_CODES}"`);
    return parsed;
  } catch (e) {
    console.error('[Redeem-Trace] [STORAGE] Parse failure:', e);
    return [];
  }
}

export function saveRedeemCodes(codes: RedeemCode[]) {
  if (typeof window === 'undefined') return;
  console.debug(`[Redeem-Trace] Saving ${codes.length} codes to ${STORAGE_KEY_CODES}`);
  localStorage.setItem(STORAGE_KEY_CODES, JSON.stringify(codes));
  
  // Broadcast updates
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('admin_codes_updated'));
}

// ─── Redemption & Activation ─────────────────────────────────────────────────

export function validateAndRedeemCode(rawInput: string, userEmail: string = 'anonymous'): { success: boolean; error?: string; plan?: PlanType } {
  console.log(`[Redeem-Trace] REDEMPTION ATTEMPT: "${rawInput}" (User: ${userEmail})`);
  
  const normalizedInput = normalizeRedeemCode(rawInput);
  if (!normalizedInput) {
    return { success: false, error: 'Please enter a valid code.' };
  }

  // 1. Fetch Latest Dynamic Codes
  const allCodes = getRedeemCodes();
  
  // 2. Search Dynamic Codes
  console.log(`[Redeem-Trace] Searching through ${allCodes.length} dynamic codes...`);
  const dynamicMatch = allCodes.find(c => {
    const normalizedStored = normalizeRedeemCode(c.code);
    const isMatch = normalizedStored === normalizedInput;
    if (isMatch) console.log(`[Redeem-Trace] EXACT MATCH FOUND: "${c.code}"`);
    return isMatch;
  });
  
  let activatedPlan: PlanType | null = null;
  let dynamicCodeId: string | null = null;

  if (dynamicMatch) {
    console.log(`[Redeem-Trace] MATCH FOUND (Dynamic): ID=${dynamicMatch.id}, Plan=${dynamicMatch.planType}`);
    
    if (!dynamicMatch.isActive) {
      return { success: false, error: 'This code has been deactivated.' };
    }
    
    if (dynamicMatch.expiresAt && new Date(dynamicMatch.expiresAt) < new Date()) {
      return { success: false, error: 'This code has expired.' };
    }

    if (dynamicMatch.currentUses >= dynamicMatch.maxUses) {
      return { success: false, error: 'Maximum usage limit reached.' };
    }

    activatedPlan = dynamicMatch.planType;
    dynamicCodeId = dynamicMatch.id;
  } else {
    // 3. Search Fallback Codes
    console.log(`[Redeem-Trace] No dynamic match. Checking system fallbacks...`);
    const fallbackKey = Object.keys(FALLBACK_REDEEM_CODES).find(k => normalizeRedeemCode(k) === normalizedInput);
    
    if (fallbackKey) {
      console.log(`[Redeem-Trace] MATCH FOUND (Fallback): ${fallbackKey}`);
      activatedPlan = FALLBACK_REDEEM_CODES[fallbackKey];
    }
  }

  if (!activatedPlan) {
    console.warn(`[Redeem-Trace] NO VALID CODE FOUND for: "${normalizedInput}"`);
    return { success: false, error: 'Invalid or unrecognized access code.' };
  }

  // 4. THE ACTIVATION PIPELINE
  try {
    console.log(`[Redeem-Trace] PIPELINE: Activating ${activatedPlan} for ${userEmail}`);

    // A. Update userSession (The standard UI state)
    const sessionRaw = localStorage.getItem(STORAGE_KEY_SESSION) || '{}';
    const session = JSON.parse(sessionRaw);
    session.plan = activatedPlan;
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    console.log(`[Redeem-Trace] SUCCESS: Updated ${STORAGE_KEY_SESSION} with plan ${activatedPlan}`);

    // B. Update subscription_{email} (The persistent vault record)
    const subKey = `${SUB_PREFIX}${userEmail}`;
    const subData = {
      plan: activatedPlan, // Use "plan" key for consistency with AuthPage check
      planId: activatedPlan, 
      activatedAt: new Date().toISOString(),
      redeemedCode: normalizedInput,
      status: 'active'
    };
    localStorage.setItem(subKey, JSON.stringify(subData));
    console.log(`[Redeem-Trace] SUCCESS: Updated persistent storage key "${subKey}"`);

    // C. Increment usage for dynamic codes
    if (dynamicCodeId) {
      const updatedCodes = allCodes.map(c => 
        c.id === dynamicCodeId ? { ...c, currentUses: c.currentUses + 1 } : c
      );
      saveRedeemCodes(updatedCodes);
      console.log(`[Redeem-Trace] PIPELINE: Incremented usage for ${dynamicCodeId}`);
    }

    // D. Global Sync
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('plan-updated'));
    console.log(`[Redeem-Trace] PIPELINE: Signals dispatched.`);

    return { success: true, plan: activatedPlan };
  } catch (err) {
    console.error('[Redeem-Trace] PIPELINE FAILURE:', err);
    return { success: false, error: 'System error during activation.' };
  }
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

export function generateRedeemCode(data: Omit<RedeemCode, 'id' | 'createdAt' | 'currentUses'>): RedeemCode {
  console.log('[Redeem-Trace] Admin: Generating new code:', data.code);
  const codes = getRedeemCodes();
  const newCode: RedeemCode = {
    ...data,
    id: `code-${Date.now()}`,
    createdAt: new Date().toISOString(),
    currentUses: 0,
  };
  saveRedeemCodes([newCode, ...codes]);
  return newCode;
}

export function toggleCodeStatus(id: string) {
  const codes = getRedeemCodes();
  const updated = codes.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
  saveRedeemCodes(updated);
}

export function deleteRedeemCode(id: string) {
  const codes = getRedeemCodes();
  saveRedeemCodes(codes.filter((c) => c.id !== id));
}

// ─── Plan Configurations ─────────────────────────────────────────────────────

export interface PlanConfig {
  id: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    maxFields: number;
    maxWorkflows: number;
    maxTargets: number;
    aiInsights: boolean;
    advancedAnalytics: boolean;
  };
}

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'Free',
    name: 'Free Starter',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['3 Custom Fields', '1 Active Workflow', 'Basic Analytics'],
    limits: { maxFields: 3, maxWorkflows: 1, maxTargets: 2, aiInsights: false, advancedAnalytics: false },
  },
  {
    id: 'Pro',
    name: 'Pro Creator',
    priceMonthly: 12,
    priceYearly: 120,
    features: ['Unlimited Fields', '10 Workflows', 'AI Insights', 'Advanced Analytics'],
    limits: { maxFields: 999, maxWorkflows: 10, maxTargets: 10, aiInsights: true, advancedAnalytics: true },
  },
  {
    id: 'Studio',
    name: 'Studio Agency',
    priceMonthly: 29,
    priceYearly: 290,
    features: ['Unlimited Everything', 'Custom Branding', 'Priority Support'],
    limits: { maxFields: 999, maxWorkflows: 999, maxTargets: 999, aiInsights: true, advancedAnalytics: true },
  },
];

export function getPlanConfigs(): PlanConfig[] {
  if (typeof window === 'undefined') return DEFAULT_PLANS;
  try {
    const raw = localStorage.getItem('admin_plan_configs');
    return raw ? JSON.parse(raw) : DEFAULT_PLANS;
  } catch (e) {
    return DEFAULT_PLANS;
  }
}

export function savePlanConfigs(configs: PlanConfig[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_plan_configs', JSON.stringify(configs));
}

// ─── Stats & Users ───────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  planCounts: Record<PlanType, number>;
  activeUpgrades: number;
  totalRedeems: number;
}

export function getAdminStats(): AdminStats {
  if (typeof window === 'undefined') return { totalUsers: 0, planCounts: { Free: 0, Pro: 0, Studio: 0 }, activeUpgrades: 0, totalRedeems: 0 };

  const usersRaw = localStorage.getItem('users');
  const users = usersRaw ? JSON.parse(usersRaw) : {};
  const userEmails = Object.keys(users);

  const planCounts: Record<PlanType, number> = { Free: 0, Pro: 0, Studio: 0 };
  let activeUpgrades = 0;

  userEmails.forEach((email) => {
    const subRaw = localStorage.getItem(`${SUB_PREFIX}${email}`);
    if (subRaw) {
      const sub = JSON.parse(subRaw);
      const plan = (sub.planId as PlanType) || 'Free';
      if (planCounts[plan] !== undefined) planCounts[plan]++;
      if (plan !== 'Free') activeUpgrades++;
    } else {
      planCounts['Free']++;
    }
  });

  const codes = getRedeemCodes();
  const totalRedeems = codes.reduce((sum, c) => sum + c.currentUses, 0);

  return {
    totalUsers: userEmails.length,
    planCounts,
    activeUpgrades,
    totalRedeems,
  };
}

export function getAllUsers() {
  if (typeof window === 'undefined') return [];
  const usersRaw = localStorage.getItem('users');
  const users: Record<string, any> = usersRaw ? JSON.parse(usersRaw) : {};
  
  return Object.entries(users).map(([email, data]) => {
    const subRaw = localStorage.getItem(`${SUB_PREFIX}${email}`);
    const sub = subRaw ? JSON.parse(subRaw) : { planId: 'Free' };
    
    return {
      email,
      fullName: data.fullName,
      role: data.role,
      createdAt: data.createdAt,
      plan: sub.planId || 'Free',
    };
  });
}
