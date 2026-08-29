/**
 * Yapendik School OS — Stage 4.1 Quick Capture Floating Button (CC-06)
 * Floating action primitive [ Momen Cepat] for ultra-fast pedagogical observation trigger
 */

import React, { useEffect } from 'react';
import { Sparkles, Camera } from 'lucide-react';

interface Props {
  onClick: () => void;
  pendingDraftCount?: number;
}

export const QuickCaptureFloatingButton: React.FC<Props> = ({ onClick, pendingDraftCount = 0 }) => {
  // Optional keyboard shortcut listener (e.g. Ctrl + M or Shift + Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+96px)] right-4 expanded:bottom-6 expanded:right-6 z-40 flex items-center gap-3 pointer-events-auto">
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Rekam Momen Belajar"
        className="group relative flex items-center justify-center w-14 h-14 medium:w-16 medium:h-16 rounded-pill bg-brand hover-only:bg-surface-inset text-on-brand shadow-floating hover-only:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-line-strong/80"
      >
        <Sparkles className="w-6 h-6 medium:w-7 medium:h-7 text-brass fill-brass group-hover:rotate-12 transition-transform" />

        {/* Pending Draft Counter Badge */}
        {pendingDraftCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 medium:w-6 medium:h-6 rounded-pill bg-danger text-on-brand text-[10px] medium:text-xs font-mono font-bold whitespace-nowrap flex items-center justify-center border-2 border-brand shadow-ambient animate-bounce">
            {pendingDraftCount}
          </span>
        )}
      </button>
    </div>
  );
};
