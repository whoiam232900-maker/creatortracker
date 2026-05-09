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
        <label className="text-xs font-medium text-muted-foreground ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`
            w-full bg-input border border-border/40 text-sm rounded-xl transition-all 
            placeholder:text-muted-foreground/30 outline-none
            focus:border-primary/40 focus:bg-input-focus focus:ring-4 focus:ring-primary/5 hover:border-border/60
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11 pr-4' : 'px-4'} 
            ${error ? 'border-danger/50 focus:border-danger focus:ring-danger/5' : ''}
            py-2.5
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-danger font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground/60 ml-1 italic">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
