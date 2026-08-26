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
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Floating Action Button */}
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/40"
      >
        <div className="p-1 rounded-full bg-slate-950/15 group-hover:rotate-12 transition-transform">
          <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
        </div>
        <span className="tracking-tight font-extrabold">Momen Cepat</span>
        
        {/* Hotkey hint pill */}
        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-950/20 text-slate-950 rounded-md">
          Ctrl+K
        </span>

        {/* Pending Draft Counter Badge */}
        {pendingDraftCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md animate-bounce">
            {pendingDraftCount}
          </span>
        )}
      </button>
    </div>
  );
};
