'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck } from 'lucide-react';

// ── Inner component that uses useSearchParams (must be inside Suspense) ─────
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.isLoggedIn === true && session?.isNewAccount !== true) {
          router.replace(getLandingRoute());
        }
      }
    } catch (e) {
      // ignore
    }
  }, [router, searchParams]);

  const isPasswordValid = password.length >= 8;
  const isConfirmMatch = password === confirmPassword;
  const canSubmit = isSignUp 
    ? (fullName && email && isPasswordValid && isConfirmMatch) 
    : (email && password);

  const handleAuth = async () => {
    setError('');
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
      await new Promise(resolve => setTimeout(resolve, 800));

      // ── Admin credential check ───────────────────────────────────────────
      const isAdminLogin = email === 'Kabenix_is_admin' && password === '****New****Tracker';

      if (isAdminLogin) {
        const sessionData = {
          isLoggedIn: true,
          isAdmin: true,
          plan: 'Studio',
          email,
          fullName: 'Admin User',
          isNewAccount: false,
          onboardingPath: null,
          remember: keepMeSignedIn
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        localStorage.removeItem('pendingSetupPath');
        router.push(getLandingRoute());
        return;
      }

      // ── Regular user ─────────────────────────────────────────────────────
      const usersRaw = localStorage.getItem('users');
      const users: Record<string, { password: string, fullName?: string }> = usersRaw
        ? JSON.parse(usersRaw)
        : {};

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
        if (users[email]) {
          setError('An account with this email already exists');
          setIsLoading(false);
          return;
        }

        // Register new user
        users[email] = { password, fullName };
        localStorage.setItem('users', JSON.stringify(users));

        const pendingSetupPath = localStorage.getItem('pendingSetupPath') ?? 'ai';
        localStorage.removeItem('pendingSetupPath');

        const sessionData = {
          isLoggedIn: true,
          isAdmin: false,
          plan: 'Free',
          email,
          fullName,
          isNewAccount: true,
          onboardingPath: pendingSetupPath,
          remember: keepMeSignedIn
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));

        if (pendingSetupPath === 'manual') {
          router.push('/onboarding/manual');
        } else {
          router.push('/onboarding/ai');
        }
      } else {
        if (!users[email]) {
          setError('No account found with this email');
          setIsLoading(false);
          return;
        }
        if (users[email].password !== password) {
          setError('Incorrect password');
          setIsLoading(false);
          return;
        }

        const sessionData = {
          isLoggedIn: true,
          isAdmin: false,
          plan: 'Free',
          email,
          fullName: users[email].fullName || email.split('@')[0],
          isNewAccount: false,
          onboardingPath: null,
          remember: keepMeSignedIn
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        router.push(getLandingRoute());
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-lg shadow-primary/5">
             <ShieldCheck className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--foreground)' }}>
            CreatorTracker
          </h1>
        </div>

        <div className="card p-8 flex flex-col gap-6 backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl shadow-black/20 rounded-[24px]">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
              {isSignUp
                ? 'Join thousands of creators tracking their growth'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <X size={14} />
                {error}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Full Name</label>
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
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email</label>
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
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Password</label>
                {!isSignUp && (
                  <button className="text-[10px] font-bold text-primary/70 hover:text-primary uppercase tracking-wider transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
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
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Confirm Password</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
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
                <label htmlFor="remember" className="text-[11px] font-medium text-muted-foreground/60 cursor-pointer select-none">
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

          <p className="text-xs text-center font-medium" style={{ color: 'var(--muted-foreground)' }}>
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
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <ShieldCheck size={12} className="opacity-40" />
            Secure & Encrypted
          </p>
          
          <button
            className="text-[11px] font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors uppercase tracking-widest"
            onClick={() => router.push('/')}
          >
            ← Back to home
          </button>
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
