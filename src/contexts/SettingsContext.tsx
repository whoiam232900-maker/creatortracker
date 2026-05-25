'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDashboardSettings, saveDashboardSettings } from '@/lib/user-data-store';
import { showToast } from '@/components/ui/Toast';

export type ThemeMode = 'Dark' | 'Light' | 'System';
export type UIDensity = 'Comfortable' | 'Compact';
export type LandingPage = 'Dashboard' | 'Analytics' | 'Settings';
export type VisualTheme = 'Original' | 'Cinematic' | 'Cinematic Light';

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
  enableWorkflowTracking: boolean;
  // Dashboard Module Visibility
  showFocusTimer: boolean;
  showWeeklyPulse: boolean;
  showAnalyticsCards: boolean;
  showTargets: boolean;
  showStudyTracker: boolean;
  showEarningsTracker: boolean;
  showProductivitySummary: boolean;
  showRecentEntries: boolean;
  // Visual Theme Identity
  visualTheme: VisualTheme;
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
  enableWorkflowTracking: true,
  showFocusTimer: true,
  showWeeklyPulse: true,
  showAnalyticsCards: true,
  showTargets: true,
  showStudyTracker: false,
  showEarningsTracker: false,
  showProductivitySummary: true,
  showRecentEntries: true,
  visualTheme: 'Cinematic',
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
  openSettings: (tab?: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('Preferences');

  const openSettings = (tab?: string) => {
    if (tab) setActiveSettingsTab(tab);
    setIsSettingsModalOpen(true);
  };

  useEffect(() => {
    async function loadSettings() {
      // Load from local storage initially for speed
      let localData: any = null;
      try {
        const stored = localStorage.getItem('app_settings');
        if (stored) {
          localData = JSON.parse(stored);
          setSettings(prev => ({ ...prev, ...localData }));
        }
      } catch (err) {
        console.error('Failed to load local settings', err);
      }

      // Then fetch from Supabase
      try {
        const remoteData = await getDashboardSettings();
        if (remoteData) {
          setSettings(prev => ({ ...prev, ...remoteData }));
          // Update local cache
          localStorage.setItem('app_settings', JSON.stringify(remoteData));
        } else if (localData) {
          // If remote is null but we have local, migrate local to remote
          await saveDashboardSettings(localData);
        }
      } catch (err) {
        console.debug('Supabase settings fetch skipped/failed (possibly unauthenticated):', err);
      }
      setMounted(true);
    }
    
    loadSettings();

    const handleOpenSettings = (e: any) => {
      if (e.detail?.tab) setActiveSettingsTab(e.detail.tab);
      setIsSettingsModalOpen(true);
    };
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  // We use a ref to track the previous settings so we don't trigger saves on initial load
  const prevSettingsRef = React.useRef(settings);
  
  useEffect(() => {
    if (!mounted) return;
    
    // Check if settings actually changed deeply
    const changed = JSON.stringify(prevSettingsRef.current) !== JSON.stringify(settings);
    if (!changed) return;
    
    prevSettingsRef.current = settings;

    // Save to local storage
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }

    // Save to Supabase (fire and forget for now, but catch errors)
    saveDashboardSettings(settings).catch(err => {
       console.error('Failed to save settings to Supabase', err);
       // We don't want to spam toasts for every slider drag, so we keep it quiet or just show errors
       // showToast({ type: 'error', title: 'Settings Sync Failed', description: 'Could not sync settings to cloud.' });
    });

    // Apply global CSS variables / DOM manipulations based on settings
    const root = document.documentElement;

    // 1. Dark Class Management
    // Cinematic Light is the only light mode for now.
    if (settings.visualTheme === 'Cinematic Light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    // 2. Visual Theme Attribute Management
    // data-visual-theme is the primary selector for theme-cinematic.css
    // 'Cinematic' and 'Cinematic Light' both use 'cinematic' attribute, but differ by .dark class
    const themeValue = settings.visualTheme ?? 'Cinematic';
    if (themeValue === 'Cinematic' || themeValue === 'Cinematic Light') {
      root.setAttribute('data-visual-theme', 'cinematic');
    } else if (themeValue === 'Original') {
      root.setAttribute('data-visual-theme', 'original');
    } else {
      // Fallback to cinematic
      root.setAttribute('data-visual-theme', 'cinematic');
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

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Render children immediately to support SSR. Client-side effects will update settings.
  // There's no hydration mismatch as long as the initial render uses defaultSettings.

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        activeSettingsTab,
        setActiveSettingsTab,
        openSettings,
      }}
    >
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
