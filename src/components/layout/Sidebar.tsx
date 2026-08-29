/**
 * Yapendik School OS — Premium SaaS Left Sidebar Navigation
 * Role-Based Grouped Navigation & Humanized School Operations Copywriting
 */

import React from 'react';
import { useSecurityContext } from '../../auth/context';
import { WorkspaceTab } from './TopBar';
import { 
  Building2, 
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
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  tab: WorkspaceTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
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

  // Humanized Navigation Groups per Role
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

  return (
    <aside
      aria-label="Sidebar Navigasi"
      className={`bg-surface border-r border-line h-[100dvh] sticky top-0 hidden expanded:flex flex-col justify-between text-ink z-30 shrink-0 transition-[width] duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
    >
      {/* Top Header branding section in sidebar (Clickable Collapse/Expand Toggle) */}
      <div className={`border-b border-line-soft flex items-center min-w-0 transition-all ${
        isCollapsed ? 'p-3 justify-center' : 'p-4'
      }`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Buka Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          aria-label={isCollapsed ? 'Buka Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          className={`flex items-center text-left min-w-0 group cursor-pointer rounded-field transition-colors ${
            isCollapsed ? 'justify-center p-1' : 'w-full space-x-3 p-2 -m-1 hover-only:bg-surface-subtle'
          }`}
        >
          <div
            className="w-9 h-9 rounded-field bg-surface-subtle border border-line flex items-center justify-center text-ink shrink-0 shadow-hairline group-hover-only:bg-surface-subtle/80 group-hover-only:border-line-strong transition-all"
          >
            <Building2 className="w-5 h-5 text-brass" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm tracking-tight text-ink truncate group-hover-only:text-ink transition-colors font-display">
                Yapendik OS
              </h2>
              <p className="text-[10px] text-ink-soft font-mono tracking-wider truncate uppercase font-semibold whitespace-nowrap">
                {role.replace('_', ' ')}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Main Grouped Navigation Surface */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4 scrollbar-thin scrollbar-thumb-line-soft min-w-0 ${
        isCollapsed ? 'px-2' : 'px-3'
      }`}>
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1 min-w-0">
            {isCollapsed ? (
              groupIdx > 0 && <div className="w-7 h-px bg-line-soft mx-auto my-2" />
            ) : (
              <div className="text-[10px] text-ink-faint font-bold uppercase tracking-wider px-3 mb-1.5 select-none truncate">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;

              return (
                <div key={item.tab} className="relative group min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelectTab(item.tab)}
                    aria-label={item.label}
                    className={`w-full flex items-center rounded-field text-xs font-medium transition-all duration-150 cursor-pointer min-w-0 relative overflow-hidden ${
                      isCollapsed
                        ? 'justify-center h-10 w-10 mx-auto'
                        : 'space-x-2.5 px-3 py-2 text-left'
                    } ${
                      isActive
                        ? 'bg-brand text-on-brand font-semibold shadow-hairline'
                        : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brass motif-poleng opacity-80" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-on-brand' : 'text-ink-faint group-hover-only:text-ink'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left line-clamp-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1 py-1 rounded bg-surface-subtle text-ink-soft border border-line shrink-0 whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Sleek Tooltip for Collapsed Mode */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 hidden group-hover:flex items-center">
                      <div className="bg-surface-inset text-on-brand text-xs font-medium px-2 py-1 rounded-lg shadow-floating whitespace-nowrap flex items-center space-x-1.5 border border-line-strong animate-in fade-in zoom-in-95 duration-150">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1 py-0 rounded bg-brand text-brass border border-line-strong whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={`border-t border-line-soft bg-surface-subtle/80 min-w-0 transition-all space-y-1.5 ${
        isCollapsed ? 'p-2' : 'p-3'
      }`}>
        {/* Living Contract Button */}
        <div className="relative group min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('PERCONTOHAN')}
            aria-label="Living Contract ✦"
            className={`w-full flex items-center rounded-field text-xs font-semibold transition-all duration-150 cursor-pointer min-w-0 ${
              isCollapsed
                ? 'justify-center h-10 w-10 mx-auto'
                : 'space-x-2.5 px-3 py-2 text-left'
            } ${
              activeTab === 'PERCONTOHAN'
                ? 'bg-brand text-on-brand shadow-hairline font-bold'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface border border-line'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-brass" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left line-clamp-1">Living Contract</span>
                <span className="text-[9px] font-mono px-1 py-1 rounded bg-surface-inset text-on-brand border border-line-strong shrink-0 whitespace-nowrap">
                  ✦ ADS
                </span>
              </>
            )}
          </button>

          {/* Tooltip in collapsed mode */}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 hidden group-hover:flex items-center">
              <div className="bg-surface-inset text-on-brand text-xs font-medium px-2 py-1 rounded-lg shadow-floating whitespace-nowrap flex items-center space-x-1.5 border border-line-strong">
                <span>Living Contract</span>
                <span className="text-[9px] font-mono px-1 py-0 rounded bg-surface-inset text-on-brand border border-line-strong whitespace-nowrap">
                  ADS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test Suite Button */}
        <div className="relative group min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('TESTS')}
            aria-label="Uji Otorisasi (TESTS)"
            className={`w-full flex items-center rounded-field text-xs font-semibold transition-all duration-150 cursor-pointer min-w-0 ${
              isCollapsed
                ? 'justify-center h-10 w-10 mx-auto'
                : 'space-x-2.5 px-3 py-2 text-left'
            } ${
              activeTab === 'TESTS'
                ? 'bg-brand text-on-brand shadow-hairline font-bold'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface border border-line'
            }`}
          >
            <FlaskConical className={`w-4 h-4 shrink-0 ${activeTab === 'TESTS' ? 'text-brass' : 'text-ink-faint'}`} />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left line-clamp-1">Uji Otorisasi</span>
                <span className="text-[9px] font-mono px-1 py-1 rounded bg-line-soft text-ink-soft border border-line-strong shrink-0 whitespace-nowrap">
                  TESTS
                </span>
              </>
            )}
          </button>

          {/* Tooltip in collapsed mode */}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 hidden group-hover:flex items-center">
              <div className="bg-surface-inset text-on-brand text-xs font-medium px-2 py-1 rounded-lg shadow-floating whitespace-nowrap flex items-center space-x-1.5 border border-line-strong">
                <span>Uji Otorisasi</span>
                <span className="text-[9px] font-mono px-1 py-0 rounded bg-brand text-brass border border-line-strong whitespace-nowrap">
                  TESTS
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

