'use client';

import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
  glass?: boolean;
}

export default function AppCard({ 
  children, 
  className = '', 
  noPadding = false,
  hoverable = false,
  glass = false
}: AppCardProps) {
  return (
    <div 
      className={`
        bg-card border border-border/50 rounded-[var(--radius)] overflow-hidden shadow-card
        ${noPadding ? '' : 'p-6 sm:p-8'}
        ${hoverable ? 'hover:bg-card-hover hover:border-border transition-all duration-200 cursor-pointer' : ''}
        ${glass ? 'bg-card/50 backdrop-blur-xl border-white/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
