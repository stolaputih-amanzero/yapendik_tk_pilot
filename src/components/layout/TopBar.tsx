/**
 * Yapendik School OS — Global Top Bar
 * 
 * Clean Header Contract:
 * [ZONE 1: Brand Title] — [ZONE 3: Status & Mobile-Clean Persona Switcher]
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { useTheme } from '../../hooks/useTheme';
import { 
  Building2, 
  Database, 
  LogOut, 
  CheckCircle2, 
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { getSupabaseConfig } from '../../db/supabaseClient';

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
  | 'TESTS'
  | 'PERCONTOHAN';

interface TopBarProps {
  onOpenSupabaseModal: () => void;
  onSelectTab?: (tab: WorkspaceTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSupabaseModal,
  onSelectTab
}) => {
  const { currentPersona, personas, switchPersona, signOut } = useSecurityContext();
  const { isDark, toggleTheme } = useTheme();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const supabaseConfig = getSupabaseConfig();
  const isSimulationEnabled = import.meta.env.VITE_ENABLE_SIMULATION === 'true';

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-line text-ink sticky top-0 z-40 px-4 medium:px-6 h-16 flex items-center justify-between shadow-hairline min-w-0 shrink-0 transition-colors duration-300">
      {/* ZONE 1: BRAND TITLE */}
      <div className="flex items-center space-x-2.5 medium:space-x-3 shrink-0 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-line flex items-center justify-center text-ink shrink-0">
          <Building2 className="w-4 h-4 text-brass" />
        </div>
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="font-bold tracking-tight text-ink text-base medium:text-lg whitespace-nowrap truncate font-display">
            Yapendik OS
          </span>
          <span className="text-brass text-xs animate-amanaura-breath select-none shrink-0" aria-hidden="true" title="Amanaura Breath ✦">✦</span>
        </div>
      </div>

      {/* ZONE 3: ACTIONS & CLEAN CONTEXT SELECTOR */}
      <div className="flex items-center space-x-2 medium:space-x-3 shrink-0">
        {/* Supabase status indicator (Hidden in production / simulation-disabled mode) */}
        {isSimulationEnabled && (
          <button
            onClick={onOpenSupabaseModal}
            title={supabaseConfig.statusMessage}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-surface-subtle hover-only:bg-surface-subtle/80 border border-line text-xs font-mono text-ink-soft transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-success' : 'text-ink-faint'}`} />
            <span className="hidden medium:inline">
              {supabaseConfig.isConnected ? 'Supabase On' : 'Storage Engine'}
            </span>
          </button>
        )}

        {/* Dark/Light Mode "Night Temple" Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Beralih ke Frangipani Day (Light Mode)" : "Beralih ke Night Temple (Dark Mode)"}
          title={isDark ? "Beralih ke Frangipani Day (Light Mode)" : "Beralih ke Night Temple (Dark Mode)"}
          className="p-2 rounded-lg bg-surface-subtle hover-only:bg-surface border border-line text-ink-soft hover-only:text-ink transition-colors cursor-pointer shrink-0"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-brass animate-in fade-in" />
          ) : (
            <Moon className="w-4 h-4 text-ink-soft animate-in fade-in" />
          )}
        </button>

        {/* Persona Switcher Dropdown (Mobile: Clean Avatar Only | Desktop: Full Info) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center space-x-2 p-2 medium:px-3 medium:py-1 rounded-lg bg-surface-subtle hover-only:bg-surface-subtle/80 border border-line text-left transition-colors whitespace-nowrap cursor-pointer text-ink"
            title={currentPersona?.name || 'Pengguna'}
          >
            <div className="w-7 h-7 rounded-full bg-brand text-on-brand flex items-center justify-center text-xs font-bold shrink-0">
              {currentPersona?.name.charAt(0) || 'U'}
            </div>
            <div className="text-xs hidden expanded:block leading-tight text-left min-w-0">
              <div className="font-semibold text-ink truncate max-w-[140px] expanded:max-w-[180px]">
                {currentPersona?.name || 'Pengguna'}
              </div>
              <div className="text-ink-soft text-[10px] truncate max-w-[140px] expanded:max-w-[180px]">
                {currentPersona?.role || 'AUTH'} • {currentPersona?.schoolName?.split(' ')[0] || 'Unit'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-faint hidden medium:block shrink-0" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 medium:w-80 rounded-card shadow-floating bg-surface border border-line p-2 z-50">
              <div className="px-3 py-2 border-b border-line-soft mb-1">
                <div className="text-xs font-bold text-ink uppercase tracking-wider">
                  Ganti Konteks Persona
                </div>
                <div className="text-[11px] text-ink-soft mt-0.5 line-clamp-2">
                  Uji perilaku sistem dari berbagai sudut pandang peran sekolah.
                </div>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {personas.map(p => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setShowPersonaMenu(false);
                        if (onSelectTab) {
                          if (p.role === 'GUARDIAN' || p.id === 'user_parent_budi' || p.id === 'user_parent_bona') {
                            onSelectTab('ADMISSIONS_PORTAL');
                          } else if (p.role === 'TEACHER') {
                            onSelectTab('TEACHER_HOME');
                          } else if (p.role === 'HEADMASTER') {
                            onSelectTab('ADMISSIONS_DESK');
                          } else if (p.role === 'YAPENDIK_SUPERADMIN') {
                            onSelectTab('INSTITUTIONAL_HEALTH');
                          }
                        }
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start space-x-2.5 cursor-pointer ${
                        isSelected ? 'bg-surface-subtle border border-line-strong' : 'hover-only:bg-surface-subtle border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-brand text-on-brand' : 'bg-line-soft text-ink-soft'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink truncate">{p.name}</div>
                        <div className="text-ink-soft font-mono text-[10px] truncate whitespace-nowrap">{p.role}</div>
                        <div className="text-ink-faint text-[11px] truncate">{p.schoolName}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-line-soft">
                <button
                  onClick={() => {
                    signOut();
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs font-semibold text-danger-deep hover-only:bg-danger-tint transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Keluar / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
