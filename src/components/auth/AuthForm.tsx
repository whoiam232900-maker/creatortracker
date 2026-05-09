'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, Lock, User, ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import { GoogleIcon, GitHubIcon } from './SocialIcons';
import { useSettings } from '@/contexts/SettingsContext';
import { useUser } from '@/contexts/UserContext';
import { showToast } from '../ui/Toast';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import PasswordStrength from './PasswordStrength';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { login, user } = useUser();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const m = searchParams?.get('mode') as AuthMode;
    if (m === 'signup' || m === 'signin') setMode(m);
    
    if (user) {
      if (user.isNewAccount) {
        const setupChoice = localStorage.getItem('pendingSetupPath');
        if (setupChoice === 'manual') router.replace('/onboarding/manual');
        else router.replace('/onboarding/ai');
      } else {
        router.replace(getLandingRoute());
      }
    }
  }, [router, searchParams, user]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getLandingRoute = () => {
    switch (settings.defaultLandingPage) {
      case 'Analytics': return '/analytics-screen';
      case 'Settings': return '/settings-screen';
      default: return '/dashboard';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';

    if (mode !== 'forgot-password' && !password) newErrors.password = 'Password is required';
    if (mode === 'signup') {
      if (!fullName) newErrors.fullName = 'Name is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (mode === 'forgot-password') {
        showToast({ type: 'success', title: 'Check your email', description: `We've sent password reset instructions to ${email}` });
        setMode('signin');
        return;
      }

      login(email, fullName || email.split('@')[0], mode === 'signup');
    } catch (err) {
      showToast({ type: 'error', title: 'Authentication failed', description: 'Please check your credentials and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-bottom duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {mode === 'signin' && 'Sign in'}
          {mode === 'signup' && 'Create an account'}
          {mode === 'forgot-password' && 'Reset password'}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mode === 'signin' && 'Enter your details to access your workspace.'}
          {mode === 'signup' && 'Start tracking your productivity with precision.'}
          {mode === 'forgot-password' && 'Enter your email to receive a reset link.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        {mode === 'signup' && (
          <AppInput
            label="Full Name"
            icon={User}
            placeholder="Alex Rivera"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
        )}

        <AppInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        {mode !== 'forgot-password' && (
          <div className="space-y-5">
            <AppInput
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            
            {mode === 'signup' && password.length > 0 && (
              <PasswordStrength password={password} />
            )}

            {mode === 'signup' && (
              <AppInput
                label="Confirm Password"
                icon={ShieldCheck}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
            )}
          </div>
        )}

        {mode === 'signin' && (
          <div className="flex items-center justify-between px-0.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-primary border-primary shadow-glow-primary' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`}>
                {rememberMe && <Check size={10} className="text-primary-foreground font-bold" />}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => setMode('forgot-password')}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-all"
            >
              Forgot password?
            </button>
          </div>
        )}

        <AppButton isLoading={loading} type="submit" fullWidth size="lg" className="mt-2" icon={ArrowRight} iconPosition="right">
          {mode === 'signin' && 'Sign in'}
          {mode === 'signup' && 'Get started'}
          {mode === 'forgot-password' && 'Send reset link'}
        </AppButton>
      </form>

      <div className="relative flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AppButton variant="secondary" size="md" className="py-2.5">
          <GoogleIcon size={16} />
          <span className="text-sm font-medium ml-2">Google</span>
        </AppButton>
        <AppButton variant="secondary" size="md" className="py-2.5">
          <GitHubIcon size={16} className="text-foreground/80" />
          <span className="text-sm font-medium ml-2">GitHub</span>
        </AppButton>
      </div>

      <p className="text-center text-sm text-muted-foreground font-medium">
        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setErrors({});
          }}
          className="text-primary font-semibold hover:underline transition-colors"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

function Check({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
