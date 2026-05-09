'use client';

import React, { useRef, useState, useEffect } from 'react';
import AppModal from './ui/AppModal';
import { 
  User, Building, CreditCard, Settings, Bell, 
  HelpCircle, X, Clock
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Tabs
import AccountTab from './settings/AccountTab';
import WorkspaceTab from './settings/WorkspaceTab';
import BillingTab from './settings/BillingTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  initialTab?: string;
}

const SIDEBAR_ITEMS = [
  { label: 'Account', icon: User, component: AccountTab },
  { label: 'Workspace', icon: Building, component: WorkspaceTab },
  { label: 'Billing & Plans', icon: CreditCard, component: BillingTab },
  { label: 'Preferences', icon: Settings },
  { label: 'Notifications', icon: Bell },
  { label: 'Help & Support', icon: HelpCircle },
];

export default function SettingsModal({ isOpen, onClose, initialTab = 'Account' }: SettingsModalProps) {
  const { activeWorkspace } = useWorkspace();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (!activeWorkspace) return null;

  const ActiveComponent = SIDEBAR_ITEMS.find(item => item.label === activeTab)?.component;

  return (
    <AppModal isOpen={isOpen} onClose={onClose} hideHeader noPadding maxWidth="max-w-6xl">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex h-[750px] w-full relative group overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--card-rgb))' }}
      >
        {/* Cursor Follow Effect */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.04), transparent 40%)`
          }}
        />

        {/* Sidebar */}
        <div 
          className="w-64 flex-shrink-0 border-r border-border/40 flex flex-col relative z-10 bg-card/50" 
        >
          <div className="p-6 pb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
               <Settings size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">Settings</h2>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                    activeTab === item.label
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:bg-white/[0.02] hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon size={14} className={`transition-colors ${activeTab === item.label ? 'text-primary' : 'group-hover:text-foreground'}`} />
                  <span>{item.label}</span>
                  {activeTab === item.label && (
                    <div className="absolute right-3 w-1 h-4 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 py-12">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-40 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center mb-6 border border-border/40">
                  <Clock size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2 uppercase tracking-widest">{activeTab}</h2>
                <p className="text-sm max-w-xs leading-relaxed">This section is currently being optimized for the new infrastructure.</p>
              </div>
            )}
          </div>
        </div>

        {/* Close Button Top Right */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted transition-all z-20 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>
    </AppModal>
  );
}
