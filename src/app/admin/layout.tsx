'use client';

import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
        <AdminSidebar />
        <main className="pl-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
