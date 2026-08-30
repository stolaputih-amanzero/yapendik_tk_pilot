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
  AutoResizeTextarea, 
  SelectSheet,
  ToastHUD 
} from '../ui';
import { 
  CalendarCheck, 
  Calendar, 
  Thermometer, 
  Save, 
  Users 
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

  const statusOptions: { value: AttendanceStatus; label: string; activeColor: string }[] = [
    { value: 'HADIR', label: 'Hadir', activeColor: 'bg-success text-on-brand' },
    { value: 'SAKIT', label: 'Sakit', activeColor: 'bg-warning text-on-brand' },
    { value: 'IZIN', label: 'Izin', activeColor: 'bg-info text-on-brand' },
    { value: 'ALPA', label: 'Alpa', activeColor: 'bg-danger text-on-brand' }
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
  const belumCount = Math.max(0, students.length - (hadirCount + sakitCount + izinCount + alpaCount));

  return (
    <div className="space-y-4">
      {/* 1. HEADER (COMPACT & EXPANDED ADAPTIVE) */}
      <div className="bg-surface border-b border-line-soft px-4 pt-3 pb-3 space-y-2.5">
        {/* Expanded Description Only */}
        <div className="hidden expanded:flex expanded:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2 font-display">
              <CalendarCheck className="w-5 h-5 text-success shrink-0" />
              Buku Presensi & Skrining Kedatangan Siswa
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              Pencatatan kehadiran harian, pemeriksaan suhu tubuh anak, dan observasi mood kedatangan.
            </p>
          </div>
        </div>

        {/* Control Grid: 2 Columns */}
        <div className="grid grid-cols-2 gap-2 items-center">
          {/* Tanggal: Field SelectSheet/date, label value formatID -> "Sen, 24 Agu 2026", class font-mono tabular-nums */}
          <div 
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch {
                dateInputRef.current?.focus();
              }
            }}
            className="relative flex items-center justify-between bg-surface border border-line hover-only:border-brand-primary rounded-xl px-3 py-2 text-xs font-medium text-ink cursor-pointer transition-all shadow-hairline group min-h-[44px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="font-mono tabular-nums font-bold text-ink text-[12px] truncate">
                {formatDateID(selectedDate)}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-ink-soft bg-surface-subtle border border-line-soft px-2 py-1 rounded shrink-0">
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
          <SegmentedControl
            options={classSegments}
            value={selectedClassId}
            onChange={setSelectedClassId}
            size="sm"
            className="w-full h-[44px]"
          />
        </div>

        {/* Micro-Summary Live: {total} Murid • {hadir} Hadir • {sakit} Sakit • {belum} Belum */}
        <div className="flex items-center gap-2 text-xs text-ink-soft font-medium pt-1 px-1 flex-wrap">
          <span className="font-semibold text-ink">{students.length} Murid</span>
          <span className="text-ink-faint">•</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
            <span className="font-semibold text-success-deep">{hadirCount} Hadir</span>
          </span>
          <span className="text-ink-faint">•</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>
            <span className="font-semibold text-warning-deep">{sakitCount} Sakit</span>
          </span>
          {izinCount > 0 && (
            <>
              <span className="text-ink-faint">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-info inline-block"></span>
                <span className="font-semibold text-info-deep">{izinCount} Izin</span>
              </span>
            </>
          )}
          {alpaCount > 0 && (
            <>
              <span className="text-ink-faint">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>
                <span className="font-semibold text-danger-deep">{alpaCount} Alpa</span>
              </span>
            </>
          )}
          {belumCount > 0 && (
            <>
              <span className="text-ink-faint">•</span>
              <span className="flex items-center gap-1 text-ink-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-faint inline-block"></span>
                <span>{belumCount} Belum</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. LIST ITEM (ATTENDANCE GRID / CHILD CARD) */}
      {students.length > 0 ? (
        <div className="flex flex-col divide-y divide-line-soft pb-[160px]">
          {students.map((s, idx) => {
            const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
            const isFever = row.temperature >= 37.5;

            return (
              <div 
                key={s.id} 
                className="px-4 medium:px-6 py-4 flex flex-col gap-3 hover-only:bg-surface-subtle/40 transition-colors"
              >
                {/* Child Identity Header: Number, Avatar, Full Name (No Truncate), NIS */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-[11px] font-mono font-bold text-ink-faint w-4 text-right shrink-0">
                    {idx + 1}
                  </div>
                  <AvatarChild
                    name={s.person?.fullName || 'Siswa'}
                    id={s.id}
                    size="md"
                    showSymbol
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold leading-snug break-words text-ink">
                      {s.person?.fullName || 'Siswa'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="neutral">
                        NIS {s.nis || s.id}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Status 1-Tap Pill Selection Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {statusOptions.map(opt => {
                    const isSelected = row.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!authResult.granted}
                        onClick={() => handleStatusChange(s.id, opt.value)}
                        className={`py-2 px-2 rounded-field text-xs transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-[0.98] ${
                          isSelected 
                            ? `${opt.activeColor} font-bold shadow-hairline` 
                            : 'bg-surface border border-line text-ink-soft hover-only:bg-surface-subtle font-medium'
                        } ${!authResult.granted ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Temperature & Mood Sub-Row (Rendered ONLY when status === 'HADIR') */}
                {row.status === 'HADIR' && (
                  <div className="flex flex-col compact:flex-row items-stretch compact:items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Temperature Stepper [−][value °C mono][+] */}
                    <div className={`flex items-center justify-between border rounded-field px-3 py-2 shrink-0 transition-colors ${
                      isFever 
                        ? 'bg-warning-tint text-warning-deep border-warning-line' 
                        : 'bg-surface border-line text-ink'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-semibold mr-2">
                        <Thermometer className={`w-4 h-4 ${isFever ? 'text-warning-deep' : 'text-brand-primary'}`} />
                        <span className="font-mono tabular-nums font-bold text-xs">
                          {row.temperature.toFixed(1)} °C
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={!authResult.granted || row.temperature <= 34.0}
                          onClick={() => handleTempChange(s.id, Math.max(34.0, Math.round((row.temperature - 0.1) * 10) / 10))}
                          className="w-6 h-6 rounded-md bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                          title="Turunkan 0.1°C"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          disabled={!authResult.granted || row.temperature >= 42.0}
                          onClick={() => handleTempChange(s.id, Math.min(42.0, Math.round((row.temperature + 0.1) * 10) / 10))}
                          className="w-6 h-6 rounded-md bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                          title="Naikkan 0.1°C"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Arrival Mood SelectSheet */}
                    <div className="flex-1 min-w-0">
                      <SelectSheet
                        disabled={!authResult.granted}
                        value={row.arrivalMood}
                        onChange={(val) => handleMoodChange(s.id, val)}
                        options={[
                          { value: 'CERIA', label: 'Ceria & Bersemangat' },
                          { value: 'TENANG', label: 'Cukup Stabil' },
                          { value: 'GELISAH', label: 'Lesu Perlu Pendampingan' },
                          { value: 'MENANGIS', label: 'Rewel Butuh Tenang' },
                        ]}
                        placeholder="Pilih Mood..."
                      />
                    </div>
                  </div>
                )}

                {/* Arrival Notes: AutoResizeTextarea collapsed 1 baris, expand on focus */}
                <div className="w-full">
                  <AutoResizeTextarea
                    minRows={1}
                    maxRows={4}
                    disabled={!authResult.granted}
                    placeholder="Catatan kedatangan / penjemputan..."
                    value={row.notes}
                    onChange={(e) => handleNotesChange(s.id, e.target.value)}
                    className="bg-surface border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint focus:border-brand-primary p-2"
                  />
                </div>
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

      {/* 3. ACTION DOCK STICKY (BOTTOM FIXED) */}
      {authResult.granted && students.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+84px)] px-4 z-40 max-w-lg mx-auto pointer-events-none">
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
