import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, LogOut, Settings, CreditCard, User, Building, Crown, X, HelpCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import SettingsModal from './SettingsModal';
import { useSettings } from '@/contexts/SettingsContext';

interface WorkspaceSwitcherProps {
  collapsed: boolean;
  onClose?: () => void;
  onDropdownOpenChange?: (isOpen: boolean) => void;
}

export default function WorkspaceSwitcher({ collapsed, onClose, onDropdownOpenChange }: WorkspaceSwitcherProps) {
  const { isSettingsModalOpen, setIsSettingsModalOpen, activeSettingsTab, setActiveSettingsTab } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Workspace');
  const [plan, setPlan] = useState('Free');
  const [email, setEmail] = useState('user@creatortracker.app');
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 260 });
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (onDropdownOpenChange) {
      onDropdownOpenChange(isOpen);
    }
  }, [isOpen, onDropdownOpenChange]);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    setMounted(true);
    try {
      const sessionStr = localStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.workspaceName) setWorkspaceName(session.workspaceName);
        if (session.plan) setPlan(session.plan);
        if (session.email) setEmail(session.email);
      }
    } catch (e) {}

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the trigger button and the dropdown portal
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(event.target as Node);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      
      if (isOutsideTrigger && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current && isOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: collapsed ? rect.top : rect.bottom + 12,
        left: collapsed ? rect.right + 16 : rect.left + 4,
        width: 300,
      });
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isOpen, collapsed]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    window.location.href = '/auth';
  };

  return (
    <div className="relative border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center w-full">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={[
            'flex-1 flex items-center gap-3 p-3 transition-all duration-200 outline-none hover:bg-muted/50 group',
            isOpen ? 'bg-muted/50' : '',
            collapsed ? 'justify-center m-2 rounded-xl p-2' : 'm-2 rounded-xl'
          ].join(' ')}
        >
          <div className="relative flex-shrink-0">
            {/* Logo/Avatar Wrapper with premium glass/glow effect */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-border group-hover:ring-primary/30 transition-all overflow-hidden relative">
               <AppLogo size={20} />
               {/* Hover glow effect */}
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            {/* Premium badge dot if Pro or Max */}
            {(plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'max' || plan.toLowerCase() === 'studio') && (
               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-card flex items-center justify-center shadow-sm z-10">
                 <Crown size={8} className="text-white" />
               </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex flex-col items-start min-w-0 text-left">
                <span className="font-semibold text-sm truncate text-foreground w-full">
                  {workspaceName}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full flex items-center gap-1">
                  {plan}
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground flex-shrink-0 ml-1 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>
          )}
        </button>

        {/* Mobile close button (if passed and not collapsed) */}
        {!collapsed && onClose && (
          <button 
            onClick={onClose} 
            className="btn-ghost p-1.5 mr-3 rounded-lg flex-shrink-0" 
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Notion-style Dropdown Menu using Portal to escape overflow-hidden */}
      {mounted && isOpen && createPortal(
        <div 
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed z-[100] rounded-2xl overflow-hidden scale-in origin-top-left border border-white/[0.05]"
          style={{ 
            backgroundColor: 'rgba(10, 10, 10, 0.3)', 
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            backdropFilter: 'blur(40px) saturate(1.5)',
          }}        >
          {/* Header area - Top section */}
          <div className="p-4 border-b bg-transparent" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
             <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-3">Current Workspace</p>
             <div className="flex items-start gap-3 mt-1">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.02] shadow-sm ring-1 ring-white/[0.05] flex-shrink-0 mt-0.5 relative overflow-hidden">
                 <AppLogo size={22} />
                 {/* Premium badge in dropdown */}
                 {(plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'max' || plan.toLowerCase() === 'studio') && (
                   <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center shadow-sm">
                     <Crown size={9} className="text-white" />
                   </div>
                 )}
               </div>
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-2">
                   <p className="text-[13px] font-semibold text-foreground/90 truncate">{workspaceName}</p>
                 </div>
                 <p className="text-[11px] font-medium text-muted-foreground/40 truncate">{plan} Plan</p>
                 <p className="text-[11px] text-muted-foreground/20 truncate mt-0.5">{email}</p>
               </div>
               <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <Check size={12} className="text-primary/60" />
               </div>
             </div>
          </div>

          {/* Menu items - Middle section */}
          <div className="p-1.5 space-y-0.5 bg-transparent">
            <div className="px-3 py-2 text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.15em] mt-1">
               Account
            </div>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Account'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-white/[0.05] text-foreground/70 transition-all text-left group"
            >
              <User size={14} className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span>Profile Settings</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Billing & Plans'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-white/[0.05] text-foreground/70 transition-all text-left group"
            >
              <CreditCard size={14} className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span>Billing & Plan</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Preferences'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-white/[0.05] text-foreground/70 transition-all text-left group"
            >
              <Settings size={14} className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span>Preferences</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Help & Support'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-white/[0.05] text-foreground/70 transition-all text-left group"
            >
              <HelpCircle size={14} className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span>Help & Support</span>
            </button>
            
            <div className="h-px w-full my-2 bg-white/[0.03]"></div>
            
            <div className="px-3 py-2 text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.15em]">
               Workspace
            </div>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-white/[0.05] text-foreground/70 transition-all text-left group">
              <Building size={14} className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <span>Switch Workspace</span>
            </button>
            
            <div className="h-px w-full my-2 bg-white/[0.03]"></div>
            
            {/* Bottom section */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-red-500/[0.08] text-red-500/60 transition-all text-left group"
            >
              <LogOut size={14} className="text-red-500/40 group-hover:text-red-500/60 transition-colors" />
              <span>Log out</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {mounted && (
        <SettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
          currentPlan={plan}
          initialTab={activeSettingsTab}
        />
      )}
    </div>
  );
}
