'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'Dark' | 'Light' | 'System';
export type UIDensity = 'Comfortable' | 'Compact';
export type LandingPage = 'Dashboard' | 'Analytics' | 'Settings';
export type DigestFrequency = 'Daily' | 'Weekly' | 'Never';

export interface AppSettings {
  themeMode: ThemeMode;
  uiDensity: UIDensity;
  cardCornerRadius: number; // 0-100
  blurIntensity: number; // 0-100
  enableAnimations: boolean;
  smoothTransitions: boolean;
  showAIInsights: boolean;
  showStreaks: boolean;
  defaultLandingPage: LandingPage;
  autoCollapseSidebar: boolean;
  hoverExpandSidebar: boolean;
  iconOnlyMinimized: boolean;
  focusTimerAutoStart: boolean;
  dailyResetTime: string;
  enableShortcuts: boolean;
  enableBetaFeatures: boolean;
  // Notification Settings
  emailNotifications: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
  dailyReminderTiming: string;
  digestFrequency: DigestFrequency;
  notifyProductivity: boolean;
  notifyGoals: boolean;
  notifyStreaks: boolean;
  notifyAIInsights: boolean;
  notifyWeeklyReports: boolean;
  notifySystemUpdates: boolean;
}

const defaultSettings: AppSettings = {
  themeMode: 'Dark',
  uiDensity: 'Comfortable',
  cardCornerRadius: 70, // default 8px roughly mapped to 70% range or whatever the slider feels like
  blurIntensity: 40,
  enableAnimations: true,
  smoothTransitions: true,
  showAIInsights: true,
  showStreaks: true,
  defaultLandingPage: 'Dashboard',
  autoCollapseSidebar: false,
  hoverExpandSidebar: true,
  iconOnlyMinimized: false,
  focusTimerAutoStart: false,
  dailyResetTime: '00:00',
  enableShortcuts: true,
  enableBetaFeatures: false,
  // Notification Defaults
  emailNotifications: true,
  desktopNotifications: true,
  soundAlerts: false,
  dailyReminderTiming: '09:00',
  digestFrequency: 'Daily',
  notifyProductivity: true,
  notifyGoals: true,
  notifyStreaks: true,
  notifyAIInsights: true,
  notifyWeeklyReports: true,
  notifySystemUpdates: false,
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings', err);
    }

    // Apply global CSS variables / DOM manipulations based on settings
    const root = document.documentElement;

    // Theme (we'll just apply 'dark' class or remove it based on settings)
    if (settings.themeMode === 'Light') {
      root.classList.remove('dark');
    } else if (settings.themeMode === 'Dark') {
      root.classList.add('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // UI Density (We can map Comfortable to padding 1rem, Compact to 0.5rem via CSS vars, if we had them. For now we can just set a data attribute)
    root.setAttribute('data-density', settings.uiDensity.toLowerCase());

    // Card Corner Radius: map 0-100 to 0px-24px. 70 ~ 16.8px. Wait, original default --radius is 8px.
    // So let's map 0-100 to 0-24px.
    const radiusPx = (settings.cardCornerRadius / 100) * 24;
    root.style.setProperty('--radius', `${radiusPx}px`);

    // Blur Intensity: map 0-100 to 0px-20px
    const blurPx = (settings.blurIntensity / 100) * 20;
    root.style.setProperty('--blur-intensity', `${blurPx}px`);

    // Animations & Transitions
    root.setAttribute('data-animations', settings.enableAnimations.toString());
    root.setAttribute('data-transitions', settings.smoothTransitions.toString());

    // Toggle global animation disabling class if needed
    if (!settings.enableAnimations || !settings.smoothTransitions) {
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--transition-duration');
    }

  }, [settings, mounted]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Render children immediately to support SSR. Client-side effects will update settings.
  // There's no hydration mismatch as long as the initial render uses defaultSettings.

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
