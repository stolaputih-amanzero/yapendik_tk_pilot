/**
 * Yapendik School OS — Domain 04: Attendance Register (Presensi Harian TK)
 * Clean & Neat Compact Layout with Explicit Unmarked Default (Amanaura Design System v3.0).
 * Enforces DENY_CLASS_UNASSIGNED for cross-class security, date navigation, and screening.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

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
  X,
  BarChart3,
  Palmtree,
  CalendarOff,
  Coffee
} from 'lucide-react';
import { MonthlyAttendanceReport } from '../attendance/MonthlyAttendanceReport';
import { holidayService, HolidayEntry } from '../../services/holidayService';


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

const isWeekend = (dateStr: string): boolean => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const day = dateObj.getDay();
    return day === 0 || day === 6;
  } catch {
    return false;
  }
};

const shiftSchoolDate = (dateStr: string, direction: 1 | -1, schoolId?: string): string => {
  return holidayService.shiftSchoolDate(dateStr, direction, schoolId, true);
};


export const AttendanceWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentDateRef = useRef<string>(getTodayDateString());

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return securityContext?.assignedClasses?.[0] || 'cls_maranatha_tka';
  });
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status?: AttendanceStatus;
    temperature: number;
    arrivalMood: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS';
    notes: string;
  }>>({});
  
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus | 'UNMARKED'>('ALL');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showSpecialAttendanceForm, setShowSpecialAttendanceForm] = useState(false);
  const [holidaysVersion, setHolidaysVersion] = useState(0);

  // Subscribe to holidayService updates
  useEffect(() => {
    holidayService.revalidateYear(parseInt(selectedDate.split('-')[0], 10));
    const unsubscribe = holidayService.subscribe(() => {
      setHolidaysVersion(v => v + 1);
    });
    return unsubscribe;
  }, [selectedDate]);

  const todayHoliday = useMemo(() => {
    return holidayService.isHoliday(selectedDate, securityContext?.activeSchoolId);
  }, [selectedDate, securityContext?.activeSchoolId, holidaysVersion]);

  // Reset special form toggle whenever date changes
  useEffect(() => {
    setShowSpecialAttendanceForm(false);
  }, [selectedDate]);


  // Midnight Auto-Rollover & Visibility Sync
  useEffect(() => {
    const checkDateRollover = () => {
      const today = getTodayDateString();
      if (today !== currentDateRef.current) {
        currentDateRef.current = today;
        setSelectedDate(today);
      }
    };

    const interval = setInterval(checkDateRollover, 60000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDateRollover();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Update selected class if user context changes
  useEffect(() => {
    if (securityContext?.assignedClasses && securityContext.assignedClasses.length > 0) {
      if (!securityContext.assignedClasses.includes(selectedClassId)) {
        setSelectedClassId(securityContext.assignedClasses[0]);
      }
    }
  }, [securityContext?.assignedClasses]);

  const loadData = () => {
    if (!securityContext) return;
    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);
    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      const preferred = clsList.find(c => securityContext.assignedClasses?.includes(c.id));
      setSelectedClassId(preferred ? preferred.id : clsList[0].id);
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
    { id: 'HADIR', label: 'Hadir', activeClassName: 'bg-success text-on-brand font-bold shadow-sm ring-1 ring-success-line' },
    { id: 'SAKIT', label: 'Sakit', activeClassName: 'bg-warning text-on-brand font-bold shadow-sm ring-1 ring-warning-line' },
    { id: 'IZIN', label: 'Izin', activeClassName: 'bg-info text-on-brand font-bold shadow-sm ring-1 ring-info-line' },
    { id: 'ALPA', label: 'Alpa', activeClassName: 'bg-danger text-on-brand font-bold shadow-sm ring-1 ring-danger-line' }
  ];

  const classSegments: SegmentedControlOption[] = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'Kelas TK A' : c.name.includes('B') ? 'Kelas TK B' : c.name,
    activeClassName: 'bg-brand text-on-brand font-bold shadow-sm ring-1 ring-brand/50'
  }));

  const moodButtons: { 
    id: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS'; 
    label: string; 
    emoji: string;
    activeClassName: string;
    inactiveBadgeClassName: string;
  }[] = [
    { 
      id: 'CERIA', 
      label: 'Ceria', 
      emoji: '😊', 
      activeClassName: 'bg-success-tint text-success-deep border-success-line ring-1 ring-success font-bold',
      inactiveBadgeClassName: 'hover-only:bg-success-tint/50'
    },
    { 
      id: 'TENANG', 
      label: 'Stabil', 
      emoji: '😐', 
      activeClassName: 'bg-info-tint text-info-deep border-info-line ring-1 ring-info font-bold',
      inactiveBadgeClassName: 'hover-only:bg-info-tint/50'
    },
    { 
      id: 'GELISAH', 
      label: 'Lesu', 
      emoji: '🙁', 
      activeClassName: 'bg-warning-tint text-warning-deep border-warning-line ring-1 ring-warning font-bold',
      inactiveBadgeClassName: 'hover-only:bg-warning-tint/50'
    },
    { 
      id: 'MENANGIS', 
      label: 'Rewel', 
      emoji: '😭', 
      activeClassName: 'bg-danger-tint text-danger-deep border-danger-line ring-1 ring-danger font-bold',
      inactiveBadgeClassName: 'hover-only:bg-danger-tint/50'
    }
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

  // Filtered student list based on active status filter
  const filteredStudents = students.filter(s => {
    if (statusFilter === 'ALL') return true;
    const row = attendanceMap[s.id];
    if (statusFilter === 'UNMARKED') return !row?.status;
    return row?.status === statusFilter;
  });

  return (
    <div className="space-y-3 pb-[120px] expanded:pb-12">
      {/* ═══════════════════════════════════════════════════════════
          HEADER: 5-ROW STRUCTURED CONTROLS
          1. Tabs: Harian & Bulanan
          2. Pilihan Kelas
          3. Pilihan Tanggal
          4. Status Filters & Stats (Hadir, Sakit, Izin, Alpa, Belum)
          5. Primary Actions: Tandai Semua Hadir & Simpan
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-surface rounded-2xl border border-line p-3.5 sm:p-4 expanded:p-5 shadow-hairline space-y-3">
        {/* BARIS 1: Tab Harian & Bulanan */}
        <div className="flex items-center justify-between gap-3">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-subtle border border-line gap-1 select-none w-full sm:w-72">
            <button
              type="button"
              onClick={() => setActiveMode('DAILY')}
              className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'DAILY'
                  ? 'bg-brand text-on-brand shadow-sm ring-1 ring-brand/50'
                  : 'text-ink-soft hover-only:text-ink hover-only:bg-surface/50'
              }`}
            >
              <CalendarCheck className={`w-3.5 h-3.5 ${activeMode === 'DAILY' ? 'text-on-brand' : 'text-accent-valor'}`} />
              <span>Harian</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('MONTHLY')}
              className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'MONTHLY'
                  ? 'bg-brand text-on-brand shadow-sm ring-1 ring-brand/50'
                  : 'text-ink-soft hover-only:text-ink hover-only:bg-surface/50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${activeMode === 'MONTHLY' ? 'text-on-brand' : 'text-accent-valor'}`} />
              <span>Bulanan</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-ink-soft">
            <CalendarCheck className="w-4 h-4 text-accent-valor mr-1.5 shrink-0" />
            <span className="font-semibold text-ink">Buku Presensi</span>
          </div>
        </div>

        {/* BARIS 2: Pilihan Kelas */}
        <div className="w-full">
          <SegmentedControl
            options={classSegments}
            value={selectedClassId}
            onChange={(val) => {
              setSelectedClassId(val);
              setStatusFilter('ALL');
            }}
            size="sm"
            className="w-full min-h-[36px]"
          />
        </div>

        {activeMode === 'DAILY' && (
          <>
            {/* BARIS 3: Pilihan Tanggal (chevron kiri/kanan & badge hari ini) */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-line-soft/60">
              <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(shiftSchoolDate(selectedDate, -1, securityContext?.activeSchoolId));
                    setStatusFilter('ALL');
                  }}
                  className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0 transition-colors"
                  title="Hari Sekolah Sebelumnya (Senin–Jumat)"
                  aria-label="Hari Sekolah Sebelumnya"
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
                  className="relative flex-1 sm:flex-initial min-h-[36px] px-3 py-1.5 rounded-xl bg-surface border border-line hover-only:border-brand flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-ink cursor-pointer shadow-hairline select-none transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent-valor shrink-0" />
                  <span className="font-mono font-bold text-xs whitespace-nowrap">{formatDateID(selectedDate)}</span>
                  <span className="text-ink-soft text-[10px] pl-0.5">▾</span>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setStatusFilter('ALL');
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Pilih Tanggal Presensi"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(shiftSchoolDate(selectedDate, 1, securityContext?.activeSchoolId));
                    setStatusFilter('ALL');
                  }}
                  className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0 transition-colors"
                  title="Hari Sekolah Berikutnya (Senin–Jumat)"
                  aria-label="Hari Sekolah Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                {todayHoliday ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium border select-none shadow-hairline ${
                    todayHoliday.isCutiBersama 
                      ? 'bg-warning-tint text-warning-deep border-warning-line' 
                      : todayHoliday.source === 'CUSTOM_SCHOOL'
                      ? 'bg-brand/10 text-brand border-brand/20'
                      : 'bg-info-tint text-info-deep border-info-line'
                  }`}
                  title={`${todayHoliday.name} (${todayHoliday.date})`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      todayHoliday.isCutiBersama ? 'bg-warning' : todayHoliday.source === 'CUSTOM_SCHOOL' ? 'bg-brand' : 'bg-info'
                    }`} />
                    <span className="truncate max-w-[130px] sm:max-w-[200px]">Libur: {todayHoliday.name}</span>
                  </span>
                ) : isWeekend(selectedDate) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-subtle text-ink-soft border border-line text-[11px] font-medium select-none shadow-hairline">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-faint inline-block" />
                    Akhir Pekan
                  </span>
                ) : null}

                {!isToday && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(getTodayDateString());
                      setStatusFilter('ALL');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-surface-subtle border border-line text-xs font-semibold text-accent-valor hover-only:bg-surface cursor-pointer shrink-0 transition-colors shadow-hairline"
                  >
                    Hari Ini
                  </button>
                )}
              </div>
            </div>

            {/* Show Baris 4 & Baris 5 only on school days, or when special attendance form is opened on a holiday */}
            {(!todayHoliday || showSpecialAttendanceForm) && (
              <>
                {/* BARIS 4: Status Pills & Stats (Clickable Filter: Hadir, Sakit, Izin, Alpa, Belum) */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1 border-t border-line-soft/60">
                  {/* Hadir Pill */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'HADIR' ? 'ALL' : 'HADIR')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-hairline ${
                      statusFilter === 'HADIR'
                        ? 'bg-success text-on-brand border-success-line ring-2 ring-success/30 font-bold'
                        : hadirCount > 0
                        ? 'bg-surface border-line text-ink hover-only:bg-surface-subtle'
                        : 'bg-surface-subtle border-line text-ink-soft hover-only:bg-surface'
                    }`}
                    title={statusFilter === 'HADIR' ? 'Klik untuk tampilkan semua siswa' : 'Filter siswa Hadir'}
                  >
                    <span className={statusFilter === 'HADIR' ? 'font-mono font-bold text-on-brand' : 'font-mono font-bold text-ink'}>
                      {hadirCount}/{students.length}
                    </span>
                    <span className={statusFilter === 'HADIR' ? 'text-on-brand/90 font-bold' : 'text-ink-soft'}>Hadir</span>
                  </button>

                  {/* Sakit Pill */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'SAKIT' ? 'ALL' : 'SAKIT')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-hairline ${
                      statusFilter === 'SAKIT'
                        ? 'bg-warning text-on-brand border-warning-line ring-2 ring-warning/30 font-bold'
                        : sakitCount > 0
                        ? 'bg-warning-tint text-warning-deep border-warning-line hover-only:bg-warning-tint/80 font-semibold'
                        : 'bg-surface-subtle border-line text-ink-soft hover-only:bg-surface'
                    }`}
                    title={statusFilter === 'SAKIT' ? 'Klik untuk tampilkan semua siswa' : 'Filter siswa Sakit'}
                  >
                    <span className="font-mono font-bold">{sakitCount}</span>
                    <span>Sakit</span>
                  </button>

                  {/* Izin Pill */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'IZIN' ? 'ALL' : 'IZIN')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-hairline ${
                      statusFilter === 'IZIN'
                        ? 'bg-info text-on-brand border-info-line ring-2 ring-info/30 font-bold'
                        : izinCount > 0
                        ? 'bg-info-tint text-info-deep border-info-line hover-only:bg-info-tint/80 font-semibold'
                        : 'bg-surface-subtle border-line text-ink-soft hover-only:bg-surface'
                    }`}
                    title={statusFilter === 'IZIN' ? 'Klik untuk tampilkan semua siswa' : 'Filter siswa Izin'}
                  >
                    <span className="font-mono font-bold">{izinCount}</span>
                    <span>Izin</span>
                  </button>

                  {/* Alpa Pill */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'ALPA' ? 'ALL' : 'ALPA')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-hairline ${
                      statusFilter === 'ALPA'
                        ? 'bg-danger text-on-brand border-danger-line ring-2 ring-danger/30 font-bold'
                        : alpaCount > 0
                        ? 'bg-danger-tint text-danger-deep border-danger-line hover-only:bg-danger-tint/80 font-semibold'
                        : 'bg-surface-subtle border-line text-ink-soft hover-only:bg-surface'
                    }`}
                    title={statusFilter === 'ALPA' ? 'Klik untuk tampilkan semua siswa' : 'Filter siswa Alpa'}
                  >
                    <span className="font-mono font-bold">{alpaCount}</span>
                    <span>Alpa</span>
                  </button>

                  {/* Belum Pill */}
                  {unrecordedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter(statusFilter === 'UNMARKED' ? 'ALL' : 'UNMARKED')}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-hairline ${
                        statusFilter === 'UNMARKED'
                          ? 'bg-ink text-on-brand border-ink ring-2 ring-ink/30 font-bold'
                          : 'bg-surface-subtle border-line text-ink-faint hover-only:text-ink hover-only:bg-surface'
                      }`}
                      title={statusFilter === 'UNMARKED' ? 'Klik untuk tampilkan semua siswa' : 'Filter siswa yang belum diabsen'}
                    >
                      <span className="font-mono font-bold">{unrecordedCount}</span>
                      <span>Belum</span>
                    </button>
                  )}

                  {/* Filter Reset Button */}
                  {statusFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-accent-valor hover-only:underline cursor-pointer ml-auto"
                    >
                      Semua ({students.length}) ✕
                    </button>
                  )}
                </div>

                {/* BARIS 5: Tandai Semua Hadir & Simpan / Belum Tersimpan */}
                {canEdit && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line-soft/60">
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      className={`min-h-[38px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-hairline active:scale-98 ${
                        allPresent
                          ? 'bg-success-tint/60 text-success-deep border-success-line'
                          : 'bg-success text-on-brand hover-only:bg-success-deep border-transparent shadow-soft'
                      }`}
                      title="Tandai seluruh siswa di kelas ini hadir"
                    >
                      <CheckCheck className="w-4 h-4 shrink-0" />
                      <span className="truncate">{allPresent ? `Semua Hadir (${students.length})` : 'Tandai Semua Hadir'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canEdit || isSaving || !isDirty}
                      onClick={handleSaveAll}
                      className={`min-h-[38px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 ${
                        isSaving
                          ? 'bg-brand/80 text-on-brand border-transparent cursor-wait'
                          : isDirty
                          ? 'bg-brand text-on-brand hover-only:bg-brand-deep border-transparent shadow-soft'
                          : 'bg-surface-subtle text-ink-faint border-line opacity-75 cursor-not-allowed'
                      }`}
                      title={isDirty ? `Simpan perubahan presensi (${recordedCount}/${students.length})` : 'Belum ada perubahan baru'}
                    >
                      <Save className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {isSaving 
                          ? 'Menyimpan...' 
                          : isDirty 
                          ? `Simpan (${recordedCount}/${students.length})` 
                          : recordedCount > 0 
                          ? 'Tersimpan' 
                          : 'Belum Tersimpan'}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. BODY: MONTHLY REPORT OR DAILY ATTENDANCE
          ═══════════════════════════════════════════════════════════ */}
      {activeMode === 'MONTHLY' ? (
        <MonthlyAttendanceReport
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          classes={classes}
          onSwitchToDaily={() => setActiveMode('DAILY')}
        />
      ) : todayHoliday && !showSpecialAttendanceForm ? (
        /* ═══════════════════════════════════════════════════════════
           THE "CALM MORNING" HOLIDAY STATE (Part VI §6.4 & Hukum 11)
           ═══════════════════════════════════════════════════════════ */
        <div className="bg-surface rounded-2xl border border-line p-6 sm:p-8 text-center shadow-hairline space-y-4 max-w-xl mx-auto my-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-info-tint text-info-deep border border-info-line mx-auto flex items-center justify-center shadow-hairline">
            <Palmtree className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-info-tint text-info-deep text-xs font-mono font-medium border border-info-line select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-info" />
              {todayHoliday.isCutiBersama ? 'Cuti Bersama' : todayHoliday.source === 'CUSTOM_SCHOOL' ? 'Libur Khusus Sekolah' : 'Hari Libur Nasional'}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink tracking-tight">
              {todayHoliday.name}
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed max-w-md mx-auto">
              Hari ini adalah hari libur resmi. Selamat beristirahat dan menikmati hari bersama keluarga, Bapak/Ibu Guru.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle border border-line text-[11px] text-ink-soft space-y-1 text-left sm:text-center max-w-md mx-auto">
            <p className="font-semibold text-ink flex items-center justify-start sm:justify-center gap-1.5">
              <CalendarOff className="w-3.5 h-3.5 text-accent-valor shrink-0" />
              <span>Denominator Exclusion Aktif</span>
            </p>
            <p className="text-ink-faint leading-normal">
              Sistem secara otomatis mengeluarkan tanggal ini dari perhitungan hari efektif KBM. Siswa tidak dihitung alpa.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowSpecialAttendanceForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line text-xs font-medium text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle cursor-pointer transition-colors shadow-hairline"
            >
              <Calendar className="w-3.5 h-3.5 text-accent-valor" />
              <span>Ada kegiatan khusus hari ini? Buka Formulir Presensi</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Special Attendance Notice for Holidays */}
          {todayHoliday && showSpecialAttendanceForm && (
            <div className="bg-info-tint border border-info-line rounded-xl p-3 flex items-center justify-between gap-3 shadow-hairline">
              <div className="flex items-center gap-2 text-xs text-info-deep font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-info shrink-0" />
                <span>Mode Presensi Khusus ({todayHoliday.name})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecialAttendanceForm(false)}
                className="px-2.5 py-1 rounded-lg bg-surface border border-info-line text-xs text-ink-soft hover-only:text-ink font-medium cursor-pointer shadow-hairline"
              >
                Kembali ke Mode Santai
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SECURITY FIRST: DENY_CLASS_UNASSIGNED READ-ONLY BANNER
              ═══════════════════════════════════════════════════════════ */}
          {!canEdit && (
            <div className="bg-surface border border-warning-line/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-hairline animate-in fade-in duration-150">
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
        <div className="space-y-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, idx) => {
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
                  <div className="flex flex-col large:flex-row large:items-center justify-between gap-3">
                    {/* Kolom 1 (Kiri): Nomor + Foto + Nama Siswa + NIS (Full name without truncate; no redundant badge) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 large:w-64 shrink-0">
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
                        <p className="font-sans font-bold text-ink text-xs sm:text-sm leading-snug break-words">
                          {studentFullName}
                        </p>
                        <p className="text-[11px] text-ink-soft">
                          <span className="font-semibold text-ink">{studentCallName}</span> • <span className="font-mono text-[10px]">NIS {s.nis || s.id}</span>
                        </p>
                      </div>
                    </div>

                    {/* Kolom 2 (Tengah): 4-Segment Status Pills */}
                    <div className="w-full large:w-64 shrink-0">
                      <SegmentedControl
                        options={statusSegments}
                        value={row.status || ''}
                        onChange={(val) => handleStatusChange(s.id, val as AttendanceStatus)}
                      disabled={!canEdit}
                      size="sm"
                      className="w-full min-h-[38px]"
                    />
                  </div>

                  {/* Kolom 3 (Kanan): Detail Kondisional */}
                  {row.status === 'HADIR' ? (
                    <>
                      {/* Desktop Screening Row (>= large: 1200px) */}
                      <div className="hidden large:flex items-center justify-end gap-2 w-auto animate-in fade-in duration-150">
                        {/* Mini Mood Pill Selector with High Visibility */}
                        <div className="flex items-center bg-surface-subtle border border-line rounded-lg p-0.5 shrink-0 gap-0.5">
                          {moodButtons.map((m) => {
                            const isSelected = row.arrivalMood === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => handleMoodChange(s.id, m.id)}
                                className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-all cursor-pointer select-none border ${
                                  isSelected
                                    ? `${m.activeClassName} shadow-hairline scale-[1.02]`
                                    : `border-transparent text-ink-soft opacity-60 hover-only:opacity-100 ${m.inactiveBadgeClassName}`
                                }`}
                                title={`Kondisi Kedatangan: ${m.label}`}
                                aria-label={`Mood ${m.label}`}
                              >
                                <span className="text-sm leading-none">{m.emoji}</span>
                                <span className={`text-[11px] leading-none ${isSelected ? 'font-bold' : 'font-medium hidden large:inline'}`}>
                                  {m.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Compact Temperature Stepper */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-semibold shrink-0 ${
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
                      </div>

                      {/* Mobile & Compact Tablet Screening Row (< large: < 1200px) */}
                      <div className="large:hidden space-y-2 pt-2 border-t border-line-hairline w-full animate-in fade-in duration-150">
                        {/* 4 Mood Buttons Grid */}
                        <div className="grid grid-cols-4 gap-1 w-full bg-surface-subtle border border-line rounded-lg p-0.5">
                          {moodButtons.map((m) => {
                            const isSelected = row.arrivalMood === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => handleMoodChange(s.id, m.id)}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs transition-all cursor-pointer select-none border ${
                                  isSelected
                                    ? `${m.activeClassName} shadow-hairline scale-[1.02]`
                                    : `border-transparent text-ink-soft opacity-60 hover-only:opacity-100 ${m.inactiveBadgeClassName}`
                                }`}
                                title={`Kondisi: ${m.label}`}
                                aria-label={`Mood ${m.label}`}
                              >
                                <span className="text-sm leading-none">{m.emoji}</span>
                                <span className={`text-[11px] leading-none ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                  {m.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Temperature & Notes Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold shrink-0 ${
                            isFever 
                              ? 'bg-warning-tint text-warning-deep border-warning-line' 
                              : 'bg-surface-subtle text-ink border-line'
                          }`}>
                            <Thermometer className={`w-3.5 h-3.5 shrink-0 ${isFever ? 'text-warning-deep' : 'text-accent-valor'}`} />
                            <span>{row.temperature.toFixed(1)}°C</span>
                            {canEdit && (
                              <div className="flex items-center ml-1 border-l border-line pl-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleTempChange(s.id, Math.max(34.0, Math.round((row.temperature - 0.1) * 10) / 10))}
                                  className="w-5 h-5 flex items-center justify-center hover-only:bg-line-soft rounded text-ink text-xs font-bold cursor-pointer"
                                  title="Turunkan 0.1°C"
                                >
                                  −
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTempChange(s.id, Math.min(42.0, Math.round((row.temperature + 0.1) * 10) / 10))}
                                  className="w-5 h-5 flex items-center justify-center hover-only:bg-line-soft rounded text-ink text-xs font-bold cursor-pointer"
                                  title="Naikkan 0.1°C"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => setActiveNoteStudentId(isEditingNote ? null : s.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors shrink-0 cursor-pointer ${
                              row.notes?.trim()
                                ? 'bg-brand-tint text-brand-deep border-brand-line font-medium'
                                : 'bg-surface-subtle text-ink-soft hover-only:text-ink border-line'
                            }`}
                            title={row.notes?.trim() ? `Catatan: ${row.notes}` : 'Tambah Catatan'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{row.notes?.trim() ? 'Catatan Disimpan' : 'Tambah Catatan'}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : row.status ? (
                    /* Alasan Ketidakhadiran (Sakit / Izin / Alpa) */
                    <div className="flex items-center gap-2 w-full large:w-auto flex-1 min-w-0 pt-2 large:pt-0 border-t border-line-hairline large:border-t-0 animate-in fade-in duration-150">
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
                    /* Status Belum Diabsen (Unmarked) - hidden on mobile/compact so unmarked cards are clean & compact */
                    <div className="hidden large:flex items-center justify-end gap-2 text-xs text-ink-faint italic py-1">
                      <span>Pilih status di samping</span>
                    </div>
                  )}
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
          })
        ) : (
          <div className="bg-surface rounded-2xl border border-line p-8 text-center space-y-2 shadow-hairline">
            <p className="text-xs text-ink-soft">
              Tidak ada siswa dengan status filter <strong className="font-semibold text-ink">{statusFilter}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="px-3.5 py-1.5 rounded-xl bg-brand text-on-brand text-xs font-bold shadow-soft cursor-pointer transition-all hover-only:bg-brand-deep"
            >
              Tampilkan Semua Siswa ({students.length})
            </button>
          </div>
        )}
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-dashed border-line-strong p-12 text-center text-ink-soft shadow-hairline">
          <Users className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink">Belum ada data siswa di kelas ini</h4>
          <p className="text-xs text-ink-soft mt-1">Pilih kelas lain atau tambahkan siswa melalui modul PPDB / Roster.</p>
        </div>
      )}

      {/* Sleek Centered Floating Save Pill for Mobile / Compact view when dirty */}
      {canEdit && students.length > 0 && isDirty && (
        <div className="expanded:hidden fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+44px)] px-4 z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150 flex justify-center">
          <button
            type="button"
            disabled={!canEdit || isSaving || !isDirty}
            onClick={handleSaveAll}
            className="pointer-events-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand text-on-brand font-bold text-xs shadow-floating hover-only:bg-brand-deep cursor-pointer active:scale-95 transition-all border border-brand-deep/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : `Simpan Presensi • ${recordedCount}/${students.length}`}</span>
          </button>
        </div>
      )}
        </>
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
