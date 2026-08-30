/**
 * Amanaura OS × FLOW — Context Bar (TopBar)
 * Architectural Specification: ADR-UX-011 §4.1
 * 
 * "Context Bar, Not Brand Bar"
 * Left Zone: Active Page Title & Operational Context
 * Right Zone: Presence Marker ✦, Quick Theme, & Avatar Profile Trigger
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { 
  Building2, 
  Database, 
  ChevronDown,
  Sparkles,
  LogOut
} from 'lucide-react';
import { getSupabaseConfig } from '../../db/supabaseClient';
import { getTabMetadata } from '../../config/routeRegistry';
import { useConnectionStatus, getBreathStateMeta } from '../../hooks/useConnectionStatus';

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
  onOpenSupabaseModal: () => void;
  onSelectTab?: (tab: WorkspaceTab) => void;
  onOpenProfileDrawer?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab = 'TEACHER_HOME',
  onOpenSupabaseModal,
  onSelectTab,
  onOpenProfileDrawer
}) => {
  const { currentPersona, personas, switchPersona, signOut } = useSecurityContext();
  const { state: connectionState, queuedMutations } = useConnectionStatus();
  const [showDesktopPersonaMenu, setShowDesktopPersonaMenu] = useState(false);
  const supabaseConfig = getSupabaseConfig();
  const isSimulationEnabled = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_SIMULATION === 'true';

  const tabMeta = getTabMetadata(activeTab);
  const breathMeta = getBreathStateMeta(connectionState, queuedMutations);

  const handleAvatarClick = () => {
    if (onOpenProfileDrawer && window.innerWidth < 840) {
      // Mobile / Tablet: Open Mobile Profile Drawer
      onOpenProfileDrawer();
    } else {
      // Desktop: Toggle desktop quick menu
      setShowDesktopPersonaMenu(prev => !prev);
    }
  };

  return (
    <header 
      data-testid="topbar"
      className="bg-surface-glass backdrop-blur-xl border-b border-line-hairline text-ink sticky top-0 z-40 px-4 medium:px-6 h-16 flex items-center justify-between shadow-hairline min-w-0 shrink-0 transition-colors duration-300"
    >
      {/* ZONE 1: CONTEXT TITLE (Dynamic Active Page) */}
      <div className="flex items-center space-x-2.5 medium:space-x-3 shrink-0 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="font-bold tracking-tight text-ink text-base medium:text-lg whitespace-nowrap truncate">
              {tabMeta.title}
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
          <span className="text-[10px] text-ink-faint hidden medium:block font-medium truncate">
            {tabMeta.category} • {tabMeta.description}
          </span>
        </div>
      </div>

      {/* ZONE 2: ACTIONS & AVATAR PROFILE TRIGGER */}
      <div className="flex items-center space-x-2 medium:space-x-3 shrink-0">
        {/* Supabase status indicator (Simulation mode, Mobile Viewport Only) */}
        {isSimulationEnabled && (
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            title={supabaseConfig.statusMessage}
            className="flex expanded:hidden items-center space-x-1.5 px-2.5 py-2 rounded-control bg-surface-subtle hover-only:bg-surface border border-line-hairline text-xs font-mono text-ink-soft transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-success' : 'text-ink-faint'}`} />
          </button>
        )}

        {/* Avatar Profile Trigger (Touch Floor 48dp) */}
        <div className="relative">
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label="Buka Menu Profil & Pengaturan"
            className="flex items-center space-x-2 p-1 medium:px-3 medium:py-2 rounded-full medium:rounded-control bg-surface-subtle hover-only:bg-surface border border-line-hairline text-left transition-colors whitespace-nowrap cursor-pointer text-ink min-h-[48px] min-w-[48px]"
            title={currentPersona?.name || 'Profil Pengguna'}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-xs font-bold shadow-soft">
                {currentPersona?.name.charAt(0) || 'U'}
              </div>
              {/* Presence Marker Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-surface flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${breathMeta.state === 'ONLINE' || breathMeta.state === 'RECONCILING' ? 'bg-accent-valor' : 'bg-ink-faint'}`} />
              </span>
            </div>

            <div className="hidden medium:flex flex-col min-w-0 pr-1">
              <span className="text-xs font-bold text-ink truncate max-w-[120px]">
                {currentPersona?.name}
              </span>
              <span className="text-[10px] text-ink-faint font-medium truncate">
                {currentPersona?.role}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-ink-faint hidden expanded:block shrink-0" />
          </button>

          {/* Desktop Persona Dropdown Menu (Secondary on Desktop) */}
          {showDesktopPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface border border-line-hairline rounded-card shadow-floating z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-line-hairline mb-1">
                <div className="text-xs font-bold text-ink">{currentPersona?.name}</div>
                <div className="text-[11px] text-ink-soft">{currentPersona?.schoolName || 'Unit Satuan'}</div>
              </div>

              <div className="text-[10px] font-bold text-ink-faint uppercase px-3 py-1 tracking-wider">
                Ganti Peran (Simulasi)
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {personas.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      switchPersona(p.id);
                      setShowDesktopPersonaMenu(false);
                      if (onSelectTab) {
                        if (p.role === 'APPLICANT' || p.id === 'user_parent_bona') {
                          onSelectTab('ADMISSIONS_PORTAL');
                        } else if (p.role === 'GUARDIAN' || p.id === 'user_parent_budi') {
                          onSelectTab('GUARDIAN_WORKSPACE');
                        } else if (p.role === 'TEACHER') {
                          onSelectTab('TEACHER_HOME');
                        } else if (p.role === 'HEADMASTER') {
                          onSelectTab('HEADMASTER_ADOPTION');
                        } else if (p.role === 'YAPENDIK_SUPERADMIN' || p.role === 'FOUNDATION_DIRECTOR') {
                          onSelectTab('FOUNDATION_GOVERNANCE');
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 text-left rounded-control text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      p.id === currentPersona?.id
                        ? 'bg-surface-subtle font-bold text-brand-primary'
                        : 'text-ink-soft hover-only:bg-surface-subtle/70 hover-only:text-ink'
                    }`}
                  >
                    <div className="truncate">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-ink-faint">{p.role}</div>
                    </div>
                    {p.id === currentPersona?.id && (
                      <span className="text-accent-valor text-xs shrink-0">●</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-1.5 mt-1 border-t border-line-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesktopPersonaMenu(false);
                    signOut();
                  }}
                  className="w-full py-2 px-3 text-left rounded-control text-xs text-danger hover-only:bg-danger-tint font-medium flex items-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
