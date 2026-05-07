'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const getWorkspaceName = () => {
    let workspaceName = "My Workspace";
    try {
      const aiDataRaw = localStorage.getItem('onboardingData');
      if (aiDataRaw) {
        const aiData = JSON.parse(aiDataRaw);
        if (aiData.role) {
          workspaceName = `${aiData.role} Workspace`;
        }
      } else {
        const manualSetupRaw = localStorage.getItem('manualSetup');
        if (manualSetupRaw) {
          workspaceName = "Custom Workspace";
        }
      }
    } catch (e) {}
    return workspaceName;
  };

  const handleAuth = () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      // Admin Credential Check
      const isAdminLogin = email === "Kabenix_is_admin" && password === "****New****Tracker";
      
      let sessionData = null;

      if (isAdminLogin) {
        sessionData = {
          isLoggedIn: true,
          isAdmin: true,
          plan: "Pro",
          email
        };
      } else {
        const usersRaw = localStorage.getItem('users');
        const users = usersRaw ? JSON.parse(usersRaw) : {};

        if (isSignUp) {
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          if (users[email]) {
            setError('User already exists');
            return;
          }
          
          users[email] = { password };
          localStorage.setItem('users', JSON.stringify(users));
          
          sessionData = {
            isLoggedIn: true,
            isAdmin: false,
            plan: "Free",
            email
          };
        } else {
          // Login
          if (!users[email]) {
            setError('User not found');
            return;
          }
          if (users[email].password !== password) {
            setError('Incorrect password');
            return;
          }
          
          sessionData = {
            isLoggedIn: true,
            isAdmin: false,
            plan: "Free",
            email
          };
        }
      }

      // Success
      if (sessionData) {
        const workspaceName = getWorkspaceName();
        localStorage.setItem('userSession', JSON.stringify({
          ...sessionData,
          workspaceName
        }));
        router?.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred');
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
            {isSignUp ? 'Sign up for your CreatorTracker account' : 'Sign in to your CreatorTracker account'}
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
              />
            </div>
          )}
        </div>

        <button
          className="btn-primary w-full py-2.5"
          onClick={handleAuth}
        >
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
      </div>
    </div>
  );
}
