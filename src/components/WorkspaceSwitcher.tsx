import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, LogOut, Settings, CreditCard, User, Building, Crown, X, HelpCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import SettingsModal from './SettingsModal';

interface WorkspaceSwitcherProps {
  collapsed: boolean;
  onClose?: () => void;
  onDropdownOpenChange?: (isOpen: boolean) => void;
}

export default function WorkspaceSwitcher({ collapsed, onClose, onDropdownOpenChange }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Workspace');
  const [plan, setPlan] = useState('Free');
  const [email, setEmail] = useState('user@creatortracker.app');
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 260 });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('Billing & Plans');
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

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
            {(plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'max') && (
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
          className="fixed z-[100] rounded-2xl overflow-hidden scale-in origin-top-left"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--card) 96%, transparent)', 
            border: '1px solid color-mix(in srgb, var(--border) 80%, transparent)',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15), 0 0 0 1px color-mix(in srgb, var(--border) 50%, transparent)',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header area - Top section */}
          <div className="p-4 border-b bg-transparent" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Current Workspace</p>
             <div className="flex items-start gap-3 mt-1">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-border flex-shrink-0 mt-0.5 relative">
                 <AppLogo size={22} />
                 {/* Premium badge in dropdown */}
                 {(plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'max') && (
                   <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-yellow-500 rounded-full border-2 border-card flex items-center justify-center shadow-sm">
                     <Crown size={9} className="text-white" />
                   </div>
                 )}
               </div>
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-2">
                   <p className="text-sm font-bold text-foreground truncate">{workspaceName}</p>
                 </div>
                 <p className="text-xs font-medium text-muted-foreground truncate">{plan} Plan</p>
                 <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{email}</p>
               </div>
               <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <Check size={12} className="text-primary" />
               </div>
             </div>
          </div>

          {/* Menu items - Middle section */}
          <div className="p-2 space-y-0.5 bg-transparent">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
               Account
            </div>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted text-foreground transition-colors text-left group">
              <User size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Profile Settings</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Billing & Plans'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted text-foreground transition-colors text-left group"
            >
              <CreditCard size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Billing & Plan</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); setActiveSettingsTab('Preferences'); setIsSettingsModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted text-foreground transition-colors text-left group"
            >
              <Settings size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Preferences</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted text-foreground transition-colors text-left group">
              <HelpCircle size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Help & Support</span>
            </button>
            
            <div className="h-px w-full my-1.5" style={{ backgroundColor: 'var(--border)' }}></div>
            
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
               Workspace
            </div>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-muted text-foreground transition-colors text-left group">
              <Building size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Switch Workspace</span>
            </button>
            
            <div className="h-px w-full my-1.5" style={{ backgroundColor: 'var(--border)' }}></div>
            
            {/* Bottom section */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-danger/10 text-danger transition-colors text-left group"
            >
              <LogOut size={16} className="text-danger/80 group-hover:text-danger transition-colors" />
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
