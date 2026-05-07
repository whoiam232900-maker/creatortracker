'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    options: [] as string[], // dynamically filled
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    role: '',
    trackingGoal: [],
    priority: '',
    trackingStyle: '',
    wantsTargets: '',
  });

  // Build steps with dynamic Step 2 options based on selected role
  const steps = BASE_STEPS.map((s) => {
    if (s.id === 2) {
      return {
        ...s,
        options: TRACKING_OPTIONS_BY_ROLE[answers.role] ?? [],
      };
    }
    return s;
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const getCurrentAnswer = () => {
    return answers[step.key as keyof OnboardingAnswers];
  };

  const isOptionSelected = (option: string) => {
    const val = getCurrentAnswer();
    if (step.type === 'multi') {
      return (val as string[]).includes(option);
    }
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
      // When role changes, reset trackingGoal since options will change
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
      localStorage.setItem('onboardingData', JSON.stringify(answers));

      const isFreelancer = answers.role === 'Freelancer';
      const isStudent = answers.role === 'Student';

      const generatedTrackers = [];
      if (isFreelancer) {
        generatedTrackers.push(
          { name: 'Work Tracker', emoji: '💼', fields: [{ name: 'Work Hours', type: 'number' }, { name: 'Tasks Completed', type: 'number' }] },
          { name: 'Client Tracker', emoji: '🤝', fields: [{ name: 'Meetings', type: 'number' }, { name: 'Client Name', type: 'text' }] },
          { name: 'Revenue Tracker', emoji: '💰', fields: [{ name: 'Earnings', type: 'number' }, { name: 'Source', type: 'text' }] }
        );
      } else if (isStudent) {
        generatedTrackers.push(
          { name: 'Study Tracker', emoji: '📚', fields: [{ name: 'Study Hours', type: 'number' }, { name: 'Subject', type: 'text' }] },
          { name: 'Assignment Tracker', emoji: '📝', fields: [{ name: 'Assignments', type: 'number' }, { name: 'Subject', type: 'text' }] }
        );
      } else {
        generatedTrackers.push(
          { name: 'Business Tracker', emoji: '📈', fields: [{ name: 'Revenue', type: 'number' }, { name: 'Meetings', type: 'number' }] },
          { name: 'Team Tracker', emoji: '👥', fields: [{ name: 'Team Performance', type: 'text' }] }
        );
      }

      localStorage.setItem('manualSetup', JSON.stringify({ trackers: generatedTrackers }));

      const fieldsToSave: any[] = [];
      const targetsToSave: any[] = [];
      const generateIdStr = () => Math.random().toString(36).substring(2, 9);
      const colors = ['#2563EB', '#0EA5E9', '#16A34A', '#D97706', '#9333EA', '#DB2777'];

      generatedTrackers.forEach((tracker, idx) => {
        tracker.fields.forEach((f, fIdx) => {
          const fieldId = `field-${generateIdStr()}`;
          fieldsToSave.push({
            id: fieldId,
            name: `${tracker.name} - ${f.name}`,
            type: f.type,
            unit: f.type === 'number' ? (f.name.toLowerCase().includes('hour') ? 'hrs' : '') : '',
            defaultValue: f.type === 'number' ? '0' : '',
            color: colors[(idx + fIdx) % colors.length]
          });

          if (f.type === 'number' && targetsToSave.length < 2) {
            targetsToSave.push({
              fieldId,
              targetValue: f.name.toLowerCase().includes('hour') ? 4 : 5,
              type: 'daily'
            });
          }
        });
      });

      try {
        const rawState = localStorage.getItem('creator_tracker_v2');
        const state = rawState ? JSON.parse(rawState) : { entries: [], theme: 'light' };
        state.fields = fieldsToSave;
        state.targets = answers.wantsTargets === 'Yes' ? targetsToSave : [];
        localStorage.setItem('creator_tracker_v2', JSON.stringify(state));
      } catch(e) {}

      const timerEnabled = answers.role === 'Student' || answers.role === 'Freelancer';
      localStorage.setItem('featureSettings', JSON.stringify({ timerEnabled }));

      if (answers.wantsTargets === 'Yes') {
        router.push('/onboarding/targets');
      } else {
        router.push('/auth');
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1 text-center">
          <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Step {currentStep + 1} of {steps.length}
          </p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            {step.question}
          </h1>
          {step.type === 'multi' && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Select all that apply
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: 'var(--primary)',
            }}
          />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {step.options.map((option) => {
            const selected = isOptionSelected(option);
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: selected ? 'var(--primary)' : 'var(--card)',
                  color: selected ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderColor: selected ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-secondary px-6 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary flex-1 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLastStep ? 'Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
