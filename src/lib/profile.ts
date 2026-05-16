import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/auth-utils';
import { normalizePlan } from './subscription';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'studio';
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches the user profile from Supabase.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data as UserProfile;
}

/**
 * Ensures a profile exists in the Supabase database.
 * Does not overwrite existing non-null fields to avoid resetting plan/role.
 */
export async function ensureProfile(user: { id: string; email?: string; user_metadata?: any }): Promise<UserProfile> {
  const existingProfile = await getProfile(user.id);
  
  if (existingProfile) {
    // Optionally update email or full_name if missing in db but present in user metadata
    let updates: Partial<UserProfile> = {};
    if (!existingProfile.full_name && user.user_metadata?.full_name) {
      updates.full_name = user.user_metadata.full_name;
    }
    
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (!error && data) {
        return data as UserProfile;
      }
    }
    return existingProfile;
  }

  // Determine initial role and plan based on email
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const initialRole = isAdmin ? 'admin' : 'user';
  const initialPlan = isAdmin ? 'studio' : 'free';
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';

  // Create new profile
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: initialRole,
      plan: initialPlan
    }])
    .select()
    .single();

  if (error || !data) {
    console.error('[profile] Failed to create profile row:', error);
    // Return a fallback profile so the app can continue
    return {
      id: user.id,
      email: user.email || '',
      full_name: fullName,
      role: initialRole,
      plan: initialPlan
    };
  }

  return data as UserProfile;
}

/**
 * Fetches the latest profile and rewrites localStorage 'userSession'.
 */
export async function syncUserSessionFromSupabase(
  user: { id: string; email?: string; user_metadata?: any },
  overrides?: { isNewAccount?: boolean; onboardingPath?: string | null; remember?: boolean }
) {
  if (typeof window === 'undefined') return null;

  // 1. Ensure profile exists and get the latest
  const profile = await ensureProfile(user);

  // 2. Determine existing onboarding state if any
  let isNewAccount = overrides?.isNewAccount ?? false;
  let onboardingPath = overrides?.onboardingPath ?? null;
  let keepMeSignedIn = overrides?.remember ?? true;
  
  if (!overrides) {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const existingSession = JSON.parse(raw);
        isNewAccount = existingSession.isNewAccount ?? false;
        onboardingPath = existingSession.onboardingPath ?? null;
        keepMeSignedIn = existingSession.remember ?? true;
      }
    } catch (e) {}
  }

  // 3. Check for persistent local subscription upgrade so we don't downgrade
  let currentPlan = normalizePlan(profile.plan || 'free');
  const email = profile.email || user.email || '';
  const subKey = `subscription_${email}`;
  try {
    const existingSubRaw = localStorage.getItem(subKey);
    if (existingSubRaw) {
      const subData = JSON.parse(existingSubRaw);
      // If local subscription is stronger than profile plan, favor local
      if (subData.plan && subData.plan !== 'free' && subData.plan !== 'Free') {
        currentPlan = normalizePlan(subData.plan);
      }
    }
  } catch (e) {}

  // 4. Build fresh user session shape
  const sessionData = {
    id: profile.id,
    email: email,
    fullName: profile.full_name || user.user_metadata?.full_name || '',
    role: profile.role || 'user',
    plan: currentPlan,
    provider: 'supabase',
    isLoggedIn: true,
    isNewAccount,
    onboardingPath,
    remember: keepMeSignedIn
  };

  // 5. Write back to localStorage
  localStorage.setItem('userSession', JSON.stringify(sessionData));
  
  // Dispatch update events
  window.dispatchEvent(new Event('userSessionUpdated'));
  window.dispatchEvent(new Event('subscriptionUpdated'));
  window.dispatchEvent(new Event('storage'));
  
  console.debug('[profile] Synced userSession from Supabase profiles', sessionData);
  return sessionData;
}
