'use client';
import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

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
  return (
    <>
      {/* Mobile hamburger - absolute positioned to avoid layout spacing */}
      <div className="absolute top-4 left-4 z-30 lg:hidden">
        <button onClick={onMenuClick} className="btn-ghost p-2" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>

      {/* Theme toggle - absolute positioned to avoid layout spacing */}
      <div className="absolute top-4 right-4 lg:right-6 z-30">
        <button
          onClick={onThemeToggle}
          className="btn-ghost p-2"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </>
  );
}
