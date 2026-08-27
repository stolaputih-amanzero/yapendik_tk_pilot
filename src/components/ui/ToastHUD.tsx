/**
 * Amanaura Design System v1.0 — ToastHUD Primitive
 * Floating Action Feedback Capsule with 4s/5s Undo Mechanism (Signature HUD)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning';

export interface ToastHUDProps {
  message: string;
  type?: ToastType;
  undoAction?: {
    label?: string;
    onUndo: () => void;
  };
  onClose: () => void;
  durationMs?: number;
  className?: string;
}

const typeIconMap = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-sky-400 shrink-0" />
};

export const ToastHUD: React.FC<ToastHUDProps> = ({
  message,
  type = 'success',
  undoAction,
  onClose,
  durationMs = 4000,
  className = ''
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    Math.ceil(durationMs / 1000)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [durationMs, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          fixed bottom-28 lg:bottom-10 left-1/2 -translate-x-1/2 z-[80]
          bg-slate-900/95 text-white border border-slate-700/80
          shadow-floating backdrop-blur-md rounded-full px-4 py-2.5
          flex items-center gap-3 text-xs font-medium max-w-[90vw] select-none
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        role="status"
        aria-live="polite"
      >
        {typeIconMap[type]}

        <span className="truncate max-w-[240px] sm:max-w-sm">
          {message}
        </span>

        {undoAction && (
          <button
            type="button"
            onClick={() => {
              undoAction.onUndo();
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold transition text-[11px] cursor-pointer border border-slate-700 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {undoAction.label || `Batalkan (${secondsRemaining}s)`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
