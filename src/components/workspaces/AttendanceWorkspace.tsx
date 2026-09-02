/**
 * Yapendik School OS — Domain 04: Attendance Register (Presensi Harian TK)
 * Clean & Neat Compact Layout with Explicit Unmarked Default (Amanaura Design System v3.0).
 * Enforces DENY_CLASS_UNASSIGNED for cross-class security, date navigation, and screening.
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { 
  AttendanceStatus, 
  ClassRoom 
} from '../../domain/types';
import { 
  Button, 
  AvatarChild, 
  SegmentedControl, 
  SegmentedControlOption,
  AutoResizeTextarea, 
  ToastHUD 
} from '../ui';
import { 
  CalendarCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Thermometer, 
  Save, 
  Users,
  CheckCheck,
  FileText,
  ShieldAlert,
  X
} from 'lucide-react';

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

const shiftDate = (dateStr: string, offsetDays: number): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offsetDays);
    const ny = dateObj.getFullYear();
    const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const nd = String(dateObj.getDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  } catch {
    return dateStr;
  }
};

export const AttendanceWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_maranatha_tka');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status?: AttendanceStatus;
    temperature: number;
    arrivalMood: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS';
    notes: string;
  }>>({});
  
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const loadData = () => {
    if (!securityContext) return;
    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);
    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      setSelectedClassId(clsList[0].id);
    }
    const studentList = db.getStudents(securityContext.activeSchoolId, selectedClassId);
    setStudents(studentList);

    const existing = db.getAttendance(securityContext.activeSchoolId, selectedDate, selectedClassId);
    const newMap: Record<string, any> = {};

    studentList.forEach(s => {
      const match = existing.find(e => e.studentId === s.id);
      if (match) {
        newMap[s.id] = {
          status: match.status,
          temperature: match.temperatureCelsius ?? 36.5,
          arrivalMood: match.arrivalMood || 'CERIA',
          notes: match.notes || ''
        };
      } else {
        // Explicit Unmarked Default (Belum Diabsen)
        newMap[s.id] = {
          status: undefined,
          temperature: 36.5,
          arrivalMood: 'CERIA',
          notes: ''
        };
      }
    });

    setAttendanceMap(newMap);
    setIsDirty(false);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedDate]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // SECURITY FIRST: DENY_CLASS_UNASSIGNED Evaluation
  // ═══════════════════════════════════════════════════════════════
  const authResult = evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'ATTENDANCE_REGISTER',
    resourceSchoolId: securityContext?.activeSchoolId || '',
    targetClassId: selectedClassId
  });
  const canEdit = authResult.granted;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!canEdit) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setIsDirty(true);
  };

  const handleMoodChange = (studentId: string, mood: any) => {
    if (!canEdit) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        arrivalMood: mood
      }
    }));
    setIsDirty(true);
  };

  const handleTempChange = (studentId: string, temp: number) => {
    if (!canEdit) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        temperature: temp
      }
    }));
    setIsDirty(true);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    if (!canEdit) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    if (!canEdit) return;
    setAttendanceMap(prev => {
      const updated: Record<string, any> = { ...prev };
      students.forEach(s => {
        updated[s.id] = {
          ...(updated[s.id] || {}),
          status: 'HADIR',
          temperature: updated[s.id]?.temperature ?? 36.5,
          arrivalMood: updated[s.id]?.arrivalMood || 'CERIA',
        };
      });
      return updated;
    });
    setIsDirty(true);
  };

  const handleSaveAll = () => {
    if (!canEdit) {
      alert(`Akses Ditolak: ${authResult.reason}`);
      return;
    }
    if (isSaving || !isDirty) return;

    const markedEntries = students.filter(s => attendanceMap[s.id]?.status);
    if (markedEntries.length === 0) {
      alert('Harap tandai kehadiran siswa terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      if (!securityContext) {
        setIsSaving(false);
        return;
      }

      const batchEntries = markedEntries.map(s => {
        const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
        const isHadir = row.status === 'HADIR';
        return {
          schoolId: securityContext.activeSchoolId,
          classId: selectedClassId,
          studentId: s.id,
          date: selectedDate,
          status: row.status as AttendanceStatus,
          notes: row.notes,
          recordedByPersonId: securityContext.personId,
          temperatureCelsius: isHadir ? row.temperature : undefined,
          arrivalMood: isHadir ? row.arrivalMood : undefined
        };
      });

      db.saveAttendanceBatch(
        batchEntries,
        securityContext.personName,
        securityContext.userId,
        securityContext.role
      );

      setIsSaving(false);
      setIsDirty(false);
      setShowToast(true);
    }, 300);
  };

  const statusSegments: SegmentedControlOption[] = [
    { id: 'HADIR', label: 'Hadir', activeClassName: 'bg-success text-on-brand shadow-hairline' },
    { id: 'SAKIT', label: 'Sakit', activeClassName: 'bg-warning text-on-brand shadow-hairline' },
    { id: 'IZIN', label: 'Izin', activeClassName: 'bg-info text-on-brand shadow-hairline' },
    { id: 'ALPA', label: 'Alpa', activeClassName: 'bg-danger text-on-brand shadow-hairline' }
  ];

  const classSegments = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'TK A' : c.name.includes('B') ? 'TK B' : c.name
  }));

  const moodButtons: { id: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS'; label: string; emoji: string }[] = [
    { id: 'CERIA', label: 'Ceria', emoji: '😊' },
    { id: 'TENANG', label: 'Stabil', emoji: '😐' },
    { id: 'GELISAH', label: 'Lesu', emoji: '🙁' },
    { id: 'MENANGIS', label: 'Rewel', emoji: '😭' }
  ];

  // Live Micro-Summary Counts
  const entries = Object.values(attendanceMap) as { status?: AttendanceStatus }[];
  const hadirCount = entries.filter(v => v.status === 'HADIR').length;
  const sakitCount = entries.filter(v => v.status === 'SAKIT').length;
  const izinCount = entries.filter(v => v.status === 'IZIN').length;
  const alpaCount = entries.filter(v => v.status === 'ALPA').length;
  const recordedCount = hadirCount + sakitCount + izinCount + alpaCount;
  const unrecordedCount = Math.max(0, students.length - recordedCount);
  const allPresent = hadirCount === students.length && students.length > 0;
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="space-y-3 pb-[140px] medium:pb-12">
      {/* ═══════════════════════════════════════════════════════════
          1. HEADER BAR (CLEAN, NEAT & UNCLUTTERED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-surface border-b border-line px-4 medium:px-6 py-4 space-y-3">
        {/* Row 1: Title + Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-lg medium:text-xl font-bold text-ink flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-accent-valor shrink-0" />
              <span>Buku Presensi Siswa</span>
            </h1>
            <p className="text-xs text-ink-soft">
              Pencatatan kehadiran harian dan skrining kedatangan anak didik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-hairline ${
                  allPresent
                    ? 'bg-success-tint/60 text-success-deep border-success-line'
                    : 'bg-success text-on-brand hover-only:bg-success-deep border-transparent shadow-soft active:scale-95'
                }`}
                title="Tandai seluruh siswa di kelas ini hadir"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{allPresent ? `Semua Hadir (${students.length})` : 'Tandai Semua Hadir'}</span>
              </button>
            )}

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                disabled={!canEdit || isSaving || !isDirty}
                onClick={handleSaveAll}
                leftIcon={<Save className="w-4 h-4" />}
                className="rounded-xl text-xs font-bold shadow-soft min-h-[38px]"
              >
                {isSaving 
                  ? 'Menyimpan...' 
                  : isDirty 
                    ? `Simpan Presensi (${recordedCount}/${students.length})` 
                    : recordedCount > 0 ? 'Tersimpan' : 'Belum Tersimpan'}
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Date Selector with Navigation + Class Switcher + Summary Pills */}
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
                aria-label="Pilih Tanggal Presensi"
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
              {recordedCount === 0 ? (
                <span className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-line font-medium text-ink-faint shadow-hairline">
                  Belum diabsen (0/{students.length})
                </span>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-line font-mono font-semibold text-ink shadow-hairline">
                    {hadirCount}/{students.length} <span className="font-sans text-[11px] text-ink-soft font-normal">Hadir</span>
                  </span>
                  {sakitCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-warning-tint border border-warning-line font-mono font-semibold text-warning-deep shadow-hairline">
                      {sakitCount} <span className="font-sans text-[11px] font-normal">Sakit</span>
                    </span>
                  )}
                  {izinCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-info-tint border border-info-line font-mono font-semibold text-info-deep shadow-hairline">
                      {izinCount} <span className="font-sans text-[11px] font-normal">Izin</span>
                    </span>
                  )}
                  {alpaCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-danger-tint border border-danger-line font-mono font-semibold text-danger-deep shadow-hairline">
                      {alpaCount} <span className="font-sans text-[11px] font-normal">Alpa</span>
                    </span>
                  )}
                  {unrecordedCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-line text-[11px] text-ink-faint">
                      {unrecordedCount} Belum
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECURITY FIRST: DENY_CLASS_UNASSIGNED READ-ONLY BANNER
          ═══════════════════════════════════════════════════════════ */}
      {!canEdit && (
        <div className="mx-4 medium:mx-6 bg-surface border border-warning-line/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-hairline animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldAlert className="w-4 h-4 text-warning-deep shrink-0" />
            <p className="text-xs text-ink leading-relaxed">
              <strong className="font-semibold text-warning-deep">Mode Hanya Baca (Read-Only):</strong> Anda tidak ditugaskan sebagai pendidik di rombel ini. Pencatatan kehadiran dan skrining kedatangan hanya dapat dilakukan oleh wali kelas bersangkutan.
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-warning-tint text-warning-deep border border-warning-line">
            READ ONLY
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          2. NEAT COMPACT ROWS (1 ROW PER STUDENT)
          ═══════════════════════════════════════════════════════════ */}
      {students.length > 0 ? (
        <div className="px-4 medium:px-6 space-y-2">
          {students.map((s, idx) => {
            const row = attendanceMap[s.id] || { status: undefined, temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
            const isFever = row.temperature >= 37.5;
            const isEditingNote = activeNoteStudentId === s.id;
            const studentPhoto = s.photoUrl || s.photo_url || s.person?.avatarUrl;
            const studentFullName = s.person?.fullName || s.full_name || 'Siswa';
            const studentCallName = s.person?.preferredName || studentFullName.split(' ')[0] || 'Anak';
            const isMarked = Boolean(row.status);

            return (
              <div
                key={s.id}
                className={`bg-surface border rounded-xl p-3 shadow-hairline transition-colors ${
                  !canEdit 
                    ? 'opacity-90 border-line' 
                    : isMarked 
                    ? 'border-line hover-only:border-brand/40' 
                    : 'border-line/70 bg-surface/80'
                }`}
              >
                {/* Main Compact Row */}
                <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3">
                  {/* Kolom 1 (Kiri): Nomor + Foto + Nama Siswa + NIS */}
                  <div className="flex items-center gap-2.5 min-w-0 medium:w-64 shrink-0">
                    <span className="font-mono text-xs font-semibold text-ink-faint w-5 shrink-0">
                      #{idx + 1}
                    </span>

                    {studentPhoto ? (
                      <img
                        src={studentPhoto}
                        alt={studentFullName}
                        className="w-9 h-9 rounded-lg object-cover border border-line shadow-hairline shrink-0"
                      />
                    ) : (
                      <AvatarChild
                        name={studentFullName}
                        id={s.nis || s.id}
                        size="sm"
                        showSymbol={false}
                        uniformColor={true}
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-bold text-ink text-xs medium:text-sm truncate leading-snug">
                        {studentFullName}
                      </p>
                      <p className="text-[11px] text-ink-soft truncate">
                        <span className="font-semibold text-ink">{studentCallName}</span> • <span className="font-mono text-[10px]">NIS {s.nis || s.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Kolom 2 (Tengah): 4-Segment Status Pills */}
                  <div className="w-full medium:w-64 shrink-0">
                    <SegmentedControl
                      options={statusSegments}
                      value={row.status || ''}
                      onChange={(val) => handleStatusChange(s.id, val as AttendanceStatus)}
                      disabled={!canEdit}
                      size="sm"
                      className="w-full min-h-[38px]"
                    />
                  </div>

                  {/* Kolom 3 (Kanan): Detail Kondisional Bersih */}
                  <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                    {row.status === 'HADIR' ? (
                      <>
                        {/* Mini Mood Pill Selector */}
                        <div className="flex items-center bg-surface-subtle border border-line rounded-lg p-0.5 shrink-0 animate-in fade-in duration-150">
                          {moodButtons.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              disabled={!canEdit}
                              onClick={() => handleMoodChange(s.id, m.id)}
                              className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                                row.arrivalMood === m.id
                                  ? 'bg-surface font-semibold text-ink shadow-hairline border border-line'
                                  : 'text-ink-faint hover-only:text-ink'
                              }`}
                              title={m.label}
                            >
                              <span className="text-sm">{m.emoji}</span>
                            </button>
                          ))}
                        </div>

                        {/* Compact Temperature Stepper */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-semibold shrink-0 animate-in fade-in duration-150 ${
                          isFever 
                            ? 'bg-warning-tint text-warning-deep border-warning-line' 
                            : 'bg-surface-subtle text-ink border-line'
                        }`}>
                          <Thermometer className={`w-3.5 h-3.5 shrink-0 ${isFever ? 'text-warning-deep' : 'text-accent-valor'}`} />
                          <span>{row.temperature.toFixed(1)}°C</span>
                          {canEdit && (
                            <div className="flex items-center ml-1 border-l border-line pl-1 gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleTempChange(s.id, Math.max(34.0, Math.round((row.temperature - 0.1) * 10) / 10))}
                                className="w-4 h-4 flex items-center justify-center hover-only:bg-line-soft rounded text-ink text-xs font-bold cursor-pointer"
                                title="Turunkan 0.1°C"
                              >
                                −
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTempChange(s.id, Math.min(42.0, Math.round((row.temperature + 0.1) * 10) / 10))}
                                className="w-4 h-4 flex items-center justify-center hover-only:bg-line-soft rounded text-ink text-xs font-bold cursor-pointer"
                                title="Naikkan 0.1°C"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Note Toggle Button */}
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => setActiveNoteStudentId(isEditingNote ? null : s.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 cursor-pointer ${
                            row.notes?.trim()
                              ? 'bg-brand-tint text-brand-deep border-brand-line'
                              : 'bg-surface-subtle text-ink-soft hover-only:text-ink border-line'
                          }`}
                          title={row.notes?.trim() ? `Catatan: ${row.notes}` : 'Tambah Catatan'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : row.status ? (
                      /* Alasan Ketidakhadiran (Sakit / Izin / Alpa) */
                      <div className="flex items-center gap-2 flex-1 min-w-0 animate-in fade-in duration-150">
                        <input
                          type="text"
                          disabled={!canEdit}
                          placeholder={
                            row.status === 'SAKIT' 
                              ? 'Keterangan sakit (misal: flu, demam)...' 
                              : row.status === 'IZIN' 
                              ? 'Alasan izin (misal: ada acara keluarga)...' 
                              : 'Keterangan alpa...'
                          }
                          value={row.notes}
                          onChange={(e) => handleNotesChange(s.id, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-line text-xs text-ink placeholder:text-ink-faint focus:border-brand outline-none"
                        />
                      </div>
                    ) : (
                      /* Status Belum Diabsen (Unmarked) */
                      <div className="flex items-center justify-end gap-2 text-xs text-ink-faint italic py-1">
                        <span>Pilih status di samping</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Expandable Note Drawer (Only when open) */}
                {isEditingNote && row.status === 'HADIR' && canEdit && (
                  <div className="mt-2.5 pt-2.5 border-t border-line-soft space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-ink-soft flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent-valor" />
                        Catatan Khusus Kedatangan ({studentCallName})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveNoteStudentId(null)}
                        className="text-xs text-ink-soft hover-only:text-ink p-1 cursor-pointer"
                        title="Tutup Catatan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <AutoResizeTextarea
                      minRows={2}
                      maxRows={4}
                      autoFocus
                      placeholder="Tulis catatan kondisi kesehatan, pesan orang tua saat antar, atau barang bawaan anak..."
                      value={row.notes}
                      onChange={(e) => handleNotesChange(s.id, e.target.value)}
                      className="bg-surface-subtle border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint p-2.5"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-dashed border-line-strong p-12 text-center text-ink-soft shadow-hairline mx-4">
          <Users className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink">Belum ada data siswa di kelas ini</h4>
          <p className="text-xs text-ink-soft mt-1">Pilih kelas lain atau tambahkan siswa melalui modul PPDB / Roster.</p>
        </div>
      )}

      {/* Floating Bottom Bar for Mobile / Compact view when dirty */}
      {canEdit && students.length > 0 && isDirty && (
        <div className="expanded:hidden fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+84px)] px-4 z-40 max-w-lg mx-auto pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="pointer-events-auto shadow-floating rounded-2xl bg-surface/95 backdrop-blur-md p-2 border border-line">
            <Button
              variant="primary"
              size="lg"
              disabled={!canEdit || isSaving || !isDirty}
              onClick={handleSaveAll}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full min-h-[48px] text-sm font-bold shadow-soft transition-all"
            >
              {isSaving 
                ? 'Menyimpan...' 
                : `Simpan Presensi • ${hadirCount}/${students.length}`}
            </Button>
          </div>
        </div>
      )}

      {/* ToastHUD Feedback */}
      {showToast && (
        <ToastHUD
          message={`Presensi kelas ${classSegments.find(c => c.id === selectedClassId)?.label || ''} tanggal ${formatDateID(selectedDate)} berhasil disimpan.`}
          type="success"
          onClose={() => setShowToast(false)}
          durationMs={3500}
        />
      )}
    </div>
  );
};
