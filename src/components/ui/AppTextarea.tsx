'use client';

import React from 'react';

interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function AppTextarea({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: AppTextareaProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-muted-foreground ml-1 block">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-input border border-border/40 text-sm rounded-xl transition-all 
          placeholder:text-muted-foreground/30 outline-none px-4 py-2.5
          focus:border-primary/40 focus:bg-input-focus focus:ring-4 focus:ring-primary/5 hover:border-border/60
          disabled:opacity-50 disabled:cursor-not-allowed resize-none
          ${error ? 'border-danger/50 focus:border-danger focus:ring-danger/5' : ''}
          ${className}
        `}
        {...props}
      />
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
