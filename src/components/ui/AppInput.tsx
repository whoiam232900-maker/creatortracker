'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
}

export default function AppInput({ 
  label, 
  icon: Icon, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: AppInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[11px] font-semibold text-muted-foreground/60 tracking-wider uppercase ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon size={14} />
          </div>
        )}
        <input
          className={`
            w-full bg-white/[0.02] border border-white/[0.05] text-[13px] font-medium rounded-lg transition-all 
            placeholder:text-muted-foreground/20 outline-none
            focus:border-primary/40 focus:bg-white/[0.04] focus:shadow-glow-sm hover:border-white/[0.1]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10 pr-4' : 'px-4'} 
            ${error ? 'border-danger/50 focus:border-danger' : ''}
            py-2.5
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[10px] text-danger font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-foreground/40 ml-1 italic">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

