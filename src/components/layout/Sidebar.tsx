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
  className = ''
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
    <aside className={`w-64 bg-white border-r border-slate-200 h-screen sticky top-0 hidden lg:flex flex-col justify-between text-slate-900 z-30 shrink-0 min-w-0 ${className}`}>
      {/* Top Header branding section in sidebar */}
      <div className="p-4 border-b border-slate-100 flex items-center space-x-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-sm tracking-tight text-slate-900 truncate">Yapendik OS</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider truncate uppercase">
            {role.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Main Grouped Navigation Surface */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 min-w-0">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1 min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 mb-1.5 select-none truncate">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onSelectTab(item.tab)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer min-w-0 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate flex-1 text-left line-clamp-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Action / Test Suite Button (Available for all roles) */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 min-w-0">
        <button
          type="button"
          onClick={() => onSelectTab('TESTS')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer min-w-0 ${
            activeTab === 'TESTS'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4 shrink-0 text-slate-500" />
          <span className="truncate flex-1 text-left line-clamp-1">Uji Otorisasi</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 shrink-0">
            TESTS
          </span>
        </button>
      </div>
    </aside>
  );
};
