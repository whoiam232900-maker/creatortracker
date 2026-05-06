import React from 'react';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import AnalyticsContent from './components/AnalyticsContent';

export default function AnalyticsScreenPage() {
  return (
    <AppLayout activeRoute="/analytics-screen">
      <AnalyticsContent />
      <ToastContainer />
    </AppLayout>
  );
}