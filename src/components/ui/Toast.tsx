'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory = 'workspace' | 'task' | 'invoice' | 'subscription' | 'security' | 'system';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  category?: NotificationCategory;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export function showToast(msg: Omit<ToastMessage, 'id'>) {
  const id = `toast-${Date.now()}`;
  toastListeners.forEach((fn) => fn({ ...msg, id }));
}

export function ToastContainer() {
  const { settings } = useSettings();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (msg: ToastMessage) => {
      // ── Notification Preference Filtering ──────────────────────────
      if (!settings.enableNotifications) return;

      // Category-specific filtering
      if (msg.category) {
        if (msg.category === 'workspace' && !settings.notifyWorkspaceInvites) return;
        if (msg.category === 'task' && !settings.notifyTaskUpdates) return;
        if (msg.category === 'invoice' && !settings.notifyInvoicePayments) return;
        if (msg.category === 'subscription' && !settings.notifySubscriptionWarnings) return;
        if (msg.category === 'security' && !settings.notifySecurityAlerts) return;
        // system is usually always allowed if global is on
      }

      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, [settings]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!mounted) return null;

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} style={{ color: 'var(--success)' }} />,
    error: <XCircle size={16} style={{ color: 'var(--danger)' }} />,
    warning: <AlertCircle size={16} style={{ color: 'var(--warning)' }} />,
    info: <Info size={16} style={{ color: 'var(--accent)' }} />,
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="card shadow-elevated pointer-events-auto flex items-start gap-3 px-4 py-3.5 w-80 animate-in slide-in-from-right-5 fade-in duration-300 border-white/[0.05] bg-[#09090b]/90 backdrop-blur-md"
          style={{
            boxShadow: '0 8px 32px -4px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold tracking-tight text-white">{toast.title}</p>
            {toast.description && (
              <p className="text-[11px] mt-0.5 leading-relaxed text-zinc-400">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-zinc-500 hover:text-white transition-colors p-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
