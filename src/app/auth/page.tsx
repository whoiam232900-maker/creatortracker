'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';

// ── Inner component that uses useSearchParams (must be inside Suspense) ─────
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { settings } = useSettings();

  const getLandingRoute = () => {
    switch (settings.defaultLandingPage) {
      case 'Analytics': return '/analytics-screen';
      case 'Settings': return '/settings-screen';
      default: return '/dashboard';
    }
  };

  useEffect(() => {
    const mode = searchParams?.get('mode');
    if (mode === 'signup') setIsSignUp(true);
    if (mode === 'signin') setIsSignUp(false);

    // If user is already logged in and onboarding is complete, skip auth
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.isLoggedIn === true && session?.isNewAccount !== true) {
          console.debug('[auth] Already fully logged in — to default landing page');
          router.replace(getLandingRoute());
        }
      }
    } catch (e) {
      // ignore
    }
  }, [router, searchParams]);

  const handleAuth = () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      // ── Admin credential check ───────────────────────────────────────────
      const isAdminLogin = email === 'Kabenix_is_admin' && password === '****New****Tracker';

      if (isAdminLogin) {
        console.debug('[auth] Admin login detected');
        const sessionData = {
          isLoggedIn: true,
          isAdmin: true,
          plan: 'Max',
          email,
          isNewAccount: false,
          onboardingPath: null,
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        localStorage.removeItem('pendingSetupPath');
        router.push(getLandingRoute());
        return;
      }

      // ── Regular user ─────────────────────────────────────────────────────
      const usersRaw = localStorage.getItem('users');
      const users: Record<string, { password: string }> = usersRaw
        ? JSON.parse(usersRaw)
        : {};

      if (isSignUp) {
        // ── Sign Up ────────────────────────────────────────────────────────
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (users[email]) {
          setError('An account with this email already exists. Please sign in.');
          return;
        }

        // Register new user
        users[email] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        console.debug('[auth] New account created for:', email);

        // Read the setup path the user chose on the landing page
        const pendingSetupPath = localStorage.getItem('pendingSetupPath') ?? 'ai';
        localStorage.removeItem('pendingSetupPath'); // consume it
        console.debug('[auth] Consumed pendingSetupPath:', pendingSetupPath);

        const sessionData = {
          isLoggedIn: true,
          isAdmin: false,
          plan: 'Free',
          email,
          isNewAccount: true,              // ← allows onboarding pages to run
          onboardingPath: pendingSetupPath, // ← which onboarding flow to use
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));

        // Route to the correct onboarding start
        if (pendingSetupPath === 'manual') {
          router.push('/onboarding/manual');
        } else {
          router.push('/onboarding/ai');
        }
      } else {
        // ── Login (existing user) ──────────────────────────────────────────
        if (!users[email]) {
          setError('No account found with this email. Did you mean to sign up?');
          return;
        }
        if (users[email].password !== password) {
          setError('Incorrect password');
          return;
        }

        console.debug('[auth] Existing user logged in:', email);

        const sessionData = {
          isLoggedIn: true,
          isAdmin: false,
          plan: 'Free',
          email,
          isNewAccount: false, // ← never re-run onboarding for existing users
          onboardingPath: null,
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));

        // Go straight to dashboard or preferred landing page — existing data is stored under their key
        router.push(getLandingRoute());
      }
    } catch (err) {
      console.error('[auth] Error during auth:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="card p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {isSignUp
              ? 'Sign up for your CreatorTracker account'
              : 'Sign in to your CreatorTracker account'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
          )}
        </div>

        <button className="btn-primary w-full py-2.5" onClick={handleAuth}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            className="font-medium hover:underline transition-all"
            style={{ color: 'var(--primary)' }}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
          >
            {isSignUp ? 'Sign in' : 'Get started free'}
          </button>
        </p>

        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          <button
            className="hover:underline transition-all"
            onClick={() => router.push('/')}
          >
            ← Back to home
          </button>
        </p>
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
