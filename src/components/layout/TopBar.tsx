/**
 * Amanaura OS × FLOW — Context Bar (TopBar)
 * Architectural Specification: ADR-UX-011 §4.1
 * 
 * "Context Bar, Not Brand Bar" — Pure Clean Ambient TopBar
 * Zone 1: Active Page Title & Amanaura Breath ✦ Presence Glyph
 * Zero Action Clutter: Profile moved to Sidebar (desktop) & Omnibar (mobile)
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTabMetadata, getRouteLabel } from '../../config/routeRegistry';
import { useConnectionStatus, getBreathStateMeta } from '../../hooks/useConnectionStatus';
import { useSecurityContext } from '../../auth/context';

export type WorkspaceTab = 
  | 'TEACHER_HOME'
  | 'DAILY_WORK'
  | 'OBSERVATIONS'
  | 'DEVELOPMENT'
  | 'ATTENDANCE'
  | 'COMMUNICATION'
  | 'ROSTER'
  | 'GOVERNANCE'
  | 'PROVISIONING'
  | 'ACADEMIC_LIFECYCLE'
  | 'COHORT_PROMOTION'
  | 'GRADUATION_REGISTRY'
  | 'INSTITUTIONAL_HEALTH'
  | 'STUDENT_JOURNEY'
  | 'FOUNDATION_GOVERNANCE'
  | 'HEADMASTER_ADOPTION'
  | 'ADMISSIONS_PORTAL'
  | 'ADMISSIONS_DESK'
  | 'GUARDIAN_WORKSPACE'
  | 'TESTS'
  | 'PERCONTOHAN';

interface TopBarProps {
  activeTab?: WorkspaceTab;
  onNavigateTab?: (tab: WorkspaceTab) => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab = 'TEACHER_HOME',
  onNavigateTab,
  className = ''
}) => {
  const { currentPersona } = useSecurityContext();
  const { state: connectionState, queuedMutations } = useConnectionStatus();
  const tabMeta = getTabMetadata(activeTab);
  const pageTitle = getRouteLabel(activeTab, currentPersona?.role);
  const breathMeta = getBreathStateMeta(connectionState, queuedMutations);

  return (
    <header 
      data-testid="topbar"
      className={`bg-surface-glass backdrop-blur-xl border-b border-line-hairline text-ink sticky top-0 z-40 px-4 medium:px-6 h-16 flex items-center justify-between shadow-hairline min-w-0 shrink-0 transition-colors duration-300 ${className}`}
    >
      {/* ZONE 1: CONTEXT TITLE (Dynamic Active Page) & Amanaura Breath ✦ */}
      <div className="flex items-center space-x-2.5 medium:space-x-3 shrink-0 min-w-0">
        {activeTab !== 'TEACHER_HOME' && onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('TEACHER_HOME')}
            className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-xl text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle transition-colors min-h-[40px] text-xs font-semibold cursor-pointer group shrink-0 active:scale-95"
            title="Kembali ke Beranda Guru"
            aria-label="Kembali ke Beranda Guru"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden medium:inline">Kembali</span>
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="font-bold tracking-tight text-ink text-base medium:text-lg whitespace-nowrap truncate">
              {pageTitle}
            </h1>
            <span 
              className={`${breathMeta.colorClass} text-xs ${breathMeta.animationClass} select-none shrink-0`} 
              aria-label={breathMeta.ariaLabel}
              title={breathMeta.title}
            >
              ✦
            </span>
            {breathMeta.showCapsule && (
              <span className="px-2 py-1 rounded-full bg-warning-tint text-warning-deep border border-warning-line text-[10px] font-mono font-semibold shrink-0 animate-in fade-in">
                {breathMeta.capsuleText}
              </span>
            )}
          </div>
          <span className="text-[10px] text-ink-faint hidden md:block font-medium truncate">
            {tabMeta.category} • {tabMeta.description}
          </span>
        </div>
      </div>
    </header>
  );
};
