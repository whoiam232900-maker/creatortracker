'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AppBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function AppBadge({ variant = 'default', children, className = '' }: AppBadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-muted text-muted-foreground border-border/40',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </span>
  );
}
