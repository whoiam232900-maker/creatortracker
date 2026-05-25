import { supabase } from './supabase/client';
import { loadStateFromSupabase, syncStateToSupabase, migrateLocalDataToSupabaseIfNeeded } from './user-data-store';

export interface TrackingField {
  id: string;
  name: string;
  type: 'number' | 'text';
  unit: string;
  defaultValue: string;
  color: string;
}

export interface EntryValue {
  fieldId: string;
  value: string;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  values: EntryValue[];
  createdAt: string;
}

export interface TargetConfig {
  id: string;
  fieldId: string;
  targetValue: number;
  type: 'daily' | 'weekly';
}

export interface TimerState {
  running: boolean;
  elapsed: number; // seconds
  startedAt: number | null;
}

export type WorkflowStatus = 'Pending' | 'In Progress' | 'Review' | 'Completed' | 'Delivered';

export interface WorkflowCheckpoint {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  checkpoints: WorkflowCheckpoint[];
  timeLoggedMinutes: number;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface AppState {
  fields: TrackingField[];
  entries: DailyEntry[];
  targets: TargetConfig[];
  workflows?: Workflow[];
  /** @deprecated Use SettingsContext.visualTheme instead */
  theme: 'light' | 'dark';
}

// ─── Storage key helpers ──────────────────────────────────────────────────────

/**
 * Returns the localStorage key for a given userId.
 * Falls back to reading from userSession if no userId is provided.
 * This ensures per-user data isolation.
 */
export function getUserStorageKey(userId?: string): string {
  if (userId) return `creator_tracker_${userId}`;

  if (typeof window === 'undefined') return 'creator_tracker_v2';

  try {
    const raw = localStorage.getItem('userSession');
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.email) {
        console.debug('[store] Resolved storage key for user:', session.email);
        return `creator_tracker_${session.email}`;
      }
    }
  } catch (e) {
    console.warn('[store] Could not read userSession for storage key, using fallback');
  }

  // Anonymous / admin fallback
  return 'creator_tracker_v2';
}

// ─── Color palette ────────────────────────────────────────────────────────────

const FIELD_COLORS = [
  '#2563EB',
  '#0EA5E9',
  '#16A34A',
  '#D97706',
  '#9333EA',
  '#DB2777',
  '#0891B2',
  '#65A30D',
];

export function getFieldColor(index: number): string {
  return FIELD_COLORS[index % FIELD_COLORS.length];
}

// ─── Starter / default data ───────────────────────────────────────────────────

export const DEFAULT_FIELDS: TrackingField[] = [
  {
    id: 'field-001',
    name: 'Hours Worked',
    type: 'number',
    unit: 'hrs',
    defaultValue: '0',
    color: '#2563EB',
  },
  {
    id: 'field-002',
    name: 'Tasks Completed',
    type: 'number',
    unit: 'tasks',
    defaultValue: '0',
    color: '#16A34A',
  },
  {
    id: 'field-003',
    name: 'Focus Notes',
    type: 'text',
    unit: '',
    defaultValue: '',
    color: '#9333EA',
  },
];

export const DEFAULT_TARGETS: TargetConfig[] = [
  { id: 'target-001', fieldId: 'field-001', targetValue: 8, type: 'daily' },
  { id: 'target-002', fieldId: 'field-002', targetValue: 5, type: 'daily' },
];

export function generateSampleEntries(fields: TrackingField[]): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const today = new Date();

  const patterns = [
    [6.5, 8, 5, 7.5, 9, 4, 0],
    [5, 6, 8, 7, 9, 3, 0],
    [7, 5.5, 8.5, 6, 7, 8, 2],
    [4, 7, 6, 8.5, 5, 9, 0],
    [8, 6.5, 7, 5, 8, 7.5, 3],
    [5.5, 8, 6, 7.5, 9, 4, 1],
    [7, 6, 8, 5.5, 7, 8.5, 0],
    [6, 7.5, 5, 8, 6.5, 9, 2],
    [8.5, 5, 7, 6, 8, 7, 0],
    [5, 6.5, 8, 7, 6, 9, 1],
    [7.5, 8, 5, 6.5, 8, 7, 0],
    [6, 7, 8.5, 5, 7.5, 8, 2],
    [8, 6, 7, 8.5, 5, 7, 0],
    [5.5, 7.5, 6, 8, 7, 6.5, 1],
    [7, 8, 5.5, 7, 8, 6, 0],
    [6.5, 5, 8, 7, 6, 8.5, 2],
    [8, 7, 6.5, 5, 7.5, 8, 0],
    [5, 6, 7, 8.5, 6, 7, 1],
    [7.5, 8, 5, 6, 8, 7.5, 0],
    [6, 7, 8, 5.5, 7, 8, 2],
    [8.5, 6, 7.5, 8, 5, 7, 0],
    [5, 7, 6, 8, 7.5, 6, 1],
    [7, 5.5, 8, 6.5, 8, 7, 0],
    [6.5, 8, 7, 5, 7.5, 8, 2],
    [8, 7.5, 5.5, 8, 6, 7, 0],
    [5.5, 6, 8, 7, 8.5, 5, 1],
    [7, 8, 6, 7.5, 5, 8, 0],
    [6, 5, 7.5, 8, 7, 6.5, 2],
    [8.5, 7, 6, 5.5, 8, 7, 0],
    [5, 8, 7, 6.5, 7.5, 8, 1],
  ];

  const taskPatterns = [
    [4, 6, 3, 5, 7, 2, 0],
    [3, 5, 7, 6, 8, 2, 0],
    [5, 4, 6, 5, 7, 6, 1],
    [3, 6, 5, 7, 4, 8, 0],
    [6, 5, 7, 4, 6, 7, 2],
    [4, 7, 5, 6, 8, 3, 0],
  ];

  const notes = [
    'Deep work session on project deliverables',
    'Client calls and review meetings',
    'Research and documentation sprint',
    'Code review and bug fixes',
    'Planning and strategy session',
    'Content creation and editing',
    '',
  ];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) continue;

    const dateStr = date.toISOString().split('T')[0];
    const patternIdx = i % patterns.length;
    const dayIdx = Math.min(dayOfWeek, 6);

    const values: EntryValue[] = fields.map((field) => {
      if (field.id === 'field-001') {
        return { fieldId: field.id, value: String(patterns[patternIdx][dayIdx]) };
      }
      if (field.id === 'field-002') {
        return {
          fieldId: field.id,
          value: String(taskPatterns[patternIdx % taskPatterns.length][dayIdx]),
        };
      }
      if (field.type === 'number') {
        const val = (((patternIdx + dayIdx) % 5) + 1) * 1.5;
        return { fieldId: field.id, value: String(Math.round(val * 10) / 10) };
      }
      const noteIdx = (patternIdx + dayIdx) % notes.length;
      return { fieldId: field.id, value: notes[noteIdx] };
    });

    const hasMeaningfulData = values.some((v) => v.value !== '0' && v.value !== '');
    if (!hasMeaningfulData && dayOfWeek !== 6) continue;

    entries.push({
      id: `entry-${dateStr}`,
      date: dateStr,
      values,
      createdAt: date.toISOString(),
    });
  }

  return entries;
}

// ─── Local State Legacy Helpers ─────────────────────────────────────────────
// Used for migration or fallback.

export function loadLocalState(userId?: string): AppState {
  if (typeof window === 'undefined') {
    return { fields: [], entries: [], targets: [], theme: 'dark' };
  }

  const key = getUserStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { fields: [], entries: [], targets: [], theme: 'dark' };
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const today = getTodayString();

    const validEntries = (Array.isArray(parsed.entries) ? parsed.entries : []).filter(
      (e) => e.date <= today
    );

    return {
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      entries: validEntries,
      targets: Array.isArray(parsed.targets) ? parsed.targets : [],
      workflows: Array.isArray(parsed.workflows) ? parsed.workflows : [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch (e) {
    return { fields: [], entries: [], targets: [], theme: 'dark' };
  }
}

// ─── Core load / save (ASYNC with Supabase) ──────────────────────────────────

/**
 * Loads the AppState for a specific user from Supabase.
 * IMPORTANT: If no data exists for the user, returns an EMPTY state (no auto-seed).
 * Starter data seeding is done explicitly via initializeStarterData().
 */
export async function loadState(userId?: string): Promise<AppState> {
  if (typeof window === 'undefined') {
    return { fields: [], entries: [], targets: [], theme: 'dark' };
  }

  // Load localStorage state first
  const localState = loadLocalState(userId);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.debug('[store] loadState() — not authenticated, falling back to local');
      return localState;
    }

    // Attempt migration first (idempotent check inside)
    await migrateLocalDataToSupabaseIfNeeded(localState);

    // Load from Supabase
    try {
      const dbState = await loadStateFromSupabase();
      
      // Intelligent Merge Strategy
      // If DB is completely empty but local has data, prefer local
      const dbHasData = dbState.fields.length > 0 || dbState.entries.length > 0;
      const localHasData = localState.fields.length > 0 || localState.entries.length > 0;

      if (!dbHasData && localHasData) {
        console.debug('[store] DB is empty but local has data, using local and triggering sync');
        return localState;
      }

      if (dbHasData && localHasData) {
        console.debug('[store] Merging local and DB data');
        
        // Simple merge: prefer DB but keep unique local fields by name
        const mergedFields = [...dbState.fields];
        localState.fields.forEach(lf => {
          const exists = mergedFields.some(df => lf.name.trim().toLowerCase() === df.name.trim().toLowerCase());
          if (!exists) mergedFields.push(lf);
        });

        // For entries, we can union by date + fieldId
        const mergedEntries = [...dbState.entries];
        localState.entries.forEach(le => {
          const existingEntry = mergedEntries.find(de => de.date === le.date);
          if (!existingEntry) {
            mergedEntries.push(le);
          } else {
            // Merge values within same date
            le.values.forEach(lv => {
              const valExists = existingEntry.values.some(dv => dv.fieldId === lv.fieldId);
              if (!valExists) existingEntry.values.push(lv);
            });
          }
        });

        // For targets, union and deduplicate by tracker name + period
        const mergedTargets = [...dbState.targets];
        localState.targets.forEach(lt => {
          const lField = localState.fields.find(f => f.id === lt.fieldId);
          const lName = lField ? lField.name.trim().toLowerCase() : '';
          
          const exists = mergedTargets.some(dt => {
            const dField = mergedFields.find(f => f.id === dt.fieldId);
            const dName = dField ? dField.name.trim().toLowerCase() : '';
            return lName === dName && lt.type === dt.type;
          });
          
          if (!exists) mergedTargets.push(lt);
        });

        return {
          ...dbState,
          fields: mergedFields,
          entries: mergedEntries.sort((a, b) => b.date.localeCompare(a.date)),
          targets: mergedTargets,
          theme: localState.theme
        };
      }

      console.debug('[store] loadState() — using DB state');
      return dbState;
    } catch (e) {
      console.warn('[store] loadState() DB load failed, falling back to local:', e);
      return localState;
    }
  } catch (error) {
    console.error('[store] loadState() error:', error);
    return localState;
  }
}

export async function saveState(state: AppState, userId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(userId);
  
  // Always update local cache for offline availability and speed
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {}

  // Sync to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await syncStateToSupabase(state);
      console.debug('[store] saveState() — Synced to Supabase');
    }
  } catch (error) {
    console.error('[store] saveState() Supabase sync error:', error);
    throw error;
  }
}

// ─── New account seeding ──────────────────────────────────────────────────────

/**
 * Seeds starter data for a brand-new user.
 * ONLY call this when the account is truly new (isNewAccount flag is set).
 * If data already exists for the user, this is a no-op.
 */
export async function initializeStarterData(userId?: string): Promise<AppState> {
  const existingLocal = loadLocalState(userId);

  if (existingLocal.fields.length > 0) {
    console.warn('[store] initializeStarterData() — local data already exists → skipping seed');
    return loadState(userId);
  }

  // Also check Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbState = await loadStateFromSupabase();
      if (dbState.fields.length > 0) {
        console.warn('[store] initializeStarterData() — DB data already exists → skipping seed');
        return dbState;
      }
    }
  } catch (e) {}

  console.debug('[store] initializeStarterData() — seeding starter data');
  const initial: AppState = {
    fields: DEFAULT_FIELDS,
    entries: generateSampleEntries(DEFAULT_FIELDS),
    targets: DEFAULT_TARGETS,
    workflows: [],
    theme: 'dark',
  };
  await saveState(initial, userId);
  return initial;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

/**
 * Completely wipes all data for a user locally AND remotely:
 * After calling this, set isNewAccount: true in userSession so onboarding re-runs.
 */
export async function resetUserData(userId?: string): Promise<void> {
  const resolvedId =
    userId ??
    (() => {
      try {
        const raw = localStorage.getItem('userSession');
        if (raw) return JSON.parse(raw)?.email ?? '';
      } catch {
        return '';
      }
      return '';
    })();

  console.debug('[store] resetUserData() — wiping all data for user:', resolvedId);

  const keysToRemove = [
    `creator_tracker_${resolvedId}`,
    `onboarding_${resolvedId}`,
    `featureSettings_${resolvedId}`,
    // Legacy global keys (clean up too)
    'creator_tracker_v2',
    'onboardingData',
    'manualSetup',
    'userTargets',
    'featureSettings',
  ];

  keysToRemove.forEach((k) => {
    if (localStorage.getItem(k) !== null) {
      localStorage.removeItem(k);
      console.debug('[store] resetUserData() — removed local key:', k);
    }
  });

  // Wipe remote
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_trackers').delete().eq('user_id', user.id);
      await supabase.from('user_entries').delete().eq('user_id', user.id);
      await supabase.from('user_targets').delete().eq('user_id', user.id);
      const migrationKey = `creatortracker_data_migrated_v1_${user.id}`;
      localStorage.removeItem(migrationKey);
    }
  } catch (error) {
    console.error('[store] resetUserData remote wipe error:', error);
  }
}

// ─── Date / field utilities ───────────────────────────────────────────────────

function getAdjustedDate(baseDate = new Date()): Date {
  const d = new Date(baseDate);
  if (typeof window !== 'undefined') {
    try {
      const settingsStr = localStorage.getItem('app_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.dailyResetTime) {
          const [hours, minutes] = settings.dailyResetTime.split(':').map(Number);
          const resetTime = new Date(d);
          resetTime.setHours(hours, minutes, 0, 0);
          if (d < resetTime) {
            // Before reset time, still counts as previous day
            d.setDate(d.getDate() - 1);
          }
        }
      }
    } catch (e) {}
  }
  return d;
}

export function getTodayString(): string {
  return getAdjustedDate().toISOString().split('T')[0];
}

export function getWeekDates(): string[] {
  const today = getAdjustedDate();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function getFieldTotal(entries: DailyEntry[], fieldId: string, dates?: string[]): number {
  const today = getTodayString();
  const filtered = (dates ? entries.filter((e) => dates.includes(e.date)) : entries).filter(
    (e) => e.date <= today
  );

  return filtered.reduce((sum, entry) => {
    const val = entry.values.find((v) => v.fieldId === fieldId);
    if (!val) return sum;
    const n = parseFloat(val.value);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

export function getCurrentStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const today = getTodayString();
  const validEntries = entries.filter((e) => e.date <= today);
  if (validEntries.length === 0) return 0;

  const adjustedToday = getAdjustedDate();
  let streak = 0;
  const checkDate = new Date(adjustedToday);

  for (let i = 0; i < 366; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasEntry = validEntries.some((e) => {
      const hasData = e.values.some((v) => v.value !== '' && v.value !== '0' && v.value !== '0.00');
      return e.date === dateStr && hasData;
    });

    if (!hasEntry) {
      // If we are checking "today" and there's no entry, streak might still be alive from yesterday
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
