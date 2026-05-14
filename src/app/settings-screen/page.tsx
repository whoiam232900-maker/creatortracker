import React from 'react';
import AppLayout from '@/components/AppLayout';

import SettingsContent from './components/SettingsContent';
import AuthGuard from '@/components/AuthGuard';

export default function SettingsScreenPage() {
  return (
    <AuthGuard>
      <AppLayout activeRoute="/settings-screen">
        <SettingsContent />
      </AppLayout>
    </AuthGuard>
  );
}
