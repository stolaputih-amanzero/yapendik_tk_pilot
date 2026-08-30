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
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+92px)] right-4 expanded:bottom-6 expanded:right-6 z-40 flex items-center gap-3 pointer-events-auto">
      {/* Extended Floating Action Pill */}
      <button
        type="button"
        onClick={onClick}
        title="Catat Momen Belajar Cepat (Ctrl+K)"
        aria-label="Catat Momen Belajar Cepat"
        className="group relative flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full bg-brand-primary text-on-brand shadow-floating hover-only:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-line-hairline font-bold text-xs"
      >
        <Sparkles className="w-4 h-4 text-on-brand fill-on-brand group-hover:rotate-12 transition-transform shrink-0" />
        <span className="whitespace-nowrap font-semibold tracking-wide">Catat Momen</span>

        {/* Pending Draft Counter Badge */}
        {pendingDraftCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-danger text-on-brand text-[10px] font-mono font-bold whitespace-nowrap">
            {pendingDraftCount}
          </span>
        )}
      </button>
    </div>
  );
};
