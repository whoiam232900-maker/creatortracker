'use client';

import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionContainer({ 
  children, 
  title, 
  description, 
  actions,
  className = '' 
}: SectionContainerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground font-medium">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
