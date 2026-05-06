'use client';
import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="card shadow-modal w-full max-w-md scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor:
                variant === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
            }}
          >
            <AlertTriangle
              size={20}
              style={{
                color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              {title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {description}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="btn-ghost p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}