'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, saveState } from '@/lib/store';
import { LogOut, LayoutGrid, SlidersHorizontal, ChevronLeft } from 'lucide-react';

type Field = { id: string; name: string; type: string };
type Tracker = { id: string; name: string; emoji?: string; fields: Field[] };

interface Step1TrackersProps {
  availableTrackers: Tracker[];
  selectedTrackerIds: string[];
  setSelectedTrackerIds: React.Dispatch<React.SetStateAction<string[]>>;
  showCustomForm: boolean;
  setShowCustomForm: React.Dispatch<React.SetStateAction<boolean>>;
  customName: string;
  setCustomName: React.Dispatch<React.SetStateAction<string>>;
  customEmoji: string;
  setCustomEmoji: React.Dispatch<React.SetStateAction<string>>;
  onAddCustomTracker: (tracker: Tracker) => void;
}

interface Step2FieldsProps {
  trackers: Tracker[];
  setTrackers: React.Dispatch<React.SetStateAction<Tracker[]>>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEFAULT_TRACKERS: Tracker[] = [
  {
    id: 'study',
    name: 'Study',
    fields: [
      { id: generateId(), name: 'Hours studied', type: 'number' },
      { id: generateId(), name: 'Subjects', type: 'text' },
      { id: generateId(), name: 'Notes', type: 'text' },
      { id: generateId(), name: 'Assignments', type: 'text' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    fields: [
      { id: generateId(), name: 'Work Hours', type: 'number' },
      { id: generateId(), name: 'Tasks', type: 'text' },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    fields: [
      { id: generateId(), name: 'Time Spent', type: 'timer' },
      { id: generateId(), name: 'Milestones', type: 'text' },
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue',
    fields: [
      { id: generateId(), name: 'Amount', type: 'currency' },
      { id: generateId(), name: 'Source', type: 'text' },
    ],
  },
  {
    id: 'habits',
    name: 'Habits',
    fields: [
      { id: generateId(), name: 'Completed', type: 'checkbox' },
      { id: generateId(), name: 'Notes', type: 'text' },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    fields: [
      { id: generateId(), name: 'Workout Time', type: 'timer' },
      { id: generateId(), name: 'Exercises', type: 'text' },
    ],
  },
  {
    id: 'clients',
    name: 'Clients',
    fields: [
      { id: generateId(), name: 'Client Name', type: 'text' },
      { id: generateId(), name: 'Billed Amount', type: 'currency' },
    ],
  },
];

export default function ManualOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 State
  const [availableTrackers, setAvailableTrackers] = useState<Tracker[]>(DEFAULT_TRACKERS);
  const [selectedTrackerIds, setSelectedTrackerIds] = useState<string[]>([]);
  const [showCustomTrackerForm, setShowCustomTrackerForm] = useState(false);
  const [customTrackerName, setCustomTrackerName] = useState('');
  const [customTrackerEmoji, setCustomTrackerEmoji] = useState('');

  // Step 2 State
  const [customizedTrackers, setCustomizedTrackers] = useState<Tracker[]>([]);

  // ── Guard: only new accounts may run onboarding ────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) {
        console.debug('[onboarding/manual] No session — redirecting to /');
        router.replace('/');
        return;
      }
      const session = JSON.parse(raw);
      if (!session?.isNewAccount) {
        console.debug(
          '[onboarding/manual] isNewAccount is false for',
          session?.email,
          '— skipping onboarding, redirecting to /dashboard'
        );
        router.replace('/dashboard');
      } else {
        console.debug('[onboarding/manual] New account — proceeding for', session?.email);
      }
    } catch (e) {
      console.error('[onboarding/manual] Session read error:', e);
      router.replace('/');
    }
  }, [router]);

  const handleNext = async () => {
    if (step === 1) {
      const selected = availableTrackers.filter((t) => selectedTrackerIds.includes(t.id));
      setCustomizedTrackers(JSON.parse(JSON.stringify(selected)));
      setStep(2);
    } else if (step === 2) {
      try {
        const raw = localStorage.getItem('userSession');
        if (!raw) return;
        const session = JSON.parse(raw);

        // Double-check guard
        if (!session?.isNewAccount) {
          console.warn('[onboarding/manual] isNewAccount is false mid-flow — aborting data write');
          router.replace('/dashboard');
          return;
        }

        const userId = session.email;
        console.debug('[onboarding/manual] Saving manual setup for user:', userId);

        const fieldsToSave: any[] = [];
        const colors = ['#2563EB', '#0EA5E9', '#16A34A', '#D97706', '#9333EA', '#DB2777'];
        let colorIdx = 0;

        customizedTrackers.forEach((tracker) => {
          tracker.fields.forEach((f) => {
            fieldsToSave.push({
              id: f.id,
              name: `${tracker.name} - ${f.name}`,
              type:
                f.type === 'currency' || f.type === 'timer'
                  ? 'number'
                  : f.type === 'checkbox'
                    ? 'text'
                    : f.type,
              unit: f.type === 'currency' ? '$' : f.type === 'timer' ? 'min' : '',
              defaultValue:
                f.type === 'number' || f.type === 'currency' || f.type === 'timer' ? '0' : '',
              color: colors[colorIdx++ % colors.length],
            });
          });
        });

        // Load existing (empty for new user) and apply fields only
        const existingState = await loadState(userId);
        const newState = { ...existingState, fields: fieldsToSave };
        await saveState(newState, userId);

        // Save tracker structure scoped to user
        const manualSetup = {
          trackers: customizedTrackers.map((t) => ({
            name: t.name,
            emoji: t.emoji,
            fields: t.fields.map((f) => ({ name: f.name, type: f.type })),
          })),
        };
        localStorage.setItem(`onboarding_${userId}`, JSON.stringify(manualSetup));

        // NOTE: isNewAccount is cleared by the /onboarding/targets page (final step)
        window.location.href = '/onboarding/targets';
      } catch (e) {
        console.error('[onboarding/manual] Error saving manual data:', e);
        router.push('/onboarding/targets');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      window.location.href = '/onboarding';
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Sign Out Fallback */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            if(typeof window !== 'undefined') { import('@/lib/supabase/client').then(m => m.supabase.auth.signOut().catch(console.error)); } localStorage.removeItem('userSession');
            router.replace('/');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 transition-all"
        >
          <LogOut size={14} />
          Abort & Sign Out
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Step {step} of 2
          </p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            {step === 1 && 'Build Your Tracker'}
            {step === 2 && 'Customize Fields'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {step === 1 && 'Choose what you want to track manually'}
            {step === 2 && 'Tailor the data you want to collect'}
          </p>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>

        {/* Step Content */}
        <div className="flex flex-col gap-6">
          {step === 1 && (
            <Step1Trackers
              availableTrackers={availableTrackers}
              selectedTrackerIds={selectedTrackerIds}
              setSelectedTrackerIds={setSelectedTrackerIds}
              showCustomForm={showCustomTrackerForm}
              setShowCustomForm={setShowCustomTrackerForm}
              customName={customTrackerName}
              setCustomName={setCustomTrackerName}
              customEmoji={customTrackerEmoji}
              setCustomEmoji={setCustomTrackerEmoji}
              onAddCustomTracker={(tracker) => {
                setAvailableTrackers([...availableTrackers, tracker]);
                setSelectedTrackerIds([...selectedTrackerIds, tracker.id]);
                setShowCustomTrackerForm(false);
                setCustomTrackerName('');
                setCustomTrackerEmoji('');
              }}
            />
          )}

          {step === 2 && (
            <Step2Fields trackers={customizedTrackers} setTrackers={setCustomizedTrackers} />
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <button
            onClick={handleBack}
            className="btn-secondary px-6 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={step === 1 && selectedTrackerIds.length === 0}
            className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: TRACKER CATEGORY SELECTION
// ============================================================================
function Step1Trackers({
  availableTrackers,
  selectedTrackerIds,
  setSelectedTrackerIds,
  showCustomForm,
  setShowCustomForm,
  customName,
  setCustomName,
  customEmoji,
  setCustomEmoji,
  onAddCustomTracker,
}: Step1TrackersProps) {
  const toggleSelection = (id: string) => {
    if (selectedTrackerIds.includes(id)) {
      setSelectedTrackerIds(selectedTrackerIds.filter((tId: string) => tId !== id));
    } else {
      setSelectedTrackerIds([...selectedTrackerIds, id]);
    }
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAddCustomTracker({
      id: generateId(),
      name: customName.trim(),
      emoji: customEmoji.trim(),
      fields: [{ id: generateId(), name: 'Value', type: 'number' }],
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {availableTrackers.map((tracker: Tracker) => {
          const isSelected = selectedTrackerIds.includes(tracker.id);
          return (
            <button
              key={tracker.id}
              onClick={() => toggleSelection(tracker.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {tracker.emoji && <span>{tracker.emoji}</span>}
              {tracker.name}
            </button>
          );
        })}
      </div>

      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full py-3 rounded-xl border border-dashed text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          + Create Custom Tracker
        </button>
      ) : (
        <div
          className="flex flex-col gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            New Custom Tracker
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="🎬"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              className="w-12 bg-transparent border-b focus:outline-none text-center text-lg pb-1"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              maxLength={2}
            />
            <input
              type="text"
              placeholder="Example: Editing Sessions"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-transparent border-b focus:outline-none text-sm pb-1"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowCustomForm(false)}
              className="text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="btn-primary text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Add Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 2: CUSTOM FIELD BUILDER
// ============================================================================
function Step2Fields({ trackers, setTrackers }: Step2FieldsProps) {
  const updateTrackerName = (tId: string, newName: string) => {
    setTrackers(trackers.map((t: Tracker) => (t.id === tId ? { ...t, name: newName } : t)));
  };

  const updateField = (tId: string, fId: string, key: string, value: string) => {
    setTrackers(
      trackers.map((t: Tracker) => {
        if (t.id !== tId) return t;
        return {
          ...t,
          fields: t.fields.map((f: Field) => (f.id === fId ? { ...f, [key]: value } : f)),
        };
      })
    );
  };

  const removeField = (tId: string, fId: string) => {
    setTrackers(
      trackers.map((t: Tracker) => {
        if (t.id !== tId) return t;
        return { ...t, fields: t.fields.filter((f: Field) => f.id !== fId) };
      })
    );
  };

  const addField = (tId: string) => {
    setTrackers(
      trackers.map((t: Tracker) => {
        if (t.id !== tId) return t;
        return {
          ...t,
          fields: [...t.fields, { id: generateId(), name: 'New Field', type: 'text' }],
        };
      })
    );
  };

  return (
    <div className="flex flex-col gap-5 max-h-[55vh] overflow-y-auto pb-4 pr-1">
      {trackers.map((tracker: Tracker) => (
        <div
          key={tracker.id}
          className="flex flex-col gap-4 p-5 rounded-xl border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-center gap-2 border-b pb-3"
            style={{ borderColor: 'var(--border)' }}
          >
            {tracker.emoji && <span className="text-xl">{tracker.emoji}</span>}
            <input
              type="text"
              value={tracker.name}
              onChange={(e) => updateTrackerName(tracker.id, e.target.value)}
              className="bg-transparent font-bold focus:outline-none text-lg w-full"
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {tracker.fields.map((field: Field) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(tracker.id, field.id, 'name', e.target.value)}
                  className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(tracker.id, field.id, 'type', e.target.value)}
                  className="w-[105px] bg-transparent border rounded-lg px-2 py-2 text-xs focus:outline-none cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--background)',
                  }}
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="currency">Currency</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="timer">Timer</option>
                </select>
                <button
                  onClick={() => removeField(tracker.id, field.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  title="Remove Field"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addField(tracker.id)}
            className="w-full py-2.5 mt-1 rounded-lg border border-dashed text-sm font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            + Add Custom Field
          </button>
        </div>
      ))}
    </div>
  );
}
