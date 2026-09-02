import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Building2,
  GraduationCap
} from 'lucide-react';
import { PtkProfileItem } from '../../db/database';
import { useSecurityContext } from '../../auth/context';

interface PtkDirectoryViewProps {
  ptkList: PtkProfileItem[];
  schoolName: string;
}

type RoleFilterType = 'ALL' | 'HEADMASTER' | 'TEACHER' | 'ASSISTANT_TEACHER';

function maskPii(val?: string, visibleChars = 4): string {
  if (!val) return '—';
  const clean = val.replace(/\s+/g, '');
  if (clean.length <= visibleChars) return clean;
  return `••••••••••••${clean.slice(-visibleChars)}`;
}

export const PtkDirectoryView: React.FC<PtkDirectoryViewProps> = ({
  ptkList,
  schoolName
}) => {
  const { currentPersona } = useSecurityContext();
  const isHeadmasterOrSuperadmin =
    currentPersona?.role === 'HEADMASTER' || currentPersona?.role === 'YAPENDIK_SUPERADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedPiiIds, setRevealedPiiIds] = useState<Set<string>>(new Set());

  // Toggle PII reveal per row
  const togglePiiReveal = (id: string) => {
    setRevealedPiiIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Role Counts
  const counts = useMemo(() => {
    return {
      all: ptkList.length,
      headmaster: ptkList.filter(p => p.role === 'HEADMASTER').length,
      teacher: ptkList.filter(p => p.role === 'TEACHER').length,
      assistant: ptkList.filter(p => p.role === 'ASSISTANT_TEACHER').length
    };
  }, [ptkList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return ptkList.filter(p => {
      // 1. Role Filter
      if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.fullName.toLowerCase().includes(q);
        const matchesPreferred = p.preferredName.toLowerCase().includes(q);
        const matchesRole = p.roleDisplay.toLowerCase().includes(q);
        const matchesClass = p.assignedClassName.toLowerCase().includes(q);
        const matchesSpec = p.specialization.toLowerCase().includes(q);
        return matchesName || matchesPreferred || matchesRole || matchesClass || matchesSpec;
      }

      return true;
    });
  }, [ptkList, roleFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Filter Controls */}
      <div className="flex flex-col medium:flex-row gap-3 items-stretch medium:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama pendidik, spesialisasi, atau rombel..."
            className="w-full min-h-[48px] pl-10 pr-4 py-2 text-xs medium:text-sm rounded-xl bg-surface border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-valor shadow-hairline"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover-only:text-ink min-h-[32px] px-2"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div
          className="inline-flex flex-wrap p-1 rounded-xl bg-surface-subtle border border-line gap-1 shadow-hairline"
          role="tablist"
          aria-label="Filter Peran Pendidik"
        >
          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === 'ALL'}
            onClick={() => setRoleFilter('ALL')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'ALL'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <span>Semua</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              roleFilter === 'ALL' ? 'bg-on-brand/20 text-on-brand' : 'bg-surface text-ink-faint border border-line-hairline'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === 'HEADMASTER'}
            onClick={() => setRoleFilter('HEADMASTER')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'HEADMASTER'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <span>Kepala Sekolah</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              roleFilter === 'HEADMASTER' ? 'bg-on-brand/20 text-on-brand' : 'bg-surface text-ink-faint border border-line-hairline'
            }`}>
              {counts.headmaster}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === 'TEACHER'}
            onClick={() => setRoleFilter('TEACHER')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'TEACHER'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <span>Wali Kelas</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              roleFilter === 'TEACHER' ? 'bg-on-brand/20 text-on-brand' : 'bg-surface text-ink-faint border border-line-hairline'
            }`}>
              {counts.teacher}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={roleFilter === 'ASSISTANT_TEACHER'}
            onClick={() => setRoleFilter('ASSISTANT_TEACHER')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'ASSISTANT_TEACHER'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <span>Pendamping</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              roleFilter === 'ASSISTANT_TEACHER' ? 'bg-on-brand/20 text-on-brand' : 'bg-surface text-ink-faint border border-line-hairline'
            }`}>
              {counts.assistant}
            </span>
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-surface border border-line">
            <UserCheck className="w-10 h-10 mx-auto text-ink-faint mb-3" />
            <h3 className="font-display text-base font-bold text-ink">Tidak Ada Pendidik Ditemukan</h3>
            <p className="text-ink-soft mt-1 text-xs">Coba sesuaikan kata kunci pencarian atau filter peran.</p>
          </div>
        ) : (
          filteredList.map((ptk, index) => {
            const isExpanded = expandedId === ptk.id;
            const isPiiRevealed = revealedPiiIds.has(ptk.id);

            // Deterministic initials
            const initials = ptk.fullName
              .split(' ')
              .filter(Boolean)
              .map(p => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <article
                key={ptk.id}
                className="rounded-2xl bg-surface border border-line overflow-hidden shadow-hairline transition-all hover:border-accent-valor/40"
              >
                {/* Header Row — Clickable to Expand */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ptk.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : ptk.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    {/* Deterministic Initial Avatar */}
                    <div className="w-12 h-12 rounded-full bg-surface-subtle border border-line-hairline flex items-center justify-center text-accent-valor font-bold font-mono text-sm shrink-0 shadow-hairline">
                      {initials}
                    </div>

                    {/* PTK Identity & Roles */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-ink truncate">
                          {ptk.fullName}
                        </h3>
                        {/* Role Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          ptk.role === 'HEADMASTER'
                            ? 'bg-accent-valor/10 text-accent-valor border border-accent-valor/20'
                            : ptk.role === 'TEACHER'
                            ? 'bg-brand/10 text-brand border border-brand/20'
                            : 'bg-surface-subtle text-ink-soft border border-line'
                        }`}>
                          {ptk.roleDisplay}
                        </span>
                      </div>

                      {/* Subtitle: Assigned Class & Employment */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                        <span className="flex items-center gap-1 font-medium text-ink">
                          <GraduationCap className="w-3.5 h-3.5 text-accent-valor shrink-0" />
                          <span>{ptk.assignedClassName}</span>
                        </span>
                        <span className="text-line-soft">•</span>
                        <span className="font-mono text-[11px] text-ink-faint">
                          {ptk.specialization}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action: Status Capsule & Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Dot Capsule */}
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-success-tint border-success-line shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="font-mono text-xs font-medium text-success-deep">
                        {ptk.employmentType}
                      </span>
                    </span>

                    <button
                      type="button"
                      aria-label={isExpanded ? 'Tutup Detail' : 'Buka Detail'}
                      className="min-h-[48px] min-w-[48px] flex items-center justify-center text-ink-soft hover:text-ink rounded-xl"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-line-hairline bg-surface-subtle/50 p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Section 1: Data Penugasan & Kualifikasi */}
                      <div className="p-4 rounded-xl bg-surface border border-line-hairline space-y-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent-valor flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Kualifikasi &amp; Penugasan</span>
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-line-hairline">
                            <span className="text-ink-soft">Nama Panggilan:</span>
                            <span className="font-medium text-ink">{ptk.preferredName}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-line-hairline">
                            <span className="text-ink-soft">Rombongan Belajar:</span>
                            <span className="font-semibold text-ink">{ptk.assignedClassName}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-line-hairline">
                            <span className="text-ink-soft">Spesialisasi Sentra:</span>
                            <span className="font-medium text-ink text-right">{ptk.specialization}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-line-hairline">
                            <span className="text-ink-soft">Status Kepegawaian:</span>
                            <span className="font-mono font-medium text-success-deep">
                              {ptk.employmentType} (Aktif)
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-ink-soft">TMT Bergabung:</span>
                            <span className="font-mono text-ink">
                              {new Date(ptk.joinDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Data Administrasi & Kontak (PII Dewasa — Privacy Matrix) */}
                      <div className="p-4 rounded-xl bg-surface border border-line-hairline space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-valor flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Kontak &amp; Administrasi</span>
                          </span>

                          {/* Privacy Reveal Toggle for Headmaster */}
                          {isHeadmasterOrSuperadmin && (
                            <button
                              type="button"
                              onClick={() => togglePiiReveal(ptk.id)}
                              className="min-h-[36px] px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface border border-line text-[11px] font-medium text-ink flex items-center gap-1.5 transition-all shadow-hairline cursor-pointer"
                              title={isPiiRevealed ? 'Samarkan Data Pribadi' : 'Buka Kunci Data Pribadi'}
                            >
                              {isPiiRevealed ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-warning-deep" />
                                  <span>Tutup Privasi</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-accent-valor" />
                                  <span>Buka Kunci PII</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {isHeadmasterOrSuperadmin ? (
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-line-hairline">
                              <span className="text-ink-soft">NIK / No. Identitas:</span>
                              <span className="font-mono font-medium text-ink">
                                {isPiiRevealed ? ptk.nationalIdNumber || '—' : maskPii(ptk.nationalIdNumber, 4)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-line-hairline">
                              <span className="text-ink-soft">Nomor Telepon/WA:</span>
                              <span className="font-mono text-ink">
                                {isPiiRevealed ? ptk.phone || '—' : maskPii(ptk.phone, 3)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-line-hairline">
                              <span className="text-ink-soft">Pos-el Resmi:</span>
                              <span className="font-mono text-ink">
                                {isPiiRevealed ? ptk.email || '—' : maskPii(ptk.email, 6)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-ink-soft">Alamat Tinggal:</span>
                              <span className="text-ink text-right max-w-[200px] truncate">
                                {isPiiRevealed ? ptk.address || '—' : 'Tersamar demi privasi pegawai'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Restricted View for Teacher Persona
                          <div className="p-4 rounded-lg bg-surface-subtle border border-line-hairline text-center space-y-2">
                            <Lock className="w-5 h-5 mx-auto text-ink-faint" />
                            <p className="text-xs text-ink-soft leading-relaxed">
                              Data administrasi kependudukan dan kontak pribadi hanya dapat diakses oleh Kepala Sekolah &amp; Tata Usaha Satuan.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
