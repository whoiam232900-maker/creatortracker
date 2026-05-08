import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  hideHeader?: boolean;
  noPadding?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-4xl',
  hideHeader = false,
  noPadding = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-center justify-center fade-in p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(var(--blur-intensity, 3px))',
      }}
    >
      <div 
        className={`relative w-full ${maxWidth} h-[85vh] max-h-[800px] flex flex-col scale-in rounded-2xl border shadow-2xl overflow-hidden`}
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--card) 98%, transparent)', 
          borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in srgb, var(--border) 50%, transparent)',
        }}
      >
        {hideHeader && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 btn-ghost p-2 rounded-lg hover:bg-muted/80 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}

        {!hideHeader && (
          <div className="flex items-center justify-between p-4 lg:p-6 border-b flex-shrink-0 relative z-10" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)', backgroundColor: 'var(--card)' }}>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
            <button 
              onClick={onClose}
              className="btn-ghost p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={`flex-1 overflow-hidden flex flex-col relative z-0 ${noPadding ? '' : 'p-4 lg:p-6'}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
