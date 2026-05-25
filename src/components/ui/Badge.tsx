import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { backgroundColor: 'var(--accent-glow, rgba(37,99,235,0.1))', color: 'var(--primary)' },
  success: { backgroundColor: 'var(--success-bg)', color: 'var(--success)' },
  warning: { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' },
  danger: { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' },
  info: { backgroundColor: 'rgba(14,165,233,0.1)', color: 'var(--accent)' },
  neutral: { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' },
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
