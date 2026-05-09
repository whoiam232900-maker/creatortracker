'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, Plus, Settings, Check, 
  Search
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@/contexts/UserContext';
import SettingsModal from './SettingsModal';
import CreateWorkspaceModal from './CreateWorkspaceModal';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
  onClose?: () => void;
  onDropdownOpenChange?: (open: boolean) => void;
}

export default function WorkspaceSwitcher({ collapsed, onClose, onDropdownOpenChange }: WorkspaceSwitcherProps) {
  const { user } = useUser();
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('Account');
  const [searchTerm, setSearchTerm] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onDropdownOpenChange?.(isOpen);
  }, [isOpen, onDropdownOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openSettings = (tab: string) => {
    setActiveSettingsTab(tab);
    setIsSettingsOpen(true);
    setIsOpen(false);
  };

  if (!activeWorkspace && !isLoading) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group
          ${isOpen ? 'bg-secondary border-border/60' : 'hover:bg-secondary/60 border-transparent'}
          border ${collapsed ? 'w-10 h-10 justify-center px-0' : 'w-full'}
        `}
      >
        <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 transition-transform group-hover:scale-105">
          {activeWorkspace?.icon || activeWorkspace?.name.substring(0, 1).toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <div className="text-left flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                {activeWorkspace?.name || 'Select Workspace'}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {activeWorkspace?.plan || 'Free'} Plan
              </p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`
            absolute top-12 left-0 w-64 bg-card border border-border/80 rounded-xl shadow-modal z-[100] overflow-hidden animate-in zoom-in-95 duration-200 origin-top-left
            ${collapsed ? 'left-0' : 'left-0'}
          `}
        >
          {/* Search */}
          <div className="p-2 border-b border-border/50 bg-muted/30">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input 
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-input border border-border/40 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin p-1.5">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/40 tracking-wider">Your Workspaces</div>
            {filteredWorkspaces.map((ws) => {
              const userRole = (ws.members && Array.isArray(ws.members)) 
                ? (ws.members.find(m => m.email === user?.email)?.role || 'Viewer')
                : 'Viewer';
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-200 group
                    ${activeWorkspace?.id === ws.id ? 'bg-primary/5' : 'hover:bg-muted/50'}
                  `}
                >
                  <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs border transition-all ${
                    activeWorkspace?.id === ws.id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border/40 text-muted-foreground'
                  }`}>
                    {ws.icon || ws.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${activeWorkspace?.id === ws.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {ws.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">{userRole}</p>
                  </div>
                  {activeWorkspace?.id === ws.id && (
                    <Check size={12} className="text-primary" />
                  )}
                </button>
              );
            })}

            {filteredWorkspaces.length === 0 && (
              <div className="py-6 text-center px-4">
                <p className="text-xs text-muted-foreground italic">No results found</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5 border-t border-border/50 bg-muted/30 space-y-0.5">
            <button 
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs font-semibold group"
            >
              <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Plus size={14} />
              </div>
              <span>Create Workspace</span>
            </button>
            
            <button 
              onClick={() => openSettings('Workspace')}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-all duration-200 text-xs font-semibold group text-muted-foreground hover:text-foreground"
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings size={14} />
              </div>
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={activeSettingsTab}
      />
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
