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

import { PlanType, normalizePlan } from './subscription';
export type { PlanType };

import { RedeemCode as CentralRedeemCode, redeemCode as centralRedeemCode, REDEEM_CODES_KEY, Plan } from './subscription';
import { supabase } from './supabase/client';

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

export async function getRedeemCodes(): Promise<RedeemCode[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const { data, error } = await supabase
      .from('redeem_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      code: c.code,
      plan: c.plan?.toLowerCase() as 'pro' | 'studio',
      status: c.status as 'active' | 'disabled' | 'expired',
      maxUses: c.max_uses,
      usedCount: c.used_count,
      expiresAt: c.expires_at,
      createdAt: c.created_at,
      notes: c.notes
    }));
  } catch (e) {
    console.error('[AdminStore] Fetch codes failed:', e);
    // Legacy fallback ONLY if Supabase fails
    const raw = localStorage.getItem(REDEEM_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
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

export async function validateAndRedeemCode(rawInput: string, userEmail: string = 'anonymous'): Promise<{ success: boolean; error?: string; plan?: PlanType }> {
  // Use the new central logic!
  const result = await centralRedeemCode(rawInput);
  return {
    success: result.success,
    error: result.success ? undefined : result.message,
    plan: result.plan ? (result.plan === 'studio' ? 'Studio' : 'Pro') : undefined
  };
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

export async function generateRedeemCode(data: { code: string; planType: PlanType; maxUses: number; expiresAt: string | null; isActive: boolean; notes: string }): Promise<RedeemCode | null> {
  console.log('[AdminStore] Generating new code:', data.code);
  
  try {
    const { data: newCode, error } = await supabase
      .from('redeem_codes')
      .insert({
        code: data.code,
        plan: data.planType.toLowerCase(),
        status: data.isActive ? 'active' : 'disabled',
        max_uses: data.maxUses,
        used_count: 0,
        expires_at: data.expiresAt,
        notes: data.notes
      })
      .select()
      .single();

    if (error) throw error;

    window.dispatchEvent(new Event('admin_codes_updated'));
    
    return {
      id: newCode.id,
      code: newCode.code,
      plan: newCode.plan?.toLowerCase() as 'pro' | 'studio',
      status: newCode.status as 'active' | 'disabled' | 'expired',
      maxUses: newCode.max_uses,
      usedCount: newCode.used_count,
      expiresAt: newCode.expires_at,
      createdAt: newCode.created_at,
      notes: newCode.notes
    };
  } catch (e) {
    console.error('[AdminStore] Generate code failed:', e);
    return null;
  }
}

export async function toggleCodeStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const { error } = await supabase
      .from('redeem_codes')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    window.dispatchEvent(new Event('admin_codes_updated'));
  } catch (e) {
    console.error('[AdminStore] Toggle status failed:', e);
  }
}

export async function deleteRedeemCode(id: string) {
  try {
    const { error } = await supabase
      .from('redeem_codes')
      .delete()
      .eq('id', id);

    if (error) {
      // If delete fails due to foreign key (redemptions), disable instead
      if (error.code === '23503') {
        console.warn('[AdminStore] Code has history, disabling instead of deleting');
        await supabase
          .from('redeem_codes')
          .update({ status: 'disabled' })
          .eq('id', id);
      } else {
        throw error;
      }
    }
    
    window.dispatchEvent(new Event('admin_codes_updated'));
  } catch (e) {
    console.error('[AdminStore] Delete code failed:', e);
  }
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

export async function getAdminStats(): Promise<AdminStats> {
  if (typeof window === 'undefined') return { totalUsers: 0, planCounts: { Free: 0, Pro: 0, Studio: 0 }, activeUpgrades: 0, totalRedeems: 0 };

  try {
    // 1. Fetch user stats
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('plan');

    if (profileError) throw profileError;

    const planCounts: Record<PlanType, number> = { Free: 0, Pro: 0, Studio: 0 };
    let activeUpgrades = 0;

    (profiles || []).forEach((p) => {
      const plan = normalizePlan(p.plan);
      if (planCounts[plan] !== undefined) planCounts[plan]++;
      if (plan !== 'Free') activeUpgrades++;
    });

    // 2. Fetch redeem stats from Supabase
    const { data: codes, error: codeError } = await supabase
      .from('redeem_codes')
      .select('used_count');

    if (codeError) throw codeError;

    const totalRedeems = (codes || []).reduce((sum, c) => sum + (c.used_count || 0), 0);

    return {
      totalUsers: profiles?.length || 0,
      planCounts,
      activeUpgrades,
      totalRedeems,
    };
  } catch (err) {
    console.error('[AdminStore] Stats sync failed:', err);
    return { totalUsers: 0, planCounts: { Free: 0, Pro: 0, Studio: 0 }, activeUpgrades: 0, totalRedeems: 0 };
  }
}

export async function getAllUsers() {
  if (typeof window === 'undefined') return [];
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      throw error || new Error('No profiles found');
    }

    return profiles.map((p) => ({
      email: p.email,
      fullName: p.full_name || p.email?.split('@')[0] || 'User',
      role: p.role || 'user',
      createdAt: p.created_at,
      plan: normalizePlan(p.plan),
    }));
  } catch (err) {
    console.error('[AdminStore] User sync failed:', err);
    return [];
  }
}
