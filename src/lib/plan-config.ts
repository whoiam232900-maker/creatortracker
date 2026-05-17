import { supabase } from './supabase/client';
import { PlanType, normalizePlan } from './subscription';

/**
 * PlanConfig represents the database structure and application state
 * for subscription tiers.
 */
export interface PlanConfig {
  plan: PlanType;
  display_name: string;
  price_monthly_usd: number;
  price_yearly_usd: number;
  price_monthly_inr: number;
  price_yearly_inr: number;
  custom_fields_limit: number;
  workflows_limit: number;
  daily_targets_limit: number;
  ai_enabled: boolean;
  advanced_analytics_enabled: boolean;
  features: string[];
}

/**
 * Centered fallback defaults for the entire application.
 * Values requested for Phase 2H stabilization:
 * Pro: $4.99/mo, $49/yr, ₹299/mo, ₹2999/yr
 * Studio: $29/mo, $249/yr, ₹2499/mo, ₹19999/yr
 */
export const DEFAULT_PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  Free: {
    plan: 'Free',
    display_name: 'Free Starter',
    price_monthly_usd: 0,
    price_yearly_usd: 0,
    price_monthly_inr: 0,
    price_yearly_inr: 0,
    custom_fields_limit: 3,
    workflows_limit: 1,
    daily_targets_limit: 2,
    ai_enabled: false,
    advanced_analytics_enabled: false,
    features: ['3 Custom Fields', '1 Active Workflow', 'Basic Analytics'],
  },
  Pro: {
    plan: 'Pro',
    display_name: 'Pro Creator',
    price_monthly_usd: 4.99,
    price_yearly_usd: 49,
    price_monthly_inr: 299,
    price_yearly_inr: 2999,
    custom_fields_limit: 999,
    workflows_limit: 10,
    daily_targets_limit: 10,
    ai_enabled: true,
    advanced_analytics_enabled: true,
    features: ['Unlimited Fields', '10 Workflows', 'AI Insights', 'Advanced Analytics'],
  },
  Studio: {
    plan: 'Studio',
    display_name: 'Studio Agency',
    price_monthly_usd: 29,
    price_yearly_usd: 249,
    price_monthly_inr: 2499,
    price_yearly_inr: 19999,
    custom_fields_limit: 999,
    workflows_limit: 999,
    daily_targets_limit: 999,
    ai_enabled: true,
    advanced_analytics_enabled: true,
    features: ['Unlimited Everything', 'Custom Branding', 'Priority Support'],
  },
};

/**
 * Safely converts a DB row to PlanConfig, handling nulls and backward compatibility.
 */
export function normalizePlanConfig(row: any): PlanConfig {
  const plan = normalizePlan(row.plan);
  const defaults = DEFAULT_PLAN_CONFIGS[plan];

  return {
    plan: plan,
    display_name: row.display_name ?? defaults.display_name,
    // Use numeric USD fields with fallback to old monthly_price
    price_monthly_usd: Number(row.price_monthly_usd ?? row.monthly_price ?? defaults.price_monthly_usd),
    price_yearly_usd: Number(row.price_yearly_usd ?? row.yearly_price ?? defaults.price_yearly_usd),
    price_monthly_inr: Number(row.price_monthly_inr ?? defaults.price_monthly_inr),
    price_yearly_inr: Number(row.price_yearly_inr ?? defaults.price_yearly_inr),
    custom_fields_limit: row.custom_fields_limit ?? defaults.custom_fields_limit,
    workflows_limit: row.workflows_limit ?? defaults.workflows_limit,
    daily_targets_limit: row.daily_targets_limit ?? defaults.daily_targets_limit,
    ai_enabled: row.ai_enabled ?? defaults.ai_enabled,
    advanced_analytics_enabled: row.advanced_analytics_enabled ?? defaults.advanced_analytics_enabled,
    features: row.features ?? defaults.features,
  };
}

/**
 * Fetches latest configurations from Supabase.
 * ONLY SELECTs from the database. Does not insert or update.
 */
export async function getPlanConfigsFromDB(): Promise<PlanConfig[]> {
  try {
    const { data, error } = await supabase
      .from('plan_configs')
      .select('*')
      .order('plan', { ascending: true });

    if (error) {
      console.error('[plan-config] Supabase fetch error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return Object.values(DEFAULT_PLAN_CONFIGS);
    }

    if (!data || data.length === 0) {
      return Object.values(DEFAULT_PLAN_CONFIGS);
    }

    const configs = data.map(normalizePlanConfig);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[plan-config] Fetched from DB:', configs);
    }

    return configs;
  } catch (e) {
    console.error('[plan-config] Critical fetch error:', e);
    return Object.values(DEFAULT_PLAN_CONFIGS);
  }
}

/**
 * Updates a single plan configuration in the database.
 * @deprecated Removed from Admin UI for stability. Manage via Supabase dashboard.
 */
export async function updatePlanConfigInDB(plan: PlanType, updates: Partial<PlanConfig>) {
  console.warn('[plan-config] updatePlanConfigInDB called but UI editing is disabled.');
  const dbPlan = plan.toLowerCase();
  
  // Ensure we are not sending 'plan' in the update payload
  const { plan: _, ...cleanUpdates } = updates;

  const { data, error } = await supabase
    .from('plan_configs')
    .update({
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('plan', dbPlan)
    .select();

  if (error) {
    console.error('[plan-config] Update error:', error);
    throw error;
  }
  
  return data ? normalizePlanConfig(data[0]) : null;
}

/**
 * Helper to get the correct price based on user selection.
 */
export function getPlanPrice(config: PlanConfig, currency: 'USD' | 'INR' | string, billingPeriod: 'Monthly' | 'Yearly'): number {
  if (currency === 'INR') {
    return billingPeriod === 'Yearly' ? config.price_yearly_inr : config.price_monthly_inr;
  }
  return billingPeriod === 'Yearly' ? config.price_yearly_usd : config.price_monthly_usd;
}

/**
 * Formats price for display, handling decimals for USD and integers for INR.
 */
export function formatPlanPrice(amount: number, currency: 'USD' | 'INR' | string, billingPeriod: 'Monthly' | 'Yearly' | string): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const suffix = billingPeriod === 'Yearly' ? '/yr' : '/mo';
  
  if (amount === 0) return `${symbol}0 /forever`;

  // Format with commas and handle decimals if USD
  const formattedAmount = currency === 'USD' 
    ? amount.toLocaleString(undefined, { minimumFractionDigits: amount % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })
    : Math.floor(amount).toLocaleString();

  return `${symbol}${formattedAmount}${suffix}`;
}
