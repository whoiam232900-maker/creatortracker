'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
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
    primary: 'bg-primary text-primary-foreground shadow-[0_1px_10px_rgba(var(--primary-rgb),0.1)] hover:bg-primary/90 active:bg-primary/95',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-muted/80 active:bg-muted/60 border border-border/50',
    outline: 'bg-transparent border border-border/80 text-foreground hover:bg-muted/30 hover:border-border active:bg-muted',
    danger: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90 active:bg-danger/95',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 active:bg-muted',
    glass: 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-foreground hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-[calc(var(--radius)-2px)] gap-1.5',
    sm: 'px-3.5 py-2 text-sm rounded-[var(--radius)] gap-2',
    md: 'px-4.5 py-2.5 text-sm font-semibold rounded-[var(--radius)] gap-2.5',
    lg: 'px-6 py-3.5 text-base font-semibold rounded-[var(--radius)] gap-3'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] select-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 12 : 16} className="flex-shrink-0" />}
      <span className="truncate">{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon size={size === 'xs' ? 12 : 16} className="flex-shrink-0" />}
    </button>
  );
}
