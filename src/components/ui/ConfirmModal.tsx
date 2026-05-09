'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AppModal from './AppModal';
import AppButton from './AppButton';

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
  return (
    <AppModal 
      isOpen={open} 
      onClose={onCancel}
      maxWidth="max-w-md"
      noPadding
    >
      <div className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center border ${
            variant === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
          }`}>
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80 px-4">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <AppButton 
            variant="ghost" 
            size="md"
            onClick={onCancel}
          >
            Go Back
          </AppButton>
          <AppButton 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            size="md"
            onClick={onConfirm}
          >
            {confirmLabel}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}
