/**
 * Yapendik School OS — Global Top Bar
 * 
 * Clean Header Contract:
 * [ZONE 1: Brand Title] — [ZONE 3: Status & Mobile-Clean Persona Switcher]
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { 
  Building2, 
  Database, 
  LogOut, 
  CheckCircle2, 
  ChevronDown 
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
  | 'TESTS';

interface TopBarProps {
  onOpenSupabaseModal: () => void;
  onSelectTab?: (tab: WorkspaceTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSupabaseModal,
  onSelectTab
}) => {
  const { currentPersona, personas, switchPersona, signOut } = useSecurityContext();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const supabaseConfig = getSupabaseConfig();
  const isSimulationEnabled = import.meta.env.VITE_ENABLE_SIMULATION === 'true';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-900 sticky top-0 z-40 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xs min-w-0 shrink-0">
      {/* ZONE 1: BRAND TITLE (Minimal on Mobile) */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg whitespace-nowrap truncate">
          Yapendik OS
        </span>
      </div>

      {/* ZONE 3: ACTIONS & CLEAN CONTEXT SELECTOR */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Supabase status indicator (Hidden in production / simulation-disabled mode) */}
        {isSimulationEnabled && (
          <button
            onClick={onOpenSupabaseModal}
            title={supabaseConfig.statusMessage}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {supabaseConfig.isConnected ? 'Supabase On' : 'Storage Engine'}
            </span>
          </button>
        )}

        {/* Persona Switcher Dropdown (Mobile: Clean Avatar Only | Desktop: Full Info) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center space-x-2 p-1.5 md:px-3 md:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-colors whitespace-nowrap cursor-pointer text-slate-900"
            title={currentPersona?.name || 'Pengguna'}
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentPersona?.name.charAt(0) || 'U'}
            </div>
            <div className="text-xs hidden md:block leading-tight text-left min-w-0">
              <div className="font-semibold text-slate-900 truncate max-w-[140px] lg:max-w-[180px]">
                {currentPersona?.name || 'Pengguna'}
              </div>
              <div className="text-slate-500 text-[10px] truncate max-w-[140px] lg:max-w-[180px]">
                {currentPersona?.role || 'AUTH'} • {currentPersona?.schoolName?.split(' ')[0] || 'Unit'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block shrink-0" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl bg-white border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ganti Konteks Persona
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
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
                        isSelected ? 'bg-slate-100 border border-slate-300' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                        <div className="text-slate-600 font-mono text-[10px] truncate">{p.role}</div>
                        <div className="text-slate-500 text-[11px] truncate">{p.schoolName}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    signOut();
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2 cursor-pointer"
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
