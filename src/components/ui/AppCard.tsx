'use client';

import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
  glass?: boolean;
}

export default function AppCard({ 
  children, 
  title,
  className = '', 
  noPadding = false,
  hoverable = false,
  glass = false
}: AppCardProps) {
  return (
    <div 
      className={`
        bg-card border border-white/[0.03] rounded-[var(--radius)] overflow-hidden transition-all duration-300 relative
        ${noPadding ? '' : 'p-5 md:p-6'}
        ${hoverable ? 'hover:bg-card-hover hover:border-white/[0.06] cursor-pointer' : ''}
        ${glass ? 'glass' : ''}
        ${className}
      `}
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 20px -10px rgba(0,0,0,0.5)'
      }}
    >
      {title && (
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-5">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}


