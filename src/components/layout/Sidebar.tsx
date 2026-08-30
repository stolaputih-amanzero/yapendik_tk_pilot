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

import React, { useState } from 'react';
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
  ChevronDown,
  LogOut,
  Compass,
  FileCheck2
} from 'lucide-react';
import { useSecurityContext } from '../../auth/context';
import { WorkspaceTab } from './TopBar';

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
  const { currentPersona, personas, switchPersona, signOut } = useSecurityContext();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const role = currentPersona?.role || 'TEACHER';

  // Role-Based Navigation Definition
  let navGroups: NavGroup[] = [];

  if (role === 'YAPENDIK_SUPERADMIN' || role === 'FOUNDATION_DIRECTOR') {
    navGroups = [
      {
        title: 'Console Yayasan',
        items: [
          { tab: 'FOUNDATION_GOVERNANCE', label: 'Console Yayasan', icon: Building2 },
          { tab: 'INSTITUTIONAL_HEALTH', label: 'Statistik Unit', icon: Flame },
          { tab: 'GOVERNANCE', label: 'Audit Tata Kelola', icon: ShieldCheck }
        ]
      },
      {
        title: 'Akademik & PPDB',
        items: [
          { tab: 'ACADEMIC_LIFECYCLE', label: 'Tahun Ajaran', icon: Compass },
          { tab: 'COHORT_PROMOTION', label: 'Kenaikan Kelas', icon: GraduationCap },
          { tab: 'GRADUATION_REGISTRY', label: 'Buku Induk', icon: FileCheck2 },
          { tab: 'ADMISSIONS_PORTAL', label: 'Portal PPDB', icon: HeartHandshake }
        ]
      },
      {
        title: 'Administrasi',
        items: [
          { tab: 'PROVISIONING', label: 'Kesiapan Unit', icon: Settings }
        ]
      }
    ];
  } else if (role === 'HEADMASTER') {
    navGroups = [
      {
        title: 'Kepemimpinan Sekolah',
        items: [
          { tab: 'HEADMASTER_ADOPTION', label: 'Kotak Kebijakan', icon: ShieldCheck },
          { tab: 'INSTITUTIONAL_HEALTH', label: 'Statistik Unit', icon: Flame },
          { tab: 'ADMISSIONS_DESK', label: 'Meja PPDB', icon: HeartHandshake }
        ]
      },
      {
        title: 'Akademik & Observasi',
        items: [
          { tab: 'DEVELOPMENT', label: 'Verifikasi LPPA', icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles },
          { tab: 'ROSTER', label: 'Data Roster', icon: Users }
        ]
      },
      {
        title: 'Tata Kelola',
        items: [
          { tab: 'ACADEMIC_LIFECYCLE', label: 'Tahun Ajaran', icon: Compass },
          { tab: 'COHORT_PROMOTION', label: 'Kenaikan Kelas', icon: GraduationCap },
          { tab: 'GRADUATION_REGISTRY', label: 'Buku Induk', icon: FileCheck2 }
        ]
      }
    ];
  } else if (role === 'APPLICANT') {
    navGroups = [
      {
        title: 'Layanan PPDB',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: 'Pendaftaran PPDB', icon: HeartHandshake }
        ]
      }
    ];
  } else if (role === 'GUARDIAN') {
    navGroups = [
      {
        title: 'Portal Keluarga',
        items: [
          { tab: 'GUARDIAN_WORKSPACE', label: 'Portal Keluarga', icon: Home },
          { tab: 'COMMUNICATION', label: 'Buku Penghubung', icon: MessageSquare },
          { tab: 'DEVELOPMENT', label: 'Perkembangan Ananda', icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      },
      {
        title: 'Layanan Sekolah',
        items: [
          { tab: 'ADMISSIONS_PORTAL', label: 'Pendaftaran PPDB', icon: HeartHandshake }
        ]
      }
    ];
  } else {
    // Default: Guru Kelas (Teacher Workspace)
    navGroups = [
      {
        title: 'Ruang Kelas',
        items: [
          { tab: 'TEACHER_HOME', label: 'Beranda Kelas', icon: Home },
          { tab: 'ATTENDANCE', label: 'Presensi Harian', icon: CalendarCheck2 },
          { tab: 'DAILY_WORK', label: 'Jurnal Harian', icon: Clock }
        ]
      },
      {
        title: 'Akademik & Observasi',
        items: [
          { tab: 'OBSERVATIONS', label: 'Momen Belajar', icon: Palette },
          { tab: 'DEVELOPMENT', label: 'Rapor LPPA', icon: TrendingUp },
          { tab: 'STUDENT_JOURNEY', label: 'Jejak Anak', icon: Sparkles }
        ]
      },
      {
        title: 'Kemitraan & Roster',
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
          <span className="text-accent-valor text-lg select-none shrink-0" aria-hidden="true">
            ✦
          </span>
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

      {/* Bottom Actions: User Profile & Persona Switcher — Pure Flat Fluid Surface */}
      <div className="border-t border-line-hairline min-w-0 transition-all space-y-0.5 py-2 bg-surface">
        {/* User Profile Card & Persona Switcher (Desktop/Tablet) */}
        <div className="relative group min-w-0">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(prev => !prev)}
            aria-label="Menu Profil & Ganti Persona"
            title={currentPersona?.name || 'Profil Pengguna'}
            className={`w-full flex items-center text-xs transition-colors duration-150 cursor-pointer min-w-0 min-h-[48px] border-l-2 border-transparent bg-transparent text-ink hover-only:bg-surface-subtle/50 ${
              isCollapsed
                ? 'justify-center py-2 px-1'
                : 'space-x-3 px-4 py-2 text-left'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-xs font-bold shadow-soft">
                {currentPersona?.name.charAt(0) || 'U'}
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
                  {currentPersona?.role}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 text-ink-faint transition-transform shrink-0 ${showPersonaMenu ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Persona Switcher Popover Menu */}
          {showPersonaMenu && (
            <div 
              className={`absolute bottom-full mb-2 z-50 bg-surface rounded-2xl border border-line shadow-floating p-2 space-y-1 ${
                isCollapsed ? 'left-full ml-2 w-64' : 'left-2 right-2'
              }`}
            >
              <div className="px-3 py-1.5 border-b border-line-hairline flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-ink-faint uppercase tracking-wider">
                  Ganti Persona
                </span>
                {onOpenProfileDrawer && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPersonaMenu(false);
                      onOpenProfileDrawer();
                    }}
                    className="text-[10px] text-brand-primary hover-only:underline font-medium cursor-pointer"
                  >
                    Profil Lengkap
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      switchPersona(p.id);
                      setShowPersonaMenu(false);
                      if (onSelectTab) {
                        if (p.role === 'GUARDIAN') {
                          onSelectTab('GUARDIAN_WORKSPACE');
                        } else if (p.role === 'APPLICANT') {
                          onSelectTab('ADMISSIONS_PORTAL');
                        } else if (p.role === 'TEACHER') {
                          onSelectTab('TEACHER_HOME');
                        } else if (p.role === 'HEADMASTER') {
                          onSelectTab('HEADMASTER_ADOPTION');
                        } else if (p.role === 'YAPENDIK_SUPERADMIN' || p.role === 'FOUNDATION_DIRECTOR') {
                          onSelectTab('FOUNDATION_GOVERNANCE');
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      p.id === currentPersona?.id
                        ? 'bg-surface-subtle font-bold text-brand-primary'
                        : 'text-ink-soft hover-only:bg-surface-subtle/70 hover-only:text-ink'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] text-ink-faint font-mono">{p.role}</div>
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
                    setShowPersonaMenu(false);
                    signOut();
                  }}
                  className="w-full py-2 px-3 text-left rounded-xl text-xs text-danger hover-only:bg-danger-tint font-medium flex items-center space-x-2 transition-colors cursor-pointer min-h-[40px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
