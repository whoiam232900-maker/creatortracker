'use client';

/**
 * REDEEM SYSTEM - Centralized Architecture
 * 
 * This file provides admin actions for:
 * 1. Redeem Code Management (Supabase: 'redeem_codes')
 * 2. User Profile Management (Supabase: 'profiles')
 * 3. Stats and Operational Oversight
 */

import { PlanType, normalizePlan } from './subscription';
export type { PlanType };

import { RedeemCode as CentralRedeemCode, redeemCode as centralRedeemCode, Plan } from './subscription';
import { supabase } from './supabase/client';

// ─── Plan Configurations ─────────────────────────────────────────────────────

import { PlanConfig as CentralPlanConfig, getPlanConfigsFromDB, updatePlanConfigInDB } from './plan-config';
export type PlanConfig = CentralPlanConfig;

export async function getPlanConfigs(): Promise<PlanConfig[]> {
  return getPlanConfigsFromDB();
}

/** @deprecated Use Supabase dashboard for pricing edits */
export async function updatePlanConfig(plan: PlanType, updates: Partial<PlanConfig>) {
  return updatePlanConfigInDB(plan, updates);
}

/** @deprecated Use Supabase dashboard for pricing edits */
export async function savePlanConfigs(configs: PlanConfig[]) {
  console.warn('[AdminStore] savePlanConfigs is deprecated. Manage via Supabase.');
  return { success: true };
}

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
      durationType: c.duration_type,
      durationDays: c.duration_days,
      createdAt: c.created_at,
      notes: c.notes
    }));
  } catch (e) {
    console.error('[AdminStore] Fetch codes failed:', e);
    return [];
  }
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

export async function generateRedeemCode(data: { 
  code: string; 
  planType: PlanType; 
  maxUses: number; 
  expiresAt: string | null; 
  isActive: boolean; 
  notes: string;
  durationType?: string;
  durationDays?: number;
}): Promise<RedeemCode | null> {
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
        duration_type: data.durationType || 'lifetime',
        duration_days: data.durationDays || null,
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
      durationType: newCode.duration_type,
      durationDays: newCode.duration_days,
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
          .update({ 
            status: 'disabled',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        throw error;
      }
    }
    
    window.dispatchEvent(new Event('admin_codes_updated'));
  } catch (e) {
    console.error('[AdminStore] Delete code failed:', e);
    throw e;
  }
}

export async function deleteRedeemCodeWithOptionalRevoke(id: string, shouldRevoke: boolean, plan: 'pro' | 'studio') {
  console.log(`[AdminStore] Deleting code ${id} with revoke=${shouldRevoke}`);
  
  let revokedCount = 0;
  let skippedCount = 0;
  let affectedUserIds: string[] = [];
  let deletedOrDisabled = false;
  let redemptionRecordsFound = 0;

  try {
    // 1. Fetch the redeem code row first from Supabase to ensure UUID is valid and get latest state
    const { data: selectedCode, error: codeError } = await supabase
      .from('redeem_codes')
      .select('id, code, plan, used_count, max_uses, status')
      .eq('id', id)
      .single();
    
    if (codeError) {
      console.error('[AdminStore] Failed to load code:', codeError);
      throw new Error('Failed to load code: ' + codeError.message);
    }

    if (shouldRevoke) {
      // 2. Query redemptions using the correct schema
      const { data: redemptions, error: redemptionError } = await supabase
        .from('redeem_redemptions')
        .select('id, code_id, user_id, previous_plan, new_plan, plan, code_snapshot, user_email_snapshot, redeemed_at')
        .eq('code_id', selectedCode.id);

      if (redemptionError) {
        console.error('[AdminStore] Redemption load failed:', {
          message: redemptionError.message,
          code: redemptionError.code,
          details: redemptionError.details,
          hint: redemptionError.hint
        });
        throw new Error('Failed to load redemption records: ' + redemptionError.message);
      }

      redemptionRecordsFound = redemptions?.length || 0;

      if (redemptions && redemptions.length > 0) {
        const uniqueUserIds = Array.from(new Set(redemptions.map(r => r.user_id).filter(Boolean)));
        
        // 3. For each user, fetch profile and check plan
        
        for (const userId of uniqueUserIds) {
          try {
            // Find the specific redemption row for this user to get new_plan
            const userRedemption: any = redemptions.find(r => r.user_id === userId);
            if (!userRedemption) continue;
            
            // Fallback chain: new_plan -> plan -> code.plan
            const targetPlan = userRedemption.new_plan || userRedemption.plan || normalizePlan(selectedCode.plan).toLowerCase();

            const { data: profile, error: profileFetchError } = await supabase
              .from('profiles')
              .select('id, plan')
              .eq('id', userId)
              .single();
            
            if (profileFetchError) {
              console.warn(`[AdminStore] Could not fetch profile for user ${userId}:`, profileFetchError);
              skippedCount++;
              continue;
            }

            if (normalizePlan(profile.plan).toLowerCase() === targetPlan) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  plan: 'free',
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId);

              if (updateError) {
                console.error(`[AdminStore] Revoke failed for user ${userId}:`, updateError);
                if (updateError.code === '42501') {
                  throw new Error('Revoke failed: admin does not have permission to update profiles.');
                }
                skippedCount++;
              } else {
                revokedCount++;
                affectedUserIds.push(userId);
              }
            } else {
              console.log(`[AdminStore] Skipping user ${userId}: current plan ${profile.plan} != redemption plan ${targetPlan}`);
              skippedCount++;
            }
          } catch (err) {
            console.error(`[AdminStore] Error processing user ${userId}:`, err);
            skippedCount++;
          }
        }
        
        console.log(`[AdminStore] Revoke summary: ${revokedCount} revoked, ${skippedCount} skipped.`);
      }
    }

    // 4. Attempt to delete the code
    const { error: deleteError } = await supabase
      .from('redeem_codes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      // If delete fails due to foreign key (redemption history), fallback to disabled status
      if (deleteError.code === '23503') {
        console.warn('[AdminStore] FK Constraint: Disabling instead of deleting');
        const { error: updateError } = await supabase
          .from('redeem_codes')
          .update({ 
            status: 'disabled',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
        deletedOrDisabled = true;
      } else {
        throw deleteError;
      }
    } else {
      deletedOrDisabled = true;
    }
    
    window.dispatchEvent(new Event('admin_codes_updated'));
    return { 
      success: true,
      deletedOrDisabled,
      revokedCount,
      skippedCount,
      affectedUserIds,
      redemptionRecordsFound
    };
  } catch (e: any) {
    console.error('[AdminStore] Delete with optional revoke failed', e);
    throw e;
  }
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
      id: p.id,
      email: p.email,
      fullName: p.full_name || p.email?.split('@')[0] || 'User',
      role: p.role || 'user',
      createdAt: p.created_at,
      plan: normalizePlan(p.plan),
      status: p.status || 'active',
      suspendedAt: p.suspended_at,
      suspendedUntil: p.suspended_until,
      suspensionReason: p.suspension_reason,
      terminatedAt: p.terminated_at,
      terminationReason: p.termination_reason
    }));
  } catch (err) {
    console.error('[AdminStore] User sync failed:', err);
    return [];
  }
}

export async function suspendUser(userId: string, durationHours: number | null, reason: string) {
  try {
    let suspendedUntil = null;
    if (durationHours !== null) {
      const date = new Date();
      date.setHours(date.getHours() + durationHours);
      suspendedUntil = date.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspended_until: suspendedUntil,
        suspension_reason: reason || 'Account under review',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    window.dispatchEvent(new Event('admin_users_updated'));
    return { success: true };
  } catch (err) {
    console.error('[AdminStore] Suspend failed:', err);
    throw err;
  }
}

export async function unsuspendUser(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        status: 'active',
        suspended_at: null,
        suspended_until: null,
        suspension_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    window.dispatchEvent(new Event('admin_users_updated'));
    return { success: true };
  } catch (err) {
    console.error('[AdminStore] Unsuspend failed:', err);
    throw err;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    // List of allowed fields for security
    const allowedFields = [
      'full_name', 
      'role', 
      'plan', 
      'status', 
      'suspended_at', 
      'suspended_until', 
      'suspension_reason',
      'termination_reason'
    ];
    
    const cleanUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        cleanUpdates[key] = updates[key];
      }
    });

    const { error } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId);

    if (error) {
      if (error.code === '42501') {
        throw new Error('Admin update blocked by Supabase policy. Check profiles UPDATE policy.');
      }
      throw error;
    }
    
    window.dispatchEvent(new Event('admin_users_updated'));
    return { success: true };
  } catch (err) {
    console.error('[AdminStore] Update profile failed:', err);
    throw err;
  }
}
