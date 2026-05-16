import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/auth-utils';
import { normalizePlan, PLAN_HIERARCHY } from './subscription';

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
 * Now with a safety timeout and fallback mechanism to prevent infinite loading.
 */
export async function syncUserSessionFromSupabase(
  user: { id: string; email?: string; user_metadata?: any },
  overrides?: { isNewAccount?: boolean; onboardingPath?: string | null; remember?: boolean }
) {
  if (typeof window === 'undefined') return null;

  let profile: UserProfile | null = null;
  
  try {
    // 1. Attempt to ensure profile exists with a timeout
    const profilePromise = ensureProfile(user);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Profile sync timeout')), 4000)
    );

    profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile;
    console.debug('[profile] Profile fetched successfully');
  } catch (error) {
    console.warn('[profile] Profile fetch failed or timed out, using fallback:', error);
  }

  // 2. Determine existing onboarding state and current local plan if sync fails
  let isNewAccount = overrides?.isNewAccount ?? false;
  let onboardingPath = overrides?.onboardingPath ?? null;
  let keepMeSignedIn = overrides?.remember ?? true;
  let localSessionPlan: string | null = null;
  
  if (!overrides) {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const existingSession = JSON.parse(raw);
        isNewAccount = existingSession.isNewAccount ?? false;
        onboardingPath = existingSession.onboardingPath ?? null;
        keepMeSignedIn = existingSession.remember ?? true;
        localSessionPlan = existingSession.plan;
      }
    } catch (e) {}
  }

  // 3. Check for persistent local subscription upgrade and merge with profile plan
  // Priority: 1. Profile from DB, 2. Local Session Plan (if DB fail), 3. local sub record, 4. 'free'
  let currentPlan = normalizePlan(profile?.plan || localSessionPlan || 'free');
  
  const email = profile?.email || user.email || '';
  const subKey = `subscription_${email}`;
  try {
    const existingSubRaw = localStorage.getItem(subKey);
    if (existingSubRaw) {
      const subData = JSON.parse(existingSubRaw);
      const subPlan = subData.plan || subData.planId; // support both keys
      if (subPlan && subPlan !== 'free' && subPlan !== 'Free') {
        const normalizedSub = normalizePlan(subPlan);
        // Only upgrade if local sub record is higher than current
        if (PLAN_HIERARCHY[normalizedSub] > PLAN_HIERARCHY[currentPlan]) {
          currentPlan = normalizedSub;
        }
      }
    }
  } catch (e) {}

  // 4. Build user session (with fallback if profile fetch failed)
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const sessionData = {
    id: profile?.id || user.id,
    email: email,
    fullName: profile?.full_name || user.user_metadata?.full_name || email.split('@')[0] || 'User',
    role: profile?.role || (isAdmin ? 'admin' : 'user'),
    plan: currentPlan,
    provider: 'supabase',
    isLoggedIn: true,
    isNewAccount,
    onboardingPath,
    remember: keepMeSignedIn
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[profile] Supabase profile plan:', profile?.plan);
    console.log('[profile] Normalized plan being written:', currentPlan);
  }

  // 5. Write back to localStorage
  localStorage.setItem('userSession', JSON.stringify(sessionData));
  
  // Consistency: also write to CURRENT_PLAN_KEY (from subscription.ts)
  // We use the lowercase version for CURRENT_PLAN_KEY as per subscription.ts convention
  localStorage.setItem('creatortracker_current_plan', currentPlan.toLowerCase());
  
  // Dispatch update events
  window.dispatchEvent(new Event('userSessionUpdated'));
  window.dispatchEvent(new Event('subscriptionUpdated'));
  window.dispatchEvent(new Event('storage'));
  
  console.debug('[profile] Synced userSession from Supabase profiles', sessionData);
  return sessionData;
}
