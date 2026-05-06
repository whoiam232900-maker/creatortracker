import React from 'react';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import TrackerDashboardContent from '../components/TrackerDashboardContent';

export default function TrackerDashboardPage() {
  return (
    <AppLayout activeRoute="/dashboard">
      <TrackerDashboardContent />
      <ToastContainer />
    </AppLayout>
  );
}
