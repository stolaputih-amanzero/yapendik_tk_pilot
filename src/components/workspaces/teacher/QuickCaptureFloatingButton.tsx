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
    <div className="fixed bottom-28 right-4 lg:bottom-8 lg:right-8 z-[60] flex items-center gap-3 pointer-events-auto">
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Rekam Momen Belajar"
        className="group relative flex items-center gap-2 sm:gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-floating hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-700/80"
      >
        <div className="p-1 rounded-full bg-slate-800 text-amber-400 group-hover:rotate-12 transition-transform">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
        </div>
        <span className="tracking-tight font-bold whitespace-nowrap">Momen Belajar</span>
        
        {/* Hotkey hint pill */}
        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
          Ctrl+K
        </span>

        {/* Pending Draft Counter Badge */}
        {pendingDraftCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
            {pendingDraftCount}
          </span>
        )}
      </button>
    </div>
  );
};
