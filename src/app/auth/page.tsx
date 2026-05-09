'use client';
import React, { Suspense } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#020617]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AuthLayout>
        <AuthForm />
      </AuthLayout>
    </Suspense>
  );
}
