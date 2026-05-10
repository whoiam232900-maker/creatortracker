'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSettings } from '@/contexts/SettingsContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { settings, updateSetting } = useSettings();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleTheme = useCallback(() => {
    updateSetting('themeMode', settings.themeMode === 'Light' ? 'Dark' : 'Light');
  }, [settings.themeMode, updateSetting]);

  // Close mobile sidebar on route change (since we don't have access to pathname here easily without another hook, 
  // and Sidebar already handles its own Link clicks)
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={settings.autoCollapseSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content container */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          theme={settings.themeMode.toLowerCase() as 'light' | 'dark'}
          onThemeToggle={toggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative bg-[#050506]">
          {/* Layered Atmosphere - Cinematic Desktop Glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-900/[0.03] blur-[120px] rounded-full" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-slate-800/[0.02] blur-[100px] rounded-full" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-white/[0.01] blur-[150px] rounded-full" />
          </div>
          
          <div className="max-w-[1400px] mx-auto px-6 py-6 lg:px-10 lg:py-10 min-h-full flex flex-col relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

