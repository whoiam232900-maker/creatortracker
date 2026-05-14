import React from 'react';
import AppLayout from '@/components/AppLayout';

import TrackerDashboardContent from '../components/TrackerDashboardContent';
import AuthGuard from '@/components/AuthGuard';

export default function TrackerDashboardPage() {
  return (
    <AuthGuard>
      <AppLayout activeRoute="/dashboard">
        <TrackerDashboardContent />
      </AppLayout>
    </AuthGuard>
  );
}
