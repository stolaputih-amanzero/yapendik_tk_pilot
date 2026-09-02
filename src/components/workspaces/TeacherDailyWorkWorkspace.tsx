/**
 * Yapendik School OS — Domain 01: Teacher Daily Work (Kerja Harian Guru)
 * Supports daily learning plans, sentra activities, 3-zone cards, quick starter templates, and teacher reflections.
 * Canvas-Native Flat Architecture (Hukum F-7 / A-5 / Law 11 Compliant).
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { LearningActivity, DevelopmentDomain, ClassRoom } from '../../domain/types';
import { Button, SegmentedControl, SegmentedControlOption, ToastHUD } from '../ui';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Check, 
  ShieldAlert, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Layers, 
  FileText,
  Sparkles,
  CalendarRange
} from 'lucide-react';
import { WeeklyPlanningWorkspace } from '../teacher-daily-work/WeeklyPlanningWorkspace';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateID = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const shiftDate = (dateStr: string, days: number): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
};

// 5 Canonical Sentra Quick Starter Templates for PAUD/TK
interface SentraTemplate {
  name: string;
  tag: string;
  activityName: string;
  theme: string;
  subTheme: string;
  timeSlot: string;
  domains: DevelopmentDomain[];
  materials: string[];
  steps: string[];
}

const SENTRA_TEMPLATES: SentraTemplate[] = [
  {
    name: 'Sentra Balok',
    tag: '🧱 Balok',
    activityName: 'Konstruksi Bangunan Rumah & Jembatan Sahabat',
    theme: 'Lingkunganku / Sekolah & Rumahku',
    subTheme: 'Membangun Ruang Kebersamaan',
    timeSlot: '08:30 – 10:00',
    domains: ['FISIK_MOTORIK', 'KOGNITIF', 'SOSIAL_EMOSIONAL'],
    materials: [
      'Balok kayu unit aneka bentuk & ukuran',
      'Aksesoris miniatur orang, mobil, & pohon kayu',
      'Karpet alas bermain sentra balok'
    ],
    steps: [
      'Pijakan sebelum main: Berdoa, mendiskusikan konsep bangunan rumah dan aturan keselamatan bermain balok.',
      'Pijakan saat main: Mendampingi anak bekerja sama membangun jembatan dan menghitung balok yang digunakan.',
      'Pijakan setelah main: Mengelompokkan balok sesuai bentuk ke rak sentra, recalling dan apresiasi karya.'
    ]
  },
  {
    name: 'Sentra Bahan Alam',
    tag: '🍃 Bahan Alam',
    activityName: 'Eksplorasi Tekstur, Pasir Kinetik & Warna Alami',
    theme: 'Alam Semesta / Ciptaan Tuhan',
    subTheme: 'Mengenal Tekstur Daun, Batuan & Pasir',
    timeSlot: '08:30 – 10:00',
    domains: ['NILAI_AGAMA_MORAL', 'KOGNITIF', 'FISIK_MOTORIK'],
    materials: [
      'Daun kering & daun segar aneka tekstur',
      'Baki sensori & pasir kinetik',
      'Pewarna alami dari kunyit dan daun suji',
      'Batu kerikil halus & kuas bambu'
    ],
    steps: [
      'Pijakan sebelum main: Bersyukur atas indra peraba ciptaan Tuhan, demonstrasi meraba ragam tekstur alam.',
      'Pijakan saat main: Memandu anak mencetak pasir, meraba urat daun, dan membuat lukisan cap tekstur.',
      'Pijakan setelah main: Mencuci tangan bersama dengan sabun, menceritakan sensasi tekstur yang paling disukai.'
    ]
  },
  {
    name: 'Sentra Seni & Kreativitas',
    tag: '🎨 Seni',
    activityName: 'Kolase Ceria Daun & Lukisan Cap Jari',
    theme: 'Diriku / Panca Indra Ciptaan Tuhan',
    subTheme: 'Mengekspresikan Rasa Ceria Lewat Warna',
    timeSlot: '08:30 – 10:00',
    domains: ['SENI', 'FISIK_MOTORIK', 'BAHASA'],
    materials: [
      'Kertas gambar tebal ukuran A3',
      'Cat air primer (merah, kuning, biru) non-toxic',
      'Kuas spons, celemek anak, & lap basah pembersih',
      'Potongan kertas origami & lem'
    ],
    steps: [
      'Pijakan sebelum main: Mengamati percampuran warna primer, kesepakatan mengenakan celemek seni.',
      'Pijakan saat main: Membebaskan anak mengeksplorasi cap jari dan kolase membentuk wajah ceria.',
      'Pijakan setelah main: Menggantung hasil karya di tali jemuran seni, apresiasi karya bersama teman.'
    ]
  },
  {
    name: 'Sentra Main Peran',
    tag: '🎭 Main Peran',
    activityName: 'Klinik Dokter Cilik & Apotek Sehat Maranatha',
    theme: 'Profesi & Cita-Citaku',
    subTheme: 'Merawat dan Menyayangi Sahabat yang Sakit',
    timeSlot: '08:30 – 10:00',
    domains: ['SOSIAL_EMOSIONAL', 'BAHASA', 'NILAI_AGAMA_MORAL'],
    materials: [
      'Kostum dokter & suster anak',
      'Stetoskop mainan, termometer kayu, & tas medis',
      'Buku resep tiruan & botol obat kayu',
      'Tempat tidur periksa mini & boneka pasien'
    ],
    steps: [
      'Pijakan sebelum main: Menjelaskan tugas mulia dokter/perawat dan tata krama antre di ruang tunggu.',
      'Pijakan saat main: Mengamati interaksi dialog dokter-pasien, memfasilitasi anak bergantian peran.',
      'Pijakan setelah main: Merapikan kostum dan perlengkapan medis ke kotak peran, refleksi empati.'
    ]
  },
  {
    name: 'Sentra Persiapan',
    tag: '📚 Persiapan',
    activityName: 'Mencocokkan Pola Kartu Huruf & Berhitung Ceria',
    theme: 'Keluargaku yang Hangat',
    subTheme: 'Menghitung Anggota Keluarga & Huruf Awal',
    timeSlot: '08:30 – 10:00',
    domains: ['BAHASA', 'KOGNITIF', 'FISIK_MOTORIK'],
    materials: [
      'Kartu huruf vokal bergambar anggota keluarga',
      'Jepit jemuran kayu warna-warni',
      'Papan pola bilangan & batu pipih hitung',
      'Buku cerita bergambar keluarga'
    ],
    steps: [
      'Pijakan sebelum main: Bernyanyi lagu satu-satu aku sayang ibu, demonstrasi menjepit kartu pola.',
      'Pijakan saat main: Mendampingi anak menjepit kartu sesuai jumlah anggota keluarga & menyebut bunyi huruf.',
      'Pijakan setelah main: Menghitung kembali kartu yang selesai, merapikan baki persiapan ke loker.'
    ]
  }
];

const DOMAIN_CONFIG: { key: DevelopmentDomain; label: string; bg: string; text: string; border: string }[] = [
  { key: 'NILAI_AGAMA_MORAL', label: 'Nilai Agama & Moral', bg: 'bg-success-tint', text: 'text-success-deep', border: 'border-success-line' },
  { key: 'FISIK_MOTORIK', label: 'Fisik-Motorik', bg: 'bg-warning-tint', text: 'text-warning-deep', border: 'border-warning-line' },
  { key: 'KOGNITIF', label: 'Kognitif', bg: 'bg-info-tint', text: 'text-info-deep', border: 'border-info-line' },
  { key: 'BAHASA', label: 'Bahasa', bg: 'bg-lppa-tint', text: 'text-lppa-deep', border: 'border-line' },
  { key: 'SOSIAL_EMOSIONAL', label: 'Sosial-Emosional', bg: 'bg-danger-tint', text: 'text-danger-deep', border: 'border-danger-line' },
  { key: 'SENI', label: 'Seni & Kreativitas', bg: 'bg-lppa-tint', text: 'text-lppa-deep', border: 'border-line' }
];

export const TeacherDailyWorkWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_maranatha_tka');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  
  // Modals & Reflection
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [reflectionModalActivity, setReflectionModalActivity] = useState<LearningActivity | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State for Add Activity
  const [theme, setTheme] = useState('Diriku / Panca Indra Ciptaan Tuhan');
  const [subTheme, setSubTheme] = useState('Eksplorasi Indra Pengecap & Peraba');
  const [timeSlot, setTimeSlot] = useState('08:30 – 10:00');
  const [activityName, setActivityName] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<DevelopmentDomain[]>(['KOGNITIF', 'FISIK_MOTORIK']);
  const [materials, setMaterials] = useState('');
  const [steps, setSteps] = useState('');

  const loadData = () => {
    if (!securityContext) return;
    const schoolClasses = db.getClasses(securityContext.activeSchoolId);
    setClasses(schoolClasses);
    if (schoolClasses.length > 0 && !schoolClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(schoolClasses[0].id);
    }
    const actList = db.getLearningActivities(securityContext.activeSchoolId, selectedClassId, selectedDate);
    setActivities(actList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedDate]);

  // Authorization check for creating / editing activities (DENY_CLASS_UNASSIGNED)
  const authResult = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'TEACHER_DAILY_WORK',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }) : { granted: false, reason: 'Konteks identitas belum siap' };

  const canEdit = authResult.granted;
  const isToday = selectedDate === getTodayDateString();

  const classSegments: SegmentedControlOption[] = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'Kelas TK A' : c.name.includes('B') ? 'Kelas TK B' : c.name,
    activeClassName: 'bg-brand text-on-brand font-bold shadow-sm ring-1 ring-brand/50'
  }));

  // Apply Quick Template
  const handleApplyTemplate = (tpl: SentraTemplate) => {
    setActivityName(tpl.activityName);
    setTheme(tpl.theme);
    setSubTheme(tpl.subTheme);
    setTimeSlot(tpl.timeSlot);
    setSelectedDomains(tpl.domains);
    setMaterials(tpl.materials.join('\n'));
    setSteps(tpl.steps.join('\n'));
  };

  const handleToggleDomain = (domain: DevelopmentDomain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityContext || !activityName.trim()) return;

    db.addLearningActivity({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      date: selectedDate,
      theme,
      subTheme,
      timeSlot,
      activityName,
      developmentalFocus: selectedDomains,
      materialsNeeded: materials.split('\n').map(m => m.trim()).filter(m => m.length > 0),
      plannedSteps: steps.split('\n').map(s => s.trim()).filter(s => s.length > 0),
      completed: false
    }, securityContext.personName, securityContext.userId, securityContext.role);

    setShowAddModal(false);
    setActivityName('');
    setMaterials('');
    setSteps('');
    setToastMessage('Rencana aktivitas sentra berhasil disimpan ke agenda kelas.');
    setShowToast(true);
  };

  const handleOpenReflectionModal = (activity: LearningActivity) => {
    if (!canEdit) return;
    setReflectionModalActivity(activity);
    setReflectionText(activity.teacherReflection || '');
  };

  const handleSaveReflection = () => {
    if (reflectionModalActivity) {
      db.toggleActivityComplete(reflectionModalActivity.id, reflectionText);
      setReflectionModalActivity(null);
      setReflectionText('');
      setToastMessage('Aktivitas ditandai selesai dan catatan refleksi berhasil dicatat.');
      setShowToast(true);
    }
  };

  const completedCount = activities.filter(a => a.completed).length;

  return (
    <div className="space-y-4 pb-[140px] medium:pb-12 text-ink animate-in fade-in duration-150">
      {/* ═══════════════════════════════════════════════════════════
          1. CANONICAL HEADER BAR (CLEAN, NEAT & UNCLUTTERED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-surface border-b border-line px-4 medium:px-6 py-4 space-y-3">
        {/* Row 1: Title + In-Context Mode Switcher + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-lg medium:text-xl font-bold text-ink flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-valor shrink-0" />
                <span>Jurnal Harian &amp; Agenda Pembelajaran</span>
              </h1>
              <p className="text-xs text-ink-soft">
                {viewMode === 'DAILY'
                  ? 'Pengorganisasian sentra kegiatan, fokus capaian perkembangan, dan catatan refleksi guru.'
                  : 'Rencana Pelaksanaan Pembelajaran Mingguan (RPPM) sentra PAUD 5 hari.'}
              </p>
            </div>

            {/* In-Context View Switcher (Law 11 Compliant: Zero Emoji Clutter) */}
            <div className="inline-flex p-0.5 rounded-xl bg-surface-subtle border border-line">
              <button
                type="button"
                onClick={() => setViewMode('DAILY')}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'DAILY'
                    ? 'bg-surface text-ink shadow-hairline border border-line font-bold'
                    : 'text-ink-soft hover-only:text-ink'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-accent-valor" />
                <span>Agenda Harian</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('WEEKLY')}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'WEEKLY'
                    ? 'bg-surface text-ink shadow-hairline border border-line font-bold'
                    : 'text-ink-soft hover-only:text-ink'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-accent-valor" />
                <span>Rencana Mingguan</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold shadow-soft min-h-[38px]"
            >
              Rencana Aktivitas Baru
            </Button>
          )}
        </div>

        {/* Row 2: Date Selector with Navigation + Class Switcher + Summary Status (DAILY ONLY) */}
        {viewMode === 'DAILY' && (
          <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3 pt-2 border-t border-line-soft">
            {/* Date Picker with Prev / Next Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
                title="Hari Sebelumnya"
                aria-label="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div 
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker();
                  } catch {
                    dateInputRef.current?.focus();
                  }
                }}
                className="relative min-h-[38px] px-3 py-1.5 rounded-xl bg-surface border border-line hover-only:border-brand flex items-center gap-2 text-xs font-medium text-ink cursor-pointer shadow-hairline select-none"
              >
                <Calendar className="w-4 h-4 text-accent-valor shrink-0" />
                <span className="font-mono font-bold text-xs">{formatDateID(selectedDate)}</span>
                <span className="text-ink-soft text-xs pl-1">▾</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Pilih Tanggal Pembelajaran"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
                title="Hari Berikutnya"
                aria-label="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(getTodayDateString())}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-subtle border border-line text-[11px] font-semibold text-accent-valor hover-only:bg-surface cursor-pointer"
                >
                  Hari Ini
                </button>
              )}
            </div>

            {/* Class Switcher & Metrics in One Line */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="w-44 shrink-0">
                <SegmentedControl
                  options={classSegments}
                  value={selectedClassId}
                  onChange={setSelectedClassId}
                  size="sm"
                  className="w-full min-h-[38px]"
                />
              </div>

              {/* Micro Metrics Pills */}
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-line font-medium text-ink shadow-hairline">
                  <strong className="font-mono font-bold text-ink">{activities.length}</strong> Aktivitas
                </span>
                {completedCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-success-tint border border-success-line text-success-deep font-medium shadow-hairline flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <strong className="font-mono font-bold">{completedCount}</strong> Selesai
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. BODY: WEEKLY RPPM OR DAILY ACTIVITIES TIMELINE
          ═══════════════════════════════════════════════════════════ */}
      {viewMode === 'WEEKLY' ? (
        <div className="px-4 medium:px-6">
          <WeeklyPlanningWorkspace
            selectedClassId={selectedClassId}
            onClassChange={setSelectedClassId}
            classes={classes}
            canEdit={canEdit}
            onSwitchToDaily={(targetDate) => {
              if (targetDate) setSelectedDate(targetDate);
              setViewMode('DAILY');
            }}
            onAddActivityForDate={(dateStr) => {
              setSelectedDate(dateStr);
              setShowAddModal(true);
            }}
          />
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════
              SECURITY FIRST: DENY_CLASS_UNASSIGNED READ-ONLY BANNER
              ═══════════════════════════════════════════════════════════ */}
      {!canEdit && (
        <div className="mx-4 medium:mx-6 bg-surface border border-warning-line/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-hairline animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldAlert className="w-4 h-4 text-warning-deep shrink-0" />
            <p className="text-xs text-ink leading-relaxed">
              <strong className="font-semibold text-warning-deep">Mode Hanya Baca (Read-Only):</strong> Anda tidak ditugaskan sebagai pendidik di rombel ini. Penulisan agenda sentra dan refleksi harian hanya dapat dilakukan oleh wali kelas bersangkutan.
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-warning-tint text-warning-deep border border-warning-line">
            READ ONLY
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          2. ACTIVITIES TIMELINE (3-ZONE CARD ANATOMY)
          ═══════════════════════════════════════════════════════════ */}
      {activities.length > 0 ? (
        <div className="px-4 medium:px-6 space-y-4">
          {activities.map((act) => (
            <article 
              key={act.id} 
              className={`bg-surface border rounded-2xl shadow-hairline overflow-hidden transition-all duration-150 ${
                act.completed ? 'border-success-line/60 ring-1 ring-success-line/30' : 'border-line'
              }`}
            >
              {/* ZONE 1: HEADER (Waktu, Judul, Tema & Status Selesai) */}
              <div className="px-4 medium:px-5 py-3.5 bg-surface-subtle/50 border-b border-line flex flex-wrap items-center justify-between gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-surface text-ink font-semibold flex items-center gap-1.5 border border-line shadow-hairline">
                      <Clock className="w-3.5 h-3.5 text-accent-valor" />
                      {act.timeSlot}
                    </span>
                    {act.completed && (
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-success-tint text-success-deep font-bold flex items-center gap-1 border border-success-line">
                        <Check className="w-3.5 h-3.5" />
                        Selesai Dilaksanakan
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm medium:text-base font-bold text-ink pt-0.5">
                    {act.activityName}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Tema: <strong className="text-ink">{act.theme}</strong> • Sub-tema: <span className="text-ink">{act.subTheme}</span>
                  </p>
                </div>

                {/* Zone 1 Quick Actions */}
                {canEdit && !act.completed && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleOpenReflectionModal(act)}
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-success-deep" />}
                    className="rounded-xl text-xs font-bold shrink-0 min-h-[34px]"
                  >
                    Tandai Selesai
                  </Button>
                )}
              </div>

              {/* ZONE 2: BODY (Chips Fokus Perkembangan, Alat & Bahan, Langkah Pijakan Main) */}
              <div className="p-4 medium:p-5 space-y-4">
                {/* 6 Domain Chips */}
                {act.developmentalFocus && act.developmentalFocus.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {act.developmentalFocus.map(d => {
                      const cfg = DOMAIN_CONFIG.find(c => c.key === d);
                      return (
                        <span 
                          key={d} 
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold border ${cfg ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-surface-subtle text-ink-soft border-line'}`}
                        >
                          {cfg?.label || d}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Materials & Planned Steps Grid */}
                <div className="grid grid-cols-1 medium:grid-cols-2 gap-4 text-xs text-ink-soft">
                  {/* Bahan & Perlengkapan */}
                  {act.materialsNeeded && act.materialsNeeded.length > 0 && (
                    <div className="bg-surface-subtle/30 rounded-xl p-3.5 border border-line-soft space-y-2">
                      <strong className="text-ink text-xs font-bold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-accent-valor" />
                        Alat &amp; Bahan Sentra:
                      </strong>
                      <ul className="space-y-1 pl-1">
                        {act.materialsNeeded.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-ink">
                            <span className="text-ink-soft select-none">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Langkah Alur Kegiatan */}
                  {act.plannedSteps && act.plannedSteps.length > 0 && (
                    <div className="bg-surface-subtle/30 rounded-xl p-3.5 border border-line-soft space-y-2">
                      <strong className="text-ink text-xs font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent-valor" />
                        Langkah Pijakan Main:
                      </strong>
                      <ol className="space-y-1 pl-1">
                        {act.plannedSteps.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-ink">
                            <span className="font-mono font-bold text-[11px] text-ink-soft shrink-0">{idx + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* ZONE 3: FOOTER (Catatan Refleksi Guru & Aksi Pengelolaan) */}
              <div className="px-4 medium:px-5 py-3 bg-surface-subtle/40 border-t border-line flex flex-wrap items-center justify-between gap-3">
                {act.teacherReflection ? (
                  <div className="w-full space-y-1">
                    <span className="text-[11px] font-bold text-success-deep flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Refleksi &amp; Evaluasi Guru:
                    </span>
                    <p className="text-xs text-ink italic leading-relaxed bg-surface rounded-xl p-3 border border-line">
                      "{act.teacherReflection}"
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-ink-soft italic">
                    Kegiatan ini belum ditandai selesai dan belum memiliki catatan refleksi.
                  </span>
                )}

                {canEdit && act.completed && (
                  <button
                    type="button"
                    onClick={() => handleOpenReflectionModal(act)}
                    className="text-xs font-semibold text-accent-valor hover-only:underline cursor-pointer ml-auto"
                  >
                    Edit Refleksi
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface rounded-2xl border border-dashed border-line-strong p-10 text-center text-ink-soft shadow-hairline mx-4 medium:mx-6 space-y-3">
          <BookOpen className="w-10 h-10 text-ink-faint mx-auto opacity-60" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink">Belum Ada Agenda Aktivitas pada Tanggal Ini</h4>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              Susun rencana pembelajaran sentra harian kelas untuk memandu proses belajar dan capaian tumbuh kembang anak didik.
            </p>
          </div>
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold shadow-soft mx-auto"
            >
              Rencana Aktivitas Baru
            </Button>
          )}
        </div>
      )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          3. MODAL: RENCANA AKTIVITAS BARU (LEGA, RAPI & QUICK STARTER)
          ═══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-floating border border-line max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 medium:p-6 text-ink space-y-5">
            {/* Modal Header + Ribbon */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent-valor shrink-0" />
                  <span>Rencana Aktivitas Sentra TK</span>
                </h2>
                {/* Matching Pill Ribbon */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-line text-[11px] font-mono font-medium text-ink">
                    📅 {formatDateID(selectedDate)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-line text-[11px] font-medium text-ink">
                    🏫 {classes.find(c => c.id === selectedClassId)?.name || 'TK A'}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink flex items-center justify-center cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Starter Templates Banner */}
            <div className="space-y-2 bg-surface-subtle/50 rounded-xl p-3 border border-line-soft">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-valor" />
                Template Cepat Sentra PAUD (1-Klik):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {SENTRA_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-line hover-only:border-brand hover-only:text-brand text-xs font-semibold text-ink shrink-0 cursor-pointer shadow-hairline transition-all active:scale-95"
                  >
                    {tpl.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateActivity} className="space-y-4">
              {/* Tema & Sub-tema */}
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Tema Utama:</label>
                  <input
                    type="text"
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:border-brand"
                    placeholder="mis. Diriku / Panca Indra"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Sub-Tema:</label>
                  <input
                    type="text"
                    required
                    value={subTheme}
                    onChange={(e) => setSubTheme(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:border-brand"
                    placeholder="mis. Indra Peraba &amp; Pengecap"
                  />
                </div>
              </div>

              {/* Nama Aktivitas & Waktu */}
              <div className="grid grid-cols-1 medium:grid-cols-3 gap-3">
                <div className="medium:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-ink">Nama Aktivitas Sentra:</label>
                  <input
                    type="text"
                    required
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:border-brand"
                    placeholder="mis. Eksplorasi Pasir Kinetik &amp; Warna Alami"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Waktu Pelaksanaan:</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-hidden focus:border-brand cursor-pointer shadow-hairline"
                  >
                    <option value="08:30 – 10:00">08:30 – 10:00 (Sentra Inti)</option>
                    <option value="07:45 – 08:30">07:45 – 08:30 (Lingkaran Pagi)</option>
                    <option value="10:30 – 11:00">10:30 – 11:00 (Refleksi Penutup)</option>
                  </select>
                </div>
              </div>

              {/* Fokus Capaian Perkembangan (6 Domain Chips) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Fokus Capaian Perkembangan:</label>
                <div className="flex flex-wrap gap-1.5">
                  {DOMAIN_CONFIG.map((dom) => {
                    const isSelected = selectedDomains.includes(dom.key);
                    return (
                      <button
                        key={dom.key}
                        type="button"
                        onClick={() => handleToggleDomain(dom.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? `${dom.bg} ${dom.text} ${dom.border} shadow-hairline font-bold`
                            : 'bg-surface-subtle text-ink-soft border-line opacity-70 hover-only:opacity-100'
                        }`}
                      >
                        {dom.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alat & Bahan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Alat &amp; Bahan (Satu item per baris):</label>
                <textarea
                  rows={3}
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-xl p-3 text-xs text-ink focus:outline-hidden focus:border-brand leading-relaxed"
                  placeholder="Contoh:&#10;Kertas gambar A3&#10;Cat air primer non-toxic&#10;Kuas spons &amp; lap basah"
                />
              </div>

              {/* Langkah Pijakan Main */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Langkah Pijakan Main (Satu langkah per baris):</label>
                <textarea
                  rows={4}
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-xl p-3 text-xs text-ink focus:outline-hidden focus:border-brand leading-relaxed"
                  placeholder="Contoh:&#10;Pijakan sebelum main: Berdoa dan mengenalkan aturan bermain sentra.&#10;Pijakan saat main: Memandu anak mengeksplorasi warna.&#10;Pijakan setelah main: Merapikan alat sentra dan refleksi rasa senang."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm" 
                  className="rounded-xl text-xs font-bold shadow-soft"
                >
                  Simpan Rencana Aktivitas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          4. MODAL: REFLEKSI GURU & TANDAI SELESAI
          ═══════════════════════════════════════════════════════════ */}
      {reflectionModalActivity && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-floating border border-line max-w-lg w-full p-5 medium:p-6 text-ink space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-valor shrink-0" />
                  <span>Refleksi Pembelajaran Guru</span>
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  {reflectionModalActivity.activityName}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setReflectionModalActivity(null)}
                className="w-8 h-8 rounded-lg text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink flex items-center justify-center cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">Catatan Refleksi &amp; Evaluasi Pedagogis:</label>
              <textarea
                rows={4}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full bg-surface-subtle border border-line rounded-xl p-3 text-xs text-ink focus:outline-hidden focus:border-brand leading-relaxed"
                placeholder="Tuliskan catatan observasi umum, dinamika kelompok anak, respon emosi, atau hal penting yang perlu ditindaklanjuti pada pertemuan berikutnya..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setReflectionModalActivity(null)}
                className="rounded-xl text-xs font-bold"
              >
                Batal
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                size="sm" 
                onClick={handleSaveReflection}
                leftIcon={<Check className="w-4 h-4" />}
                className="rounded-xl text-xs font-bold shadow-soft"
              >
                Simpan &amp; Tandai Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ToastHUD Feedback */}
      {showToast && (
        <ToastHUD
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
          durationMs={3500}
        />
      )}
    </div>
  );
};
