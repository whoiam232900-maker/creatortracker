// Backend integration point: replace localStorage with API calls + SWR/React Query

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
  date: string; // ISO yyyy-mm-dd
  values: EntryValue[];
  createdAt: string;
}

export interface TargetConfig {
  fieldId: string;
  targetValue: number;
  type: 'daily' | 'weekly';
}

export interface AppState {
  fields: TrackingField[];
  entries: DailyEntry[];
  targets: TargetConfig[];
  theme: 'light' | 'dark';
}

// ─── Storage key helpers ──────────────────────────────────────────────────────

/**
 * Returns the localStorage key for a given workspaceId.
 * This ensures data isolation between different workspaces.
 */
export function getWorkspaceStorageKey(workspaceId: string): string {
  return `creatortracker_ws_data_${workspaceId}`;
}

export function getUserStorageKey(userId?: string): string {
  if (userId) return `creator_tracker_${userId}`;
  if (typeof window === 'undefined') return 'creator_tracker_v2';
  try {
    const raw = localStorage.getItem('creatortracker_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.email) {
        return `creator_tracker_${session.email}`;
      }
    }
  } catch (e) {}
  return 'creator_tracker_v2';
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const DEFAULT_FIELDS: TrackingField[] = [
  {
    id: 'field-001',
    name: 'Deep Work',
    type: 'number',
    unit: 'hours',
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
  { fieldId: 'field-001', targetValue: 8, type: 'daily' },
  { fieldId: 'field-002', targetValue: 5, type: 'daily' },
];

// ─── Core load / save ─────────────────────────────────────────────────────────

export function loadState(workspaceId?: string): AppState {
  if (typeof window === 'undefined') {
    return { fields: [], entries: [], targets: [], theme: 'light' };
  }

  const key = workspaceId ? getWorkspaceStorageKey(workspaceId) : getUserStorageKey();
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { fields: [], entries: [], targets: [], theme: 'dark' };
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      fields: Array.isArray(parsed.fields) ? (parsed.fields as TrackingField[]) : [],
      entries: Array.isArray(parsed.entries) ? (parsed.entries as DailyEntry[]) : [],
      targets: Array.isArray(parsed.targets) ? (parsed.targets as TargetConfig[]) : [],
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch (error) {
    console.error('[store] Error loading state:', error);
    return { fields: [], entries: [], targets: [], theme: 'dark' };
  }
}

export function saveState(state: AppState, workspaceId?: string): void {
  if (typeof window === 'undefined') return;
  const key = workspaceId ? getWorkspaceStorageKey(workspaceId) : getUserStorageKey();
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('[store] Error saving state:', error);
  }
}

export function initializeStarterData(workspaceId?: string): AppState {
  const fields = [...DEFAULT_FIELDS];
  const targets = [...DEFAULT_TARGETS];
  const entries = generateSampleEntries(fields);
  const state: AppState = { fields, entries, targets, theme: 'dark' };
  saveState(state, workspaceId);
  return state;
}

export function resetUserData(workspaceId?: string): void {
  if (typeof window === 'undefined') return;
  const key = workspaceId ? getWorkspaceStorageKey(workspaceId) : getUserStorageKey();
  localStorage.removeItem(key);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function getFieldTotal(entries: DailyEntry[], fieldId: string, dates?: string[]): number {
  return entries
    .filter((e) => !dates || dates.includes(e.date))
    .reduce((acc, e) => {
      const val = e.values.find((v) => v.fieldId === fieldId);
      return acc + (val ? parseFloat(val.value) || 0 : 0);
    }, 0);
}

export function getCurrentStreak(entries: DailyEntry[]): number {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // If no entry for today or yesterday, streak is 0
  if (sorted[0].date !== today && sorted[0].date !== yesterdayStr) return 0;
  
  let streak = 0;
  let currentDate = new Date(sorted[0].date);
  
  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    const diffTime = Math.abs(currentDate.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getPresetFieldColor(index: number): string {
  const PRESET_COLORS = [
    '#2563EB', '#0EA5E9', '#16A34A', '#D97706', 
    '#9333EA', '#DB2777', '#0891B2', '#65A30D'
  ];
  return PRESET_COLORS[index % PRESET_COLORS.length];
}

export function getFieldColor(fields: TrackingField[], fieldId: string): string {
  const field = fields.find(f => f.id === fieldId);
  return field?.color || getPresetFieldColor(0);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function generateSampleEntries(fields: TrackingField[]): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const values = fields.map((field) => {
       if (field.type === 'number') {
          return { fieldId: field.id, value: String(Math.floor(Math.random() * 10) + 2) };
       }
       return { fieldId: field.id, value: 'Worked on projects.' };
    });

    entries.push({
      id: generateId('entry'),
      date: dateStr,
      values,
      createdAt: date.toISOString(),
    });
  }
  return entries;
}
