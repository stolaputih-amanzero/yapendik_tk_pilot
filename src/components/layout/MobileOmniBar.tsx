/**
 * Yapendik School OS — Mobile-First Zero-Navigation Omni-Bar
 * Floating Action Hub & Touch-Friendly iOS-Style App Library Sheet
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { WorkspaceTab } from './TopBar';
import { 
  Search, 
  ChevronUp, 
  X, 
  Activity, 
  Settings2, 
  Clock, 
  Shield, 
  Landmark, 
  ArrowUpRight, 
  GraduationCap, 
  Home, 
  Sparkles, 
  FileCheck, 
  CheckSquare, 
  ClipboardList, 
  UserCheck, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Palette, 
  FileText, 
  FlaskConical, 
  Command,
  LucideIcon
} from 'lucide-react';

interface MobileOmniBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
}

interface NavItem {
  tab: WorkspaceTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
  colorClass?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SmartChip {
  label: string;
  tab: WorkspaceTab;
  icon?: string;
}

export const MobileOmniBar: React.FC<MobileOmniBarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentPersona, securityContext } = useSecurityContext();

  const role = currentPersona?.role || securityContext?.role || 'TEACHER';
  const isSuperadminOrFoundation = 
    role === 'YAPENDIK_SUPERADMIN' || 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' ||
    securityContext?.role === 'FOUNDATION_DIRECTOR';
  const isHeadmaster = 
    role === 'HEADMASTER' ||
    securityContext?.role === 'HEADMASTER';
  const isGuardianOrApplicant = 
    role === 'GUARDIAN' || 
    role === 'APPLICANT' ||
    role === 'PARENT_BUDI' ||
    securityContext?.role === 'GUARDIAN' ||
    securityContext?.role === 'APPLICANT_GUARDIAN';

  // 1. SMART CHIPS (Fast Shortcuts per Role)
  let smartChips: SmartChip[] = [];

  if (isSuperadminOrFoundation) {
    smartChips = [
      { label: 'Statistik', tab: 'INSTITUTIONAL_HEALTH' },
      { label: 'Kebijakan', tab: 'FOUNDATION_GOVERNANCE' },
      { label: 'Pengaturan', tab: 'PROVISIONING' }
    ];
  } else if (isHeadmaster) {
    smartChips = [
      { label: 'Statistik', tab: 'INSTITUTIONAL_HEALTH' },
      { label: 'Meja PPDB', tab: 'ADMISSIONS_DESK' },
      { label: 'Standar Yayasan', tab: 'HEADMASTER_ADOPTION' }
    ];
  } else if (isGuardianOrApplicant) {
    smartChips = [
      { label: 'Buku Penghubung', tab: 'COMMUNICATION' },
      { label: 'Portal PPDB', tab: 'ADMISSIONS_PORTAL' },
      { label: 'Jejak Ananda', tab: 'STUDENT_JOURNEY' }
    ];
  } else {
    // Default: TEACHER
    smartChips = [
      { label: 'Presensi', tab: 'ATTENDANCE' },
      { label: 'Observasi', tab: 'OBSERVATIONS' },
      { label: 'Kerja Harian', tab: 'DAILY_WORK' }
    ];
  }

  // 2. APP LIBRARY CATEGORIES & ITEMS (Humanized Concise Copywriting)
  let navGroups: NavGroup[] = [];

  if (isSuperadminOrFoundation) {
    navGroups = [
      {
        title: 'PUSAT KOMANDO',
        items: [
          { tab: 'INSTITUTIONAL_HEALTH', label: 'Statistik Unit', icon: Activity }
        ]
      },
      {
        title: 'TATA KELOLA OPERASIONAL',
        items: [
          { tab: 'PROVISIONING', label: 'Pengaturan Unit', icon: Settings2 },
          { tab: 'ACADEMIC_LIFECYCLE', label: 'Tahun Ajaran', icon: Clock },
          { tab: 'GOVERNANCE', label: 'Log Keamanan', icon: Shield }
        ]
      },
      {
        title: 'STANDAR AKADEMIK',
        items: [
          { tab: 'FOUNDATION_GOVERNANCE', label: 'Pusat Kebijakan', icon: Landmark },
          { tab: 'COHORT_PROMOTION', label: 'Promosi Kelas', icon: ArrowUpRight },
          { tab: 'GRADUATION_REGISTRY', label: 'Buku Kelulusan', icon: GraduationCap }
        ]
      },
      {
        title: 'AUDIT LAPANGAN',
        items: [
          { tab: 'TEACHER_HOME', label: 'Ruang Guru', icon: Home },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      }
    ];
  } else if (isHeadmaster) {
    navGroups = [
      {
        title: 'MANAJEMEN UNIT',
        items: [
          { tab: 'ADMISSIONS_DESK', label: 'Meja PPDB', icon: FileCheck },
          { tab: 'HEADMASTER_ADOPTION', label: 'Standar Yayasan', icon: CheckSquare },
          { tab: 'INSTITUTIONAL_HEALTH', label: 'Statistik Unit', icon: Activity }
        ]
      },
      {
        title: 'AKADEMIK & PROMOSI',
        items: [
          { tab: 'COHORT_PROMOTION', label: 'Promosi Kelas', icon: ArrowUpRight },
          { tab: 'GRADUATION_REGISTRY', label: 'Buku Kelulusan', icon: GraduationCap }
        ]
      },
      {
        title: 'PEMANTAUAN KELAS',
        items: [
          { tab: 'TEACHER_HOME', label: 'Ruang Guru', icon: Home },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      }
    ];
  } else if (isGuardianOrApplicant) {
    navGroups = [
      {
        title: 'ANAK SAYA',
        items: [
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Ananda', icon: Sparkles },
          { tab: 'OBSERVATIONS', label: 'Karya & Observasi', icon: Palette }
        ]
      },
      {
        title: 'ADMINISTRASI',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: 'Portal PPDB', icon: FileText },
          { tab: 'COMMUNICATION', label: 'Buku Penghubung', icon: MessageSquare }
        ]
      }
    ];
  } else {
    // Default: TEACHER
    navGroups = [
      {
        title: 'RUANG KELAS',
        items: [
          { tab: 'TEACHER_HOME', label: 'Beranda Guru', icon: Home },
          { tab: 'DAILY_WORK', label: 'Kerja Harian', icon: ClipboardList },
          { tab: 'ATTENDANCE', label: 'Presensi', icon: UserCheck }
        ]
      },
      {
        title: 'AKADEMIK & OBSERVASI',
        items: [
          { tab: 'OBSERVATIONS', label: 'Observasi', icon: Palette },
          { tab: 'DEVELOPMENT', label: 'Perkembangan', icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      },
      {
        title: 'KEMITRAAN',
        items: [
          { tab: 'COMMUNICATION', label: 'Buku Penghubung', icon: MessageSquare },
          { tab: 'ROSTER', label: 'Data Roster', icon: Users }
        ]
      }
    ];
  }

  // Filter items by search query if any
  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* 1. FLOATING OMNI-BAR & SMART CHIPS CONTAINER (Visible on Mobile only when collapsed) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 expanded:hidden flex flex-col gap-2 pointer-events-auto min-w-0">
        {/* Row 1: Smart Chips Carousel */}
        <div className="flex items-center gap-2 w-full justify-start overflow-x-auto no-scrollbar pb-0.5 min-w-0 [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
          {smartChips.map(chip => {
            const isActive = activeTab === chip.tab;
            return (
              <button
                key={chip.tab}
                type="button"
                onClick={() => onSelectTab(chip.tab)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 flex items-center gap-2 shadow-hairline active:scale-95 cursor-pointer backdrop-blur-md whitespace-nowrap truncate border ${
                  isActive
                    ? 'bg-brand text-on-brand border-brand font-bold shadow-hairline'
                    : 'bg-surface/90 hover-only:bg-surface text-ink border-line shadow-hairline'
                }`}
              >
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: The Omni-Bar Capsule Trigger */}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full bg-surface/95 backdrop-blur-xl border border-line shadow-floating p-3 rounded-card flex items-center justify-between text-ink active:scale-[0.99] transition-all cursor-pointer hover-only:border-line-strong min-w-0"
        >
          <div className="flex items-center space-x-2.5 min-w-0 truncate">
            <div className="w-6 h-6 rounded-lg bg-surface-subtle border border-line flex items-center justify-center text-brass shrink-0">
              <Command className="w-4 h-4" />
            </div>
            <span className="text-xs text-ink-soft font-medium truncate">
              Apa fokus Anda hari ini?
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-ink-faint shrink-0 ml-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-surface-subtle px-2 py-1 rounded border border-line text-ink-soft font-bold whitespace-nowrap">
              Menu
            </span>
            <div className="w-6 h-6 rounded-md bg-surface-subtle flex items-center justify-center text-ink-soft">
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* 2. APP LIBRARY BOTTOM SHEET DRAWER (When isExpanded is true) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-60 bg-brand/40 backdrop-blur-xs expanded:hidden flex flex-col justify-end transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="bg-surface w-full h-[85vh] rounded-t-3xl border-t border-line shadow-floating flex flex-col overflow-hidden text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-line-strong motif-poleng rounded-full" />
            </div>

            {/* Header: Search Omnibar & Close Button */}
            <div className="p-4 border-b border-line-soft flex items-center gap-3 min-w-0">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-faint">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari modul atau menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-field pl-9 pr-8 py-2 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-line-strong transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-faint hover-only:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-field bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink-soft transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App Library Grid Content */}
            <div className="overflow-y-auto p-4 space-y-6 flex-1 min-w-0">
              {filteredGroups.length === 0 ? (
                <div className="py-12 text-center text-ink-faint text-xs">
                  Tidak ada modul yang cocok dengan pencarian "{searchQuery}"
                </div>
              ) : (
                filteredGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-2.5 min-w-0">
                    <h3 className="text-[10px] font-bold text-ink-faint uppercase tracking-wider px-1 truncate">
                      {group.title}
                    </h3>

                    <div className="grid grid-cols-3 medium:grid-cols-4 gap-3">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.tab;

                        return (
                          <button
                            key={item.tab}
                            type="button"
                            onClick={() => {
                              onSelectTab(item.tab);
                              setIsExpanded(false);
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-card transition-all duration-150 cursor-pointer active:scale-95 text-center min-w-0 border ${
                              isActive
                                ? 'bg-brand text-on-brand border-brand shadow-hairline'
                                : 'bg-surface-subtle hover-only:bg-surface-subtle/80 border-line'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-field flex items-center justify-center mb-1.5 shadow-hairline shrink-0 ${
                              isActive 
                                ? 'bg-surface-inset text-on-brand' 
                                : 'bg-surface border border-line text-ink'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[11px] leading-tight line-clamp-1 font-medium truncate w-full ${
                              isActive ? 'text-on-brand font-bold' : 'text-ink'
                            }`}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Bottom Test & Contract Actions */}
              <div className="pt-2 min-w-0 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PERCONTOHAN');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-field text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'PERCONTOHAN'
                      ? 'bg-brand text-on-brand font-bold shadow-hairline'
                      : 'bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink border border-line'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-brass shrink-0" />
                  <span className="truncate">Living Contract</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('TESTS');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-field text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'TESTS'
                      ? 'bg-brand text-on-brand font-bold shadow-hairline'
                      : 'bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink border border-line'
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-brass shrink-0" />
                  <span className="truncate">Uji Otorisasi Sistem (TESTS)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
