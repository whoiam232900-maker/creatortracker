'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { 
  AppState, TrackingField, DailyEntry, TargetConfig,
  getWorkspaceStorageKey, loadState, saveState 
} from '@/lib/store';
import { showToast } from '@/components/ui/Toast';

interface WorkspaceDataContextType {
  data: AppState;
  isLoading: boolean;
  updateFields: (fields: TrackingField[]) => void;
  updateEntries: (entries: DailyEntry[]) => void;
  updateTargets: (targets: TargetConfig[]) => void;
  saveData: () => void;
}

const WorkspaceDataContext = createContext<WorkspaceDataContextType | undefined>(undefined);

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const { activeWorkspace } = useWorkspace();
  const [data, setData] = useState<AppState>({ fields: [], entries: [], targets: [], theme: 'dark' });
  const [isLoading, setIsLoading] = useState(true);

  // Load data when active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      setIsLoading(true);
      // Small artificial delay to show skeleton loaders if needed
      const timer = setTimeout(() => {
        const loaded = loadState(activeWorkspace.id);
        
        // If empty (new workspace), maybe we should seed it?
        // For now just set whatever was loaded (which might be empty arrays)
        setData(loaded);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  // Persist data locally when it changes
  useEffect(() => {
    if (activeWorkspace && !isLoading && data.fields.length > 0) {
      saveState(data, activeWorkspace.id);
    }
  }, [data, activeWorkspace?.id, isLoading]);

  const updateFields = useCallback((fields: TrackingField[]) => {
    setData(prev => ({ ...prev, fields }));
  }, []);

  const updateEntries = useCallback((entries: DailyEntry[]) => {
    setData(prev => ({ ...prev, entries }));
  }, []);

  const updateTargets = useCallback((targets: TargetConfig[]) => {
    setData(prev => ({ ...prev, targets }));
  }, []);

  const saveData = useCallback(() => {
    if (activeWorkspace) {
      saveState(data, activeWorkspace.id);
      showToast({ type: 'success', title: 'Data Saved', description: 'Dashboard state has been persisted.' });
    }
  }, [data, activeWorkspace]);

  return (
    <WorkspaceDataContext.Provider value={{ 
      data, 
      isLoading, 
      updateFields, 
      updateEntries, 
      updateTargets, 
      saveData 
    }}>
      {children}
    </WorkspaceDataContext.Provider>
  );
}

export function useWorkspaceData() {
  const context = useContext(WorkspaceDataContext);
  if (context === undefined) {
    throw new Error('useWorkspaceData must be used within a WorkspaceDataProvider');
  }
  return context;
}
