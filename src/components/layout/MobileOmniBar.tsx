/**
 * Amanaura OS × FLOW — Mobile Slide-Up Chevron & Menu Navigasi
 * Architectural Specification: ADR-UX-012 §2, §3 & Guardrails G-1 through G-10
 * 
 * Hub-and-Spoke Mobile Ergonomics:
 * - Collapsed State: Discrete Bottom Chevron Handle (Lucide ChevronUp, min-h-[48px], aria-label)
 * - Expanded State: Curated "MENU NAVIGASI" Sheet (Amanaura Spring {380,32,0.8}, max-h-[90dvh], 4x2 Squircle Flat Grid)
 * - Zero Collision: Chevron centered at bottom, FAB at bottom right (+20px right-4)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSecurityContext } from '../../auth/context';
import { WorkspaceTab } from './TopBar';
import { getTabMetadata } from '../../config/routeRegistry';
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
  FlaskConical, 
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
  badge?: number | string;
}

export const MobileOmniBar: React.FC<MobileOmniBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfileDrawer
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoachmark, setShowCoachmark] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

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

  // Check first-time coachmark (G-3)
  useEffect(() => {
    try {
      const seen = localStorage.getItem('amanaura_chevron_coachmark_seen');
      if (!seen) {
        setShowCoachmark(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleDismissCoachmark = () => {
    setShowCoachmark(false);
    try {
      localStorage.setItem('amanaura_chevron_coachmark_seen', 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleOpenSheet = () => {
    handleDismissCoachmark();
    setIsExpanded(true);
  };

  // Keyboard accessibility: Escape to dismiss expanded sheet (G-4)
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Touch gesture: Swipe-down to dismiss sheet (G-4)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 75) {
      setIsExpanded(false);
      touchStartYRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
  };

  // 4 × 2 Curated Primary Grid per Persona (G-5: Labels <= 2 words from routeRegistry)
  let primaryItems: NavItem[] = [];

  if (isSuperadminOrFoundation) {
    primaryItems = [
      { tab: 'INSTITUTIONAL_HEALTH', label: getTabMetadata('INSTITUTIONAL_HEALTH').title, icon: Activity },
      { tab: 'FOUNDATION_GOVERNANCE', label: getTabMetadata('FOUNDATION_GOVERNANCE').title, icon: Landmark },
      { tab: 'PROVISIONING', label: getTabMetadata('PROVISIONING').title, icon: Settings2 },
      { tab: 'ACADEMIC_LIFECYCLE', label: getTabMetadata('ACADEMIC_LIFECYCLE').title, icon: Clock },
      { tab: 'GOVERNANCE', label: getTabMetadata('GOVERNANCE').title, icon: Shield },
      { tab: 'COHORT_PROMOTION', label: getTabMetadata('COHORT_PROMOTION').title, icon: ArrowUpRight },
      { tab: 'GRADUATION_REGISTRY', label: getTabMetadata('GRADUATION_REGISTRY').title, icon: GraduationCap },
      { tab: 'TEACHER_HOME', label: getTabMetadata('TEACHER_HOME').title, icon: Home }
    ];
  } else if (isHeadmaster) {
    primaryItems = [
      { tab: 'ADMISSIONS_DESK', label: getTabMetadata('ADMISSIONS_DESK').title, icon: FileCheck },
      { tab: 'HEADMASTER_ADOPTION', label: getTabMetadata('HEADMASTER_ADOPTION').title, icon: CheckSquare },
      { tab: 'INSTITUTIONAL_HEALTH', label: getTabMetadata('INSTITUTIONAL_HEALTH').title, icon: Activity },
      { tab: 'COHORT_PROMOTION', label: getTabMetadata('COHORT_PROMOTION').title, icon: ArrowUpRight },
      { tab: 'GRADUATION_REGISTRY', label: getTabMetadata('GRADUATION_REGISTRY').title, icon: GraduationCap },
      { tab: 'ACADEMIC_LIFECYCLE', label: getTabMetadata('ACADEMIC_LIFECYCLE').title, icon: Clock },
      { tab: 'GOVERNANCE', label: getTabMetadata('GOVERNANCE').title, icon: Shield },
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Sparkles }
    ];
  } else if (isGuardianOrApplicant) {
    primaryItems = [
      { tab: 'GUARDIAN_WORKSPACE', label: getTabMetadata('GUARDIAN_WORKSPACE').title, icon: Home },
      { tab: 'COMMUNICATION', label: getTabMetadata('COMMUNICATION').title, icon: MessageSquare },
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Sparkles },
      { tab: 'ADMISSIONS_PORTAL', label: getTabMetadata('ADMISSIONS_PORTAL').title, icon: UserCheck }
    ];
  } else {
    // Default: TEACHER (High-Frequency 4x2 Grid)
    primaryItems = [
      { tab: 'TEACHER_HOME', label: getTabMetadata('TEACHER_HOME').title, icon: Home },
      { tab: 'ATTENDANCE', label: getTabMetadata('ATTENDANCE').title, icon: UserCheck },
      { tab: 'OBSERVATIONS', label: getTabMetadata('OBSERVATIONS').title, icon: Sparkles },
      { tab: 'DEVELOPMENT', label: getTabMetadata('DEVELOPMENT').title, icon: TrendingUp },
      { tab: 'DAILY_WORK', label: getTabMetadata('DAILY_WORK').title, icon: ClipboardList },
      { tab: 'COMMUNICATION', label: getTabMetadata('COMMUNICATION').title, icon: MessageSquare },
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Palette },
      { tab: 'ROSTER', label: getTabMetadata('ROSTER').title, icon: Users }
    ];
  }

  // Filter items by search query if any (G-2)
  const filteredItems = primaryItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHorizonTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartYRef.current - currentY;
    if (diff > 20) {
      handleOpenSheet();
      touchStartYRef.current = null;
    }
  };

  return (
    <>
      {/* 1. HORIZON HANDLE (Collapsed State — ADR-UX-012 Horizon Handle / G-3) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 expanded:hidden flex flex-col items-center pointer-events-none pb-[calc(env(safe-area-inset-bottom,0px))]"
        data-testid="mobile-horizon-container"
      >
        {/* Polite 1-Time Coachmark Tooltip */}
        {showCoachmark && (
          <div 
            className="mb-2 pointer-events-auto px-3.5 py-1.5 rounded-full bg-surface text-ink text-[11px] font-medium border border-line shadow-floating flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            role="tooltip"
          >
            <span className="text-accent-valor font-bold" aria-hidden="true">✦</span>
            <span>Usap ke atas atau ketuk untuk Menu Navigasi</span>
            <button 
              type="button" 
              onClick={handleDismissCoachmark}
              className="ml-1 text-ink-faint hover-only:text-ink cursor-pointer p-1"
              aria-label="Tutup petunjuk"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* The Horizon Handle Strip (Hairline full-bleed broken by center Lucide ChevronUp — ZERO Text) */}
        <button
          type="button"
          onClick={handleOpenSheet}
          onTouchStart={handleTouchStart}
          onTouchMove={handleHorizonTouchMove}
          aria-label="Buka Menu Navigasi"
          title="Buka Menu Navigasi"
          data-testid="mobile-chevron-handle"
          className="pointer-events-auto w-full min-h-[48px] h-[calc(env(safe-area-inset-bottom,0px)+48px)] flex items-center justify-center relative cursor-pointer select-none bg-surface/40 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary active:opacity-80 transition-opacity"
        >
          {/* Left Hairline */}
          <span className="flex-1 h-[1px] bg-line-soft mr-3" aria-hidden="true" />
          
          {/* Pure Center Chevron (No text noise) */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-ink-faint shrink-0 bg-surface/80 border border-line-soft shadow-xs">
            <ChevronUp className="w-5 h-5 text-ink-faint shrink-0" />
          </div>

          {/* Right Hairline */}
          <span className="flex-1 h-[1px] bg-line-soft ml-3" aria-hidden="true" />
        </button>
      </div>

      {/* 2. CURATED "MENU NAVIGASI" SLIDE-UP SHEET (Expanded State — ADR-UX-012 §2.3 / G-2, G-4, G-5) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-60 bg-surface-inset/60 backdrop-blur-xs expanded:hidden flex flex-col justify-end transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
          data-testid="nav-sheet-backdrop"
        >
          <div 
            className="bg-surface w-full max-h-[90dvh] rounded-t-3xl border-t border-line-hairline shadow-floating flex flex-col overflow-hidden text-ink animate-in slide-in-from-bottom duration-300 motion-reduce:duration-0"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="nav-sheet-content"
          >
            {/* Brass Grab Handle (G-4) */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab">
              <div className="w-12 h-1.5 bg-line-strong rounded-full" />
            </div>

            {/* Pinnacle Search Field & Pinned Close Button (G-2) */}
            <div className="p-4 border-b border-line-hairline flex items-center gap-3 min-w-0 shrink-0">
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
                  aria-label="Cari modul atau menu"
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl pl-9 pr-8 py-2 text-xs text-ink placeholder:text-ink-faint outline-none focus:ring-1 focus:ring-brand-primary transition-colors min-h-[40px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-faint hover-only:text-ink cursor-pointer min-h-[40px] min-w-[36px] justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl bg-surface-subtle hover-only:bg-surface text-ink-soft hover-only:text-ink transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup Menu Navigasi"
                title="Tutup Menu Navigasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Bar Inside Sheet (Quick Switch / Identity) */}
            <div className="px-4 pt-3 shrink-0">
              <div className="p-3 rounded-2xl bg-surface-subtle border border-line-hairline flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-primary text-on-brand flex items-center justify-center text-xs font-bold shadow-soft">
                      {currentPersona?.name.charAt(0) || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-valor border-2 border-surface" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-ink truncate">
                      {currentPersona?.name || 'Pengguna Amanaura'}
                    </div>
                    <div className="text-[10px] text-ink-soft truncate font-mono">
                      {currentPersona?.role || 'AUTH'} • {currentPersona?.schoolName || 'Unit'}
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
                      className="px-3 py-2 rounded-xl bg-surface border border-line-hairline text-xs font-semibold text-ink hover-only:bg-surface-subtle transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5"
                      aria-label="Buka Profil &amp; Pengaturan"
                    >
                      <Settings2 className="w-4 h-4 text-brand-primary" />
                      <span>Pengaturan</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      signOut();
                    }}
                    className="p-2 rounded-xl bg-danger-tint text-danger hover-only:bg-danger-tint/80 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Keluar dari Sesi"
                    aria-label="Keluar dari Sesi"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4 × 2 Squircle Flat Grid Content (G-5: Flat Fluid, hairline, no heavy shadow) */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1 min-w-0 no-scrollbar">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono font-bold text-ink-faint uppercase tracking-wider truncate">
                  MENU NAVIGASI
                </h3>
                <span className="text-[10px] text-ink-faint font-mono">
                  {filteredItems.length} Modul
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-ink-faint text-xs">
                  Tidak ada modul yang cocok dengan pencarian "{searchQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-2 compact:grid-cols-4 gap-2.5">
                  {filteredItems.map(item => {
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
                        className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-150 cursor-pointer active:scale-95 text-center min-h-[80px] min-w-0 border ${
                          isActive
                            ? 'bg-brand-primary text-on-brand border-brand-primary font-bold shadow-soft'
                            : 'bg-surface-subtle hover-only:bg-surface text-ink border-line-hairline shadow-hairline'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 shrink-0 ${
                          isActive 
                            ? 'bg-surface/20 text-on-brand' 
                            : 'bg-surface text-brand-primary border border-line-hairline shadow-hairline'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs leading-tight line-clamp-1 font-medium truncate w-full ${
                          isActive ? 'text-on-brand font-bold' : 'text-ink'
                        }`}>
                          {item.label}
                        </span>

                        {/* Real Brass Counter Badge if any (G-5) */}
                        {item.badge !== undefined && (
                          <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-accent-valor text-on-accent text-[9px] font-mono font-bold leading-none">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bottom Ancillary Actions: Living Contract & Uji Otorisasi */}
              <div className="pt-2 min-w-0 space-y-2 border-t border-line-hairline">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PERCONTOHAN');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === 'PERCONTOHAN'
                      ? 'bg-brand-primary text-on-brand font-bold shadow-soft'
                      : 'bg-surface-subtle hover-only:bg-surface text-ink border border-line-hairline'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-accent-valor shrink-0" />
                  <span className="truncate">Living Contract &amp; Token Specimen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('TESTS');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === 'TESTS'
                      ? 'bg-brand-primary text-on-brand font-bold shadow-soft'
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
