'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStorageKey, loadState, saveState } from '@/lib/store';
import { useUser, SESSION_KEY } from '@/contexts/UserContext';
import AppButton from '@/components/ui/AppButton';

interface OnboardingAnswers {
  role: string;
  trackingGoal: string[];
  priority: string;
  trackingStyle: string;
  wantsTargets: string;
}

const TRACKING_OPTIONS_BY_ROLE: Record<string, string[]> = {
  Student: ['Study hours', 'Subjects', 'Assignments', 'Habits'],
  Freelancer: ['Work hours', 'Projects', 'Clients', 'Earnings'],
  Business: ['Revenue', 'Team performance', 'Tasks', 'Growth metrics'],
};

const BASE_STEPS = [
  {
    id: 1,
    question: 'Who are you?',
    key: 'role',
    type: 'single',
    options: ['Student', 'Freelancer', 'Business'],
  },
  {
    id: 2,
    question: 'What do you want to track?',
    key: 'trackingGoal',
    type: 'multi',
    options: [] as string[],
  },
  {
    id: 3,
    question: 'What matters most to you?',
    key: 'priority',
    type: 'single',
    options: ['Consistency', 'Productivity', 'Growth', 'Earnings', 'Discipline'],
  },
  {
    id: 4,
    question: 'How do you want to track?',
    key: 'trackingStyle',
    type: 'single',
    options: ['Simple', 'Detailed', 'Automated'],
  },
  {
    id: 5,
    question: 'Do you want daily targets?',
    key: 'wantsTargets',
    type: 'single',
    options: ['Yes', 'No'],
  },
];

export default function AIOnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    role: '',
    trackingGoal: [],
    priority: '',
    trackingStyle: '',
    wantsTargets: '',
  });

  useEffect(() => {
    console.log('[AIOnboarding] Mounting, user:', user?.email);
    if (!user) {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        console.log('[AIOnboarding] No session, redirecting to landing');
        router.replace('/');
      }
    } else if (!user.isNewAccount) {
      console.log('[AIOnboarding] Not a new account, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, router]);

  const steps = BASE_STEPS.map((s) => {
    if (s.id === 2) {
      return { ...s, options: TRACKING_OPTIONS_BY_ROLE[answers.role] ?? [] };
    }
    return s;
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const getCurrentAnswer = () => answers[step.key as keyof OnboardingAnswers];

  const isOptionSelected = (option: string) => {
    const val = getCurrentAnswer();
    if (step.type === 'multi') return (val as string[]).includes(option);
    return val === option;
  };

  const handleSelect = (option: string) => {
    if (step.type === 'multi') {
      const current = answers.trackingGoal;
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setAnswers((prev) => ({ ...prev, trackingGoal: updated }));
    } else {
      if (step.key === 'role' && option !== answers.role) {
        setAnswers((prev) => ({ ...prev, role: option, trackingGoal: [] }));
      } else {
        setAnswers((prev) => ({ ...prev, [step.key]: option }));
      }
    }
  };

  const canProceed = () => {
    const val = getCurrentAnswer();
    if (step.type === 'multi') return (val as string[]).length > 0;
    return (val as string) !== '';
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastStep) {
      try {
        console.log('[AIOnboarding] Finishing setup...');
        const userId = user?.email || 'guest';
        const isFreelancer = answers.role === 'Freelancer';
        const isStudent = answers.role === 'Student';

        const generatedTrackers = [];
        if (isFreelancer) {
          generatedTrackers.push(
            {
              name: 'Work Tracker',
              emoji: '💼',
              fields: [
                { name: 'Work Hours', type: 'number' },
                { name: 'Tasks Completed', type: 'number' },
              ],
            },
            {
              name: 'Client Tracker',
              emoji: '🤝',
              fields: [
                { name: 'Meetings', type: 'number' },
                { name: 'Client Name', type: 'text' },
              ],
            },
            {
              name: 'Revenue Tracker',
              emoji: '💰',
              fields: [
                { name: 'Earnings', type: 'number' },
                { name: 'Source', type: 'text' },
              ],
            }
          );
        } else if (isStudent) {
          generatedTrackers.push(
            {
              name: 'Study Tracker',
              emoji: '📚',
              fields: [
                { name: 'Study Hours', type: 'number' },
                { name: 'Subject', type: 'text' },
              ],
            },
            {
              name: 'Assignment Tracker',
              emoji: '📝',
              fields: [
                { name: 'Assignments', type: 'number' },
                { name: 'Subject', type: 'text' },
              ],
            }
          );
        } else {
          generatedTrackers.push(
            {
              name: 'Business Tracker',
              emoji: '📈',
              fields: [
                { name: 'Revenue', type: 'number' },
                { name: 'Meetings', type: 'number' },
              ],
            },
            {
              name: 'Team Tracker',
              emoji: '👥',
              fields: [{ name: 'Team Performance', type: 'text' }],
            }
          );
        }

        const fieldsToSave: any[] = [];
        const targetsToSave: any[] = [];
        const generateIdStr = () => Math.random().toString(36).substring(2, 9);
        const colors = ['#38BDF8', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E'];

        generatedTrackers.forEach((tracker, idx) => {
          tracker.fields.forEach((f, fIdx) => {
            const fieldId = `field-${generateIdStr()}`;
            fieldsToSave.push({
              id: fieldId,
              name: `${tracker.name} - ${f.name}`,
              type: f.type,
              unit: f.type === 'number' ? (f.name.toLowerCase().includes('hour') ? 'hrs' : '') : '',
              defaultValue: f.type === 'number' ? '0' : '',
              color: colors[(idx + fIdx) % colors.length],
            });

            if (f.type === 'number' && targetsToSave.length < 2) {
              targetsToSave.push({
                fieldId,
                targetValue: f.name.toLowerCase().includes('hour') ? 4 : 5,
                type: 'daily',
              });
            }
          });
        });

        const existingState = loadState(userId);
        const newState = {
          ...existingState,
          fields: fieldsToSave,
          targets: answers.wantsTargets === 'Yes' ? targetsToSave : [],
        };
        saveState(newState, userId);
        localStorage.setItem(`onboarding_${userId}`, JSON.stringify(answers));

        if (answers.wantsTargets === 'Yes') {
          router.push('/onboarding/targets');
        } else {
          console.log('[AIOnboarding] Clearing isNewAccount and finishing');
          updateUser({ isNewAccount: false });
          router.push('/dashboard');
        }
      } catch (e) {
        console.error('[AIOnboarding] Error finishing:', e);
        router.push('/dashboard');
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10 animate-in fade-in duration-700">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary/60">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {step.question}
          </h1>
          {step.type === 'multi' && (
            <p className="text-sm text-muted-foreground font-medium">
              Select all that apply
            </p>
          )}
        </div>

        <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 shadow-glow-primary"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col gap-3">
          {step.options.map((option) => {
            const selected = isOptionSelected(option);
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  selected 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-card border-border hover:border-border/80 text-foreground'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 pt-4">
          <AppButton
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6"
          >
            Back
          </AppButton>
          <AppButton
            onClick={handleNext}
            disabled={!canProceed()}
            fullWidth
            size="lg"
          >
            {isLastStep ? 'Complete setup' : 'Continue'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
