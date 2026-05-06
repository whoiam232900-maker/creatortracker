'use client';
import React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Topbar({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed,
  theme,
  onThemeToggle,
}: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 border-b flex-shrink-0"
      style={{
        height: '64px',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="btn-ghost p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {/* Desktop sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className="btn-ghost p-2 hidden lg:flex"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="btn-ghost p-2"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}