import React from 'react';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import AnalyticsContent from './components/AnalyticsContent';
import AuthGuard from '@/components/AuthGuard';

export default function AnalyticsScreenPage() {
  return (
    <AuthGuard>
      <AppLayout activeRoute="/analytics-screen">
        <AnalyticsContent />
        <ToastContainer />
      </AppLayout>
    </AuthGuard>
  );
}