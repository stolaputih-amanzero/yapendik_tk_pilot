/**
 * Amanaura Design System v1.0 — AdaptiveDialog Primitive
 * "The Chameleon": Bottom Sheet Drawer on Mobile (<1024px) & Centered Modal on Desktop (>=1024px)
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface AdaptiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl'
};

const amanauraSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8
};

export const AdaptiveDialog: React.FC<AdaptiveDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className = ''
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when dialog is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={amanauraSpring}
            className={`
              relative z-10 w-full bg-white text-slate-900 shadow-2xl
              rounded-t-3xl lg:rounded-3xl border border-slate-200/90
              flex flex-col max-h-[88vh] lg:max-h-[85vh] overflow-hidden
              ${maxWidthMap[maxWidth]}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
          >
            {/* Mobile Pull-Down / Drag Handle */}
            <div className="lg:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {(title || description) && (
              <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
                <div className="space-y-1 min-w-0 flex-1">
                  {title && (
                    <h3 className="text-base lg:text-lg font-black text-slate-900 tracking-tight truncate">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-slate-500 font-medium">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                  aria-label="Tutup dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 lg:p-6 overflow-y-auto flex-1 space-y-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 lg:px-6 lg:py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
