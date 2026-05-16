'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  loadState,
  saveState,
  resetUserData,
  getUserStorageKey,
  AppState,
  TrackingField,
  TargetConfig,
} from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
import FieldForm from './FieldForm';
import TargetForm from './TargetForm';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Target,
  AlertTriangle,
  Hash,
  AlignLeft,
  Database,
  RefreshCw,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

type SettingsTab = 'fields' | 'targets' | 'danger';

export default function SettingsContent() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('fields');
  const [editingField, setEditingField] = useState<TrackingField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [deleteFieldConfirm, setDeleteFieldConfirm] = useState<string | null>(null);
  const [clearEntriesConfirm, setClearEntriesConfirm] = useState(false);
  const [resetAllConfirm, setResetAllConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { withinLimit, triggerUpgrade } = useSubscription();

  useEffect(() => {
    // Resolve userId from session
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.email) {
          setUserId(session.email);
          console.debug('[settings] Resolved userId:', session.email);
        }
      }
    } catch (e) {
      console.warn('[settings] Could not read userSession:', e);
    }

    const s = loadState();
    setState(s);
    setTheme(s.theme);
  }, []);

  const persistState = useCallback(
    (newState: AppState) => {
      saveState(newState, userId);
      setState(newState);
    },
    [userId]
  );

  const handleThemeToggle = useCallback(
    (checked: boolean) => {
      const newTheme: 'light' | 'dark' = checked ? 'dark' : 'light';
      setTheme(newTheme);
      setState((prev) => {
        if (!prev) return prev;
        const newState: AppState = { ...prev, theme: newTheme };
        saveState(newState, userId);
        // Apply to DOM
        if (typeof document !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return newState;
      });
      showToast({ type: 'info', title: `Switched to ${newTheme} mode` });
    },
    [userId]
  );

  const handleSaveField = useCallback(
    (field: TrackingField) => {
      setState((prev) => {
        if (!prev) return prev;
        const existing = prev.fields.findIndex((f) => f.id === field.id);
        let newFields: TrackingField[];
        if (existing >= 0) {
          newFields = prev.fields.map((f) => (f.id === field.id ? field : f));
        } else {
          newFields = [...prev.fields, field];
        }
        const newState = { ...prev, fields: newFields };
        saveState(newState, userId);
        return newState;
      });
      setShowFieldForm(false);
      setEditingField(null);
      showToast({
        type: 'success',
        title: editingField ? 'Field updated' : 'Field created',
        description: `"${field.name}" is now available for tracking`,
      });
    },
    [editingField, userId]
  );

  const handleDeleteField = useCallback(
    (fieldId: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const newFields = prev.fields.filter((f) => f.id !== fieldId);
        const newTargets = prev.targets.filter((t) => t.fieldId !== fieldId);
        const newEntries = prev.entries.map((e) => ({
          ...e,
          values: e.values.filter((v) => v.fieldId !== fieldId),
        }));
        const newState = {
          ...prev,
          fields: newFields,
          targets: newTargets,
          entries: newEntries,
        };
        saveState(newState, userId);
        return newState;
      });
      setDeleteFieldConfirm(null);
      showToast({
        type: 'success',
        title: 'Field deleted',
        description: 'All associated entry data was also removed',
      });
    },
    [userId]
  );

  const handleSaveTarget = useCallback(
    (target: TargetConfig) => {
      setState((prev) => {
        if (!prev) return prev;
        const existing = prev.targets.findIndex(
          (t) => t.fieldId === target.fieldId && t.type === target.type
        );
        let newTargets: TargetConfig[];
        if (existing >= 0) {
          newTargets = prev.targets.map((t, idx) => (idx === existing ? target : t));
        } else {
          if (!withinLimit('targetsLimit', prev.targets.length)) {
            triggerUpgrade();
            return prev; // Or handle error
          }
          newTargets = [...prev.targets, target];
        }
        const newState = { ...prev, targets: newTargets };
        saveState(newState, userId);
        return newState;
      });
      showToast({ type: 'success', title: 'Target saved' });
    },
    [userId]
  );

  const handleDeleteTarget = useCallback(
    (fieldId: string, type: 'daily' | 'weekly') => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = {
          ...prev,
          targets: prev.targets.filter((t) => !(t.fieldId === fieldId && t.type === type)),
        };
        saveState(newState, userId);
        return newState;
      });
      showToast({ type: 'info', title: 'Target removed' });
    },
    [userId]
  );

  const handleClearEntries = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const newState = { ...prev, entries: [] };
      saveState(newState, userId);
      return newState;
    });
    setClearEntriesConfirm(false);
    showToast({
      type: 'success',
      title: 'All entries cleared',
      description: 'Your fields and targets are still intact',
    });
  }, [userId]);

  const handleResetAll = useCallback(() => {
    if (typeof window === 'undefined') return;

    console.debug('[settings] handleResetAll — wiping all data for user:', userId);

    // Clear ALL per-user data (tracker data, onboarding, feature settings)
    resetUserData(userId);

    // Set isNewAccount + clear onboardingPath so user re-chooses AI vs Manual from landing
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        const updatedSession = {
          ...session,
          isNewAccount: true,
          onboardingPath: null, // will be set again when they choose on landing page
        };
        localStorage.setItem('userSession', JSON.stringify(updatedSession));
        // Also clear pendingSetupPath in case it was left over
        localStorage.removeItem('pendingSetupPath');
        console.debug(
          '[settings] isNewAccount=true, onboardingPath cleared — user will re-choose setup'
        );
      }
    } catch (e) {
      console.warn('[settings] Could not update session after reset:', e);
    }

    setResetAllConfirm(false);
    showToast({ type: 'info', title: 'App reset', description: 'Redirecting to setup...' });

    // Redirect to landing so user can re-choose AI or Manual
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }, [userId]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userSession');
    window.location.href = '/auth';
  }, []);

  if (!state) return <SettingsSkeleton />;

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'fields', label: 'Tracking Fields', icon: <Hash size={15} /> },
    { id: 'targets', label: 'Targets', icon: <Target size={15} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={15} /> },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Manage your tracking fields, targets, and preferences
          </p>
        </div>
        {/* Theme toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {theme === 'light' ? (
              <Sun size={15} style={{ color: 'var(--muted-foreground)' }} />
            ) : (
              <Moon size={15} style={{ color: 'var(--muted-foreground)' }} />
            )}
            <Toggle
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
              label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
            />
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={`settings-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
              activeTab === tab.id
                ? 'border-primary'
                : 'border-transparent hover:border-muted-foreground/30',
            ].join(' ')}
            style={{
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottomColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'fields' && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                style={{
                  backgroundColor: activeTab === 'fields' ? 'rgba(37,99,235,0.1)' : 'var(--muted)',
                  color: activeTab === 'fields' ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {state.fields.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'fields' && (
        <FieldsTab
          fields={state.fields}
          showFieldForm={showFieldForm}
          editingField={editingField}
          onAddField={() => {
            setEditingField(null);
            setShowFieldForm(true);
          }}
          onEditField={(field) => {
            setEditingField(field);
            setShowFieldForm(true);
          }}
          onDeleteField={(id) => setDeleteFieldConfirm(id)}
          onSaveField={handleSaveField}
          onCancelFieldForm={() => {
            setShowFieldForm(false);
            setEditingField(null);
          }}
        />
      )}

      {activeTab === 'targets' && (
        <TargetsTab
          fields={state.fields}
          targets={state.targets}
          onSaveTarget={handleSaveTarget}
          onDeleteTarget={handleDeleteTarget}
        />
      )}

      {activeTab === 'danger' && (
        <DangerZoneTab
          entryCount={state.entries.length}
          onClearEntries={() => setClearEntriesConfirm(true)}
          onResetAll={() => setResetAllConfirm(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Modals */}
      <ConfirmModal
        open={deleteFieldConfirm !== null}
        title="Delete this tracking field?"
        description="This will permanently remove the field and all its logged values from every entry. This cannot be undone."
        confirmLabel="Delete Field"
        variant="danger"
        onConfirm={() => deleteFieldConfirm && handleDeleteField(deleteFieldConfirm)}
        onCancel={() => setDeleteFieldConfirm(null)}
      />
      <ConfirmModal
        open={clearEntriesConfirm}
        title="Clear all entries?"
        description="All logged entries will be permanently deleted. Your tracking fields and targets will remain. This cannot be undone."
        confirmLabel="Clear All Entries"
        variant="danger"
        onConfirm={handleClearEntries}
        onCancel={() => setClearEntriesConfirm(false)}
      />
      <ConfirmModal
        open={resetAllConfirm}
        title="Reset entire app?"
        description="This will delete all fields, entries, targets, and settings — returning the app to its default state. This cannot be undone."
        confirmLabel="Reset Everything"
        variant="danger"
        onConfirm={handleResetAll}
        onCancel={() => setResetAllConfirm(false)}
      />
    </div>
  );
}

// ─── Fields Tab ───────────────────────────────────────────────────────────────

function FieldsTab({
  fields,
  showFieldForm,
  editingField,
  onAddField,
  onEditField,
  onDeleteField,
  onSaveField,
  onCancelFieldForm,
}: {
  fields: TrackingField[];
  showFieldForm: boolean;
  editingField: TrackingField | null;
  onAddField: () => void;
  onEditField: (f: TrackingField) => void;
  onDeleteField: (id: string) => void;
  onSaveField: (f: TrackingField) => void;
  onCancelFieldForm: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Field list */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {fields.length} field{fields.length !== 1 ? 's' : ''} configured
          </p>
          <button onClick={onAddField} className="btn-primary text-sm">
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="card p-8 text-center" style={{ borderStyle: 'dashed' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Database size={20} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              No tracking fields yet
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Fields define what you measure — hours worked, tasks completed, revenue earned, or any
              custom metric.
            </p>
            <button onClick={onAddField} className="btn-primary text-sm">
              <Plus size={14} />
              Create First Field
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <FieldRow
                key={field.id}
                field={field}
                index={idx}
                onEdit={() => onEditField(field)}
                onDelete={() => onDeleteField(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Field form panel */}
      <div className="lg:col-span-2">
        {showFieldForm ? (
          <div className="card p-5 shadow-card sticky top-4">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              {editingField ? 'Edit Field' : 'New Field'}
            </h3>
            <FieldForm
              existingField={editingField}
              fieldCount={fields.length}
              onSave={onSaveField}
              onCancel={onCancelFieldForm}
            />
          </div>
        ) : (
          <div className="card p-5 border-dashed flex flex-col items-center justify-center text-center min-h-[180px]">
            <Settings size={24} className="mb-3" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Field editor
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Click "Add Field" or select a field to edit it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  index,
  onEdit,
  onDelete,
}: {
  field: TrackingField;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="card px-4 py-3 flex items-center gap-4 group transition-colors duration-100 shadow-card"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--muted)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--card)';
      }}
    >
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: field.color }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
            {field.name}
          </span>
          <Badge variant={field.type === 'number' ? 'default' : 'info'}>
            {field.type === 'number' ? (
              <span className="flex items-center gap-1">
                <Hash size={10} />
                Number
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlignLeft size={10} />
                Text
              </span>
            )}
          </Badge>
          {field.unit && <Badge variant="neutral">{field.unit}</Badge>}
        </div>
        {field.defaultValue && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Default: {field.defaultValue}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
        <button
          onClick={onEdit}
          className="btn-ghost p-1.5"
          aria-label={`Edit ${field.name}`}
          title={`Edit ${field.name}`}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={onDelete}
          className="btn-ghost p-1.5"
          aria-label={`Delete ${field.name}`}
          title={`Delete ${field.name} — removes all associated data`}
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Targets Tab ─────────────────────────────────────────────────────────────

function TargetsTab({
  fields,
  targets,
  onSaveTarget,
  onDeleteTarget,
}: {
  fields: TrackingField[];
  targets: TargetConfig[];
  onSaveTarget: (t: TargetConfig) => void;
  onDeleteTarget: (fieldId: string, type: 'daily' | 'weekly') => void;
}) {
  const numberFields = fields.filter((f) => f.type === 'number');

  if (numberFields.length === 0) {
    return (
      <div className="card p-10 text-center" style={{ borderStyle: 'dashed' }}>
        <Target size={28} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          No numeric fields available
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Targets can only be set on numeric fields. Create a numeric tracking field first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Set daily or weekly targets for your numeric fields. Progress is shown on the Dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {numberFields.map((field) => (
          <React.Fragment key={`field-targets-${field.id}`}>
            {(['daily', 'weekly'] as const).map((type) => {
              const existing = targets.find((t) => t.fieldId === field.id && t.type === type) ?? null;
              return (
                <TargetForm
                  key={`target-card-${field.id}-${type}`}
                  field={field}
                  initialType={type}
                  existingTarget={existing}
                  onSave={onSaveTarget}
                  onDelete={existing ? () => onDeleteTarget(field.id, type) : undefined}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Danger Zone Tab ─────────────────────────────────────────────────────────

function DangerZoneTab({
  entryCount,
  onClearEntries,
  onResetAll,
  onLogout,
}: {
  entryCount: number;
  onClearEntries: () => void;
  onResetAll: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div
        className="rounded-xl border p-1"
        style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}
      >
        {/* Log Out */}
        <div className="flex items-center justify-between p-4 rounded-lg">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Log out
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Sign out of your account. You will need to log in again to access your data.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="btn-danger ml-4 flex-shrink-0 transition-all duration-150 hover:bg-red-600 hover:text-white"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>

        <div className="mx-4 my-1 border-t" style={{ borderColor: 'rgba(220,38,38,0.2)' }} />

        {/* Clear entries */}
        <div className="flex items-center justify-between p-4 rounded-lg">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Clear all logged entries
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Permanently delete all {entryCount} entries. Fields and targets remain intact.
            </p>
          </div>
          <button
            onClick={onClearEntries}
            disabled={entryCount === 0}
            className="btn-danger ml-4 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Clear Entries
          </button>
        </div>

        <div className="mx-4 my-1 border-t" style={{ borderColor: 'rgba(220,38,38,0.2)' }} />

        {/* Reset all */}
        <div className="flex items-center justify-between p-4 rounded-lg">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Reset entire app
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Wipes all data — fields, entries, targets, and settings. App reloads with defaults.
            </p>
          </div>
          <button onClick={onResetAll} className="btn-danger ml-4 flex-shrink-0">
            <RefreshCw size={14} />
            Reset App
          </button>
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        All data is stored locally in your browser. Clearing browser storage also removes all
        CreatorTracker data.
      </p>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
      <div className="flex gap-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={`sskel-tab-${i}`}
            className="h-8 w-28 rounded"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={`sskel-row-${i}`}
              className="card h-16"
              style={{ backgroundColor: 'var(--muted)' }}
            />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="card h-48" style={{ backgroundColor: 'var(--muted)' }} />
        </div>
      </div>
    </div>
  );
}
