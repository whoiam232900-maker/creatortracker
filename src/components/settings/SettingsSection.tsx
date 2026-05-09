'use client';

import React from 'react';

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="space-y-6">
      {(title || description) && (
        <div className="pl-1">
          {title && <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground/60 italic">{description}</p>}
        </div>
      )}
      <div className="bg-card border border-border/60 rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 space-y-8">
          {children}
        </div>
      </div>
    </section>
  );
}
