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
import { useTheme } from '../../hooks/useTheme';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { WorkspaceTab } from './TopBar';
import { getTabMetadata } from '../../config/routeRegistry';
import { 
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
  CircleUser,
  Sun,
  Moon,
  Download,
  LogOut,
  LucideIcon
} from 'lucide-react';

interface MobileOmniBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenProfileDrawer?: () => void;
  hasPageChips?: boolean;
  initialExpanded?: boolean;
}

interface NavItem {
  tab?: WorkspaceTab;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  isProfile?: boolean;
}

export const MobileOmniBar: React.FC<MobileOmniBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfileDrawer,
  initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  const { currentPersona, securityContext, signOut } = useSecurityContext();
  const { isDark, setTheme } = useTheme();
  const { isInstallable, isInstalled, isIOS, promptInstall } = useInstallPrompt();

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

  // Check first-time coachmark (G-3) & first-visit bloom
  useEffect(() => {
    try {
      const seen = localStorage.getItem('amanaura_chevron_coachmark_seen');
      const bloomSeen = localStorage.getItem('amanaura_horizon_bloom_seen');
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      
      if (!bloomSeen && !prefersReducedMotion) {
        setIsBlooming(true);
        try {
          localStorage.setItem('amanaura_horizon_bloom_seen', 'true');
        } catch {
          // Ignore localStorage errors
        }
        const bloomTimer = setTimeout(() => setIsBlooming(false), 900);
        return () => clearTimeout(bloomTimer);
      }

      if (!seen && !prefersReducedMotion) {
        setShowCoachmark(true);
        const timer = setTimeout(() => {
          setShowCoachmark(false);
          try {
            localStorage.setItem('amanaura_chevron_coachmark_seen', 'true');
          } catch {
            // Ignore localStorage errors
          }
        }, 3000);
        return () => clearTimeout(timer);
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

  // 3×3 Curated Primary Grid per Persona (ADR-UX-012 Addendum VIII)
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
      { tab: 'TEACHER_HOME', label: getTabMetadata('TEACHER_HOME').title, icon: Home },
      { isProfile: true, label: 'Profil', icon: CircleUser }
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
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Sparkles },
      { isProfile: true, label: 'Profil', icon: CircleUser }
    ];
  } else if (isGuardianOrApplicant) {
    primaryItems = [
      { tab: 'GUARDIAN_WORKSPACE', label: getTabMetadata('GUARDIAN_WORKSPACE').title, icon: Home },
      { tab: 'COMMUNICATION', label: getTabMetadata('COMMUNICATION').title, icon: MessageSquare },
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Sparkles },
      { tab: 'ADMISSIONS_PORTAL', label: getTabMetadata('ADMISSIONS_PORTAL').title, icon: UserCheck },
      { isProfile: true, label: 'Profil', icon: CircleUser }
    ];
  } else {
    // Default: TEACHER (3×3 Perfect Grid: 8 Curated Primitives + Profil)
    primaryItems = [
      { tab: 'TEACHER_HOME', label: getTabMetadata('TEACHER_HOME').title, icon: Home },
      { tab: 'ATTENDANCE', label: getTabMetadata('ATTENDANCE').title, icon: UserCheck },
      { tab: 'OBSERVATIONS', label: getTabMetadata('OBSERVATIONS').title, icon: Sparkles },
      { tab: 'DEVELOPMENT', label: getTabMetadata('DEVELOPMENT').title, icon: TrendingUp },
      { tab: 'DAILY_WORK', label: getTabMetadata('DAILY_WORK').title, icon: ClipboardList },
      { tab: 'COMMUNICATION', label: getTabMetadata('COMMUNICATION').title, icon: MessageSquare },
      { tab: 'STUDENT_JOURNEY', label: getTabMetadata('STUDENT_JOURNEY').title, icon: Palette },
      { tab: 'ROSTER', label: getTabMetadata('ROSTER').title, icon: Users },
      { isProfile: true, label: 'Profil', icon: CircleUser }
    ];
  }

  const handleHorizonTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartYRef.current - currentY;
    if (diff > 24) {
      handleOpenSheet();
      touchStartYRef.current = null;
    }
  };

  return (
    <>
      {/* 1. HORIZON HANDLE (Collapsed State — Dawn Aura Horizon Handle / G-3) */}
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
            <span>Geser ke atas untuk menu</span>
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

        {/* The Peeking Horizon Handle Strip (v4: Warm Sky + Peeking Navy Notch + Golden Chevron — ZERO Permanent Text) */}
        <button
          type="button"
          onClick={handleOpenSheet}
          onPointerDown={() => setIsPressed(true)}
          onPointerUp={() => setIsPressed(false)}
          onPointerCancel={() => setIsPressed(false)}
          onTouchStart={(e) => {
            setIsPressed(true);
            handleTouchStart(e);
          }}
          onTouchMove={handleHorizonTouchMove}
          onTouchEnd={() => {
            setIsPressed(false);
            handleTouchEnd();
          }}
          aria-label="Buka Menu Navigasi"
          title="Buka Menu Navigasi"
          data-testid="mobile-chevron-handle"
          className="group pointer-events-auto w-full min-h-[48px] compact:min-h-[56px] h-[calc(env(safe-area-inset-bottom,0px)+56px)] flex items-center justify-center relative cursor-pointer select-none bg-surface/40 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary active:opacity-95 transition-all overflow-visible"
        >
          {/* 1. Warm Sky Gradient Canopy */}
          <div 
            className={`absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-valor-deep/25 via-accent-valor/10 to-transparent dark:from-accent-valor/20 dark:via-accent-valor/8 pointer-events-none transition-all duration-300 ${
              isPressed ? 'opacity-100 scale-y-110' : 'opacity-80'
            }`} 
            aria-hidden="true" 
          />

          {/* 2. Left Hairline with Gradient Lighting into Peeking Notch */}
          <span 
            className="absolute left-0 right-[calc(50%+40px)] bottom-[18px] h-[1px] bg-gradient-to-r from-transparent via-line-strong dark:via-line-soft to-valor-deep/60 dark:to-accent-valor/40 group-hover-only:to-valor-deep/80 dark:group-hover-only:to-accent-valor/70 group-active:to-valor-deep dark:group-active:to-accent-valor/80 transition-all pointer-events-none" 
            aria-hidden="true" 
          />
          
          {/* 3. The Peeking Horizon Notch (The Sheet Lip: Navy in Light, Elevated in Dark — Flush Bottom) */}
          <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-9 rounded-t-2xl bg-brand dark:bg-surface-subtle border-t border-x border-line-soft/50 dark:border-line/60 flex items-center justify-center pointer-events-none transition-transform duration-200 ${
              isBlooming ? 'animate-horizon-bloom' : ''
            } ${isPressed ? '-translate-y-1 scale-105' : ''}`}
          >
            <div className="animate-horizon-breathe motion-reduce:animate-none flex items-center justify-center">
              <ChevronUp className="w-5 h-5 text-accent-valor stroke-[2.5]" strokeWidth={2.5} />
            </div>
          </div>

          {/* 4. Right Hairline with Gradient Lighting into Peeking Notch */}
          <span 
            className="absolute left-[calc(50%+40px)] right-0 bottom-[18px] h-[1px] bg-gradient-to-l from-transparent via-line-strong dark:via-line-soft to-valor-deep/60 dark:to-accent-valor/40 group-hover-only:to-valor-deep/80 dark:group-hover-only:to-accent-valor/70 group-active:to-valor-deep dark:group-active:to-accent-valor/80 transition-all pointer-events-none" 
            aria-hidden="true" 
          />
        </button>
      </div>

      {/* 2. CURATED "MENU NAVIGASI" SLIDE-UP SHEET (Expanded State — ADR-UX-012 Addendum VIII / Single-Surface Launcher) */}
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
            {/* Header: Brass Grab Handle & Pinned Close Button (G-4) */}
            <div className="pt-3 pb-2 px-4 flex items-center justify-between shrink-0">
              <div className="w-8" />
              <div className="w-12 h-1.5 bg-line-strong rounded-full cursor-grab" />
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl bg-surface-subtle hover-only:bg-surface text-ink-soft hover-only:text-ink transition-colors shrink-0 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Tutup Menu Navigasi"
                title="Tutup Menu Navigasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content: 3×3 Grid + Utility Actions Footer */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1 min-w-0 no-scrollbar">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono font-bold text-ink-faint uppercase tracking-wider">
                  MENU NAVIGASI
                </h3>
                <span className="text-[10px] text-ink-faint font-mono">
                  {`${primaryItems.length} Modul`}
                </span>
              </div>

              {/* 3×3 Perfect Fluid Grid (8 Core Primitives + Profil) */}
              <div className="grid grid-cols-3 gap-3" data-testid="nav-grid-3x3">
                {primaryItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = !item.isProfile && activeTab === item.tab;

                  return (
                    <button
                      key={item.tab || `profile-tile-${idx}`}
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        if (item.isProfile) {
                          if (onOpenProfileDrawer) onOpenProfileDrawer();
                        } else if (item.tab) {
                          onSelectTab(item.tab);
                        }
                      }}
                      data-testid={item.isProfile ? "tile-profile-drawer" : undefined}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-150 cursor-pointer active:scale-95 text-center min-h-[96px] min-w-0 border ${
                        isActive
                          ? 'bg-brand-tint text-ink border-brand font-bold shadow-soft'
                          : 'bg-surface-subtle hover-only:bg-surface text-ink border-line-hairline shadow-hairline'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 shrink-0 ${
                        isActive 
                          ? 'bg-brand text-on-brand shadow-xs' 
                          : 'bg-surface text-brand-primary border border-line-hairline shadow-hairline'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-center text-xs leading-snug break-words w-full ${
                        isActive ? 'text-ink font-bold' : 'text-ink font-medium'
                      }`}>
                        {item.label}
                      </span>

                      {/* Real Brass Counter Badge if any (G-5) */}
                      {item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-accent-valor text-on-accent text-[9px] font-mono font-bold leading-none">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Utility Footer: Rows of Actions (ADR-UX-012 Addendum VIII) */}
              <div className="pt-2 border-t border-line-hairline space-y-2.5" data-testid="nav-utility-footer">
                {/* a) Tema Visual + Inline SegmentedControl [Ivory | Midnight] */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-subtle border border-line-hairline">
                  <div className="flex items-center space-x-2.5 min-w-0 pl-1">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-accent-valor shrink-0" />
                    ) : (
                      <Sun className="w-4 h-4 text-accent-valor shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-ink">Tema Visual</span>
                  </div>

                  {/* Segmented Control [Ivory | Midnight] */}
                  <div className="inline-flex p-1 rounded-xl bg-surface border border-line-hairline text-xs font-medium" role="radiogroup" aria-label="Pilih Tema">
                    <button
                      type="button"
                      onClick={() => setTheme('ivory')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        !isDark 
                          ? 'bg-brand-primary text-on-brand font-bold shadow-xs' 
                          : 'text-ink-soft hover-only:text-ink'
                      }`}
                      aria-checked={!isDark}
                      role="radio"
                    >
                      Ivory
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('midnight')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-brand-primary text-on-brand font-bold shadow-xs' 
                          : 'text-ink-soft hover-only:text-ink'
                      }`}
                      aria-checked={isDark}
                      role="radio"
                    >
                      Midnight
                    </button>
                  </div>
                </div>

                {/* b) Pasang Aplikasi (Conditional: only when browser prompt is available, #DW-01) */}
                {isInstallable && (
                  <button
                    type="button"
                    onClick={() => promptInstall()}
                    className="w-full py-2 px-3 rounded-xl bg-brand-primary text-on-brand hover-only:opacity-95 font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[40px] shadow-soft"
                    data-testid="btn-install-pwa"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi Amanaura OS</span>
                  </button>
                )}

                {/* c) Keluar dari Sesi (Danger Tint at the very bottom) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    signOut();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-danger-tint border border-danger-line text-danger hover-only:bg-danger-tint/80 font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[40px]"
                  aria-label="Keluar dari Sesi"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sesi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
