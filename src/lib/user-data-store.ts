import { supabase } from './supabase/client';
import { AppState, TrackingField, DailyEntry, TargetConfig, EntryValue, Workflow } from './store';

export type SyncResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
    raw?: unknown;
  };
};

export type SaveOptions = {
  throwOnError?: boolean;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatSupabaseError(error: any, context: string, payload?: any) {
  const payloadKeys = payload
    ? JSON.stringify(Object.keys(Array.isArray(payload) ? payload[0] ?? {} : payload))
    : 'NO_PAYLOAD';

  return [
    `[${context}]`,
    `code=${error?.code ?? 'NO_CODE'}`,
    `message=${error?.message ?? 'NO_MESSAGE'}`,
    `details=${error?.details ?? 'NO_DETAILS'}`,
    `hint=${error?.hint ?? 'NO_HINT'}`,
    `payloadKeys=${payloadKeys}`
  ].join(' | ');
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function toNullableNumber(value: unknown): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNormalizedName(name: string): string {
  return (name || '').trim().toLowerCase();
}

// ─── MAPPERS ──────────────────────────────────────────────────────────────────

function mapTrackerToDb(tracker: TrackingField, userId: string, existingTrackers: any[] = []) {
  const normalizedName = toNormalizedName(tracker.name);
  
  // Rule 2: If a tracker with same normalized name exists, use its ID.
  const existing = existingTrackers.find(t => toNormalizedName(t.name) === normalizedName);
  
  if (existing) {
    console.debug(`[user-data-store] existing tracker reused for "${tracker.name}"`);
  } else {
    console.debug(`[user-data-store] new tracker created for "${tracker.name}"`);
  }

  const isIdUuid = isUuid(tracker.id);
  const metadata: any = tracker.id && !isIdUuid ? { local_id: tracker.id } : {};

  const knownKeys = ['id', 'name', 'type', 'unit', 'defaultValue', 'color'];
  Object.keys(tracker).forEach((key) => {
    if (!knownKeys.includes(key)) {
      metadata[key] = (tracker as any)[key];
    }
  });

  const dbRow: any = {
    id: existing ? existing.id : (isIdUuid ? tracker.id : makeUuid()),
    user_id: userId,
    name: tracker.name ?? 'Unnamed Tracker',
    type: tracker.type ?? 'number',
    unit: tracker.unit || null,
    color: tracker.color || null,
    default_value: toNullableNumber(tracker.defaultValue),
    is_active: true,
    metadata: metadata,
    updated_at: new Date().toISOString()
  };

  return dbRow;
}

function mapEntryToDb(entry: DailyEntry, val: EntryValue, fields: TrackingField[], userId: string, trackerMapByName: Record<string, string>) {
  const trackerDef = fields.find(f => f.id === val.fieldId);
  const normalizedName = trackerDef ? toNormalizedName(trackerDef.name) : '';
  const supabaseTrackerId = trackerMapByName[normalizedName];

  const isTrackerIdUuid = isUuid(supabaseTrackerId);
  const isEntryIdUuid = isUuid(entry.id);
  const metadata: any = {};

  if (!isTrackerIdUuid) metadata.local_tracker_id = val.fieldId;
  if (!isEntryIdUuid) metadata.local_id = entry.id;

  const numVal = parseFloat(val.value);
  const isNum = !isNaN(numVal) && val.value.trim() !== '';

  const dbRow: any = {
    id: isEntryIdUuid ? entry.id : makeUuid(),
    user_id: userId,
    date: entry.date,
    value: toNullableNumber(val.value),
    note: !isNum ? val.value : null,
    tracker_name: trackerDef?.name ?? null,
    tracker_type: trackerDef?.type ?? null,
    created_at: entry.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isTrackerIdUuid) {
    dbRow.tracker_id = supabaseTrackerId;
  }

  metadata.composite_id = `${entry.date}_${val.fieldId}`;
  dbRow.metadata = metadata;

  return dbRow;
}

function mapTargetToDb(target: TargetConfig, userId: string, fields: TrackingField[], trackerMapByName: Record<string, string>, existingTargets: any[] = []) {
  const trackerDef = fields.find(f => f.id === target.fieldId);
  const normalizedName = trackerDef ? toNormalizedName(trackerDef.name) : '';
  const supabaseTrackerId = trackerMapByName[normalizedName];

  // Rule 2: If an existing Supabase target exists for same user_id + tracker_id + period, update that row
  const existing = existingTargets.find(et => et.tracker_id === supabaseTrackerId && et.period === target.type);

  const isIdUuid = isUuid(target.id);
  const isTrackerIdUuid = isUuid(supabaseTrackerId);
  const metadata: any = {};

  if (!isIdUuid) metadata.local_id = target.id;
  if (!isTrackerIdUuid) metadata.local_tracker_id = target.fieldId;

  const dbRow: any = {
    id: existing ? existing.id : (isIdUuid ? target.id : makeUuid()),
    user_id: userId,
    target_value: toNullableNumber(target.targetValue),
    period: target.type ?? 'daily',
    updated_at: new Date().toISOString()
  };

  if (isTrackerIdUuid) {
    dbRow.tracker_id = supabaseTrackerId;
  }
  
  dbRow.metadata = metadata;

  return dbRow;
}

function mapDashboardSettingsToDb(settings: any, userId: string) {
  return {
    user_id: userId,
    settings: settings ?? {},
    updated_at: new Date().toISOString()
  };
}

// ─── USER DATA STORE (Supabase Source of Truth) ────────────────────────────────

export async function getUserTrackers() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.debug('[getUserTrackers] User is not authenticated.');
    return [];
  }

  const { data, error } = await supabase
    .from('user_trackers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(formatSupabaseError(error, 'getUserTrackers'));
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }

  // Deduplicate before returning (UI safety)
  const seenNames = new Set<string>();
  const deduplicated = (data || []).filter(row => {
    const normalized = toNormalizedName(row.name);
    if (seenNames.has(normalized)) {
      console.warn(`[user-data-store] duplicate tracker ignored in UI: "${row.name}"`);
      return false;
    }
    seenNames.add(normalized);
    return true;
  });

  return deduplicated.map((row: any): TrackingField => ({
    id: row.id,
    name: row.name,
    type: row.type as 'number' | 'text',
    unit: row.unit || '',
    defaultValue: row.default_value !== null ? String(row.default_value) : '',
    color: row.color || '#2563EB',
  }));
}

export async function saveUserTrackers(fields: TrackingField[], options?: SaveOptions): Promise<SyncResult<TrackingField[]>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('[saveUserTrackers] Skipped save: user is not authenticated.');
      if (options?.throwOnError) throw new Error('Not authenticated');
      return { ok: false, error: { message: 'Not authenticated' } };
    }

    // Fetch existing trackers to ensure idempotency by name
    const { data: existing, error: fetchError } = await supabase
      .from('user_trackers')
      .select('id, name')
      .eq('user_id', user.id);
    
    if (fetchError) throw fetchError;

    // Deduplicate incoming fields by name first
    const seenNames = new Set<string>();
    const deduplicatedFields = fields.filter(f => {
      const norm = toNormalizedName(f.name);
      if (seenNames.has(norm)) return false;
      seenNames.add(norm);
      return true;
    });

    const payload = deduplicatedFields.map(f => mapTrackerToDb(f, user.id, existing || []));

    if (payload.length === 0) return { ok: true, data: fields };

    const { error } = await supabase
      .from('user_trackers')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(formatSupabaseError(error, 'saveUserTrackers', payload));
      
      const normalizedError = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        raw: error
      };
      
      if (options?.throwOnError) throw new Error(`Database error (${error.code}): ${error.message}`);
      return { ok: false, error: normalizedError };
    }

    return { ok: true, data: deduplicatedFields };
  } catch (error: any) {
    console.error('[saveUserTrackers] Unexpected error:', error);
    if (options?.throwOnError) throw error;
    return { ok: false, error: { message: error.message, raw: error } };
  }
}

export async function deleteUserTracker(id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.warn('[deleteUserTracker] User is not authenticated.');
    return;
  }

  const { error } = await supabase
    .from('user_trackers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error(formatSupabaseError(error, 'deleteUserTracker', { id }));
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }
}

export async function getUserEntries() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.debug('[getUserEntries] User is not authenticated.');
    return [];
  }

  const { data, error } = await supabase
    .from('user_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error(formatSupabaseError(error, 'getUserEntries'));
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }

  const grouped: Record<string, DailyEntry> = {};
  
  (data || []).forEach((row: any) => {
    const date = row.date;
    if (!grouped[date]) {
      grouped[date] = {
        id: (row.metadata && row.metadata.local_id) || `entry-${date}`,
        date: date,
        values: [],
        createdAt: row.created_at
      };
    }
    
    const val = row.value !== null ? String(row.value) : (row.note || '');
    const trackerId = row.tracker_id || (row.metadata && row.metadata.local_tracker_id) || '';
    
    grouped[date].values.push({
      fieldId: trackerId,
      value: val
    });
  });

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveUserEntries(entries: DailyEntry[], fields: TrackingField[] = [], options?: SaveOptions): Promise<SyncResult<DailyEntry[]>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('[saveUserEntries] Skipped save: user is not authenticated.');
      if (options?.throwOnError) throw new Error('Not authenticated');
      return { ok: false, error: { message: 'Not authenticated' } };
    }

    const { data: trackers } = await supabase.from('user_trackers').select('id, name').eq('user_id', user.id);
    const trackerMap: Record<string, string> = {};
    (trackers || []).forEach(t => {
      trackerMap[toNormalizedName(t.name)] = t.id;
    });

    const payload: any[] = [];
    entries.forEach(entry => {
      entry.values.forEach(val => {
        payload.push(mapEntryToDb(entry, val, fields, user.id, trackerMap));
      });
    });

    if (payload.length === 0) return { ok: true, data: entries };

    const { error } = await supabase
      .from('user_entries')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(formatSupabaseError(error, 'saveUserEntries', payload));
      
      const normalizedError = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        raw: error
      };
      
      if (options?.throwOnError) throw new Error(`Database error (${error.code}): ${error.message}`);
      return { ok: false, error: normalizedError };
    }
    
    return { ok: true, data: entries };
  } catch (error: any) {
    console.error('[saveUserEntries] Unexpected error:', error);
    if (options?.throwOnError) throw error;
    return { ok: false, error: { message: error.message, raw: error } };
  }
}

export async function getUserTargets() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.debug('[getUserTargets] User is not authenticated.');
    return [];
  }

  const { data, error } = await supabase
    .from('user_targets')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error(formatSupabaseError(error, 'getUserTargets'));
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }

  // Deduplicate before returning (UI safety)
  const seenTargets = new Set<string>();
  const deduplicated = (data || []).filter(row => {
    const key = `${row.tracker_id}:${row.period}`;
    if (seenTargets.has(key)) return false;
    seenTargets.add(key);
    return true;
  });

  return deduplicated.map((row: any): TargetConfig => ({
    id: row.id || (row.metadata && row.metadata.local_id) || '',
    fieldId: row.tracker_id || (row.metadata && row.metadata.local_tracker_id) || '',
    targetValue: Number(row.target_value),
    type: row.period as 'daily' | 'weekly'
  }));
}

export async function saveUserTargets(targets: TargetConfig[], fields: TrackingField[] = [], options?: SaveOptions): Promise<SyncResult<TargetConfig[]>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('[saveUserTargets] Skipped save: user is not authenticated.');
      if (options?.throwOnError) throw new Error('Not authenticated');
      return { ok: false, error: { message: 'Not authenticated' } };
    }

    // 1. Build tracker name-to-id map
    const { data: trackers } = await supabase.from('user_trackers').select('id, name').eq('user_id', user.id);
    const trackerMap: Record<string, string> = {};
    (trackers || []).forEach(t => {
      trackerMap[toNormalizedName(t.name)] = t.id;
    });

    // 2. Fetch existing targets to map IDs and ensure uniqueness
    const { data: existing, error: fetchError } = await supabase
      .from('user_targets')
      .select('id, tracker_id, period')
      .eq('user_id', user.id);
    
    if (fetchError) throw fetchError;

    // 3. Deduplicate incoming targets by user_id + tracker_id + period
    const seenIncoming = new Set<string>();
    const deduplicatedTargets = targets.filter(t => {
      const trackerDef = fields.find(f => f.id === t.fieldId);
      const normName = trackerDef ? toNormalizedName(trackerDef.name) : '';
      const trackerId = trackerMap[normName] || t.fieldId;
      const key = `${trackerId}:${t.type}`;
      if (seenIncoming.has(key)) return false;
      seenIncoming.add(key);
      return true;
    });

    const payload = deduplicatedTargets.map(t => mapTargetToDb(t, user.id, fields, trackerMap, existing || []));

    if (payload.length === 0) return { ok: true, data: targets };

    const { error } = await supabase
      .from('user_targets')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(formatSupabaseError(error, 'saveUserTargets', payload));
      
      const normalizedError = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        raw: error
      };
      
      if (options?.throwOnError) throw new Error(`Database error (${error.code}): ${error.message}`);
      return { ok: false, error: normalizedError };
    }

    return { ok: true, data: deduplicatedTargets };
  } catch (error: any) {
    console.error('[saveUserTargets] Unexpected error:', error);
    if (options?.throwOnError) throw error;
    return { ok: false, error: { message: error.message, raw: error } };
  }
}

export async function getDashboardSettings() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.debug('[getDashboardSettings] Skipped fetch: user is not authenticated.');
    return null;
  }

  const { data, error } = await supabase
    .from('user_dashboard_settings')
    .select('settings')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(formatSupabaseError(error, 'getDashboardSettings'));
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }

  return data ? data.settings : null;
}

export async function saveDashboardSettings(settings: any, options?: SaveOptions): Promise<SyncResult> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('[saveDashboardSettings] Skipped save: user is not authenticated.');
      if (options?.throwOnError) throw new Error('Not authenticated');
      return { ok: false, error: { message: 'Not authenticated' } };
    }

    const payload = mapDashboardSettingsToDb(settings, user.id);

    const { error } = await supabase
      .from('user_dashboard_settings')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error(formatSupabaseError(error, 'saveDashboardSettings', [payload]));
      
      const normalizedError = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        raw: error
      };
      
      if (options?.throwOnError) throw new Error(`Database error (${error.code}): ${error.message}`);
      return { ok: false, error: normalizedError };
    }
    
    return { ok: true };
  } catch (error: any) {
    console.error('[saveDashboardSettings] Unexpected error:', error);
    if (options?.throwOnError) throw error;
    return { ok: false, error: { message: error.message, raw: error } };
  }
}

export async function syncStateToSupabase(state: AppState) {
  // To avoid duplicates, we MUST save trackers first.
  const trackersResult = await saveUserTrackers(state.fields);
  
  if (!trackersResult.ok) {
    return {
      ok: false,
      trackers: trackersResult,
      entries: { ok: false },
      targets: { ok: false },
      dashboardSettings: { ok: true }
    };
  }

  const results = await Promise.allSettled([
    saveUserEntries(state.entries, state.fields),
    saveUserTargets(state.targets, state.fields)
  ]);

  const entriesResult = results[0].status === 'fulfilled' ? results[0].value : { ok: false, error: { message: 'Promise rejected' } };
  const targetsResult = results[1].status === 'fulfilled' ? results[1].value : { ok: false, error: { message: 'Promise rejected' } };

  return {
    ok: entriesResult.ok && targetsResult.ok,
    trackers: trackersResult,
    entries: entriesResult,
    targets: targetsResult,
    dashboardSettings: { ok: true }
  };
}

export async function loadStateFromSupabase(): Promise<AppState> {
  const [fields, entries, targets] = await Promise.all([
    getUserTrackers(),
    getUserEntries(),
    getUserTargets()
  ]);

  return {
    fields,
    entries,
    targets,
    theme: 'light'
  };
}

export async function verifyUserDataSchema() {
  console.log('[user-data-store] Verifying schema...');
  
  const schemaExpectations = [
    {
      table: 'user_trackers',
      columns: ['id', 'user_id', 'name', 'type', 'unit', 'color', 'metadata']
    },
    {
      table: 'user_entries',
      columns: ['id', 'user_id', 'tracker_id', 'date', 'value', 'note', 'metadata']
    },
    {
      table: 'user_targets',
      columns: ['id', 'user_id', 'tracker_id', 'target_value', 'period']
    },
    {
      table: 'user_dashboard_settings',
      columns: ['user_id', 'settings']
    }
  ];
  
  for (const item of schemaExpectations) {
    const { error } = await supabase
      .from(item.table)
      .select(item.columns.join(','))
      .limit(1);
      
    if (error) {
      console.warn(`[user-data-store] Schema verification warning for ${item.table}:`, {
        code: error.code,
        message: error.message,
        hint: error.hint,
        expectedColumns: item.columns
      });
    } else {
      console.log(`[user-data-store] Schema verification OK for ${item.table}`);
    }
  }
}

// ─── MIGRATION CHECK ────────────────────────────────────────────────────────

export async function migrateLocalDataToSupabaseIfNeeded(localState: AppState) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const migrationKey = `creator_tracker_supabase_migrated_${user.id}`;
  if (localStorage.getItem(migrationKey)) {
    console.debug(`[user-data-store] migration skipped because already migrated for ${user.id}`);
    return false;
  }

  if (localState.fields.length === 0 && localState.entries.length === 0) {
    localStorage.setItem(migrationKey, 'true');
    return false;
  }

  try {
    console.log('[user-data-store] migration started...');
    await verifyUserDataSchema();
    const result = await syncStateToSupabase(localState);
    
    if (result.ok) {
      localStorage.setItem(migrationKey, 'true');
      console.log('[user-data-store] migration complete.');
      return true;
    } else {
      console.warn('[user-data-store] migration partially or fully failed. Preserving local storage.', result);
      return false;
    }
  } catch (error: any) {
    console.warn('[user-data-store] migration failed exception:', error.message);
    return false;
  }
}

// ─── DEBUG ────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as any).__debugUserDataSync = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('--- DEBUG USER DATA SYNC ---');
    console.log('User ID:', user?.id);
    
    try {
      const localStateStr = localStorage.getItem(user?.id ? `creator_tracker_${user.id}` : 'creator_tracker_v2') 
        || localStorage.getItem('creator_tracker_v2');
      if (!localStateStr) {
        console.log('No local state found.');
        return;
      }
      
      const localState = JSON.parse(localStateStr);
      console.log('Trackers count:', localState.fields?.length);
      console.log('Entries count:', localState.entries?.length);
      console.log('Targets count:', localState.targets?.length);
      
      const { data: existing } = await supabase.from('user_trackers').select('id, name').eq('user_id', user?.id || '');
      const trackerMap: Record<string, string> = {};
      (existing || []).forEach(t => {
        trackerMap[toNormalizedName(t.name)] = t.id;
      });

      if (localState.fields?.[0]) {
        console.log('First Tracker Mapped:', mapTrackerToDb(localState.fields[0], user?.id || 'NO_USER', existing || []));
      }
      if (localState.entries?.[0]) {
        console.log('First Entry Mapped:', mapEntryToDb(localState.entries[0], localState.entries[0].values[0], localState.fields, user?.id || 'NO_USER', trackerMap));
      }
      if (localState.targets?.[0]) {
        console.log('First Target Mapped:', mapTargetToDb(localState.targets[0], user?.id || 'NO_USER', localState.fields, trackerMap));
      }
    } catch (e) {
      console.error('Debug error:', e);
    }
  };
}