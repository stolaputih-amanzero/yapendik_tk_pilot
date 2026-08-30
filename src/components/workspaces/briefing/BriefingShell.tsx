/**
 * YAPENDIK SCHOOL OS — STAGE 6-A BRIEFING SHELL
 * Context-Aware Operating Companion Header
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - Law F-7 (Canvas-Native Flat): Direct on canvas, zero boxed thick card borders
 * - Amanaura Breath (Signature #1): ✦ pulse 4s (Operational) / 8s (Closure)
 * - MD3 responsive layout (compact, medium, expanded)
 * - Zero raw emojis, 100% token purity
 */

import React from 'react';
import { BriefingMode } from '../../../types/briefingTypes';
import { Volume2, VolumeX } from 'lucide-react';

export interface BriefingShellProps {
  greeting: string;
  date: string;
  mode: BriefingMode;
  schoolLocalTime?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const BriefingShell: React.FC<BriefingShellProps> = ({
  greeting,
  date,
  mode,
  schoolLocalTime,
  soundEnabled,
  onToggleSound,
  children,
  className = ''
}) => {
  const isClosure = mode === 'PENUTUP';
  const isPreview = mode === 'PRATINJAU';

  return (
    <header className={`w-full px-5 pt-6 pb-5 space-y-3 ${className}`}>
      {/* Top Metadata Bar: Date, Local Time, and Optional Sound Preference */}
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <div className="flex items-center gap-2">
          <span>{date}</span>
          {schoolLocalTime && (
            <>
              <span className="text-line-strong">•</span>
              <span className="font-mono">{schoolLocalTime}</span>
            </>
          )}
        </div>

        {onToggleSound !== undefined && (
          <button
            type="button"
            onClick={onToggleSound}
            className="flex items-center gap-1 text-ink-faint hover-only:text-ink transition-colors touch-target-min"
            title={soundEnabled ? 'Suara Penutup Hari Aktif' : 'Suara Penutup Hari Hening'}
            aria-label={soundEnabled ? 'Matikan Suara Penutup' : 'Aktifkan Suara Penutup'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-brand-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-ink-faint opacity-50" />
            )}
          </button>
        )}
      </div>

      {/* Greeting Title */}
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl medium:text-4xl font-serif font-normal text-ink tracking-wide leading-tight">
          {greeting}
        </h1>
      </div>

      {/* Sub-briefing content rendered flat on canvas */}
      <div className="pt-1">{children}</div>
    </header>
  );
};
