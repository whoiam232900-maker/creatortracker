import React, { useState, useEffect, useRef } from 'react';
import { Workflow, WorkflowStatus, saveState, AppState } from '@/lib/store';
import { WORKFLOW_TEMPLATES, createWorkflowFromTemplate } from '@/lib/workflowTemplates';
import { Plus, CheckCircle2, Circle, Clock, ChevronDown, Trash2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface WorkflowModuleProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState | null>>;
  userId?: string;
}

const STATUS_META: Record<WorkflowStatus, { dot: string, text: string, bg: string, border: string }> = {
  'Pending':     { dot: 'bg-slate-400',   text: 'text-slate-400',   bg: 'bg-slate-400/8',   border: 'border-slate-400/15' },
  'In Progress': { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/8',    border: 'border-blue-400/15' },
  'Review':      { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/8',   border: 'border-amber-400/15' },
  'Completed':   { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/8', border: 'border-emerald-400/15' },
  'Delivered':   { dot: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/8',  border: 'border-violet-400/15' },
};

const ALL_STATUSES = Object.keys(STATUS_META) as WorkflowStatus[];

export default function WorkflowModule({ state, setState, userId }: WorkflowModuleProps) {
  const { settings } = useSettings();
  const [showTemplates, setShowTemplates] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!settings.enableWorkflowTracking) return null;

  const workflows = state.workflows || [];

  const updateWorkflow = (updatedWf: Workflow) => {
    const newState = { ...state, workflows: workflows.map(w => w.id === updatedWf.id ? updatedWf : w) };
    setState(newState);
    saveState(newState, userId);
  };

  const addWorkflow = (template: typeof WORKFLOW_TEMPLATES[0]) => {
    const newWf = createWorkflowFromTemplate(template);
    const newState = { ...state, workflows: [newWf, ...workflows] };
    setState(newState);
    saveState(newState, userId);
    setShowTemplates(false);
  };

  const deleteWorkflow = (id: string) => {
    const newState = { ...state, workflows: workflows.filter(w => w.id !== id) };
    setState(newState);
    saveState(newState, userId);
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.5} />
          <h2 className="text-[13px] font-medium" style={{ color: 'var(--foreground)', opacity: 0.85, letterSpacing: '-0.01em' }}>Workflows</h2>
          {workflows.length > 0 && (
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>{workflows.length}</span>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors duration-150"
            style={{
              color: 'var(--muted-foreground)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Plus size={12} strokeWidth={1.5} />
            New
          </button>

          {showTemplates && (
            <div
              className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden z-50"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>Templates</span>
              </div>
              <div className="py-1">
                {WORKFLOW_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => addWorkflow(tpl)}
                    className="w-full text-left px-3 py-[7px] text-[12px] font-medium transition-colors duration-100"
                    style={{ color: 'var(--foreground)', opacity: 0.75 }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = '0.75'; }}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {workflows.length === 0 ? (
        <div
          className="rounded-xl py-6 text-center"
          style={{
            border: '1px dashed var(--border)',
            backgroundColor: 'rgba(255,255,255,0.008)',
          }}
        >
          <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
            No active workflows
          </p>
          <button
            onClick={() => setShowTemplates(true)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{
              color: 'var(--primary)',
              backgroundColor: 'rgba(59,130,246,0.08)',
            }}
          >
            Browse Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {workflows.map(wf => (
            <WorkflowCard key={wf.id} workflow={wf} updateWorkflow={updateWorkflow} onDelete={() => deleteWorkflow(wf.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function WorkflowCard({ workflow, updateWorkflow, onDelete }: { workflow: Workflow; updateWorkflow: (w: Workflow) => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const completedCount = workflow.checkpoints.filter(c => c.isCompleted).length;
  const totalCount = workflow.checkpoints.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const toggleCheckpoint = (id: string) => {
    const updated = workflow.checkpoints.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c);
    updateWorkflow({ ...workflow, checkpoints: updated, updatedAt: new Date().toISOString() });
  };

  const setStatus = (status: WorkflowStatus) => {
    updateWorkflow({ ...workflow, status, updatedAt: new Date().toISOString() });
    setMenuOpen(false);
  };

  const meta = STATUS_META[workflow.status];

  return (
    <div
      className="rounded-xl flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div className="px-4 pt-3.5 pb-3 flex flex-col">

        {/* Header row */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0 flex-1 pr-3">
            <h3
              className="text-[13px] font-medium truncate leading-tight"
              style={{ color: 'var(--foreground)', opacity: 0.88, letterSpacing: '-0.01em' }}
              title={workflow.name}
            >
              {workflow.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}>
                {completedCount}/{totalCount}
              </span>
              {workflow.timeLoggedMinutes > 0 && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                  <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--muted-foreground)', opacity: 0.45 }}>
                    <Clock size={9} strokeWidth={1.5} />
                    {Math.floor(workflow.timeLoggedMinutes / 60)}h {workflow.timeLoggedMinutes % 60}m
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status button */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[10px] font-medium border transition-all duration-150 ${meta.bg} ${meta.text} ${meta.border}`}
            >
              <span className={`w-[5px] h-[5px] rounded-full ${meta.dot}`} />
              {workflow.status}
              <ChevronDown size={9} strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-[140px] rounded-lg overflow-hidden z-30"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
                }}
              >
                <div className="py-0.5">
                  {ALL_STATUSES.map(s => {
                    const sm = STATUS_META[s];
                    const isActive = s === workflow.status;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className="w-full text-left px-2.5 py-[5px] text-[11px] font-medium flex items-center gap-2 transition-colors duration-100"
                        style={{
                          color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${sm.dot}`} />
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <button
                  onClick={onDelete}
                  className="w-full text-left px-2.5 py-[5px] text-[11px] font-medium flex items-center justify-between transition-colors duration-100"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Delete
                  <Trash2 size={10} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-[3px] w-full rounded-full overflow-hidden mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              backgroundColor: progressPct === 100 ? 'var(--success)' : 'var(--primary)',
              opacity: progressPct === 0 ? 0 : 0.7,
            }}
          />
        </div>

        {/* Checkpoints */}
        <div className="space-y-[5px]">
          {workflow.checkpoints.map(chk => (
            <div
              key={chk.id}
              onClick={() => toggleCheckpoint(chk.id)}
              className="flex items-center gap-2 py-[2px] cursor-pointer group"
            >
              <span className={`flex-shrink-0 transition-colors duration-150 ${chk.isCompleted ? 'text-primary/70' : 'text-white/[0.12] group-hover:text-white/[0.25]'}`}>
                {chk.isCompleted
                  ? <CheckCircle2 size={13} strokeWidth={1.5} />
                  : <Circle size={13} strokeWidth={1.5} />
                }
              </span>
              <span
                className="text-[12px] leading-tight transition-colors duration-150"
                style={{
                  color: chk.isCompleted ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: chk.isCompleted ? 0.35 : 0.72,
                  textDecoration: chk.isCompleted ? 'line-through' : 'none',
                  fontWeight: chk.isCompleted ? 400 : 450,
                  letterSpacing: '-0.005em',
                }}
              >
                {chk.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
