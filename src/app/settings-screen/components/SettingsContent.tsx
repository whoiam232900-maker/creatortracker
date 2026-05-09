'use client';

import React, { useState, useCallback } from 'react';
import { 
  TrackingField, TargetConfig, resetUserData 
} from '@/lib/store';
import { useWorkspaceData } from '@/contexts/WorkspaceDataContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUser } from '@/contexts/UserContext';
import { showToast } from '@/components/ui/Toast';

import ConfirmModal from '@/components/ui/ConfirmModal';
import AppBadge from '@/components/ui/AppBadge';
import AppSwitch from '@/components/ui/AppSwitch';
import AppButton from '@/components/ui/AppButton';
import AppCard from '@/components/ui/AppCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

import FieldForm from './FieldForm';
import TargetForm from './TargetForm';

import {
  Settings as SettingsIcon, Plus, Edit2, Trash2, 
  Target as TargetIcon, AlertTriangle, Hash, 
  Database, RefreshCw, Sun, Moon
} from 'lucide-react';

type SettingsTab = 'fields' | 'targets' | 'danger';

export default function SettingsContent() {
  const { data, isLoading, updateFields, updateEntries, updateTargets } = useWorkspaceData();
  const { activeWorkspace } = useWorkspace();
  const { user } = useUser();
  const { settings, updateSetting } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('fields');
  const [editingField, setEditingField] = useState<TrackingField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  
  const [deleteFieldConfirm, setDeleteFieldConfirm] = useState<string | null>(null);
  const [clearEntriesConfirm, setClearEntriesConfirm] = useState(false);
  const [resetAllConfirm, setResetAllConfirm] = useState(false);

  const handleSaveField = useCallback((field: TrackingField) => {
    const existing = data.fields.findIndex(f => f.id === field.id);
    let newFields: TrackingField[];
    if (existing >= 0) {
      newFields = data.fields.map(f => f.id === field.id ? field : f);
    } else {
      newFields = [...data.fields, field];
    }
    updateFields(newFields);
    setShowFieldForm(false);
    setEditingField(null);
    showToast({ type: 'success', title: editingField ? 'Field Updated' : 'Field Created' });
  }, [data.fields, editingField, updateFields]);

  const handleDeleteField = useCallback((id: string) => {
    updateFields(data.fields.filter(f => f.id !== id));
    updateTargets(data.targets.filter(t => t.fieldId !== id));
    setDeleteFieldConfirm(null);
    showToast({ type: 'success', title: 'Field Deleted' });
  }, [data.fields, data.targets, updateFields, updateTargets]);

  const handleSaveTarget = useCallback((target: TargetConfig) => {
    const existing = data.targets.findIndex(t => t.fieldId === target.fieldId);
    let newTargets: TargetConfig[];
    if (existing >= 0) {
      newTargets = data.targets.map(t => t.fieldId === target.fieldId ? target : t);
    } else {
      newTargets = [...data.targets, target];
    }
    updateTargets(newTargets);
    showToast({ type: 'success', title: 'Target Saved' });
  }, [data.targets, updateTargets]);

  const handleDeleteTarget = useCallback((fieldId: string) => {
    updateTargets(data.targets.filter(t => t.fieldId !== fieldId));
    showToast({ type: 'info', title: 'Target Removed' });
  }, [data.targets, updateTargets]);

  const handleClearEntries = useCallback(() => {
    updateEntries([]);
    setClearEntriesConfirm(false);
    showToast({ type: 'success', title: 'Entries Cleared' });
  }, [updateEntries]);

  const handleResetAll = useCallback(() => {
    if (!user) return;
    resetUserData(activeWorkspace?.id);
    window.location.reload();
  }, [user, activeWorkspace]);

  if (isLoading) return <SettingsSkeleton />;

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'fields', label: 'Tracking Fields', icon: <Hash size={15} /> },
    { id: 'targets', label: 'Targets', icon: <TargetIcon size={15} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={15} /> },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Workspace Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Configure {activeWorkspace?.name || 'your workspace'} data structure.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <Sun size={14} className={settings.themeMode === 'Light' ? 'text-primary' : 'text-muted-foreground'} />
              <AppSwitch 
                checked={settings.themeMode === 'Dark'} 
                onChange={(checked) => updateSetting('themeMode', checked ? 'Dark' : 'Light')}
              />
              <Moon size={14} className={settings.themeMode === 'Dark' ? 'text-primary' : 'text-muted-foreground'} />
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.05]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black transition-all border-b-2 -mb-px ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-2">
                 <p className="text-[10px] font-black text-muted-foreground/60">{data.fields.length} Fields Active</p>
                 <AppButton size="xs" icon={Plus} onClick={() => { setEditingField(null); setShowFieldForm(true); }}>Add Field</AppButton>
              </div>

              {data.fields.length === 0 ? (
                <EmptyState 
                  icon={Database}
                  title="No tracking fields"
                  description="Define what you want to measure to start logging entries."
                />
              ) : (
                <div className="space-y-4">
                   {data.fields.map((f) => (
                     <AppCard key={f.id} noPadding className="group hover:border-white/10 transition-all border-white/[0.05] bg-white/[0.01]">
                        <div className="p-6 flex items-center gap-5">
                          <div className="w-4 h-4 rounded-full shadow-2xl" style={{ backgroundColor: f.color, boxShadow: `0 0 20px ${f.color}40` }} />
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-3">
                                <span className="font-bold text-base text-foreground">{f.name}</span>
                                <AppBadge variant={f.type === 'number' ? 'default' : 'info'} className="text-[9px] font-black tracking-tighter">{f.type}</AppBadge>
                                {f.unit && <AppBadge variant="neutral" className="text-[9px] font-black tracking-tighter">{f.unit}</AppBadge>}
                             </div>
                             <p className="text-[11px] text-muted-foreground mt-1 font-medium opacity-60">Default fallback: {f.defaultValue || 'None'}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                             <button onClick={() => { setEditingField(f); setShowFieldForm(true); }} className="p-2.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <Edit2 size={14} />
                             </button>
                             <button onClick={() => setDeleteFieldConfirm(f.id)} className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                     </AppCard>
                   ))}
                </div>
              )}
           </div>

           <div>
              {showFieldForm ? (
                <AppCard className="shadow-2xl sticky top-8 border-primary/20 bg-primary/[0.02]">
                   <h3 className="font-black text-xs text-primary mb-8 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><SettingsIcon size={14} /></div>
                      {editingField ? 'Edit Field' : 'New Field'}
                   </h3>
                   <FieldForm 
                    existingField={editingField}
                    fieldCount={data.fields.length}
                    onSave={handleSaveField}
                    onCancel={() => setShowFieldForm(false)}
                   />
                </AppCard>
              ) : (
                <AppCard className="border-dashed flex flex-col items-center justify-center text-center py-20 opacity-30">
                   <Database size={40} className="mb-6 text-muted-foreground/30" />
                   <p className="text-sm font-bold text-foreground">Field Editor</p>
                   <p className="text-xs mt-2 text-muted-foreground font-medium">Select a field or click "Add" to configure.</p>
                </AppCard>
              )}
           </div>
        </div>
      )}

      {activeTab === 'targets' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
           <div className="px-2">
             <h2 className="text-lg font-bold text-foreground">Goal Configuration</h2>
             <p className="text-sm text-muted-foreground mt-1 font-medium italic opacity-60">Set objectives for your numeric trackers to visualize progress on the hub.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {data.fields.filter(f => f.type === 'number').map(f => (
                <TargetForm 
                  key={f.id}
                  field={f}
                  existingTarget={data.targets.find(t => t.fieldId === f.id) || null}
                  onSave={handleSaveTarget}
                  onDelete={() => handleDeleteTarget(f.id)}
                />
              ))}
           </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom duration-500">
           <AppCard noPadding className="border-red-500/10 bg-red-500/[0.01]">
              <div className="p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-red-500/[0.01] transition-colors group">
                 <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground group-hover:text-red-500 transition-colors">Clear Performance Data</p>
                    <p className="text-sm text-muted-foreground font-medium opacity-60">Permanently wipe all {data.entries.length} logged entries. Your fields will remain.</p>
                 </div>
                 <AppButton variant="outline" size="md" className="border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white" disabled={data.entries.length === 0} onClick={() => setClearEntriesConfirm(true)}>Clear Logs</AppButton>
              </div>
              <div className="h-px bg-red-500/10 mx-8 sm:mx-10" />
              <div className="p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-red-500/[0.01] transition-colors group">
                 <div className="space-y-1">
                    <p className="text-lg font-bold text-red-500">Destroy Workspace</p>
                    <p className="text-sm text-muted-foreground font-medium opacity-60">Delete EVERYTHING including fields, targets, and settings. This is fatal.</p>
                 </div>
                 <AppButton variant="danger" size="md" onClick={() => setResetAllConfirm(true)}>Reset Workspace</AppButton>
              </div>
           </AppCard>
           <p className="text-xs text-muted-foreground text-center font-medium opacity-40 px-10 leading-relaxed">
             Security Note: Data destruction is irreversible. Please ensure you have backed up any critical tracking information before proceeding.
           </p>
        </div>
      )}

      <ConfirmModal 
        open={deleteFieldConfirm !== null}
        title="Delete field?"
        description="This will remove the field and all associated entry data across history. This action cannot be reversed."
        onConfirm={() => deleteFieldConfirm && handleDeleteField(deleteFieldConfirm)}
        onCancel={() => setDeleteFieldConfirm(null)}
      />

      <ConfirmModal 
        open={clearEntriesConfirm}
        title="Clear all entries?"
        description="All logged values will be wiped. Your tracking structure and targets will remain intact."
        onConfirm={handleClearEntries}
        onCancel={() => setClearEntriesConfirm(false)}
      />

      <ConfirmModal 
        open={resetAllConfirm}
        title="Reset entire workspace?"
        description="This will completely purge all fields, entries, and targets from this workspace. Fatal action."
        onConfirm={handleResetAll}
        onCancel={() => setResetAllConfirm(false)}
      />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
       <div className="flex justify-between items-center px-2">
          <div className="space-y-3">
             <Skeleton className="h-10 w-64 rounded-2xl" />
             <Skeleton className="h-5 w-48 rounded-xl opacity-40" />
          </div>
          <Skeleton className="h-12 w-32 rounded-2xl" />
       </div>
       <div className="flex gap-4 border-b border-white/[0.05] pb-6">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
             <Skeleton className="h-24 rounded-[2rem]" />
             <Skeleton className="h-24 rounded-[2rem]" />
             <Skeleton className="h-24 rounded-[2rem]" />
          </div>
          <Skeleton className="h-96 rounded-[2rem]" />
       </div>
    </div>
  );
}
