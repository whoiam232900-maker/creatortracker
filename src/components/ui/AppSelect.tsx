'use client';

import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  icon?: LucideIcon;
}

export default function AppSelect({ 
  label, 
  options, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}: AppSelectProps) {
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
        <select
          className={`
            w-full bg-input border border-border/40 text-sm rounded-xl transition-all 
            appearance-none outline-none
            focus:border-primary/40 focus:bg-input-focus focus:ring-4 focus:ring-primary/5 hover:border-border/60
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : 'pl-4'} pr-10
            ${error ? 'border-danger/50 focus:border-danger' : ''}
            py-2.5
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform group-hover:translate-y-[-40%] group-active:translate-y-[-50%]">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-danger font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
