'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onCancel,
  children,
  loading = false,
  disabled = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && !loading && !disabled) onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onConfirm, loading, disabled]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="card shadow-modal w-full max-w-md scale-in overflow-hidden border-white/[0.05] bg-[#09090b]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10">
            <AlertTriangle
              size={20}
              className={variant === 'danger' ? 'text-red-500' : 'text-amber-500'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold tracking-tight text-white mb-1">{title}</h3>
            <p className="text-[13px] leading-relaxed text-zinc-400">{description}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {children && <div className="px-6 pb-6">{children}</div>}

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/[0.02] border-t border-white/[0.05]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || disabled}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              variant === 'danger'
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-white/5 text-white hover:bg-white/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
