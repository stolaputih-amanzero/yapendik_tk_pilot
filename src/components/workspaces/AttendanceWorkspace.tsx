/**
 * Yapendik School OS — Domain 04: Attendance Register (Presensi Harian TK)
 * Refactor Compact: Clean, Intuitive, Conditional (Amanaura Design System v1.0).
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
  Badge, 
  SegmentedControl, 
  SegmentedControlOption,
  AutoResizeTextarea, 
  ToastHUD 
} from '../ui';
import { 
  CalendarCheck, 
  Calendar, 
  Thermometer, 
  Save, 
  Users,
  Plus,
  FileText,
  Smile,
  Meh,
  Frown,
  Angry
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

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    status: AttendanceStatus;
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
          temperature: match.temperatureCelsius || 36.5,
          arrivalMood: match.arrivalMood || 'CERIA',
          notes: match.notes || ''
        };
      } else {
        newMap[s.id] = {
          status: 'HADIR',
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

  const authResult = evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'ATTENDANCE_REGISTER',
    resourceSchoolId: securityContext?.activeSchoolId || '',
    targetClassId: selectedClassId
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
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
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
    setIsDirty(true);
  };

  const handleSaveAll = () => {
    if (!authResult.granted) {
      alert(`Akses Ditolak: ${authResult.reason}`);
      return;
    }
    if (isSaving || !isDirty) return;

    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      if (!securityContext) {
        setIsSaving(false);
        return;
      }

      const batchEntries = students.map(s => {
        const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
        const isHadir = row.status === 'HADIR';
        return {
          schoolId: securityContext.activeSchoolId,
          classId: selectedClassId,
          studentId: s.id,
          date: selectedDate,
          status: row.status,
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

  const moodSegments: SegmentedControlOption[] = [
    { id: 'CERIA', label: 'Ceria', tooltip: 'Ceria / Senang', icon: <Smile className="w-4 h-4" />, hideLabel: true },
    { id: 'TENANG', label: 'Stabil', tooltip: 'Stabil / Tenang', icon: <Meh className="w-4 h-4" />, hideLabel: true },
    { id: 'GELISAH', label: 'Lesu', tooltip: 'Lesu / Lelah', icon: <Frown className="w-4 h-4" />, hideLabel: true },
    { id: 'MENANGIS', label: 'Rewel', tooltip: 'Rewel / Menangis', icon: <Angry className="w-4 h-4" />, hideLabel: true }
  ];

  const classSegments = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'TK A' : c.name.includes('B') ? 'TK B' : c.name
  }));

  // Live Micro-Summary Counts
  const entries = Object.values(attendanceMap) as { status: AttendanceStatus }[];
  const hadirCount = entries.filter(v => v.status === 'HADIR').length;
  const sakitCount = entries.filter(v => v.status === 'SAKIT').length;
  const izinCount = entries.filter(v => v.status === 'IZIN').length;
  const alpaCount = entries.filter(v => v.status === 'ALPA').length;
  const totalRecorded = hadirCount + sakitCount + izinCount + alpaCount;
  const belumCount = Math.max(0, students.length - totalRecorded);

  const getStatusDot = (status?: AttendanceStatus) => {
    switch (status) {
      case 'HADIR':
        return { bg: 'bg-success', label: 'Hadir' };
      case 'SAKIT':
        return { bg: 'bg-warning', label: 'Sakit' };
      case 'IZIN':
        return { bg: 'bg-info', label: 'Izin' };
      case 'ALPA':
        return { bg: 'bg-danger', label: 'Alpa' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER (COMPACT & EXPANDED ADAPTIVE) */}
      <div className="bg-surface border-b border-line-soft px-4 pt-4 pb-4 space-y-4">
        {/* Expanded Description & Desktop Save Action */}
        <div className="hidden expanded:flex expanded:items-center justify-between gap-4 pb-2 border-b border-line-hairline">
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2 font-display">
              <CalendarCheck className="w-5 h-5 text-success shrink-0" />
              Buku Presensi &amp; Skrining Kedatangan Siswa
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              Pencatatan kehadiran harian, pemeriksaan suhu tubuh anak, dan observasi mood kedatangan.
            </p>
          </div>

          {authResult.granted && (
            <Button
              variant="primary"
              size="sm"
              disabled={!authResult.granted || isSaving || !isDirty}
              onClick={handleSaveAll}
              leftIcon={<Save className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold shadow-soft transition-all shrink-0"
            >
              {isSaving 
                ? 'Menyimpan...' 
                : isDirty 
                  ? `Simpan Presensi (${totalRecorded}/${students.length})` 
                  : 'Tersimpan'}
            </Button>
          )}
        </div>

        {/* Control Bar: Adaptive Layout for Compact & Expanded */}
        <div className="flex flex-col expanded:flex-row items-stretch expanded:items-center gap-3">
          {/* Tanggal: Field SelectSheet/date */}
          <div 
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch {
                dateInputRef.current?.focus();
              }
            }}
            className="relative w-full expanded:w-72 flex items-center justify-between bg-surface border border-line hover-only:border-brand-primary rounded-xl px-3 py-2 text-xs font-medium text-ink cursor-pointer transition-all shadow-hairline group min-h-[44px] shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="font-mono tabular-nums font-bold text-ink text-xs whitespace-nowrap">
                {formatDateID(selectedDate)}
              </span>
            </div>
            <span className="text-ink-soft text-xs shrink-0 pl-1">
              ▾
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Pilih Tanggal Presensi"
            />
          </div>

          {/* Kelas: SegmentedControl ['TK A','TK B'] */}
          <div className="w-full expanded:w-64 shrink-0">
            <SegmentedControl
              options={classSegments}
              value={selectedClassId}
              onChange={setSelectedClassId}
              size="md"
              className="w-full min-h-[44px]"
            />
          </div>

          {/* Vertical Metric Cards (5 Columns: Total Recorded/Max + 4 Statuses) */}
          <div className="flex-1 min-w-0 grid grid-cols-5 gap-1.5 medium:gap-2">
            {/* 1. Total (Recorded / Total) */}
            <div className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center shadow-hairline min-h-[44px] transition-all ${
              totalRecorded === students.length && students.length > 0
                ? 'bg-surface border-brand-primary/40 text-ink'
                : 'bg-surface border-line text-ink'
            }`}>
              <span className="font-mono tabular-nums font-bold text-xs medium:text-sm text-ink leading-tight">
                {totalRecorded}/{students.length}
              </span>
              <span className="text-[10px] medium:text-[11px] font-medium text-ink-soft leading-tight mt-0.5 whitespace-nowrap">
                Total
              </span>
            </div>

            {/* 2. Hadir */}
            <div className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-success-tint/40 border border-success-line/60 text-center shadow-hairline min-h-[44px]">
              <span className="font-mono tabular-nums font-bold text-xs medium:text-sm text-success-deep leading-tight">
                {hadirCount}
              </span>
              <span className="text-[10px] medium:text-[11px] font-semibold text-success-deep leading-tight mt-0.5 whitespace-nowrap">
                Hadir
              </span>
            </div>

            {/* 3. Sakit */}
            <div className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all min-h-[44px] ${
              sakitCount > 0 
                ? 'bg-warning-tint/40 border-warning-line/60 text-warning-deep shadow-hairline' 
                : 'bg-surface border-line text-ink'
            }`}>
              <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${sakitCount > 0 ? 'text-warning-deep' : 'text-ink'}`}>
                {sakitCount}
              </span>
              <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${sakitCount > 0 ? 'font-semibold text-warning-deep' : 'font-medium text-ink-soft'}`}>
                Sakit
              </span>
            </div>

            {/* 4. Izin */}
            <div className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all min-h-[44px] ${
              izinCount > 0 
                ? 'bg-info-tint/40 border-info-line/60 text-info-deep shadow-hairline' 
                : 'bg-surface border-line text-ink'
            }`}>
              <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${izinCount > 0 ? 'text-info-deep' : 'text-ink'}`}>
                {izinCount}
              </span>
              <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${izinCount > 0 ? 'font-semibold text-info-deep' : 'font-medium text-ink-soft'}`}>
                Izin
              </span>
            </div>

            {/* 5. Alpa */}
            <div className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all min-h-[44px] ${
              alpaCount > 0 
                ? 'bg-danger-tint/40 border-danger-line/60 text-danger-deep shadow-hairline' 
                : 'bg-surface border-line text-ink'
            }`}>
              <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${alpaCount > 0 ? 'text-danger-deep' : 'text-ink'}`}>
                {alpaCount}
              </span>
              <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${alpaCount > 0 ? 'font-semibold text-danger-deep' : 'font-medium text-ink-soft'}`}>
                Alpa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIST ITEM (ATTENDANCE GRID / CHILD CARD) */}
      {students.length > 0 ? (
        <div className="px-4 medium:px-6 pt-2 pb-[160px]">
          <div className="grid grid-cols-1 expanded:grid-cols-2 large:grid-cols-3 gap-4">
            {students.map((s, idx) => {
              const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
              const isFever = row.temperature >= 37.5;
              const statusInfo = getStatusDot(row.status);
              const isEditingNote = activeNoteStudentId === s.id;
              const hasNotes = Boolean(row.notes && row.notes.trim().length > 0);

              return (
                <div 
                  key={s.id} 
                  className="bg-surface border border-line rounded-2xl p-4 shadow-hairline flex flex-col justify-between gap-3 hover-only:border-brand-primary/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Child Identity Header: Number/Dot, Avatar, Title Case Name, NIS */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-5 flex items-center justify-center shrink-0">
                        {statusInfo ? (
                          <span 
                            className={`w-2.5 h-2.5 rounded-full inline-block shadow-xs ${statusInfo.bg}`} 
                            title={statusInfo.label} 
                          />
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-ink-faint">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <AvatarChild
                        name={s.person?.fullName || 'Siswa'}
                        id={s.id}
                        size="md"
                        showSymbol
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-semibold leading-snug break-words normal-case text-ink">
                          {toTitleCase(s.person?.fullName || 'Siswa')}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="neutral">
                            NIS {s.nis || s.id}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Status: Contained SegmentedControl (h-11, w-full) */}
                    <div className="w-full pt-1">
                      <SegmentedControl
                        options={statusSegments}
                        value={row.status}
                        onChange={(val) => handleStatusChange(s.id, val as AttendanceStatus)}
                        size="sm"
                        className="w-full min-h-[44px]"
                      />
                    </div>

                    {/* Conditional Arrival Mood (Rendered ONLY when status === 'HADIR') */}
                    {row.status === 'HADIR' && (
                      <div className="w-full pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <SegmentedControl
                          options={moodSegments}
                          value={row.arrivalMood || 'CERIA'}
                          onChange={(val) => handleMoodChange(s.id, val)}
                          size="sm"
                          className="w-full min-h-[40px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Arrival Notes & Special Screening (Option B) */}
                  {(() => {
                    const isCustomTemp = row.temperature !== 36.5;
                    const hasSpecialDetail = hasNotes || (row.status === 'HADIR' && isCustomTemp);

                    return (
                      <div className="w-full pt-1 border-t border-line-hairline">
                        {isEditingNote ? (
                          <div className="space-y-2.5 animate-in fade-in duration-150 bg-surface-subtle/50 p-3 rounded-xl border border-line-soft">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-ink-soft flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                Catatan &amp; Skrining Khusus
                              </label>
                              <button
                                type="button"
                                onClick={() => setActiveNoteStudentId(null)}
                                className="text-[11px] font-semibold text-brand-primary hover-only:underline cursor-pointer"
                              >
                                Selesai
                              </button>
                            </div>

                            {/* Temperature Stepper inside Screening Panel (HADIR-only) */}
                            {row.status === 'HADIR' && (
                              <div className={`flex items-center justify-between gap-3 border rounded-xl px-3 py-2 transition-colors ${
                                isFever 
                                  ? 'bg-warning-tint text-warning-deep border-warning-line' 
                                  : 'bg-surface border-line text-ink'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <Thermometer className={`w-4 h-4 shrink-0 ${isFever ? 'text-warning-deep' : 'text-brand-primary'}`} />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-medium text-ink-soft">Suhu Tubuh</span>
                                    <span className="font-mono tabular-nums font-bold text-xs">
                                      {row.temperature.toFixed(1)} °C {isFever && <span className="text-[10px] text-warning-deep font-bold ml-1">(Demam)</span>}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={!authResult.granted || row.temperature <= 34.0}
                                    onClick={() => handleTempChange(s.id, Math.max(34.0, Math.round((row.temperature - 0.1) * 10) / 10))}
                                    className="w-7 h-7 rounded-lg bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                                    title="Turunkan 0.1°C"
                                  >
                                    −
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!authResult.granted || row.temperature >= 42.0}
                                    onClick={() => handleTempChange(s.id, Math.min(42.0, Math.round((row.temperature + 0.1) * 10) / 10))}
                                    className="w-7 h-7 rounded-lg bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                                    title="Naikkan 0.1°C"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* AutoResize Textarea */}
                            <AutoResizeTextarea
                              minRows={2}
                              maxRows={4}
                              autoFocus
                              disabled={!authResult.granted}
                              placeholder="Tulis catatan kondisi kedatangan, kesehatan, atau penjemputan anak..."
                              value={row.notes}
                              onChange={(e) => handleNotesChange(s.id, e.target.value)}
                              className="bg-surface border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint focus:border-brand-primary p-3"
                            />
                          </div>
                        ) : hasSpecialDetail ? (
                          <div 
                            onClick={() => setActiveNoteStudentId(s.id)}
                            className="flex items-center justify-between gap-2 text-xs bg-surface-subtle hover-only:bg-surface-subtle/80 px-3 py-2 rounded-xl border border-line-soft cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                              {row.status === 'HADIR' && isCustomTemp && (
                                <Badge variant={isFever ? 'warning' : 'neutral'}>
                                  <Thermometer className="w-3 h-3 mr-0.5 inline" />
                                  {row.temperature.toFixed(1)} °C
                                </Badge>
                              )}
                              {hasNotes ? (
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <FileText className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                  <span className="text-ink text-xs line-clamp-1 truncate font-medium">
                                    {row.notes}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-ink-soft text-xs italic font-medium">
                                  Suhu tercatat
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-ink-soft bg-surface border border-line-soft px-2 py-1 rounded shrink-0">
                              Ubah
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!authResult.granted}
                            onClick={() => setActiveNoteStudentId(s.id)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft hover-only:text-ink py-2 px-3 rounded-xl border border-dashed border-line-soft hover-only:border-brand-primary/50 bg-surface-subtle/30 hover-only:bg-surface-subtle transition-all cursor-pointer min-h-[44px]"
                          >
                            <Plus className="w-4 h-4 text-brand-primary shrink-0" />
                            <span>Catatan</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-dashed border-line-strong p-12 text-center text-ink-soft shadow-hairline mx-4">
          <Users className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink">Belum ada data siswa di kelas ini</h4>
          <p className="text-xs text-ink-soft mt-1">Pilih kelas lain atau tambahkan siswa melalui modul PPDB / Roster.</p>
        </div>
      )}

      {/* 3. ACTION DOCK STICKY (BOTTOM FIXED - COMPACT ONLY) */}
      {authResult.granted && students.length > 0 && (
        <div className="expanded:hidden fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+84px)] px-4 z-40 max-w-lg mx-auto pointer-events-none">
          <div className="pointer-events-auto shadow-floating rounded-2xl bg-surface/95 backdrop-blur-md p-2 border border-line">
            <Button
              variant="primary"
              size="lg"
              disabled={!authResult.granted || isSaving || !isDirty}
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
          message={`Presensi kelas ${classSegments.find(c => c.id === selectedClassId)?.label || ''} berhasil disimpan.`}
          type="success"
          onClose={() => setShowToast(false)}
          durationMs={3500}
        />
      )}
    </div>
  );
};
