'use client';

import React from 'react';

interface AppSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function AppSwitch({ checked, onChange, label, disabled = false }: AppSwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center gap-3 group outline-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div 
        className={`
          relative w-10 h-5.5 rounded-full transition-all duration-300 border
          ${checked ? 'bg-primary/20 border-primary/50' : 'bg-secondary border-border/60 hover:bg-secondary/80'}
        `}
      >
        <div 
          className={`
            absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 shadow-sm
            ${checked ? 'left-[20px] bg-primary' : 'left-1 bg-muted-foreground/50'}
          `}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}
