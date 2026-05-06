'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="card p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Welcome back
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Sign in to your CreatorTracker account
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
        </div>

        <button
          className="btn-primary w-full py-2.5"
          onClick={() => router?.push('/dashboard')}
        >
          Sign In
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          Don&apos;t have an account?{' '}
          <button
            className="font-medium"
            style={{ color: 'var(--primary)' }}
            onClick={() => router?.push('/dashboard')}
          >
            Get started free
          </button>
        </p>
      </div>
    </div>
  );
}
