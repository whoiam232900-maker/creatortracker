'use client';
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 flex-shrink-0"
        style={{
          backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span
          className="absolute w-4 h-4 rounded-full shadow-sm transition-transform duration-200"
          style={{
            backgroundColor: '#FFFFFF',
            transform: checked ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </button>
      {label && (
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
      )}
    </label>
  );
}