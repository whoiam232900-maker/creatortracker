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

import { RedeemCode as CentralRedeemCode, redeemCode as centralRedeemCode, REDEEM_CODES_KEY, Plan } from './subscription';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY_SESSION = 'userSession';
const SUB_PREFIX = 'subscription_';

export type RedeemCode = CentralRedeemCode & { notes?: string }; // Add notes for admin UI

// ─── Normalization ───────────────────────────────────────────────────────────

export function normalizeRedeemCode(c: string): string {
  if (!c || typeof c !== 'string') return '';
  return c.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// ─── Store Core ──────────────────────────────────────────────────────────────

export function getRedeemCodes(): RedeemCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REDEEM_CODES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('[Redeem-Trace] [STORAGE] Parse failure:', e);
    return [];
  }
}

export function saveRedeemCodes(codes: RedeemCode[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REDEEM_CODES_KEY, JSON.stringify(codes));
  
  // Broadcast updates
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('admin_codes_updated'));
}

// ─── Redemption & Activation ─────────────────────────────────────────────────

export function validateAndRedeemCode(rawInput: string, userEmail: string = 'anonymous'): { success: boolean; error?: string; plan?: PlanType } {
  // Use the new central logic!
  const result = centralRedeemCode(rawInput);
  return {
    success: result.success,
    error: result.success ? undefined : result.message,
    plan: result.plan ? (result.plan === 'studio' ? 'Studio' : 'Pro') : undefined
  };
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

export function generateRedeemCode(data: { code: string; planType: PlanType; maxUses: number; expiresAt: string | null; isActive: boolean; notes: string }): RedeemCode {
  console.log('[Redeem-Trace] Admin: Generating new code:', data.code);
  const codes = getRedeemCodes();
  const newCode: RedeemCode = {
    id: `code-${Date.now()}`,
    code: data.code,
    plan: (data.planType === 'Studio' ? 'studio' : 'pro'),
    status: data.isActive ? 'active' : 'expired', // map boolean to string status
    maxUses: data.maxUses,
    usedCount: 0,
    expiresAt: data.expiresAt,
    createdAt: new Date().toISOString(),
    notes: data.notes
  };
  saveRedeemCodes([newCode, ...codes]);
  return newCode;
}

export function toggleCodeStatus(id: string) {
  const codes = getRedeemCodes();
  const updated = codes.map((c) => {
    if (c.id === id) {
      return { ...c, status: c.status === 'active' ? 'expired' : 'active' } as RedeemCode;
    }
    return c;
  });
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
  const totalRedeems = codes.reduce((sum, c) => sum + (c.usedCount || 0), 0);

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
