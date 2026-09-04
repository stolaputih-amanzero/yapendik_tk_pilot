/**
 * Amanaura OS × FLOW — Privacy-First Splash Screen (FB-01 & Signature #1)
 * Architectural Specification: AMANAURA v3.0 Part VIII §8.1.4 & ADR-UX-011 §5.4
 * 
 * Invariants:
 * 1. ZERO-PII: Strictly renders brand mark and Amanaura Breath glyph (✦). No cached student data.
 * 2. Circadian Daylight: Dynamic adaptation between Frangipani Day (#F7F4ED) and Night Temple (#16130F).
 * 3. Signature #1 Amanaura Breath: 4-second gold pulse (#A8874C).
 * 4. Graceful Departure: Dignified opacity fade-out transition.
 */

import React, { useEffect } from 'react';

interface AmanauraSplashScreenProps {
  fading?: boolean;
  subtitle?: string;
}

export const AmanauraSplashScreen: React.FC<AmanauraSplashScreenProps> = ({
  fading = false,
  subtitle = 'The Warm, Tactile, and Dignified Operating Experience'
}) => {
  // Dismiss the static pre-hydration HTML shell once this React component takes visual control
  useEffect(() => {
    const preShell = document.getElementById('amanaura-splash-shell');
    if (preShell) {
      preShell.classList.add('hidden');
      setTimeout(() => {
        preShell.remove();
      }, 500);
    }
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat Amanaura OS"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas text-ink transition-opacity duration-700 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center animate-in fade-in duration-500">
        {/* Brand Mark Emblem with Soft Aura */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-accent-valor/10 blur-xl scale-125 dark:bg-accent-valor/20 animate-pulse pointer-events-none" />
          <img
            src="/branding/amanaura-logo-plain.png"
            alt="Amanaura OS Logo"
            className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-sm dark:drop-shadow-[0_0_16px_rgba(168,135,76,0.35)]"
          />
        </div>

        {/* Wordmark & Living Presence Breath */}
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-xl sm:text-2xl font-serif font-normal tracking-wide text-ink">
            Amanaura OS
          </h1>
          <span
            className="inline-block text-accent-valor text-lg select-none animate-amanaura-breath"
            style={{ color: '#A8874C' }}
            aria-hidden="true"
          >
            ✦
          </span>
        </div>

        {/* Subtitle / Educational Vision */}
        <p className="text-xs sm:text-sm text-ink-soft font-normal tracking-normal max-w-xs leading-relaxed">
          {subtitle}
        </p>

        {/* Subtle Circadian Status Indicator */}
        <div className="mt-8 flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-ink-soft/70">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-valor animate-pulse" />
          <span>Memuat Konteks Identitas...</span>
        </div>
      </div>
    </div>
  );
};
