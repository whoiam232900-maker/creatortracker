'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function AppButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'left', 
  isLoading = false, 
  fullWidth = false,
  className = '', 
  disabled,
  ...props 
}: AppButtonProps) {
  
  const variants = {
    primary: 'bg-white/[0.03] text-white/70 shadow-premium hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.08] transition-all',
    secondary: 'bg-transparent text-white/30 hover:text-white/60 hover:bg-white/[0.02] active:bg-white/[0.04] transition-all',
    outline: 'bg-transparent border border-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.02] active:bg-white/[0.04]',
    danger: 'bg-danger/5 text-danger border border-danger/10 hover:bg-danger/10 active:bg-danger/15',
    ghost: 'bg-transparent text-white/20 hover:text-white/60 hover:bg-white/[0.01]',
    glass: 'glass text-white/80 hover:bg-white/[0.02] active:bg-white/[0.04]',
    glow: 'bg-slate-400/5 text-slate-400/70 border border-slate-400/10 hover:bg-slate-400/10 hover:shadow-[0_0_15px_-5px_rgba(148,163,184,0.15)] active:bg-slate-400/15 transition-all duration-300'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-[10px] font-bold rounded-md gap-1.5 uppercase tracking-[0.1em]',
    sm: 'px-3.5 py-2 text-[12px] font-semibold rounded-md gap-2',
    md: 'px-4.5 py-2.5 text-[13px] font-semibold rounded-lg gap-2.5',
    lg: 'px-6 py-3.5 text-[14px] font-semibold rounded-xl gap-3'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center transition-all duration-200 ease-premium-ease select-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 12 : 14} className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />}
      <span className="truncate">{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon size={size === 'xs' ? 12 : 14} className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

