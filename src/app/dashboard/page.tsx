import React from 'react';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import TrackerDashboardContent from '../components/TrackerDashboardContent';
import AuthGuard from '@/components/AuthGuard';

export default function TrackerDashboardPage() {
  console.log('[TrackerDashboardPage] Rendering root...');
  return (
    <div className="min-h-screen bg-black text-white p-20">
      <h1 className="text-4xl font-bold">Root Dashboard Page Isolation</h1>
      <p className="mt-4">If you see this, the routing works. Now checking Guards/Layout...</p>
      
      <div className="mt-10 border border-white/20 p-8 rounded-2xl">
        <AuthGuard>
          <div className="p-4 bg-green-500/20 rounded-lg mb-4 text-green-400 font-bold">
            AuthGuard Passed
          </div>
          <AppLayout activeRoute="/dashboard">
            <div className="p-4 bg-blue-500/20 rounded-lg text-blue-400 font-bold">
              AppLayout Passed
            </div>
            <TrackerDashboardContent />
          </AppLayout>
        </AuthGuard>
      </div>
    </div>
  );
}
