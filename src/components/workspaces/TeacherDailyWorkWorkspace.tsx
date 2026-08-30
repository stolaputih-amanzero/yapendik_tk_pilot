/**
 * Yapendik School OS — Domain 01: Teacher Daily Work (Kerja Harian Guru)
 * Supports daily learning plans, sentra activities, steps, and teacher reflections.
 * Canvas-Native Flat Architecture (Hukum F-7 / A-5).
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { LearningActivity, DevelopmentDomain, ClassRoom } from '../../domain/types';
import { Button, Badge, SelectSheet } from '../ui';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus, 
  BookOpen, 
  Check, 
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TeacherDailyWorkWorkspace: React.FC = () => {
  const { securityContext, currentPersona } = useSecurityContext();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_maranatha_tka');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reflectionModalActivity, setReflectionModalActivity] = useState<LearningActivity | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  // Form State
  const [theme, setTheme] = useState('Diriku / Panca Indra Ciptaan Tuhan');
  const [subTheme, setSubTheme] = useState('Eksplorasi Indra Pengecap');
  const [timeSlot, setTimeSlot] = useState('08:00 - 09:30');
  const [activityName, setActivityName] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<DevelopmentDomain[]>(['KOGNITIF', 'NILAI_AGAMA_MORAL']);
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

  // Authorization check for creating / editing activities
  const authResult = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'TEACHER_DAILY_WORK',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }) : { granted: false, reason: 'Konteks identitas belum siap' };

  const handleToggleComplete = (activity: LearningActivity) => {
    if (!authResult.granted) {
      alert(`Otorisasi Ditolak: ${authResult.reason}`);
      return;
    }
    if (!activity.completed && !activity.teacherReflection) {
      setReflectionModalActivity(activity);
      setReflectionText('');
    } else {
      db.toggleActivityComplete(activity.id);
    }
  };

  const handleSaveReflection = () => {
    if (reflectionModalActivity) {
      db.toggleActivityComplete(reflectionModalActivity.id, reflectionText);
      setReflectionModalActivity(null);
      setReflectionText('');
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    db.addLearningActivity({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      date: selectedDate,
      theme,
      subTheme,
      timeSlot,
      activityName,
      developmentalFocus: selectedDomains,
      materialsNeeded: materials.split('\n').filter(m => m.trim().length > 0),
      plannedSteps: steps.split('\n').filter(s => s.trim().length > 0),
      completed: false
    }, securityContext.personName, securityContext.userId, securityContext.role);

    setShowAddModal(false);
    setActivityName('');
    setMaterials('');
    setSteps('');
  };

  const toggleDomainSelection = (d: DevelopmentDomain) => {
    if (selectedDomains.includes(d)) {
      setSelectedDomains(selectedDomains.filter(item => item !== d));
    } else {
      setSelectedDomains([...selectedDomains, d]);
    }
  };

  const availableDomains: { key: DevelopmentDomain; label: string; bg: string }[] = [
    { key: 'NILAI_AGAMA_MORAL', label: 'Nilai Agama & Moral', bg: 'bg-success-tint text-success-deep' },
    { key: 'FISIK_MOTORIK', label: 'Fisik-Motorik', bg: 'bg-warning-tint text-warning-deep' },
    { key: 'KOGNITIF', label: 'Kognitif', bg: 'bg-info-tint text-info-deep' },
    { key: 'BAHASA', label: 'Bahasa', bg: 'bg-lppa-tint text-lppa-deep' },
    { key: 'SOSIAL_EMOSIONAL', label: 'Sosial-Emosional', bg: 'bg-danger-tint text-danger-deep' },
    { key: 'SENI', label: 'Seni & Kreativitas', bg: 'bg-lppa-tint text-lppa-deep' }
  ];

  return (
    <div 
      className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-8 animate-in fade-in duration-200 text-ink"
      data-testid="teacher-daily-work-workspace"
    >
      {/* 1. HERO CANVAS (R-1 Hero Canvas) */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Kerja Harian Guru • Pembelajaran Sentra TK</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Agenda &amp; Kerja Harian Guru</span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              Pengorganisasian sentra kegiatan, fokus capaian perkembangan, dan catatan refleksi pedagogis harian.
            </p>
          </div>

          {authResult.granted && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl text-xs font-bold shrink-0"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Rencana Aktivitas Baru
            </Button>
          )}
        </div>

        {/* 2. FLAT CONTROLS (R-2 Kontrol Flat) */}
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-3 pt-2">
          <div 
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch {
                dateInputRef.current?.focus();
              }
            }}
            className="relative flex items-center justify-between bg-surface-subtle border border-line-hairline hover-only:border-brand-primary rounded-xl px-3 py-2 text-xs font-semibold text-ink cursor-pointer transition-all min-h-[44px] group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-ink font-bold">
                {(() => {
                  try {
                    const [y, m, d] = selectedDate.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    return dateObj.toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                  } catch {
                    return selectedDate;
                  }
                })()}
              </span>
            </div>
            
            <span className="text-[10px] font-semibold text-ink-soft bg-surface border border-line-soft px-2 py-1 rounded-md flex items-center gap-1 shrink-0 ml-2">
              Ubah ▾
            </span>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Pilih Tanggal Kegiatan"
            />
          </div>

          <div className="min-w-[200px]">
            <SelectSheet 
              value={selectedClassId} 
              onChange={setSelectedClassId} 
              options={classes.map(c => ({ value: c.id, label: c.name }))} 
            />
          </div>
        </div>
      </header>

      {/* Mode Warning */}
      {!authResult.granted && (
        <div className="border-l-2 border-warning-line pl-3 py-2 text-xs text-warning-deep flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning-deep shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mode Tinjauan Terbatas:</span> {authResult.reason}
          </div>
        </div>
      )}

      {/* 3. ACTIVITIES LIST (R-3 divide-y divide-line on Canvas) */}
      <div className="divide-y divide-line border-y border-line">
        {activities.map((act) => (
          <article 
            key={act.id} 
            className={`py-6 space-y-4 transition-colors ${
              act.completed ? 'bg-success-tint/10 -mx-4 px-4 rounded-xl' : ''
            }`}
          >
            {/* Header */}
            <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-subtle text-ink-soft font-bold flex items-center gap-1.5 whitespace-nowrap border border-line-hairline">
                    <Clock className="w-4 h-4 text-ink-faint" />
                    {act.timeSlot}
                  </span>
                  {act.completed && (
                    <span className="text-xs px-3 py-1 rounded-full bg-success-tint text-success-deep font-bold flex items-center gap-1 border border-success-line whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      Selesai Dilaksanakan
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-ink leading-snug pt-1">
                  {act.activityName}
                </h3>
                <p className="text-xs text-ink-soft">
                  Tema: <strong className="text-ink">{act.theme}</strong> • {act.subTheme}
                </p>
              </div>

              {!act.completed && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleToggleComplete(act)}
                  disabled={!authResult.granted}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  className="rounded-xl text-xs font-bold shrink-0 w-fit"
                >
                  Tandai Selesai
                </Button>
              )}
            </div>

            {/* Developmental Focus Badges */}
            <div className="flex flex-wrap gap-2">
              {act.developmentalFocus.map(d => {
                const dom = availableDomains.find(ad => ad.key === d);
                return (
                  <span key={d} className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold whitespace-nowrap ${dom?.bg || 'bg-surface-subtle'}`}>
                    {dom?.label || d}
                  </span>
                );
              })}
            </div>

            {/* Steps & Materials (R-3 flat) */}
            <div className="grid grid-cols-1 medium:grid-cols-2 gap-4 text-xs text-ink-soft pt-1">
              {act.materialsNeeded.length > 0 && (
                <div className="space-y-1">
                  <strong className="text-ink block">Alat &amp; Bahan:</strong>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {act.materialsNeeded.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {act.plannedSteps.length > 0 && (
                <div className="space-y-1">
                  <strong className="text-ink block">Langkah Alur Kegiatan:</strong>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    {act.plannedSteps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Reflection Note (R-4 Footnote Etis) */}
            {act.teacherReflection && (
              <div className="border-l-2 border-warning-line pl-3 py-1 space-y-1 text-xs">
                <span className="font-bold text-warning-deep block">
                  Refleksi &amp; Catatan Guru:
                </span>
                <p className="text-ink italic">
                  "{act.teacherReflection}"
                </p>
              </div>
            )}
          </article>
        ))}

        {activities.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-xs">
            Belum ada agenda aktivitas untuk tanggal ini. Klik "Rencana Aktivitas Baru" untuk membuat jadwal.
          </div>
        )}
      </div>

      {/* Modal Add Activity */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-floating border border-line-hairline max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h2 className="text-base font-bold text-ink">
                Rencana Aktivitas Pembelajaran TK
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-ink-soft hover-only:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Tema Utama</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    required
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Sub-Tema</label>
                  <input
                    type="text"
                    value={subTheme}
                    onChange={e => setSubTheme(e.target.value)}
                    required
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Nama Aktivitas</label>
                  <input
                    type="text"
                    placeholder="mis. Sentra Balok: Menara"
                    value={activityName}
                    onChange={e => setActivityName(e.target.value)}
                    required
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    required
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1.5">Fokus Capaian Perkembangan:</label>
                <div className="flex flex-wrap gap-2">
                  {availableDomains.map(d => {
                    const isChecked = selectedDomains.includes(d.key);
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => toggleDomainSelection(d.key)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isChecked 
                            ? 'bg-brand text-on-brand border-brand' 
                            : 'bg-surface-subtle text-ink-soft border-line-hairline'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Bahan &amp; Perlengkapan (Satu per baris):</label>
                <textarea
                  rows={3}
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  placeholder="Kertas gambar A3&#10;Cat warna primer&#10;Lap pembersih"
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Langkah Kegiatan (Satu per baris):</label>
                <textarea
                  rows={3}
                  value={steps}
                  onChange={e => setSteps(e.target.value)}
                  placeholder="1. Pijakan sebelum main&#10;2. Pijakan saat main&#10;3. Pijakan setelah main"
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-xl text-xs font-bold"
                >
                  Simpan Rencana
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Teacher Reflection */}
      {reflectionModalActivity && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-floating border border-line-hairline max-w-md w-full p-6 text-xs text-ink">
            <h3 className="text-base font-bold text-ink mb-1">
              Refleksi Guru Setelah Pelaksanaan
            </h3>
            <p className="text-ink-soft mb-3">
              Aktivitas: <strong className="text-ink">{reflectionModalActivity.activityName}</strong>
            </p>
            <div className="space-y-2">
              <label className="block font-bold text-ink-soft">
                Bagaimana respon anak-anak? Adakah yang memerlukan bimbingan khusus?
              </label>
              <textarea
                rows={4}
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Contoh: Seluruh anak antusias berpartisipasi. Kenzo menunjukkan inisiatif membagi giliran bermain balok..."
                className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 outline-none focus:ring-1 focus:ring-brand-primary resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-line">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReflectionModalActivity(null)}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveReflection}
                className="rounded-xl text-xs font-bold"
              >
                Simpan &amp; Selesaikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
