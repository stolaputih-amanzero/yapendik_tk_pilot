/**
 * Amanaura OS × FLOW — Desktop Navigation Sidebar
 * Architectural Specification: ADR-UX-011 §4.3 & §7.1 (Law R-8 & Law R-9)
 * 
 * Pure Flat Fluid Doctrine (Zero Background Containers):
 * - Header Brand Mark: Naked glyph ✦ (Zero boxed container, zero background box).
 * - Rest State: Pure flat typography, border-l-2 border-transparent, bg-transparent (Zero hover background fill).
 * - Active State: Flush 2px left accent line (border-l-2 border-brand-primary), bg-transparent (Zero background container).
 * - Icons: Naked Glyphs (Law R-9) at 16px (w-4 h-4), pure glyphs without badge boxes.
 * - Touch Targets: Enforce minimum 48dp floor (min-h-[48px]).
 */

import React from 'react';
import { 
  Building2, 
  Home, 
  CalendarCheck2, 
  Clock, 
  Palette, 
  TrendingUp, 
  Sparkles,
  MessageSquare, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  GraduationCap, 
  Flame, 
  Settings, 
  Compass, 
  FileCheck2,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useSecurityContext } from '../../auth/context';
import { useTheme } from '../../hooks/useTheme';
import { WorkspaceTab } from './TopBar';
import { getRouteLabel } from '../../config/routeRegistry';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenProfileDrawer?: () => void;
  className?: string;
}

interface NavItem {
  tab: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  onOpenProfileDrawer,
  className = ''
}) => {
  const { currentPersona, signOut } = useSecurityContext();
  const { isDark, toggleTheme, setTheme } = useTheme();
  const role = currentPersona?.role || 'TEACHER';

  // Role-Based Navigation Definition
  let navGroups: NavGroup[] = [];

  if (role === 'YAPENDIK_SUPERADMIN' || role === 'FOUNDATION_DIRECTOR') {
    navGroups = [
      {
        title: 'Console Yayasan',
        items: [
          { tab: 'FOUNDATION_GOVERNANCE', label: getRouteLabel('FOUNDATION_GOVERNANCE', role), icon: Building2 },
          { tab: 'INSTITUTIONAL_HEALTH', label: getRouteLabel('INSTITUTIONAL_HEALTH', role), icon: Flame },
          { tab: 'GOVERNANCE', label: getRouteLabel('GOVERNANCE', role), icon: ShieldCheck }
        ]
      },
      {
        title: 'Akademik & PPDB',
        items: [
          { tab: 'ACADEMIC_LIFECYCLE', label: getRouteLabel('ACADEMIC_LIFECYCLE', role), icon: Compass },
          { tab: 'COHORT_PROMOTION', label: getRouteLabel('COHORT_PROMOTION', role), icon: GraduationCap },
          { tab: 'GRADUATION_REGISTRY', label: getRouteLabel('GRADUATION_REGISTRY', role), icon: FileCheck2 },
          { tab: 'ADMISSIONS_PORTAL', label: getRouteLabel('ADMISSIONS_PORTAL', role), icon: HeartHandshake }
        ]
      },
      {
        title: 'Administrasi',
        items: [
          { tab: 'PROVISIONING', label: getRouteLabel('PROVISIONING', role), icon: Settings }
        ]
      }
    ];
  } else if (role === 'HEADMASTER') {
    navGroups = [
      {
        title: 'Kepemimpinan Sekolah',
        items: [
          { tab: 'HEADMASTER_ADOPTION', label: getRouteLabel('HEADMASTER_ADOPTION', role), icon: LayoutDashboard },
          { tab: 'INSTITUTIONAL_HEALTH', label: getRouteLabel('INSTITUTIONAL_HEALTH', role), icon: Flame },
          { tab: 'ADMISSIONS_DESK', label: getRouteLabel('ADMISSIONS_DESK', role), icon: HeartHandshake }
        ]
      },
      {
        title: 'Akademik & Observasi',
        items: [
          { tab: 'DEVELOPMENT', label: getRouteLabel('DEVELOPMENT', role), icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: getRouteLabel('STUDENT_JOURNEY', role), icon: Sparkles },
          { tab: 'ROSTER', label: getRouteLabel('ROSTER', role), icon: Users }
        ]
      },
      {
        title: 'Tata Kelola',
        items: [
          { tab: 'ACADEMIC_LIFECYCLE', label: getRouteLabel('ACADEMIC_LIFECYCLE', role), icon: Compass },
          { tab: 'COHORT_PROMOTION', label: getRouteLabel('COHORT_PROMOTION', role), icon: GraduationCap },
          { tab: 'GRADUATION_REGISTRY', label: getRouteLabel('GRADUATION_REGISTRY', role), icon: FileCheck2 }
        ]
      }
    ];
  } else if (role === 'APPLICANT') {
    navGroups = [
      {
        title: 'Layanan PPDB',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: getRouteLabel('ADMISSIONS_PORTAL', role), icon: HeartHandshake }
        ]
      }
    ];
  } else if (role === 'GUARDIAN') {
    navGroups = [
      {
        title: 'Portal Keluarga',
        items: [
          { tab: 'GUARDIAN_WORKSPACE', label: getRouteLabel('GUARDIAN_WORKSPACE', role), icon: Home },
          { tab: 'COMMUNICATION', label: getRouteLabel('COMMUNICATION', role), icon: MessageSquare },
          { tab: 'DEVELOPMENT', label: getRouteLabel('DEVELOPMENT', role), icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: getRouteLabel('STUDENT_JOURNEY', role), icon: Sparkles }
        ]
      },
      {
        title: 'Layanan Sekolah',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: getRouteLabel('ADMISSIONS_PORTAL', role), icon: HeartHandshake }
        ]
      }
    ];
  } else {
    // Default: Guru Kelas (Teacher Workspace)
    navGroups = [
      {
        title: 'Ruang Kelas',
        items: [
          { tab: 'TEACHER_HOME', label: getRouteLabel('TEACHER_HOME', role), icon: Home },
          { tab: 'ATTENDANCE', label: getRouteLabel('ATTENDANCE', role), icon: CalendarCheck2 },
          { tab: 'DAILY_WORK', label: getRouteLabel('DAILY_WORK', role), icon: Clock }
        ]
      },
      {
        title: 'Akademik & Observasi',
        items: [
          { tab: 'OBSERVATIONS', label: getRouteLabel('OBSERVATIONS', role), icon: Palette },
          { tab: 'DEVELOPMENT', label: getRouteLabel('DEVELOPMENT', role), icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: getRouteLabel('STUDENT_JOURNEY', role), icon: Sparkles }
        ]
      },
      {
        title: 'Kemitraan & Roster',
        items: [
          { tab: 'COMMUNICATION', label: getRouteLabel('COMMUNICATION', role), icon: MessageSquare },
          { tab: 'ROSTER', label: getRouteLabel('ROSTER', role), icon: Users }
        ]
      }
    ];
  }

  return (
    <aside
      aria-label="Sidebar Navigasi"
      className={`bg-surface border-r border-line-hairline h-[100dvh] sticky top-0 hidden expanded:flex flex-col justify-between text-ink z-30 shrink-0 transition-[width] duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
    >
      {/* Top Header Section — Pure Naked Brand Glyph & Wordmark (Zero Background Box) */}
      <div className={`border-b border-line-hairline flex items-center min-w-0 transition-all ${
        isCollapsed ? 'p-3 justify-center' : 'px-5 py-4'
      }`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Buka Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          aria-label={isCollapsed ? 'Buka Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          className={`flex items-center text-left min-w-0 w-full group cursor-pointer transition-colors min-h-[48px] ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <img 
            src="/branding/amanaura-logo-plain.png" 
            alt="Amanaura" 
            className="w-6 h-6 object-contain shrink-0 drop-shadow-xs dark:drop-shadow-[0_0_8px_rgba(168,135,76,0.35)]" 
          />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 min-w-0">
                <h2 className="font-normal text-base tracking-wide text-ink truncate font-serif">
                  Amanaura OS
                </h2>
                <span className="text-accent-valor text-xs select-none shrink-0" aria-hidden="true">✦</span>
              </div>
              <p className="text-[10px] text-ink-soft font-mono tracking-wider truncate uppercase font-semibold whitespace-nowrap">
                {currentPersona?.schoolName?.split(' ')[0] || 'Unit TK'} • {role.replace('_', ' ')}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Main Grouped Navigation Surface — Pure Flat Fluid (Zero Background Containers) */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4 no-scrollbar min-w-0 px-0">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5 min-w-0">
            {isCollapsed ? (
              groupIdx > 0 && <div className="w-6 h-px bg-line-hairline mx-auto my-2" />
            ) : (
              <div className="text-[10px] text-ink-faint font-mono font-semibold uppercase tracking-widest px-5 py-2 select-none truncate">
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
                    className={`w-full flex items-center text-xs transition-colors duration-150 cursor-pointer min-w-0 min-h-[48px] border-l-2 bg-transparent ${
                      isCollapsed
                        ? 'justify-center py-3'
                        : 'space-x-3 px-5 py-3 text-left'
                    } ${
                      isActive
                        ? 'border-brand-primary text-ink font-semibold'
                        : 'border-transparent text-ink-soft hover-only:text-ink font-normal'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-accent-valor' : 'text-ink-faint group-hover-only:text-ink'
                    }`} />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left line-clamp-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono text-accent-valor font-medium tracking-wider shrink-0 whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Tooltip for Collapsed Mode (F-5 Floating Allowlist) */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover-only:flex items-center">
                      <div className="bg-surface text-ink text-xs font-medium px-3 py-2 rounded-xl shadow-floating whitespace-nowrap flex items-center space-x-1.5 border border-line-hairline animate-in fade-in zoom-in-95 duration-150">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line-hairline whitespace-nowrap">
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

      {/* Bottom Actions: User Profile, Theme Switcher & Sign Out — Pure Flat Fluid Surface */}
      <div className="border-t border-line-hairline min-w-0 transition-all space-y-1 py-2 bg-surface">
        {/* 1. User Profile Card & Persona Hub Trigger */}
        <div className="relative group min-w-0">
          <button
            type="button"
            onClick={() => onOpenProfileDrawer?.()}
            aria-label="Menu Profil Pengguna"
            title={currentPersona?.name || 'Profil Pengguna'}
            className={`w-full flex items-center text-xs transition-colors duration-150 cursor-pointer min-w-0 min-h-[48px] border-l-2 border-transparent bg-transparent text-ink hover-only:bg-surface-subtle/50 ${
              isCollapsed
                ? 'justify-center py-2 px-1'
                : 'space-x-3 px-4 py-2 text-left'
            }`}
            data-testid="sidebar-profile-trigger"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-xs font-bold shadow-soft overflow-hidden">
                {currentPersona?.avatarUrl ? (
                  <img
                    src={currentPersona.avatarUrl}
                    alt={currentPersona.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentPersona?.name.charAt(0) || 'U'
                )}
              </div>
              {/* Static presence dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-valor border-2 border-surface" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-ink truncate">
                  {currentPersona?.name}
                </div>
                <div className="text-[10px] text-ink-soft truncate font-mono">
                  {currentPersona?.roleTitle || currentPersona?.role}
                </div>
              </div>
            )}
          </button>

          {isCollapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover-only:flex items-center">
              <div className="bg-surface text-ink text-xs font-medium px-3 py-2 rounded-xl shadow-floating whitespace-nowrap border border-line-hairline animate-in fade-in zoom-in-95 duration-150">
                <span>{currentPersona?.name || 'Profil Pengguna'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Theme Toggle (Ivory / Midnight) */}
        <div className="relative group min-w-0">
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Beralih ke Tema Ivory' : 'Beralih ke Tema Midnight'}
              className="w-full flex items-center justify-center text-xs transition-colors duration-150 cursor-pointer min-w-0 min-h-[44px] text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/50"
              data-testid="sidebar-theme-toggle"
            >
              {isDark ? <Sun className="w-4 h-4 text-accent-valor" /> : <Moon className="w-4 h-4 text-brand-primary" />}
            </button>
          ) : (
            <div className="px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-ink-soft">
                {isDark ? <Moon className="w-4 h-4 text-accent-valor" /> : <Sun className="w-4 h-4 text-brand-primary" />}
                <span className="text-xs font-medium">Tema Visual</span>
              </div>
              <div className="inline-flex p-0.5 rounded-lg bg-surface-subtle border border-line-hairline text-[11px]" role="radiogroup" aria-label="Pilihan Tema Visual">
                <button
                  type="button"
                  onClick={() => setTheme('ivory')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    !isDark ? 'bg-brand-primary text-on-brand font-bold shadow-xs' : 'text-ink-soft hover-only:text-ink'
                  }`}
                  aria-checked={!isDark}
                  role="radio"
                >
                  Ivory
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('midnight')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    isDark ? 'bg-brand-primary text-on-brand font-bold shadow-xs' : 'text-ink-soft hover-only:text-ink'
                  }`}
                  aria-checked={isDark}
                  role="radio"
                >
                  Midnight
                </button>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover-only:flex items-center">
              <div className="bg-surface text-ink text-xs font-medium px-3 py-2 rounded-xl shadow-floating whitespace-nowrap border border-line-hairline animate-in fade-in zoom-in-95 duration-150">
                <span>{isDark ? 'Tema: Midnight (Klik untuk Ivory)' : 'Tema: Ivory (Klik untuk Midnight)'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Keluar dari Sesi (Sign Out) */}
        <div className="relative group min-w-0">
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Keluar dari Sesi"
            className={`w-full flex items-center text-xs transition-colors duration-150 cursor-pointer min-w-0 min-h-[44px] border-l-2 border-transparent bg-transparent text-danger hover-only:bg-danger-tint/30 ${
              isCollapsed
                ? 'justify-center py-2 px-1'
                : 'space-x-3 px-4 py-2 text-left'
            }`}
            data-testid="sidebar-signout"
          >
            <LogOut className="w-4 h-4 shrink-0 text-danger" />
            {!isCollapsed && (
              <span className="font-semibold truncate">Keluar dari Sesi</span>
            )}
          </button>

          {isCollapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover-only:flex items-center">
              <div className="bg-surface text-danger text-xs font-medium px-3 py-2 rounded-xl shadow-floating whitespace-nowrap border border-danger-line animate-in fade-in zoom-in-95 duration-150">
                <span>Keluar dari Sesi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
