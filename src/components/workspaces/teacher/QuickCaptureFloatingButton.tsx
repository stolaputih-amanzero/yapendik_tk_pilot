/**
 * Yapendik School OS — Stage 4.1 Quick Capture Floating Button (CC-06)
 * Floating action primitive [⚡ Momen Cepat] for ultra-fast pedagogical observation trigger
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
    <div className="fixed bottom-36 right-4 lg:bottom-8 lg:right-8 z-[60] flex items-center gap-3 pointer-events-auto">
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Rekam Momen Belajar"
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-floating hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-700/80"
      >
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />

        {/* Pending Draft Counter Badge */}
        {pendingDraftCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-black flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">
            {pendingDraftCount}
          </span>
        )}
      </button>
    </div>
  );
};
