'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Sparkles, 
  Command,
  User,
  Plus,
  Settings
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import AppButton from './ui/AppButton';

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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header 
      className={`
        h-16 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-30 transition-all duration-500 ease-premium-ease
        ${isScrolled 
          ? 'bg-[#050506]/80 backdrop-blur-xl border-b border-white/[0.02]' 
          : 'bg-transparent border-b border-transparent'}
      `}
    >
      
      {/* Left: Search & Mobile Menu */}
      <div className="flex items-center gap-8 flex-1 max-w-[400px]">
        <button 
          onClick={onMenuClick} 
          className="p-2 -ml-2 rounded-lg hover:bg-white/[0.02] lg:hidden transition-colors text-white/20 hover:text-white/60"
        >
          <Menu size={18} />
        </button>
        
        <div className="relative group w-full hidden sm:block">
           <Search size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-white/30 transition-colors" />
           <input 
            type="text" 
            placeholder="Search commands..." 
            className="w-full bg-transparent border-none rounded-none py-2 pl-7 pr-12 text-[12px] font-semibold transition-all outline-none placeholder:text-white/10 focus:placeholder:text-white/20 opacity-30 hover:opacity-100 focus:opacity-100"
           />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6 lg:gap-8">
        
        {/* Theme Switcher - Softer */}
        <div className="hidden sm:flex items-center p-0.5 rounded bg-white/[0.01] border border-white/[0.03]">
          <button 
            onClick={() => theme === 'dark' && onThemeToggle()}
            className={`p-1.5 rounded transition-all ${theme === 'light' ? 'bg-white shadow-premium text-black' : 'text-white/10 hover:text-white/30'}`}
          >
            <Sun size={11} />
          </button>
          <button 
            onClick={() => theme === 'light' && onThemeToggle()}
            className={`p-1.5 rounded transition-all ${theme === 'dark' ? 'bg-white/[0.05] text-white/80 shadow-premium' : 'text-white/10 hover:text-white/30'}`}
          >
            <Moon size={11} />
          </button>
        </div>

        <div className="h-3 w-px bg-white/[0.04] hidden md:block" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 rounded transition-all relative group ${
              isNotifOpen ? 'text-white/90 bg-white/[0.02]' : 'text-white/20 hover:text-white/60'
            }`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-slate-400" />
            )}
          </button>
        </div>

        <div className="h-7 w-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all group overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <User size={13} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </header>
  );
}
