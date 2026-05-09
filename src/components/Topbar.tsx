'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, Zap, Command } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSettings } from '@/contexts/SettingsContext';

interface TopbarProps {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Topbar({
  onMenuClick,
  theme,
  onThemeToggle,
}: TopbarProps) {
  const { notifications } = useWorkspace();
  const { updateSetting } = useSettings();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-14 flex items-center justify-between px-6 lg:px-8 border-b border-border bg-background/60 backdrop-blur-xl relative z-30">
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-1.5 -ml-1 rounded-lg hover:bg-muted lg:hidden transition-colors" aria-label="Open menu">
          <Menu size={18} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border group focus-within:border-primary/50 transition-all cursor-text min-w-[300px]">
           <Search size={14} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
           <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-[13px] font-medium w-full placeholder:text-muted-foreground/30"
           />
           <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-card text-[9px] font-bold text-muted-foreground/60 shadow-sm">
             <Command size={10} />
             K
           </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Quick Action */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all group">
           <Zap size={14} className="group-hover:scale-110 transition-transform" />
           <span className="text-xs font-semibold">Assistant</span>
        </button>

        <div className="h-4 w-px bg-border mx-1 hidden md:block" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 rounded-lg transition-all relative group ${isNotifOpen ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[7px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
}
