'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export function showToast(msg: Omit<ToastMessage, 'id'>) {
  const id = `toast-${Date.now()}`;
  toastListeners.forEach((fn) => fn({ ...msg, id }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} style={{ color: 'var(--success)' }} />,
    error: <XCircle size={16} style={{ color: 'var(--danger)' }} />,
    warning: <AlertCircle size={16} style={{ color: 'var(--warning)' }} />,
    info: <Info size={16} style={{ color: 'var(--accent)' }} />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="card shadow-elevated pointer-events-auto flex items-start gap-3 px-4 py-3 w-80 slide-up"
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="btn-ghost p-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}