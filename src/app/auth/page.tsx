'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import {
  seedAdminAccount,
  validateCredentials,
  clearAllSessions,
  ADMIN_EMAIL,
} from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase/client';
import { syncUserSessionFromSupabase } from '@/lib/profile';

// ── Inner component that uses useSearchParams (must be inside Suspense) ─────
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useSettings();

  const getLandingRoute = () => {
    switch (settings.defaultLandingPage) {
      case 'Analytics':
        return '/analytics-screen';
      case 'Settings':
        return '/settings-screen';
      default:
        return '/dashboard';
    }
  };

  useEffect(() => {
    setIsMounted(true);
    // Ensure admin account exists on load - DISABLED for Phase 2E-1
    // seedAdminAccount();

    const mode = searchParams?.get('mode');
    const reset = searchParams?.get('reset');

    if (reset === 'true') {
      clearAllSessions();
      console.debug('[auth] Sessions cleared via reset flag');
    }

    if (mode === 'signup') setIsSignUp(true);
    if (mode === 'signin') setIsSignUp(false);

    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.isLoggedIn === true && session?.isNewAccount !== true) {
          window.location.href = getLandingRoute();
        }
      }
    } catch (e) {
      // ignore
    }
  }, [router, searchParams]);

  const isPasswordValid = password.length >= 8;
  const isConfirmMatch = password === confirmPassword;
  const canSubmit = isSignUp
    ? fullName && email && isPasswordValid && isConfirmMatch
    : email && password;

  const handleAuth = async () => {
    setError('');
    if (isForgotPassword) return;

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Full name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for premium feel
      await new Promise((resolve) => setTimeout(resolve, 800));

        if (isSignUp) {
        if (!isPasswordValid) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        if (!isConfirmMatch) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // PROTECTION: Prevent creating a new account with the admin email via signup
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setError('This email is reserved for system administration');
          setIsLoading(false);
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (authError) {
          setError(authError.message);
          setIsLoading(false);
          return;
        }

        console.log('[auth] signup success');

        const pendingSetupPath = localStorage.getItem('pendingSetupPath') ?? 'ai';
        localStorage.removeItem('pendingSetupPath');

        if (data.user) {
          try {
            // Safety timeout around sync to prevent infinite loading
            const syncPromise = syncUserSessionFromSupabase(data.user, {
              isNewAccount: true,
              onboardingPath: pendingSetupPath,
              remember: keepMeSignedIn
            });
            const syncTimeout = new Promise(resolve => setTimeout(resolve, 3000));
            await Promise.race([syncPromise, syncTimeout]);
            console.log('[auth] profile sync complete/timeout');
          } catch (e) {
            console.warn('[auth] sync failed during signup', e);
          }
        }

        const target = pendingSetupPath === 'manual' ? '/onboarding/manual' : '/onboarding/ai';
        console.log('[auth] routing to', target);
        router.push(target);
      } else {
        // Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message || 'Invalid email or password');
          setIsLoading(false);
          return;
        }

        console.log('[auth] login success');

        if (data.user) {
          try {
            // Safety timeout around sync
            const syncPromise = syncUserSessionFromSupabase(data.user, {
              isNewAccount: false,
              onboardingPath: null,
              remember: keepMeSignedIn
            });
            const syncTimeout = new Promise(resolve => setTimeout(resolve, 3000));
            await Promise.race([syncPromise, syncTimeout]);
            console.log('[auth] profile sync complete/timeout');
          } catch (e) {
            console.warn('[auth] sync failed during signin', e);
          }
        }
        const target = getLandingRoute();
        console.log('[auth] routing to', target);
        router.push(target);
      }
    } catch (err) {
      console.error('[auth] Authentication error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      // Small delay before clearing loading to allow transition to start
      setTimeout(() => {
        if (typeof window !== 'undefined') setIsLoading(false);
      }, 500);
    }
  };

  const isTerminated = searchParams?.get('terminated') === '1';
  const isSuspended = searchParams?.get('suspended') === '1';
  const suspendedUntil = searchParams?.get('until');

  const formatSuspendedUntil = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <AppLogo size={80} className="mb-4" />
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--foreground)' }}>
            CreatorTracker
          </h1>
        </div>

        <div className="card p-8 flex flex-col gap-6 backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl shadow-black/20 rounded-[24px] overflow-hidden">
          <div className="flex flex-col gap-1.5 transition-all duration-300">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              {isForgotPassword
                ? 'Password Recovery'
                : isSignUp
                  ? 'Create account'
                  : 'Welcome back'}
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {isForgotPassword
                ? 'Security infrastructure maintenance in progress.'
                : isSignUp
                  ? 'Join thousands of creators tracking their growth'
                  : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {isTerminated && (
            <div className="p-3 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                < ShieldAlert size={14} />
                Your account has been terminated. Contact support if this was a mistake.
              </div>
            </div>
          )}

          {isSuspended && (
            <div className="p-4 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider">Account Under Review</p>
                  <p className="leading-relaxed opacity-80">
                    Your access has been temporarily restricted. 
                    {suspendedUntil && isMounted ? (
                      <> Access will be restored after <span className="underline decoration-amber-500/30">{formatSuspendedUntil(suspendedUntil)}</span>.</>
                    ) : (
                      <> Access will be restored after the review period.</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => window.location.href = 'mailto:support@creatortracker.com?subject=Account Review Request'}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {isForgotPassword ? (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 size={16} className="animate-spin opacity-60" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Infrastructure Update
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground/80">
                  Password recovery is currently unavailable while we complete essential security
                  infrastructure improvements.
                </p>
                <p className="text-[12px] leading-relaxed text-muted-foreground/80">
                  We prioritize your data security and will restore this feature once
                  production-ready systems are fully validated.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="btn-primary w-full py-3 text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Return to Sign In
                </button>
                <p className="text-[11px] text-center text-muted-foreground/40 font-medium">
                  Need immediate help? Contact support.
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2">
                    <X size={14} />
                    {error}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input-field py-2.5 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all bg-white/[0.02] border-white/[0.05]"
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field py-2.5 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all bg-white/[0.02] border-white/[0.05]"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-bold text-primary/70 hover:text-primary uppercase tracking-wider transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field py-2.5 px-4 pr-10 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all bg-white/[0.02] border-white/[0.05] w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {isSignUp && password && (
                    <div className="flex items-center gap-2 ml-1 mt-1 transition-all duration-300">
                      {isPasswordValid ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                          <Check size={12} strokeWidth={3} /> Strong password
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500/70 text-[10px] font-bold uppercase tracking-wider">
                          <X size={12} strokeWidth={3} /> Min. 8 characters
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input-field py-2.5 px-4 pr-10 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all bg-white/[0.02] border-white/[0.05] w-full"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                      />
                      <button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-2 ml-1 mt-0.5 transition-all duration-300">
                        {!isConfirmMatch && (
                          <div className="flex items-center gap-1.5 text-red-500/70 text-[10px] font-bold uppercase tracking-wider">
                            <X size={12} strokeWidth={3} /> Passwords do not match
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-primary focus:ring-offset-background"
                      checked={keepMeSignedIn}
                      onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-[11px] font-medium text-muted-foreground/60 cursor-pointer select-none"
                    >
                      Keep me signed in
                    </label>
                  </div>
                )}
              </div>

              <button
                className="btn-primary w-full py-3 text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                onClick={handleAuth}
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>

              <p
                className="text-xs text-center font-medium"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  className="text-primary font-bold hover:text-primary/80 transition-colors ml-1"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  {isSignUp ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <ShieldCheck size={12} className="opacity-40" />
            Secure & Encrypted
          </p>

          <div className="flex items-center gap-6">
            <button
              className="text-[11px] font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors uppercase tracking-widest"
              onClick={() => window.location.href = '/'}
            >
              ← Back to home
            </button>
            
            <button
              className="text-[11px] font-bold text-red-500/40 hover:text-red-500 transition-colors uppercase tracking-widest"
              onClick={async () => {
                await supabase.auth.signOut();
                console.log('[auth] logout success');
                if(typeof window !== 'undefined') { import('@/lib/supabase/client').then(m => m.supabase.auth.signOut().catch(console.error)); } localStorage.removeItem('userSession');
                window.location.reload();
              }}
            >
              Clear Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page export: wrap in Suspense as required by Next.js for useSearchParams ──
export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
