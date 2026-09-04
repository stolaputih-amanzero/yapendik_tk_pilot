/**
 * Amanaura OS — Workspace Loading Skeleton (Padma Modern / FLOW)
 * 
 * Epistemic Calm & Zero-CLS Transition Anchor:
 * Provides instant tactile visual continuity during route/chunk loading.
 * Strictly adheres to Law 11 (Zero-Emoji) and ARB Guardrail 3 & 5.
 */

import React from 'react';

interface WorkspaceSkeletonProps {
  label?: string;
}

export const WorkspaceSkeleton: React.FC<WorkspaceSkeletonProps> = ({
  label = 'Menyiapkan lembar kerja...'
}) => {
  return (
    <div 
      className="w-full min-h-[60vh] p-4 medium:p-6 lg:p-8 animate-in fade-in duration-200"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      {/* Skeleton Top Context Ribbon / Breadcrumb Header */}
      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4 mb-6 pb-4 border-b border-line-hairline/60">
        <div className="space-y-2">
          {/* Category Pill Skeleton */}
          <div className="h-4 w-28 rounded-full bg-surface-subtle animate-pulse" />
          {/* Workspace Title Skeleton */}
          <div className="h-7 w-56 medium:w-72 rounded-lg bg-surface-subtle animate-pulse" />
        </div>

        {/* Action Button Skeletons */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-field bg-surface-subtle animate-pulse" />
          <div className="h-9 w-32 rounded-field bg-surface-subtle animate-pulse" />
        </div>
      </div>

      {/* Main Content Grid Skeletons */}
      <div className="grid grid-cols-1 medium:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {/* Metric / Status Cards */}
        {[1, 2, 3].map((item) => (
          <div 
            key={item}
            className="p-5 rounded-card bg-surface border border-line-hairline/80 shadow-hairline space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-surface-subtle animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-surface-subtle animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded bg-surface-subtle animate-pulse" />
            <div className="h-3 w-40 rounded bg-surface-subtle/80 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Central Calm Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-card bg-surface/40 border border-line-hairline/60">
        <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-3">
          <span 
            className="text-brand-primary text-base font-serif select-none"
            style={{ animation: 'amanaura-shell-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            ✦
          </span>
        </div>
        <p className="text-xs medium:text-sm font-medium text-ink-soft tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
};
