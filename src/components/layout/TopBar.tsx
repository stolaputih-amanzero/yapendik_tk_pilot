/**
 * Yapendik School OS — Institutional Top Bar
 * 
 * Top Bar Contract:
 * [Brand title, one line] — [4–6 nav links, 1–2 word labels, single-line] — [1–2 primary actions]
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Database, 
  LogOut, 
  CheckCircle2, 
  ChevronDown,
  Sparkles
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
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenSupabaseModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSupabaseModal
}) => {
  const { currentPersona, personas, switchPersona, signOut, securityContext } = useSecurityContext();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLainnyaMenu, setShowLainnyaMenu] = useState(false);
  const supabaseConfig = getSupabaseConfig();
  const isGuardian = currentPersona.role === 'PARENT_BUDI' || securityContext?.role === 'GUARDIAN';
  const isSuperadminOrFoundation = 
    currentPersona.role === 'YAPENDIK_SUPERADMIN' || 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' ||
    securityContext?.role === 'FOUNDATION_DIRECTOR';
  const isHeadmaster = 
    currentPersona.role === 'HEADMASTER' ||
    securityContext?.role === 'HEADMASTER';
  const isGovernanceOrHeadmaster = isSuperadminOrFoundation || isHeadmaster;

  const navItems: { tab: WorkspaceTab; label: string }[] = isGuardian ? [
    { tab: 'ADMISSIONS_PORTAL' as WorkspaceTab, label: '📝 Portal PPDB' },
    { tab: 'STUDENT_JOURNEY' as WorkspaceTab, label: '🌟 Jejak Ananda' },
    { tab: 'COMMUNICATION' as WorkspaceTab, label: '📖 Buku Penghubung' },
    { tab: 'OBSERVATIONS' as WorkspaceTab, label: '🎨 Karya & Observasi' },
    { tab: 'TESTS', label: 'Uji Otorisasi' }
  ] : [
    { tab: 'TEACHER_HOME', label: '🏠 Ruang Guru' },
    ...(isHeadmaster ? [
      { tab: 'ADMISSIONS_DESK' as WorkspaceTab, label: '🎓 PPDB & Promosi' },
      { tab: 'HEADMASTER_ADOPTION' as WorkspaceTab, label: '📥 Adopsi Kebijakan' }
    ] : []),
    { tab: 'STUDENT_JOURNEY' as WorkspaceTab, label: 'Jejak Anak' },
    ...(isSuperadminOrFoundation ? [
      { tab: 'FOUNDATION_GOVERNANCE' as WorkspaceTab, label: '🏛️ Konsol Yayasan' }
    ] : []),
    ...(isGovernanceOrHeadmaster ? [
      { tab: 'INSTITUTIONAL_HEALTH' as WorkspaceTab, label: 'Telemetri Yayasan' },
      { tab: 'ACADEMIC_LIFECYCLE' as WorkspaceTab, label: 'Siklus Akademik' }
    ] : []),
    { tab: 'TESTS', label: 'Uji Otorisasi' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* ZONE 1: BRAND TITLE (Single Line) */}
      <div className="flex items-center space-x-3 shrink-0">
        <span className="font-semibold tracking-tight text-white text-lg whitespace-nowrap">
          Yapendik School OS
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 whitespace-nowrap">
          TK Pilot v1.0
        </span>
      </div>

      {/* ZONE 2: NAVIGATION LINKS (Single Line, 4-6 items) */}
      <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}

        {/* Secondary dropdown items */}
        <div className="relative group">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center space-x-1 ${
              activeTab === 'ROSTER' || activeTab === 'GOVERNANCE' || activeTab === 'PROVISIONING' || activeTab === 'ACADEMIC_LIFECYCLE' || activeTab === 'COHORT_PROMOTION' || activeTab === 'GRADUATION_REGISTRY' || activeTab === 'INSTITUTIONAL_HEALTH' || activeTab === 'STUDENT_JOURNEY'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Lainnya</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-slate-900 border border-slate-700 hidden group-hover:block p-1 z-50">
            <button
              onClick={() => onSelectTab('STUDENT_JOURNEY')}
              className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                activeTab === 'STUDENT_JOURNEY' ? 'text-amber-400 font-bold bg-slate-800/50' : 'text-slate-200'
              }`}
            >
              <span>Linimasa & Jejak Anak (Multi-Tahun)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Stage 3</span>
            </button>
            {isGovernanceOrHeadmaster && (
              <>
                <button
                  onClick={() => onSelectTab('INSTITUTIONAL_HEALTH')}
                  className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                    activeTab === 'INSTITUTIONAL_HEALTH' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <span>Telemetri Kesehatan Lembaga</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Stage 3</span>
                </button>
                <button
                  onClick={() => onSelectTab('ACADEMIC_LIFECYCLE')}
                  className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                    activeTab === 'ACADEMIC_LIFECYCLE' ? 'text-amber-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <span>Tata Kelola Siklus Akademik</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Stage 3</span>
                </button>
                <button
                  onClick={() => onSelectTab('COHORT_PROMOTION')}
                  className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                    activeTab === 'COHORT_PROMOTION' ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <span>Promosi Rombel Siswa</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Stage 3</span>
                </button>
                <button
                  onClick={() => onSelectTab('GRADUATION_REGISTRY')}
                  className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                    activeTab === 'GRADUATION_REGISTRY' ? 'text-purple-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <span>Buku Registrasi Kelulusan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Stage 3</span>
                </button>
                <button
                  onClick={() => onSelectTab('PROVISIONING')}
                  className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 flex items-center justify-between ${
                    activeTab === 'PROVISIONING' ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-200'
                  }`}
                >
                  <span>Kesiapan & Setup Institusi</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Stage 2</span>
                </button>
              </>
            )}
            <div className="border-t border-slate-700 my-1"></div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Modul Kerja Standalone (Legacy)</div>
            <button
              onClick={() => onSelectTab('DAILY_WORK')}
              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'DAILY_WORK' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Kerja Harian Standalone
            </button>
            <button
              onClick={() => onSelectTab('ATTENDANCE')}
              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'ATTENDANCE' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Presensi Kelas Standalone
            </button>
            <button
              onClick={() => onSelectTab('OBSERVATIONS')}
              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'OBSERVATIONS' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Observasi TK Standalone
            </button>
            <button
              onClick={() => onSelectTab('DEVELOPMENT')}
              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'DEVELOPMENT' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Perkembangan Standalone
            </button>
            <button
              onClick={() => onSelectTab('COMMUNICATION')}
              className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'COMMUNICATION' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Buku Penghubung Standalone
            </button>
            <div className="border-t border-slate-700 my-1"></div>
            <button
              onClick={() => onSelectTab('ROSTER')}
              className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'ROSTER' ? 'text-amber-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Data Induk Siswa & Roster
            </button>
            <button
              onClick={() => onSelectTab('GOVERNANCE')}
              className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800 ${
                activeTab === 'GOVERNANCE' ? 'text-amber-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Tata Kelola & Audit Log
            </button>
          </div>
        </div>
      </nav>

      {/* ZONE 3: ACTIONS & CONTEXT SELECTOR (Single Line) */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Supabase status indicator */}
        <button
          onClick={onOpenSupabaseModal}
          title={supabaseConfig.statusMessage}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-colors whitespace-nowrap shrink-0"
        >
          <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">
            {supabaseConfig.isConnected ? 'Supabase On' : 'Storage Engine'}
          </span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-xs font-bold shrink-0">
              {currentPersona?.name.charAt(0) || 'U'}
            </div>
            <div className="text-xs hidden md:block leading-tight text-left">
              <div className="font-medium text-slate-100 truncate max-w-[160px]">{currentPersona?.name || 'Pengguna'}</div>
              <div className="text-slate-400 text-[10px] truncate max-w-[160px]">
                {currentPersona?.role || 'AUTH'} • {currentPersona?.schoolName?.split(' ')[0] || 'Unit'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-slate-900 border border-slate-700 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Konteks Persona (Contextual Auth)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Uji perilaku sistem dari sudut pandang Guru, Kepala Sekolah, Orang Tua, atau Unit Sekolah Lain.
                </div>
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {personas.map(p => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setShowPersonaMenu(false);
                        if (p.role === 'GUARDIAN' || p.id === 'user_parent_budi' || p.id === 'user_parent_bona') {
                          onSelectTab('ADMISSIONS_PORTAL');
                        } else if (p.role === 'TEACHER') {
                          onSelectTab('TEACHER_HOME');
                        } else if (p.role === 'HEADMASTER') {
                          onSelectTab('ADMISSIONS_DESK');
                        }
                      }}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors flex items-start space-x-2.5 ${
                        isSelected ? 'bg-slate-800 border border-slate-600' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                        <div className="text-amber-400 font-mono text-[10px]">{p.role}</div>
                        <div className="text-slate-400 text-[11px] truncate">{p.schoolName}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    signOut();
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-md text-xs font-semibold text-red-400 hover:bg-slate-800/60 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
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
