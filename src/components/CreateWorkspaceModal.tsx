'use client';

import React, { useState } from 'react';
import { 
  Building, Sparkles, 
  Settings, Users, Target, Palette, Check, Eye, Zap,
  Layout, ChevronLeft, ChevronRight
} from 'lucide-react';
import AppModal from './ui/AppModal';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';
import AppCard from './ui/AppCard';
import AppBadge from './ui/AppBadge';
import { useWorkspace, Workspace } from '@/contexts/WorkspaceContext';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 'name', label: 'General', icon: Building },
  { id: 'style', label: 'Setup', icon: Sparkles },
  { id: 'purpose', label: 'Purpose', icon: Layout },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'preview', label: 'Review', icon: Eye },
];

const PURPOSES = [
  'Editing Team', 'Content Agency', 'Study Tracking', 
  'Productivity', 'Personal Brand', 'Freelance Studio'
];

const TEAM_SIZES = [
  { label: 'Solo', value: '1', desc: 'Just me, myself and I.' },
  { label: 'Small Team', value: '2-5', desc: 'A tight-knit collaboration.' },
  { label: 'Growing Agency', value: '5-20', desc: 'Expanding operations.' },
  { label: 'Enterprise', value: '20+', desc: 'Scaling to new heights.' },
];

const GOALS = [
  'Track Productivity', 'Manage Team', 'Analyze Performance', 
  'AI Automation', 'Goal Tracking', 'Client Management'
];

const THEMES = [
  { id: 'Midnight', color: '#1e293b' },
  { id: 'Graphite', color: '#27272a' },
  { id: 'Frost', color: '#f8fafc' },
  { id: 'Purple Noir', color: '#2e1065' },
  { id: 'OLED Black', color: '#000000' },
] as const;

export default function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Workspace>>({
    name: '',
    style: 'Manual',
    purpose: 'Productivity',
    teamSize: '1',
    goals: [],
    theme: 'Midnight',
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleCreate = async () => {
    setIsCreating(true);
    await new Promise(r => setTimeout(r, 1500));
    await createWorkspace(formData);
    setIsCreating(false);
    onClose();
    setCurrentStep(0);
    setFormData({
      name: '',
      style: 'Manual',
      purpose: 'Productivity',
      teamSize: '1',
      goals: [],
      theme: 'Midnight',
    });
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...(prev.goals || []), goal]
    }));
  };

  return (
    <AppModal 
      isOpen={isOpen} 
      onClose={onClose} 
      noPadding 
      maxWidth="max-w-5xl"
    >
      <div className="flex h-[640px] overflow-hidden bg-card relative">
        {/* Left Progress Sidebar */}
        <div className="w-64 border-r border-border bg-muted/20 p-8 flex flex-col hidden lg:flex">
          <div className="mb-10">
            <h2 className="text-xl font-bold text-foreground tracking-tight">New Workspace</h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium opacity-60">Complete the steps below.</p>
          </div>

          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === i;
              const isCompleted = currentStep > i;

              return (
                <div key={step.id} className="flex items-center gap-3.5 group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border-primary text-primary shadow-sm' : 
                    isCompleted ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    'bg-muted border-border text-muted-foreground/40'
                  }`}>
                    {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
             <div className="p-4 rounded-xl border border-border bg-background/50">
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={14} className="text-primary" />
                 <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Quick Note</span>
               </div>
               <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                 You can change these settings later in the workspace settings.
               </p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <div className="flex-1 p-10 sm:p-12 overflow-y-auto scrollbar-thin">
            {/* STEP 1: NAME */}
            {currentStep === 0 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">General Info</h1>
                  <p className="text-base text-muted-foreground font-medium">Give your workspace a name to get started.</p>
                </div>
                
                <div className="space-y-6 pt-4">
                  <div className="relative group">
                    <AppInput 
                      placeholder="e.g. Creative Studio"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                      className="text-xl font-bold py-6 px-6 rounded-xl border-border bg-muted/30"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg pointer-events-none transition-transform group-focus-within:scale-105">
                      {formData.name?.substring(0, 1).toUpperCase() || '?'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: STYLE */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Setup Mode</h1>
                  <p className="text-base text-muted-foreground font-medium">Choose how you want to configure your trackers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {[
                    { id: 'AI', title: 'AI-Generated', desc: 'Auto-generate fields and targets based on your goals.', icon: Sparkles, color: 'text-purple-500' },
                    { id: 'Manual', title: 'Manual Setup', desc: 'Start from scratch and build your own custom structure.', icon: Settings, color: 'text-primary' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setFormData(prev => ({ ...prev, style: style.id as any }))}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${
                        formData.style === style.id 
                          ? 'bg-primary/5 border-primary shadow-sm' 
                          : 'bg-muted/10 border-border/50 hover:border-border hover:bg-muted/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 border transition-all duration-300 group-hover:scale-105 ${
                         formData.style === style.id ? 'bg-primary/10 border-primary/20 ' + style.color : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        <style.icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{style.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium opacity-60 leading-snug">{style.desc}</p>
                      {formData.style === style.id && <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm animate-in zoom-in duration-300"><Check size={12} className="text-primary-foreground font-bold" /></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: PURPOSE */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Purpose</h1>
                  <p className="text-base text-muted-foreground font-medium">Select the primary focus of this workspace.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  {PURPOSES.map(purpose => (
                    <button
                      key={purpose}
                      onClick={() => setFormData(prev => ({ ...prev, purpose }))}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 flex items-center justify-between group ${
                        formData.purpose === purpose 
                          ? 'bg-primary/10 border-primary/50 text-primary shadow-sm' 
                          : 'bg-muted/10 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                    >
                      <span className="text-sm font-semibold">{purpose}</span>
                      {formData.purpose === purpose && <Check size={14} className="animate-in zoom-in duration-200" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: TEAM SIZE */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Size</h1>
                  <p className="text-base text-muted-foreground font-medium">How many people will be collaborating here?</p>
                </div>

                <div className="space-y-3 pt-4">
                  {TEAM_SIZES.map(size => (
                    <button
                      key={size.value}
                      onClick={() => setFormData(prev => ({ ...prev, teamSize: size.value }))}
                      className={`w-full p-5 rounded-xl border text-left transition-all duration-300 flex items-center gap-5 group ${
                        formData.teamSize === size.value 
                          ? 'bg-primary/5 border-primary/50 shadow-sm' 
                          : 'bg-muted/10 border-border/50 hover:bg-muted/20 hover:border-border'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${formData.teamSize === size.value ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground/40'}`}>
                        <Users size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-bold transition-colors ${formData.teamSize === size.value ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{size.label}</p>
                        <p className="text-xs text-muted-foreground/60 font-medium">{size.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${formData.teamSize === size.value ? 'border-primary bg-primary shadow-sm' : 'border-border/60'}`}>
                        {formData.teamSize === size.value && <Check size={12} className="text-primary-foreground font-bold animate-in zoom-in duration-200" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: GOALS */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Main Goals</h1>
                  <p className="text-base text-muted-foreground font-medium">What do you want to achieve with this workspace?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 relative group overflow-hidden ${
                        formData.goals?.includes(goal)
                          ? 'bg-primary/10 border-primary/50 text-primary' 
                          : 'bg-muted/10 border-border/40 hover:bg-muted/20'
                      }`}
                    >
                      <h4 className={`text-[13px] font-bold transition-colors ${formData.goals?.includes(goal) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {goal}
                      </h4>
                      {formData.goals?.includes(goal) && (
                        <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-200">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: THEME */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Visual Theme</h1>
                  <p className="text-base text-muted-foreground font-medium">Choose a theme that fits your aesthetic.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center gap-4 group ${
                        formData.theme === theme.id 
                          ? 'bg-primary/5 border-primary/50 shadow-sm' 
                          : 'bg-muted/10 border-border/50 hover:bg-muted/20'
                      }`}
                    >
                      <div className="w-14 h-8 rounded border border-border/50 overflow-hidden flex shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <div className="w-1/3 h-full" style={{ backgroundColor: theme.color }}></div>
                        <div className="flex-1 h-full bg-background flex flex-col p-1 gap-1">
                          <div className="h-1 w-full bg-muted rounded-full"></div>
                          <div className="h-1 w-2/3 bg-muted/50 rounded-full"></div>
                        </div>
                      </div>
                      <span className={`text-[13px] font-bold flex-1 transition-colors ${formData.theme === theme.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{theme.id}</span>
                      {formData.theme === theme.id && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm animate-in zoom-in duration-200"><Check size={10} className="text-primary-foreground font-bold" /></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: PREVIEW */}
            {currentStep === 6 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Ready to go</h1>
                  <p className="text-base text-muted-foreground font-medium">Review your configuration before creating.</p>
                </div>

                <AppCard className="bg-muted/5 border-primary/20 rounded-2xl p-8 relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-4xl shadow-sm">
                      {formData.name?.substring(0, 1).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">{formData.name}</h2>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                        <AppBadge variant="neutral" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{formData.purpose}</AppBadge>
                        <AppBadge variant="default" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{formData.theme} Theme</AppBadge>
                        <AppBadge variant="neutral" className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{formData.teamSize} Member(s)</AppBadge>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mt-8 border-t border-border pt-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">Setup Mode</p>
                           <p className="text-sm font-semibold text-foreground/80">{formData.style}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">Goals</p>
                           <p className="text-sm font-semibold text-foreground/80">{formData.goals?.length || 0} selected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AppCard>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-8 border-t border-border bg-muted/10 flex items-center justify-between">
            <AppButton 
              variant="ghost" 
              size="md"
              onClick={prevStep} 
              disabled={currentStep === 0 || isCreating}
              icon={ChevronLeft}
            >
              Back
            </AppButton>

            <AppButton 
              size="md"
              onClick={currentStep === STEPS.length - 1 ? handleCreate : nextStep}
              isLoading={isCreating}
              disabled={currentStep === 0 && !formData.name}
              icon={ChevronRight}
              iconPosition="right"
              className="min-w-[140px]"
            >
              {currentStep === STEPS.length - 1 ? 'Create Workspace' : 'Continue'}
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
