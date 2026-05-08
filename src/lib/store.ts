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
  date: string; // YYYY-MM-DD
  values: EntryValue[];
  createdAt: string;
}

export interface TargetConfig {
  fieldId: string;
  targetValue: number;
  type: 'daily' | 'weekly';
}

export interface TimerState {
  running: boolean;
  elapsed: number; // seconds
  startedAt: number | null;
}

export interface AppState {
  fields: TrackingField[];
  entries: DailyEntry[];
  targets: TargetConfig[];
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

const DEFAULT_FIELDS: TrackingField[] = [
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

const DEFAULT_TARGETS: TargetConfig[] = [
  { fieldId: 'field-001', targetValue: 8, type: 'daily' },
  { fieldId: 'field-002', targetValue: 5, type: 'daily' },
];

function generateSampleEntries(fields: TrackingField[]): DailyEntry[] {
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

// ─── Core load / save ─────────────────────────────────────────────────────────

/**
 * Loads the AppState for a specific user.
 * IMPORTANT: If no data exists for the user, returns an EMPTY state (no auto-seed).
 * Starter data seeding is done explicitly via initializeStarterData().
 */
export function loadState(userId?: string): AppState {
  if (typeof window === 'undefined') {
    return { fields: [], entries: [], targets: [], theme: 'light' };
  }

  const key = getUserStorageKey(userId);
  console.debug('[store] loadState() — key:', key);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      console.debug('[store] loadState() — no data found for key:', key, '→ returning empty state');
      return { fields: [], entries: [], targets: [], theme: 'light' };
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    console.debug(
      '[store] loadState() — loaded',
      (parsed.fields ?? []).length,
      'fields,',
      (parsed.entries ?? []).length,
      'entries for key:',
      key
    );
    return {
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      targets: Array.isArray(parsed.targets) ? parsed.targets : [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch (e) {
    console.error('[store] loadState() — parse error:', e);
    return { fields: [], entries: [], targets: [], theme: 'light' };
  }
}

export function saveState(state: AppState, userId?: string): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
    console.debug(
      '[store] saveState() — saved',
      state.fields.length,
      'fields,',
      state.entries.length,
      'entries to key:',
      key
    );
  } catch (e) {
    console.warn('[store] saveState() — storage quota exceeded:', e);
  }
}

// ─── New account seeding ──────────────────────────────────────────────────────

/**
 * Seeds starter data for a brand-new user.
 * ONLY call this when the account is truly new (isNewAccount flag is set).
 * If data already exists for the user, this is a no-op.
 */
export function initializeStarterData(userId?: string): AppState {
  const key = getUserStorageKey(userId);
  const existing = localStorage.getItem(key);

  if (existing) {
    console.warn(
      '[store] initializeStarterData() — data already exists for key:',
      key,
      '→ skipping seed to avoid overwrite'
    );
    return loadState(userId);
  }

  console.debug('[store] initializeStarterData() — seeding starter data for key:', key);
  const initial: AppState = {
    fields: DEFAULT_FIELDS,
    entries: generateSampleEntries(DEFAULT_FIELDS),
    targets: DEFAULT_TARGETS,
    theme: 'light',
  };
  saveState(initial, userId);
  return initial;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

/**
 * Completely wipes all data for a user:
 * - tracker data (creator_tracker_<userId>)
 * - onboarding scratch data (onboarding_<userId>)
 * - feature settings (featureSettings_<userId>)
 *
 * After calling this, set isNewAccount: true in userSession so onboarding re-runs.
 */
export function resetUserData(userId?: string): void {
  const resolvedId = userId ?? (() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) return JSON.parse(raw)?.email ?? '';
    } catch { return ''; }
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
      console.debug('[store] resetUserData() — removed key:', k);
    }
  });
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
  const filtered = dates ? entries.filter((e) => dates.includes(e.date)) : entries;
  return filtered.reduce((sum, entry) => {
    const val = entry.values.find((v) => v.fieldId === fieldId);
    if (!val) return sum;
    const n = parseFloat(val.value);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

export function getCurrentStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const today = getAdjustedDate();
  let streak = 0;
  const checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasEntry = entries.some((e) => e.date === dateStr);
    if (!hasEntry) {
      if (streak === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yestStr = checkDate.toISOString().split('T')[0];
        if (!entries.some((e) => e.date === yestStr)) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
