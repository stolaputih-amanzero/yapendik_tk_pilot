/**
 * Yapendik School OS — Domain 04: Attendance Register (Presensi Harian TK)
 * Includes health screening (temperature), arrival mood observation, and attendance status.
 * Standardized with Amanaura Design System v1.0 Stacked List Layout.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { 
  DailyAttendanceEntry, 
  AttendanceStatus, 
  ClassRoom 
} from '../../domain/types';
import { Button, AvatarChild, Badge, Input, SelectSheet } from '../ui';
import { 
  CalendarCheck, 
  Check, 
  Thermometer, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Users
} from 'lucide-react';

export const AttendanceWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-24');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status: AttendanceStatus;
    temperature: number;
    arrivalMood: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS';
    notes: string;
  }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

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
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedDate]);

  const authResult = evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'ATTENDANCE_REGISTER',
    resourceSchoolId: securityContext.activeSchoolId,
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
    setSavedSuccess(false);
  };

  const handleMoodChange = (studentId: string, mood: any) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        arrivalMood: mood
      }
    }));
    setSavedSuccess(false);
  };

  const handleTempChange = (studentId: string, temp: number) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        temperature: temp
      }
    }));
    setSavedSuccess(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
    setSavedSuccess(false);
  };

  const handleSaveAll = () => {
    if (!authResult.granted) {
      alert(`Akses Ditolak: ${authResult.reason}`);
      return;
    }

    const batchEntries = students.map(s => {
      const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
      return {
        schoolId: securityContext.activeSchoolId,
        classId: selectedClassId,
        studentId: s.id,
        date: selectedDate,
        status: row.status,
        notes: row.notes,
        recordedByPersonId: securityContext.personId,
        temperatureCelsius: row.temperature,
        arrivalMood: row.arrivalMood
      };
    });

    db.saveAttendanceBatch(
      batchEntries,
      securityContext.personName,
      securityContext.userId,
      securityContext.role
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'HADIR', label: 'Hadir', color: 'bg-success text-on-brand' },
    { value: 'SAKIT', label: 'Sakit', color: 'bg-warning text-on-brand' },
    { value: 'IZIN', label: 'Izin', color: 'bg-info text-on-brand' },
    { value: 'ALPA', label: 'Alpa', color: 'bg-danger text-on-brand' }
  ];

  const classOptions = classes.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="px-4 medium:px-6 py-4 bg-surface border-b border-line-soft flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl medium:text-2xl font-bold text-ink flex items-center gap-2 font-display">
            <CalendarCheck className="w-6 h-6 text-success shrink-0" />
            Buku Presensi & Skrining Kedatangan Siswa
          </h1>
          <p className="text-xs text-ink-soft font-medium mt-1">
            Pencatatan kehadiran harian, pemeriksaan suhu tubuh anak, dan observasi mood kedatangan.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col medium:flex-row medium:items-center gap-3 w-full">
            <Input
              type="date"
              label="Tanggal"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <SelectSheet
              label="Kelas"
              value={selectedClassId}
              onChange={setSelectedClassId}
              options={classOptions}
            />
          </div>

          {authResult.granted && (
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAll}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full medium:w-auto mt-2 medium:mt-0 shadow-hairline"
            >
              Simpan Presensi
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-success-tint border border-success-line rounded-card p-3 text-xs text-success-deep flex items-center space-x-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span className="font-semibold">Presensi kelas dan skrining suhu berhasil disimpan ke database.</span>
        </div>
      )}

      {/* Stacked List of Students (Mobile-First Edge-to-Edge) */}
      {students.length > 0 ? (
        <div className="flex flex-col divide-y divide-line-soft pb-32">
          {students.map((s, idx) => {
            const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
            return (
              <div 
                key={s.id} 
                className="px-4 medium:px-6 py-5 flex flex-col expanded:flex-row expanded:items-center gap-4 hover-only:bg-surface-subtle/50 transition-colors"
              >
                {/* Left Profile: Avatar, Name & NIS */}
                <div className="flex items-center gap-3 min-w-0 expanded:w-72 shrink-0">
                  <div className="text-[11px] font-mono font-bold text-ink-faint w-5 text-right shrink-0 whitespace-nowrap">
                    {idx + 1}
                  </div>
                  <AvatarChild
                    name={s.person?.fullName || 'Siswa'}
                    id={s.id}
                    size="md"
                    showSymbol
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-ink truncate">
                      {s.person?.fullName || 'Siswa'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="neutral">
                        NIS {s.nis || s.id}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right/Bottom Controls: 1-Tap Attendance & Detail Inputs */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  {/* Status 1-Tap Selection Buttons */}
                  <div className="grid grid-cols-4 medium:flex medium:flex-wrap items-center gap-2">
                    {statusOptions.map(opt => {
                      const isSelected = row.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!authResult.granted}
                          onClick={() => handleStatusChange(s.id, opt.value)}
                          className={`py-1 px-3 rounded-field text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98] ${
                            isSelected 
                              ? `${opt.color} shadow-hairline font-bold` 
                              : 'bg-surface-subtle text-ink hover-only:bg-surface-subtle/80 border border-line font-semibold'
                          } ${!authResult.granted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-row: Temperature, Mood & Notes */}
                  <div className="mt-3 flex flex-row items-center gap-3 w-full text-xs">
                    {/* Temperature */}
                    <div className="flex items-center gap-2 bg-surface-subtle border border-line rounded-field px-2 py-1 w-28 shrink-0">
                      <Thermometer className="w-4 h-4 text-brass" />
                      <input
                        type="number"
                        step="0.1"
                        min="34"
                        max="42"
                        disabled={!authResult.granted}
                        value={row.temperature}
                        onChange={(e) => handleTempChange(s.id, parseFloat(e.target.value))}
                        className="w-10 bg-transparent text-center font-mono font-bold text-ink outline-none text-xs whitespace-nowrap"
                      />
                      <span className="text-ink-faint font-semibold">°C</span>
                    </div>

                    {/* Arrival Mood */}
                    <div className="flex-1 min-w-0">
                      <SelectSheet
                        disabled={!authResult.granted}
                        value={row.arrivalMood}
                        onChange={(val) => handleMoodChange(s.id, val)}
                        options={[
                          { value: 'CERIA', label: 'Ceria & Bersemangat' },
                          { value: 'TENANG', label: 'Tenang & Rileks' },
                          { value: 'GELISAH', label: 'Gelisah' },
                          { value: 'MENANGIS', label: 'Menangis / Cemas' },
                        ]}
                        placeholder="Pilih Mood..."
                      />
                    </div>
                  </div>
                  
                  {/* Arrival Notes */}
                  <div className="mt-3 w-full">
                    <Input
                      disabled={!authResult.granted}
                      placeholder="Catatan kedatangan / penjemputan..."
                      value={row.notes}
                      onChange={(e) => handleNotesChange(s.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-dashed border-line-strong p-12 text-center text-ink-soft shadow-hairline">
          <Users className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink">Belum ada data siswa di kelas ini</h4>
          <p className="text-xs text-ink-soft mt-1">Pilih kelas lain atau tambahkan siswa melalui modul PPDB / Roster.</p>
        </div>
      )}
    </div>
  );
};
