import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserCog,
  GraduationCap,
  FilterX,
} from 'lucide-react';

import {
  fetchActiveClasses,
  fetchClassRoster,
  updateStudentPhoto,
} from '../../lib/queries/class-queries';
import type { ClassRecord, ClassWithDetails } from '../../types/class';
import { RosterSearchBar } from '../../components/roster/RosterSearchBar';
import { GenderFilter, GenderFilterValue } from '../../components/roster/GenderFilter';
import { StudentListItem } from '../../components/roster/StudentListItem';
import { PtkDirectoryView } from '../../components/roster/PtkDirectoryView';
import { db } from '../../db/database';
import { useSecurityContext, SEED_PERSONAS } from '../../auth/context';

// ═══════════════════════════════════════════════════════════════════
// SIGNATURE #1: Amanaura Breath (✦)
// ═══════════════════════════════════════════════════════════════════
function AmanauraBreath() {
  return (
    <span className="inline-block animate-amanaura-breath text-accent-valor text-sm select-none" aria-hidden="true">
      ✦
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HALAMAN UTAMA — DATA ROSTER
// ═══════════════════════════════════════════════════════════════════
export default function DataRosterWorkspace() {
  const { currentPersona, updateOwnProfile } = useSecurityContext();
  const activeSchoolId = currentPersona?.schoolId || 'sch_tk_maranatha';

  const [activeClasses, setActiveClasses] = useState<ClassRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null);
  const [roster, setRoster] = useState<ClassWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<GenderFilterValue>('ALL');
  const [activeView, setActiveView] = useState<'STUDENTS' | 'PTK'>('STUDENTS');

  const [ptkList, setPtkList] = useState(() => db.getPTKDirectory(activeSchoolId));
  const currentSchool = useMemo(() => db.getSchoolById(activeSchoolId), [activeSchoolId]);

  // Reactive subscription to db changes (synchronizes PTK avatars)
  useEffect(() => {
    const refreshPtk = () => {
      setPtkList(db.getPTKDirectory(activeSchoolId));
    };
    refreshPtk();
    return db.subscribe(refreshPtk);
  }, [activeSchoolId]);

  const handleUpdatePtkPhoto = async (personId: string, photoUrl: string) => {
    db.updatePersonAvatar(personId, photoUrl);

    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(localStorage.getItem('yapendik_persona_overrides') || '{}');
        for (const persona of SEED_PERSONAS) {
          if (persona.personId === personId) {
            overrides[persona.id] = {
              ...(overrides[persona.id] || persona),
              avatarUrl: photoUrl
            };
          }
        }
        localStorage.setItem('yapendik_persona_overrides', JSON.stringify(overrides));
      } catch (e) {
        console.error('Failed to sync persona override', e);
      }
    }

    if (currentPersona?.personId === personId) {
      await updateOwnProfile({ avatarUrl: photoUrl });
    }

    setPtkList(db.getPTKDirectory(activeSchoolId));
  };

  // ═══════════════════════════════════════════════════════════════
  // LOAD: Kelas aktif + detail roster
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const classes = await fetchActiveClasses('CURRENT_ACADEMIC_YEAR_ID');
        if (!isMounted) return;
        setActiveClasses(classes);

        const targetClass = classes[0];
        if (targetClass) {
          setSelectedClass(targetClass);
          const details = await fetchClassRoster(targetClass.id);
          if (!isMounted) return;
          setRoster(details);
        }
      } catch (err) {
        console.error('Gagal memuat Data Roster:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectClass = async (cls: ClassRecord) => {
    setSelectedClass(cls);
    setSearchQuery('');
    setGenderFilter('ALL');
    try {
      const details = await fetchClassRoster(cls.id);
      setRoster(details);
    } catch (e) {
      console.error('Error fetching roster for class:', e);
    }
  };

  const handleUpdateStudentPhoto = async (studentId: string, photoUrl: string) => {
    const savedUrl = await updateStudentPhoto(studentId, photoUrl);
    setRoster((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId ? { ...s, photo_url: savedUrl || undefined } : s
        ),
      };
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTERING: Real-time Search + Gender Filtering
  // ═══════════════════════════════════════════════════════════════
  const totalStudents = roster?.students || [];

  const genderCounts = useMemo(() => {
    const male = totalStudents.filter((s) => s.gender === 'Laki-laki' || s.gender === 'MALE').length;
    const female = totalStudents.filter((s) => s.gender === 'Perempuan' || s.gender === 'FEMALE').length;
    return {
      all: totalStudents.length,
      male,
      female,
    };
  }, [totalStudents]);

  const filteredStudents = useMemo(() => {
    return totalStudents.filter((s) => {
      // 1. Gender Filter
      if (genderFilter === 'Laki-laki' && s.gender !== 'Laki-laki' && s.gender !== 'MALE') {
        return false;
      }
      if (genderFilter === 'Perempuan' && s.gender !== 'Perempuan' && s.gender !== 'FEMALE') {
        return false;
      }

      // 2. Search Query (full_name, nis, call_name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = s.full_name.toLowerCase().includes(query);
        const matchesCallName = s.call_name.toLowerCase().includes(query);
        const matchesNis = s.nis.toLowerCase().includes(query);
        return matchesName || matchesCallName || matchesNis;
      }

      return true;
    });
  }, [totalStudents, genderFilter, searchQuery]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Loading State
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-ink-soft">
          <AmanauraBreath />
          <span className="font-mono text-sm">Memuat Data Roster…</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Empty State
  // ═══════════════════════════════════════════════════════════════
  if (!roster) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16 px-4">
        <GraduationCap className="w-12 h-12 mx-auto text-ink-faint mb-4" />
        <h2 className="font-display text-xl font-bold text-ink">Belum Ada Data Kelas</h2>
        <p className="text-ink-soft mt-2 text-sm">Pilih kelas aktif untuk melihat Data Roster.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 medium:px-5 pt-1 space-y-6 pb-[160px] expanded:pb-8 text-ink font-sans animate-in fade-in duration-200">
      {/* ────────────────────────────────────────────────────
          HEADER SEKSI DENGAN IN-CONTEXT VIEW SWITCHER
          ───────────────────────────────────────────────────── */}
      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-valor block">
            Administrasi &amp; Sumber Daya Sekolah
          </span>
          <h2 className="text-2xl medium:text-3xl font-bold text-ink leading-tight tracking-tight flex items-center gap-2">
            {activeView === 'STUDENTS' ? (
              <>
                <Users className="w-7 h-7 text-accent-valor shrink-0" />
                <span>Data Induk Siswa &amp; Orang Tua / Wali</span>
              </>
            ) : (
              <>
                <UserCog className="w-7 h-7 text-accent-valor shrink-0" />
                <span>Buku Induk Pendidik &amp; Tenaga Kependidikan (PTK)</span>
              </>
            )}
          </h2>
          <p className="text-xs medium:text-sm text-ink-soft leading-relaxed max-w-3xl mt-1">
            {activeView === 'STUDENTS'
              ? 'Daftar seluruh anak didik aktif, nomor induk kependudukan (NIK/NISN), data kesehatan, dan kontak orang tua/wali resmi.'
              : 'Direktori resmi pendidik, kualifikasi sentra, penugasan rombongan belajar, dan data kepegawaian.'}
          </p>
        </div>

        {/* In-Context View Switcher */}
        <div
          className="inline-flex p-1 rounded-xl bg-surface-subtle border border-line w-full medium:w-auto shadow-hairline shrink-0"
          role="tablist"
          aria-label="Pilihan Tampilan Data"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'STUDENTS'}
            onClick={() => setActiveView('STUDENTS')}
            className={`flex-1 medium:flex-none min-h-[48px] px-4 py-2 rounded-lg text-xs medium:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeView === 'STUDENTS'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Murid</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'PTK'}
            onClick={() => setActiveView('PTK')}
            className={`flex-1 medium:flex-none min-h-[48px] px-4 py-2 rounded-lg text-xs medium:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeView === 'PTK'
                ? 'bg-brand text-on-brand shadow-sm'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Direktori PTK</span>
          </button>
        </div>
      </div>

      {activeView === 'PTK' ? (
        <PtkDirectoryView
          ptkList={ptkList}
          schoolName={currentSchool?.name || 'TK YAPENDIK GPIB Cabang Maranatha'}
          onUpdatePhoto={handleUpdatePtkPhoto}
        />
      ) : (
        <div className="space-y-6">
          {/* ─────────────────────────────────────────────────────
              TIER 2: PILIHAN TAB KELAS & KONTEKS GURU (Compact Tab Strip)
              ───────────────────────────────────────────────────── */}
          <div className="space-y-3">
        {/* Tab Pilihan Kelas — Label di Baris 1, Range Umur di Baris 2 */}
        {activeClasses.length > 0 && (
          <div
            className="inline-flex p-1 rounded-xl bg-surface-subtle border border-line w-full medium:w-fit shadow-hairline"
            role="tablist"
            aria-label="Pilihan Rombel Kelas"
          >
            {activeClasses.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectClass(cls)}
                  className={`flex-1 medium:flex-none min-h-[52px] px-6 py-2 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isSelected
                      ? 'bg-brand text-on-brand shadow-sm'
                      : 'text-ink-soft hover-only:text-ink hover-only:bg-surface'
                  }`}
                >
                  <span className="text-xs medium:text-sm font-semibold leading-tight">
                    {cls.name}
                  </span>
                  <span className={`text-[10px] medium:text-[11px] font-mono leading-tight mt-0.5 ${
                    isSelected ? 'text-on-brand/80' : 'text-ink-faint'
                  }`}>
                    {cls.age_range}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Konteks Ringkas: Wali & Pendamping (Dengan Icon Representatif) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft px-1">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-accent-valor shrink-0" />
            <span>
              <strong className="text-ink font-semibold">Wali:</strong> {roster.homeroom_teacher.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-ink-faint shrink-0" />
            <span>
              <strong className="text-ink font-semibold">Pendamping:</strong> {roster.assistant_teacher.name}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          FILTER BAR: SEARCH & GENDER CONTROLS
          ───────────────────────────────────────────────────── */}
      <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-3">
        <div className="flex-1 min-w-0">
          <RosterSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama lengkap, NIS, atau panggilan…"
          />
        </div>
        <div className="w-full medium:w-auto shrink-0">
          <GenderFilter
            value={genderFilter}
            onChange={setGenderFilter}
            counts={genderCounts}
          />
        </div>
      </div>

      {/* Status hasil pencarian jika aktif */}
      {searchQuery && (
        <div className="px-1 text-xs text-ink-faint italic font-sans">
          Menampilkan {filteredStudents.length} hasil pencarian untuk &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          DAFTAR SISWA (COLLAPSIBLE EDGE-TO-EDGE LIST — Hukum 1)
          ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredStudents.map((student, idx) => (
          <StudentListItem
            key={student.id}
            student={student}
            index={idx}
            onUpdatePhoto={handleUpdateStudentPhoto}
          />
        ))}
      </div>

      {/* Empty state jika filter/search tidak menemukan data */}
      {filteredStudents.length === 0 && (
        <div className="bg-surface border border-line rounded-card p-12 text-center space-y-3 shadow-hairline">
          <FilterX className="w-12 h-12 mx-auto text-ink-faint" />
          <p className="text-ink font-semibold text-base">Tidak Ada Siswa yang Sesuai</p>
          <p className="text-ink-soft text-xs max-w-sm mx-auto">
            Tidak ditemukan murid dengan filter atau kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setGenderFilter('ALL');
            }}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-surface-subtle border border-line text-xs font-semibold text-ink hover-only:bg-surface cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
