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
        <div className="fixed inset-0 z-70 flex flex-col justify-end expanded:justify-center expanded:items-center p-0 expanded:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={amanauraSpring}
            className={`
              relative z-10 w-full bg-surface text-ink shadow-floating
              rounded-t-3xl expanded:rounded-3xl border border-line
              flex flex-col max-h-[88vh] expanded:max-h-[85vh] overflow-hidden
              ${maxWidthMap[maxWidth]}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
          >
            {/* Mobile Pull-Down / Drag Handle */}
            <div className="expanded:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-line-strong motif-poleng rounded-full" />
            </div>

            {/* Header */}
            {(title || description) && (
              <div className="px-5 py-4 expanded:px-6 expanded:py-5 border-b border-line-soft flex items-start justify-between gap-4 shrink-0 bg-surface">
                <div className="space-y-1 min-w-0 flex-1">
                  {title && (
                    <h3 className="text-base expanded:text-lg font-black text-ink tracking-tight truncate">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-ink-soft font-medium">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-field text-ink-faint hover-only:text-ink hover-only:bg-surface-subtle transition cursor-pointer shrink-0"
                  aria-label="Tutup dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-4 expanded:p-6 overflow-y-auto flex-1 space-y-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3 expanded:px-6 expanded:py-4 bg-surface-subtle/80 border-t border-line-soft flex flex-col-reverse medium:flex-row items-stretch medium:items-center medium:justify-end gap-2 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
