'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  noPadding?: boolean;
  hideHeader?: boolean;
}

export default function AppModal({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children, 
  maxWidth = 'max-w-lg',
  noPadding = false,
  hideHeader = false
}: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`
          relative w-full ${maxWidth} bg-card border border-border/40 rounded-3xl shadow-modal 
          flex flex-col overflow-hidden zoom-in origin-center
        `}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Header */}
        {!hideHeader && (title || description) && (
          <div className="px-6 py-5 border-b border-border/40 bg-card/50">
            {title && <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>}
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-20"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin ${noPadding ? '' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
