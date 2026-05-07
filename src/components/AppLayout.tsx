'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { loadState, saveState, AppState } from '@/lib/store';

import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AppLayout({ children, activeRoute }: AppLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

    const state = loadState();
    setTheme(state.theme);
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist theme
    try {
      const raw = localStorage.getItem('creator_tracker_v2');
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        parsed.theme = theme;
        saveState(parsed);
      }
    } catch {
      // ignore
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        activeRoute={activeRoute}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300"
      >
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          onSidebarToggle={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}