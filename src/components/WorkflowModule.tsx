import React, { useState, useEffect, useRef } from 'react';
import { Workflow, WorkflowStatus, saveState, AppState, generateId } from '@/lib/store';
import {
  WORKFLOW_TEMPLATES,
  createWorkflowFromTemplate,
  createCustomWorkflow,
} from '@/lib/workflowTemplates';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Archive,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Layout,
  ArrowRight,
  MousePointer2,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubscription } from '@/hooks/useSubscription';

interface WorkflowModuleProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState | null>>;
  userId?: string;
}

const STATUS_META: Record<
  WorkflowStatus,
  { dot: string; text: string; bg: string; border: string; glow: string }
> = {
  Pending: {
    dot: '#94a3b8',
    text: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.15)',
    glow: 'rgba(148,163,184,0.04)',
  },
  'In Progress': {
    dot: '#60a5fa',
    text: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.15)',
    glow: 'rgba(96,165,250,0.06)',
  },
  Review: {
    dot: '#fbbf24',
    text: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.15)',
    glow: 'rgba(251,191,36,0.04)',
  },
  Completed: {
    dot: '#34d399',
    text: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.15)',
    glow: 'rgba(52,211,153,0.05)',
  },
  Delivered: {
    dot: '#a78bfa',
    text: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.15)',
    glow: 'rgba(167,139,250,0.04)',
  },
};

const ALL_STATUSES = Object.keys(STATUS_META) as WorkflowStatus[];

function getOperationalHint(wf: Workflow): string | null {
  const done = wf.checkpoints.filter((c) => c.isCompleted).length;
  const total = wf.checkpoints.length;
  const pct = total === 0 ? 0 : done / total;
  const labels = wf.checkpoints.filter((c) => c.isCompleted).map((c) => c.label.toLowerCase());

  const hasExport = labels.some(
    (l) =>
      l.includes('export') ||
      l.includes('upload') ||
      l.includes('deliver') ||
      l.includes('submit') ||
      l.includes('send')
  );

  if (wf.status === 'Delivered') return null;
  if (isRecentlyExported(wf))
    return 'Export detected · Suggest Delivered';
  if (wf.status === 'Completed' && hasExport) return 'Finalized · Ready for delivery';
  if (pct === 1 && wf.status === 'In Progress') return 'All steps done · Review suggested';
  if (pct === 1 && wf.status === 'Review') return 'Awaiting approval';
  if (pct === 1 && wf.status === 'Pending') return 'Steps complete · Update status';
  if (hasExport && wf.status === 'Review') return 'Delivery pending';
  if (wf.status === 'In Progress' && pct >= 0.7 && pct < 1) return 'Nearing completion';
  if (wf.status === 'In Progress' && pct > 0 && pct < 0.5) return 'Execution momentum';
  if (wf.status === 'Review' && pct < 1) return 'Blocked by revisions';
  return null;
}

function isRecentlyExported(wf: Workflow): boolean {
  const labels = wf.checkpoints.filter((c) => c.isCompleted).map((c) => c.label.toLowerCase());
  return labels.some(
    (l) =>
      l.includes('export') ||
      l.includes('upload') ||
      l.includes('deliver') ||
      l.includes('submit') ||
      l.includes('send')
  );
}

import PremiumUnlockModal from './PremiumUnlockModal';

export default function WorkflowModule({ state, setState, userId }: WorkflowModuleProps) {
  const { settings } = useSettings();
  const { withinLimit, triggerUpgrade } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  if (!settings.enableWorkflowTracking) return null;

  const workflows = (state.workflows || []).filter((w) => !w.archived);
  // ... rest of methods ...


  const updateWorkflow = (updatedWf: Workflow) => {
    const newState = {
      ...state,
      workflows: (state.workflows || []).map((w) => (w.id === updatedWf.id ? updatedWf : w)),
    };
    setState(newState);
    saveState(newState, userId);
  };

  const addWorkflow = (wf: Workflow) => {
    const newState = { ...state, workflows: [wf, ...(state.workflows || [])] };
    setState(newState);
    saveState(newState, userId);
    setIsModalOpen(false);
  };

  const deleteWorkflow = (id: string) => {
    const newState = { ...state, workflows: (state.workflows || []).filter((w) => w.id !== id) };
    setState(newState);
    saveState(newState, userId);
  };

  const duplicateWorkflow = (wf: Workflow) => {
    const newWf: Workflow = {
      ...wf,
      id: generateId('wf'),
      name: `${wf.name} (Copy)`,
      status: 'Pending',
      checkpoints: wf.checkpoints.map((c) => ({ ...c, id: generateId('chk'), isCompleted: false })),
      timeLoggedMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addWorkflow(newWf);
  };

  const archiveWorkflow = (id: string) => {
    const newState = {
      ...state,
      workflows: (state.workflows || []).map((w) =>
        w.id === id ? { ...w, archived: true, updatedAt: new Date().toISOString() } : w
      ),
    };
    setState(newState);
    saveState(newState, userId);
  };

  const getGridLayout = () => {
    if (workflows.length === 1) return 'flex justify-center';
    if (workflows.length === 2) return 'grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-4';
    return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.03] border border-white/[0.05]">
            <CheckCircle2 size={12} className="text-muted-foreground" strokeWidth={2} />
          </div>
          <h2 className="text-[14px] font-semibold tracking-tight text-foreground/90">Workflows</h2>
          {workflows.length > 0 && (
            <span className="text-[11px] font-medium bg-white/[0.04] px-1.5 py-0.5 rounded-full text-muted-foreground/60">
              {workflows.length}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (!withinLimit('workflowsLimit', workflows.length)) {
              setShowUnlockModal(true);
              return;
            }
            setEditingWorkflow(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/[0.06] active:scale-[0.98]"

          style={{
            color: 'var(--foreground)',
            opacity: 0.9,
            transition: 'opacity 150ms ease, border-color 150ms ease, background-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.opacity = '1';
            el.style.backgroundColor = 'rgba(255,255,255,0.04)';
            el.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.opacity = '0.9';
            el.style.backgroundColor = 'transparent';
            el.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <Plus size={14} strokeWidth={2} />
          Create Workflow
        </button>
      </div>

      {/* Content */}
      {workflows.length === 0 ? (
        <div
          className="rounded-2xl py-12 flex flex-col items-center justify-center border border-dashed border-white/[0.08] bg-white/[0.005] cursor-pointer"
          style={{ transition: 'background-color 200ms ease, border-color 200ms ease' }}
          onClick={() => {
            if (!withinLimit('workflowsLimit', workflows.length)) {
              setShowUnlockModal(true);
              return;
            }
            setIsModalOpen(true);
          }}

          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = 'rgba(255,255,255,0.01)';
            el.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = 'rgba(255,255,255,0.005)';
            el.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/[0.05] mb-4">
            <Layout size={20} className="text-muted-foreground/40" />
          </div>
          <p className="text-[13px] font-medium mb-4 text-muted-foreground/60">
            No active workflows
          </p>
          <button
            className="text-[12px] font-medium px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] active:scale-95"
            style={{
              color: 'var(--foreground)',
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = 'rgba(255,255,255,0.08)';
              el.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = 'rgba(255,255,255,0.04)';
              el.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            Create Workflow
          </button>
        </div>
      ) : (
        <div className={getGridLayout()}>
          {workflows.map((wf) => (
            <div key={wf.id} className={workflows.length === 1 ? 'w-full max-w-md' : ''}>
              <WorkflowCard
                workflow={wf}
                updateWorkflow={updateWorkflow}
                onDelete={() => deleteWorkflow(wf.id)}
                onDuplicate={() => duplicateWorkflow(wf)}
                onArchive={() => archiveWorkflow(wf.id)}
                onEdit={() => {
                  setEditingWorkflow(wf);
                  setIsModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <WorkflowCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(wf) => (editingWorkflow ? updateWorkflow(wf) : addWorkflow(wf))}
          editingWorkflow={editingWorkflow}
        />
      )}

      <PremiumUnlockModal 
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title="Unlock Unlimited Workflows"
        description="Your operational complexity has reached the free-tier limit. Upgrade to Pro to manage unlimited workflows and custom templates."
        featureName="Workflows"
        benefits={[
          "Unlimited active workflows",
          "Advanced custom checkpoint templates",
          "Operational intelligence suggestions",
          "Workflow duplication & archiving"
        ]}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function WorkflowCreationModal({
  isOpen,
  onClose,
  onSave,
  editingWorkflow,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wf: Workflow) => void;
  editingWorkflow: Workflow | null;
}) {
  const [name, setName] = useState(editingWorkflow?.name || '');
  const [steps, setSteps] = useState(
    editingWorkflow?.checkpoints.map((c) => c.label).join('\n') || ''
  );
  const [view, setView] = useState<'custom' | 'templates'>(
    editingWorkflow ? 'custom' : 'templates'
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [onClose]);

  const handleCreate = () => {
    if (!name.trim()) return;
    const stepList = steps.split('\n').filter((s) => s.trim());
    const wf = editingWorkflow
      ? {
          ...editingWorkflow,
          name,
          checkpoints: stepList.map((s, i) => {
            const existing = editingWorkflow.checkpoints.find((c) => c.label === s);
            return existing || { id: generateId('chk'), label: s, isCompleted: false };
          }),
          updatedAt: new Date().toISOString(),
        }
      : createCustomWorkflow(name, stepList);
    onSave(wf as Workflow);
    onClose();
  };

  const selectTemplate = (tpl: (typeof WORKFLOW_TEMPLATES)[0], customize = true) => {
    if (!customize) {
      onSave(createWorkflowFromTemplate(tpl));
      onClose();
    } else {
      setName(tpl.name);
      setSteps(tpl.checkpoints.join('\n'));
      setView('custom');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#0C0C0C] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 slide-in-from-bottom-4"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <h3 className="text-[15px] font-semibold text-foreground/90">
            {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {!editingWorkflow && (
            <div className="flex p-1 bg-white/[0.03] rounded-xl mb-6 border border-white/[0.05]">
              <button
                onClick={() => setView('templates')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-all duration-300 ${view === 'templates' ? 'bg-white/[0.06] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Sparkles size={14} />
                Templates
              </button>
              <button
                onClick={() => setView('custom')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-all duration-300 ${view === 'custom' ? 'bg-white/[0.06] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Plus size={14} />
                Custom
              </button>
            </div>
          )}

          {view === 'templates' ? (
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="w-full p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-foreground/90 transition-colors">
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mb-3">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tpl.checkpoints.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-muted-foreground/80"
                      >
                        {c}
                      </span>
                    ))}
                    {tpl.checkpoints.length > 4 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-muted-foreground/40">
                        +{tpl.checkpoints.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectTemplate(tpl, false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-foreground/80 hover:bg-white/[0.08] transition-all"
                    >
                      <Plus size={12} />
                      Use Template
                    </button>
                    <button
                      onClick={() => selectTemplate(tpl, true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/[0.06] text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
                    >
                      <MousePointer2 size={12} />
                      Customize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 ml-1">
                  Workflow Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. YouTube Video #42"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 ml-1">
                  Steps (one per line)
                </label>
                <textarea
                  rows={6}
                  placeholder="Scripting&#10;Recording&#10;Editing&#10;Review"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary/40 transition-colors resize-none scrollbar-thin"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-[13px] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function WorkflowCard({
  workflow,
  updateWorkflow,
  onDelete,
  onDuplicate,
  onArchive,
  onEdit,
}: {
  workflow: Workflow;
  updateWorkflow: (w: Workflow) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onEdit: () => void;
}) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node))
        setStatusMenuOpen(false);
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node))
        setActionsMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const completedCount = workflow.checkpoints.filter((c) => c.isCompleted).length;
  const totalCount = workflow.checkpoints.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const toggleCheckpoint = (id: string) => {
    const updatedCheckpoints = workflow.checkpoints.map((c) =>
      c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
    );

    // Operational intelligence logic
    let newStatus = workflow.status;
    const allDone = updatedCheckpoints.every((c) => c.isCompleted);
    const lastAction = updatedCheckpoints.find((c) => c.id === id);
    const label = lastAction?.label.toLowerCase() || '';
    const isExportStep =
      label.includes('export') ||
      label.includes('upload') ||
      label.includes('deliver') ||
      label.includes('submit') ||
      label.includes('send');

    if (allDone && workflow.status === 'In Progress') {
      newStatus = 'Review';
    }

    updateWorkflow({
      ...workflow,
      checkpoints: updatedCheckpoints,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const setStatus = (status: WorkflowStatus) => {
    updateWorkflow({ ...workflow, status, updatedAt: new Date().toISOString() });
    setStatusMenuOpen(false);
  };

  const meta = STATUS_META[workflow.status];
  const hint = getOperationalHint(workflow);

  // Premium progress colors
  const progressColor = progressPct === 100 ? '#22c55e' : '#3b82f6';
  const progressGlow = progressPct === 100 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)';
  const ambientGlow = progressPct === 100 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)';

  return (
    <div
      className="group relative rounded-2xl flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow:
          statusMenuOpen || actionsMenuOpen
            ? '0 8px 24px rgba(0,0,0,0.25)'
            : isHovered
              ? '0 4px 16px rgba(0,0,0,0.18)'
              : '0 1px 3px rgba(0,0,0,0.12)',
        borderColor: isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Active state glow — fixed opacity, no transition to avoid visual flicker */}
      {workflow.status === 'In Progress' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${meta.glow}, transparent 70%)`,
            opacity: 0.6,
          }}
        />
      )}

      <div className="relative px-4 pt-4 pb-4 flex flex-col h-full z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="min-w-0 flex-1 pr-3">
            <h3
              className="text-[14px] font-semibold truncate leading-tight text-foreground/90 tracking-tight transition-colors group-hover:text-foreground"
              title={workflow.name}
            >
              {workflow.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                {completedCount} of {totalCount} steps
              </span>
              {workflow.timeLoggedMinutes > 0 && (
                <>
                  <div className="w-[3px] h-[3px] rounded-full bg-white/[0.1]" />
                  <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                    <Clock size={10} strokeWidth={2} />
                    {Math.floor(workflow.timeLoggedMinutes / 60)}h {workflow.timeLoggedMinutes % 60}
                    m
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Status button */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-[4px] rounded-lg text-[10px] font-semibold border active:scale-[0.98]"
                style={{
                  backgroundColor: meta.bg,
                  color: meta.text,
                  borderColor: meta.border,
                  transition: 'opacity 150ms ease, border-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }}
              >
                <div
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta.dot }}
                />
                {workflow.status}
                <ChevronDown
                  size={10}
                  strokeWidth={2.5}
                  className={`opacity-60 transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {statusMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-[148px] rounded-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="py-1">
                    {ALL_STATUSES.map((s) => {
                      const sm = STATUS_META[s];
                      const isActive = s === workflow.status;
                      return (
                        <button
                          key={s}
                          onClick={() => setStatus(s)}
                          className="w-full text-left px-3 py-[7px] text-[11px] font-medium flex items-center gap-2.5"
                          style={{
                            color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'background-color 120ms ease, color 120ms ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'rgba(255,255,255,0.04)';
                              (e.currentTarget as HTMLButtonElement).style.color =
                                'var(--foreground)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'transparent';
                              (e.currentTarget as HTMLButtonElement).style.color =
                                'var(--muted-foreground)';
                            }
                          }}
                        >
                          <div
                            className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                            style={{ backgroundColor: sm.dot }}
                          />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions button */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                className="p-1.5 rounded-lg"
                style={{
                  color: actionsMenuOpen ? 'var(--foreground)' : 'rgba(148,163,184,0.4)',
                  backgroundColor: actionsMenuOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transition: 'color 150ms ease, background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = 'var(--foreground)';
                  el.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = actionsMenuOpen ? 'var(--foreground)' : 'rgba(148,163,184,0.4)';
                  el.style.backgroundColor = actionsMenuOpen
                    ? 'rgba(255,255,255,0.05)'
                    : 'transparent';
                }}
              >
                <MoreHorizontal size={14} />
              </button>

              {actionsMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-[148px] rounded-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="py-1">
                    {(
                      [
                        {
                          label: 'Edit Workflow',
                          icon: <Edit2 size={10} className="opacity-40" />,
                          action: () => {
                            onEdit();
                            setActionsMenuOpen(false);
                          },
                        },
                        {
                          label: 'Duplicate',
                          icon: <Copy size={10} className="opacity-40" />,
                          action: () => {
                            onDuplicate();
                            setActionsMenuOpen(false);
                          },
                        },
                        {
                          label: 'Archive',
                          icon: <Archive size={10} className="opacity-40" />,
                          action: () => {
                            onArchive();
                            setActionsMenuOpen(false);
                          },
                        },
                      ] as Array<{ label: string; icon: React.ReactNode; action: () => void }>
                    ).map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full text-left px-3 py-[7px] text-[11px] font-medium flex items-center justify-between"
                        style={{
                          color: 'var(--muted-foreground)',
                          transition: 'background-color 120ms ease, color 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'rgba(255,255,255,0.04)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'transparent';
                          (e.currentTarget as HTMLButtonElement).style.color =
                            'var(--muted-foreground)';
                        }}
                      >
                        {item.label}
                        {item.icon}
                      </button>
                    ))}
                    <div
                      className="h-px my-1"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    />
                    <button
                      onClick={() => {
                        onDelete();
                        setActionsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-[7px] text-[11px] font-medium flex items-center justify-between"
                      style={{
                        color: 'var(--danger)',
                        transition: 'background-color 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'rgba(239,68,68,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'transparent';
                      }}
                    >
                      Delete
                      <Trash2 size={10} className="opacity-60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-[4px] w-full rounded-full bg-white/[0.03] border border-white/[0.05] relative overflow-visible">
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                    : 'linear-gradient(90deg, #2563eb, #3b82f6)',
                opacity: progressPct === 0 ? 0 : 1,
                boxShadow: `
                  0 0 0 1px rgba(0,0,0,0.1),
                  inset 0 1px 0 rgba(255,255,255,0.3),
                  0 0 ${isHovered ? '10px' : '6px'} ${progressGlow},
                  0 0 ${isHovered ? '16px' : '12px'} ${ambientGlow}
                `,
                transition:
                  'width 1000ms cubic-bezier(0.2,0,0,1), box-shadow 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                position: 'relative',
              }}
            >
              {/* Premium glassy highlight */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="space-y-[6px] flex-1">
          {workflow.checkpoints.map((chk) => (
            <div
              key={chk.id}
              onClick={() => toggleCheckpoint(chk.id)}
              className="flex items-center gap-2.5 py-[2px] cursor-pointer group/item"
            >
              <div
                className="flex-shrink-0"
                style={{
                  color: chk.isCompleted ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                  transition: 'color 200ms ease, opacity 200ms ease',
                }}
              >
                {chk.isCompleted ? (
                  <CheckCircle2 size={14} strokeWidth={2} />
                ) : (
                  <Circle size={14} strokeWidth={2} />
                )}
              </div>
              <span
                className="text-[12px] leading-tight select-none"
                style={{
                  color: chk.isCompleted ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: chk.isCompleted ? 0.3 : 0.8,
                  textDecoration: chk.isCompleted ? 'line-through' : 'none',
                  fontWeight: chk.isCompleted ? 400 : 500,
                  letterSpacing: '-0.01em',
                  transition: 'color 200ms ease, opacity 200ms ease',
                }}
              >
                {chk.label}
              </span>
            </div>
          ))}
        </div>

        {/* Operational Hint */}
        {hint && (
          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/[0.04] cursor-default"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.02)';
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
                style={{ opacity: 0.8 }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                  opacity: 0.8,
                }}
              >
                {hint}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
