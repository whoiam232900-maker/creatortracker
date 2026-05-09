'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, isLoading }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-10 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 rounded-[32px] bg-muted flex items-center justify-center mb-6 text-muted-foreground/30 relative">
        <Icon size={40} />
        <div className="absolute inset-0 bg-white/[0.01] rounded-[32px] blur-xl" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <AppButton onClick={onAction} isLoading={isLoading} variant="primary" size="md">
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
}
