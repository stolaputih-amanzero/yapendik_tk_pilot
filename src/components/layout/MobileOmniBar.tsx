/**
 * Yapendik School OS — Mobile-First Zero-Navigation Omni-Bar
 * Floating Action Hub & Touch-Friendly iOS-Style App Library Sheet
 * S-1 to S-4: Dock Declutter (Curated Chips, Scroll Collapse, Collision Deference, Quiet Mode)
 */

import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  LucideIcon
} from 'lucide-react';

interface MobileOmniBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenProfileDrawer?: () => void;
  hasPageChips?: boolean;
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
  onSelectTab,
  onOpenProfileDrawer,
  hasPageChips = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isQuiet, setIsQuiet] = useState(false);
  const quietTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { currentPersona, securityContext, signOut } = useSecurityContext();

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

  // S-1: CURATED SMART CHIPS (Max 2 high-frequency shortcuts per active role)
  let smartChips: SmartChip[] = [];

  if (isSuperadminOrFoundation) {
    smartChips = [
      { label: 'Statistik Unit', tab: 'INSTITUTIONAL_HEALTH' },
      { label: 'Pusat Kebijakan', tab: 'FOUNDATION_GOVERNANCE' }
    ];
  } else if (isHeadmaster) {
    smartChips = [
      { label: 'Meja PPDB', tab: 'ADMISSIONS_DESK' },
      { label: 'Standar Yayasan', tab: 'HEADMASTER_ADOPTION' }
    ];
  } else if (isGuardianOrApplicant) {
    smartChips = [
      { label: 'Buku Penghubung', tab: 'COMMUNICATION' },
      { label: 'Portal PPDB', tab: 'ADMISSIONS_PORTAL' }
    ];
  } else {
    // Default: TEACHER (High-frequency pedagogical tasks only)
    smartChips = [
      { label: 'Presensi', tab: 'ATTENDANCE' },
      { label: 'Observasi', tab: 'OBSERVATIONS' }
    ];
  }

  // S-3: COLLISION DEFERENCE (If page has its own chip bar or is Attendance, defer dock chips)
  const showChips = !hasPageChips && activeTab !== 'ATTENDANCE' && activeTab !== 'TEACHER_HOME';

  // S-2: SCROLL-AWARE COLLAPSE LISTENER
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (diff > 24 && currentScrollY > 60) {
        setIsScrolledDown(true);
      } else if (diff < -15 || currentScrollY <= 20) {
        setIsScrolledDown(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // S-4: QUIET MODE TIMER (3s inactivity => opacity-60)
  const resetQuietTimer = () => {
    setIsQuiet(false);
    if (quietTimerRef.current) clearTimeout(quietTimerRef.current);
    quietTimerRef.current = setTimeout(() => {
      setIsQuiet(true);
    }, 3000);
  };

  useEffect(() => {
    resetQuietTimer();
    const handleUserActivity = () => resetQuietTimer();
    window.addEventListener('pointerdown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    return () => {
      if (quietTimerRef.current) clearTimeout(quietTimerRef.current);
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, []);

  // 2. APP LIBRARY CATEGORIES & ITEMS (Complete navigation in Menu Drawer)
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
          { tab: 'GRADUATION_REGISTRY', label: 'Buku Kelulusan', icon: GraduationCap },
          { tab: 'ACADEMIC_LIFECYCLE', label: 'Tahun Ajaran', icon: Clock }
        ]
      },
      {
        title: 'SUPERVISI & AUDIT',
        items: [
          { tab: 'GOVERNANCE', label: 'Log Keamanan', icon: Shield },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      }
    ];
  } else if (isGuardianOrApplicant) {
    navGroups = [
      {
        title: 'PORTAL WALI MURID',
        items: [
          { tab: 'COMMUNICATION', label: 'Buku Penghubung', icon: MessageSquare },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Ananda', icon: Sparkles }
        ]
      },
      {
        title: 'LAYANAN PENDAFTARAN',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: 'Portal PPDB', icon: UserCheck }
        ]
      }
    ];
  } else {
    // Default: TEACHER
    navGroups = [
      {
        title: 'KEGIATAN HARIAN KELAS',
        items: [
          { tab: 'TEACHER_HOME', label: 'Beranda Kelas', icon: Home },
          { tab: 'ATTENDANCE', label: 'Presensi Harian', icon: UserCheck },
          { tab: 'DAILY_WORK', label: 'Rencana Harian', icon: ClipboardList }
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
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 expanded:hidden flex flex-col gap-1.5 pointer-events-none min-w-0 px-4 pb-4 pt-6 bg-gradient-to-t from-canvas via-canvas/85 to-transparent transition-all duration-300 motion-reduce:transition-none ${
          isQuiet ? 'opacity-60 hover-only:opacity-100 focus-within:opacity-100' : 'opacity-100'
        }`}
        onPointerEnter={() => setIsQuiet(false)}
        onFocus={() => {
          setIsQuiet(false);
          setIsScrolledDown(false);
        }}
      >
        {/* Row 1: Smart Chips Carousel (S-1 Curated, S-2 Collapsible, S-3 Deferrable) */}
        {showChips && smartChips.length > 0 && (
          <div 
            className={`flex items-center gap-2 w-full justify-center overflow-x-auto no-scrollbar pointer-events-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
              isScrolledDown ? 'max-h-0 opacity-0 overflow-hidden -my-1 scale-95' : 'max-h-12 opacity-100 pb-0.5 scale-100'
            }`}
          >
            {smartChips.map(chip => {
              const isActive = activeTab === chip.tab;
              return (
                <button
                  key={chip.tab}
                  type="button"
                  onClick={() => onSelectTab(chip.tab)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-hairline active:scale-95 cursor-pointer backdrop-blur-md whitespace-nowrap truncate border ${
                    isActive
                      ? 'bg-brand-primary text-on-brand border-brand-primary font-bold shadow-hairline'
                      : 'bg-surface-glass hover-only:bg-surface text-ink border-line-hairline shadow-hairline'
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Row 2: The Omni-Bar Capsule Trigger & Profile Avatar */}
        <div className="flex items-center gap-2 w-full pointer-events-auto min-w-0">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className={`flex-1 bg-surface-glass backdrop-blur-xl border border-line-hairline shadow-floating rounded-2xl flex items-center justify-between text-ink active:scale-[0.99] transition-all duration-200 cursor-pointer hover-only:border-line min-w-0 ${
              isScrolledDown ? 'py-2 px-3' : 'py-2.5 px-4'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0 truncate">
              <div className="w-6 h-6 rounded-lg bg-surface-subtle border border-line-hairline flex items-center justify-center text-brand-primary shrink-0">
                <Command className="w-4 h-4" />
              </div>
              <span className="text-xs text-ink-soft font-medium truncate">
                Apa fokus Anda hari ini?
              </span>
            </div>

            <div className="flex items-center space-x-1 text-ink-faint shrink-0 ml-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-surface-subtle px-2 py-1 rounded-md border border-line-hairline text-ink-soft font-bold whitespace-nowrap">
                Menu
              </span>
              <div className="w-6 h-6 rounded-lg bg-surface-subtle flex items-center justify-center text-ink-soft">
                <ChevronUp className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Profile Trigger Button in Mobile Omnibar Dock */}
          <button
            type="button"
            onClick={() => {
              if (onOpenProfileDrawer) {
                onOpenProfileDrawer();
              } else {
                setIsExpanded(true);
              }
            }}
            aria-label="Profil & Pengaturan"
            title={currentPersona?.name || 'Profil'}
            className="h-11 w-11 rounded-2xl bg-surface-glass backdrop-blur-xl border border-line-hairline shadow-floating flex items-center justify-center text-ink shrink-0 active:scale-95 transition-all cursor-pointer relative"
          >
            <div className="w-7 h-7 rounded-xl bg-brand-primary text-on-brand flex items-center justify-center text-xs font-bold shadow-soft">
              {currentPersona?.name.charAt(0) || 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-valor border-2 border-surface" />
          </button>
        </div>
      </div>

      {/* 2. APP LIBRARY BOTTOM SHEET DRAWER (When isExpanded is true) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-60 bg-canvas/60 backdrop-blur-sm expanded:hidden flex flex-col justify-end transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="bg-surface w-full h-[85vh] rounded-t-3xl shadow-floating flex flex-col overflow-hidden text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-line-strong rounded-full" />
            </div>

            {/* Header: Search Omnibar & Close Button */}
            <div className="p-4 border-b border-line-hairline flex items-center gap-3 min-w-0">
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
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl pl-9 pr-8 py-2 text-xs text-ink placeholder:text-ink-faint outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
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
                className="p-2 rounded-xl bg-surface-subtle hover-only:bg-surface text-ink-soft transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Summary Card in Omnibar Sheet */}
            <div className="px-4 pt-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-surface-subtle border border-line-hairline flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary text-on-brand flex items-center justify-center text-sm font-bold shadow-soft">
                      {currentPersona?.name.charAt(0) || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-valor border-2 border-surface" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-ink truncate">
                      {currentPersona?.name}
                    </div>
                    <div className="text-[10px] text-ink-soft truncate font-mono">
                      {currentPersona?.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenProfileDrawer && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        onOpenProfileDrawer();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-line-hairline text-xs font-semibold text-ink hover-only:bg-surface-subtle transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Profil</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      signOut();
                    }}
                    className="p-2 rounded-xl bg-danger-tint text-danger transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Keluar dari Sesi"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                    <h3 className="text-[10px] font-mono font-bold text-ink-faint uppercase tracking-wider px-1 truncate">
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
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-150 cursor-pointer active:scale-95 text-center min-w-0 ${
                              isActive
                                ? 'bg-brand-primary text-on-brand shadow-hairline font-bold'
                                : 'bg-surface-subtle hover-only:bg-surface border border-line-hairline'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 shadow-hairline shrink-0 ${
                              isActive 
                                ? 'bg-surface/20 text-on-brand' 
                                : 'bg-surface text-ink shadow-hairline'
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
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'PERCONTOHAN'
                      ? 'bg-brand-primary text-on-brand font-bold shadow-hairline'
                      : 'bg-surface-subtle hover-only:bg-surface text-ink border border-line-hairline'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="truncate">Living Contract</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('TESTS');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'TESTS'
                      ? 'bg-brand-primary text-on-brand font-bold shadow-hairline'
                      : 'bg-surface-subtle hover-only:bg-surface text-ink border border-line-hairline'
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-brand-primary shrink-0" />
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
