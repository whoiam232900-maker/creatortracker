'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, saveState } from '@/lib/store';
import { useUser, SESSION_KEY } from '@/contexts/UserContext';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';

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
      { id: generateId(), name: 'Time Spent', type: 'number' },
      { id: generateId(), name: 'Milestones', type: 'text' },
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue',
    fields: [
      { id: generateId(), name: 'Amount', type: 'number' },
      { id: generateId(), name: 'Source', type: 'text' },
    ],
  },
  {
    id: 'habits',
    name: 'Habits',
    fields: [
      { id: generateId(), name: 'Completed', type: 'number' },
      { id: generateId(), name: 'Notes', type: 'text' },
    ],
  },
];

export default function ManualOnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [step, setStep] = useState(1);

  const [availableTrackers, setAvailableTrackers] = useState<Tracker[]>(DEFAULT_TRACKERS);
  const [selectedTrackerIds, setSelectedTrackerIds] = useState<string[]>([]);
  const [showCustomTrackerForm, setShowCustomTrackerForm] = useState(false);
  const [customTrackerName, setCustomTrackerName] = useState('');
  const [customTrackerEmoji, setCustomTrackerEmoji] = useState('');

  const [customizedTrackers, setCustomizedTrackers] = useState<Tracker[]>([]);

  useEffect(() => {
    console.log('[ManualOnboarding] Mounting, user:', user?.email);
    if (!user) {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        console.log('[ManualOnboarding] No session, to landing');
        router.replace('/');
      }
    } else if (!user.isNewAccount) {
      console.log('[ManualOnboarding] Not new account, to dashboard');
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleNext = () => {
    if (step === 1) {
      const selected = availableTrackers.filter((t) => selectedTrackerIds.includes(t.id));
      setCustomizedTrackers(JSON.parse(JSON.stringify(selected)));
      setStep(2);
    } else if (step === 2) {
      try {
        console.log('[ManualOnboarding] Finishing setup...');
        const userId = user?.email || 'guest';
        const fieldsToSave: any[] = [];
        const colors = ['#38BDF8', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E'];
        let colorIdx = 0;

        customizedTrackers.forEach((tracker) => {
          tracker.fields.forEach((f) => {
            fieldsToSave.push({
              id: f.id,
              name: `${tracker.name} - ${f.name}`,
              type: 'number',
              unit: '',
              defaultValue: '0',
              color: colors[colorIdx++ % colors.length],
            });
          });
        });

        const existingState = loadState(userId);
        const newState = { ...existingState, fields: fieldsToSave };
        saveState(newState, userId);

        const manualSetup = {
          trackers: customizedTrackers.map((t) => ({
            name: t.name,
            emoji: t.emoji,
            fields: t.fields.map((f) => ({ name: f.name, type: f.type })),
          })),
        };
        localStorage.setItem(`onboarding_${userId}`, JSON.stringify(manualSetup));
        router.push('/onboarding/targets');
      } catch (e) {
        console.error('[ManualOnboarding] Error finishing:', e);
        router.push('/onboarding/targets');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-lg h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-10 relative z-10 animate-in fade-in duration-700">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary/60">
            Step {step} <span className="text-muted-foreground/30 mx-1">/</span> 2
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {step === 1 && 'Select categories'}
            {step === 2 && 'Customize fields'}
          </h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {step === 1 && 'Choose what you want to track in your workspace.'}
            {step === 2 && 'Fine-tune the data points for each tracker.'}
          </p>
        </div>

        <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 shadow-glow-primary"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-8">
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

        <div className="flex items-center justify-between gap-4 pt-4">
          <AppButton variant="ghost" onClick={handleBack} className="px-6">
            Back
          </AppButton>
          <AppButton
            onClick={handleNext}
            disabled={step === 1 && selectedTrackerIds.length === 0}
            fullWidth
            size="lg"
          >
            {step === 1 ? 'Continue' : 'Finish setup'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

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
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                isSelected 
                  ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                  : 'bg-card border-border hover:border-border/80 text-foreground'
              }`}
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
          className="w-full py-3 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground/60 hover:text-foreground hover:border-muted-foreground/40 transition-all duration-200"
        >
          + Add custom category
        </button>
      ) : (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider px-1">New category</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="🎬"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              className="w-10 bg-muted/30 border border-border rounded-lg text-center text-lg focus:outline-none focus:border-primary/50"
              maxLength={2}
            />
            <input
              type="text"
              placeholder="e.g. Content Creation"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <AppButton variant="ghost" size="xs" onClick={() => setShowCustomForm(false)}>Cancel</AppButton>
            <AppButton size="xs" onClick={handleAddCustom} disabled={!customName.trim()}>Add</AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

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
          fields: [...t.fields, { id: generateId(), name: 'New Field', type: 'number' }],
        };
      })
    );
  };

  return (
    <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
      {trackers.map((tracker: Tracker) => (
        <div key={tracker.id} className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-card/50">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {tracker.emoji && <span className="text-xl">{tracker.emoji}</span>}
            <input
              type="text"
              value={tracker.name}
              onChange={(e) => updateTrackerName(tracker.id, e.target.value)}
              className="bg-transparent font-bold text-foreground focus:outline-none text-lg w-full"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            {tracker.fields.map((field: Field) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(tracker.id, field.id, 'name', e.target.value)}
                  className="flex-1 bg-muted/20 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={() => removeField(tracker.id, field.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addField(tracker.id)}
            className="w-full py-2 mt-1 rounded-lg border border-dashed border-border text-xs font-semibold text-muted-foreground/60 hover:text-foreground hover:border-muted-foreground/40 transition-all duration-200"
          >
            + Add field
          </button>
        </div>
      ))}
    </div>
  );
}
