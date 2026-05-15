'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { loadState, saveState, AppState } from '@/lib/store';

import { useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AppLayout({ children, activeRoute }: AppLayoutProps) {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('userSession');
      if (!sessionStr) {
        router.push('/auth');
        return;
      }
      const session = JSON.parse(sessionStr);
      if (!session.isLoggedIn) {
        router.push('/auth');
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      router.push('/auth');
      return;
    }

    setMounted(true);
  }, [router]);

  const toggleTheme = useCallback(() => {
    updateSetting('themeMode', settings.themeMode === 'Light' ? 'Dark' : 'Light');
  }, [settings.themeMode, updateSetting]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile overlay — slightly deeper for cinematic focus state */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={settings.autoCollapseSidebar}
        mobileOpen={mobileSidebarOpen}
        activeRoute={activeRoute}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 relative"
        style={{ backgroundColor: 'var(--surface-base, var(--background))' }}
      >
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          theme={settings.themeMode.toLowerCase() as 'light' | 'dark'}
          onThemeToggle={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Atmospheric depth gradient — radial glow behind content, very subtle */}
          <div
            aria-hidden="true"
            data-ct-bg-glow="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '60vh',
              pointerEvents: 'none',
              zIndex: 0,
              background:
                'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(59,130,246,0.05) 0%, transparent 70%)',
            }}
          />
          <div className="max-w-screen-2xl mx-auto px-4 py-6 lg:px-6 xl:px-8 2xl:px-10 relative" style={{ zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
