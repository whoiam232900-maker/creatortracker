import React from 'react';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import SettingsContent from './components/SettingsContent';

export default function SettingsScreenPage() {
  return (
    <AppLayout activeRoute="/settings-screen">
      <SettingsContent />
      <ToastContainer />
    </AppLayout>
  );
}