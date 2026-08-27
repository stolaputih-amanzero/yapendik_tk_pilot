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
import { Button, AvatarChild, Badge } from '../ui';
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
    { value: 'HADIR', label: 'Hadir', color: 'bg-emerald-600 text-white' },
    { value: 'SAKIT', label: 'Sakit', color: 'bg-amber-600 text-white' },
    { value: 'IZIN', label: 'Izin', color: 'bg-sky-600 text-white' },
    { value: 'ALPA', label: 'Alpa', color: 'bg-rose-600 text-white' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="px-4 md:px-6 py-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            Buku Presensi & Skrining Kedatangan Siswa
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pencatatan kehadiran harian, pemeriksaan suhu tubuh anak, dan observasi mood kedatangan.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all">
              <span className="text-slate-500 font-medium">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 outline-none cursor-pointer text-xs text-right flex-1"
              />
            </div>

            <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all">
              <span className="text-slate-500 font-medium">Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none text-right flex-1 cursor-pointer text-xs"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {authResult.granted && (
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAll}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full md:w-auto mt-2 md:mt-0 shadow-xs"
            >
              Simpan Presensi
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-center space-x-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Presensi kelas dan skrining suhu berhasil disimpan ke database.</span>
        </div>
      )}

      {/* Stacked List of Students (Mobile-First Edge-to-Edge) */}
      {students.length > 0 ? (
        <div className="flex flex-col divide-y divide-slate-100 pb-32">
          {students.map((s, idx) => {
            const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
            return (
              <div 
                key={s.id} 
                className="px-4 md:px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Left Profile: Avatar, Name & NIS */}
                <div className="flex items-center gap-3.5 min-w-0 lg:w-72 shrink-0">
                  <div className="text-[11px] font-mono font-bold text-slate-400 w-5 text-right shrink-0">
                    {idx + 1}
                  </div>
                  <AvatarChild
                    name={s.person?.fullName || 'Siswa'}
                    id={s.id}
                    size="md"
                    showSymbol
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
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
                  <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-1.5">
                    {statusOptions.map(opt => {
                      const isSelected = row.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!authResult.granted}
                          onClick={() => handleStatusChange(s.id, opt.value)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98] ${
                            isSelected 
                              ? `${opt.color} shadow-xs font-bold` 
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold'
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
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-28 shrink-0">
                      <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        min="34"
                        max="42"
                        disabled={!authResult.granted}
                        value={row.temperature}
                        onChange={(e) => handleTempChange(s.id, parseFloat(e.target.value))}
                        className="w-10 bg-transparent text-center font-mono font-bold text-slate-900 outline-none text-xs"
                      />
                      <span className="text-slate-400 font-semibold">°C</span>
                    </div>

                    {/* Arrival Mood */}
                    <div className="w-full flex justify-between items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex-1 min-w-0">
                      <select
                        disabled={!authResult.granted}
                        value={row.arrivalMood}
                        onChange={(e) => handleMoodChange(s.id, e.target.value)}
                        className="w-full bg-transparent text-slate-800 font-semibold outline-none cursor-pointer text-xs truncate"
                      >
                        <option value="CERIA">😊 Ceria & Bersemangat</option>
                        <option value="TENANG">😌 Tenang & Rileks</option>
                        <option value="GELISAH">😟 Sedikit Gelisah</option>
                        <option value="MENANGIS">😢 Menangis / Cemas</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Arrival Notes */}
                  <div className="mt-3 w-full text-xs">
                    <input
                      type="text"
                      disabled={!authResult.granted}
                      placeholder="Catatan kedatangan / penjemputan..."
                      value={row.notes}
                      onChange={(e) => handleNotesChange(s.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 shadow-xs">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700">Belum ada data siswa di kelas ini</h4>
          <p className="text-xs text-slate-500 mt-1">Pilih kelas lain atau tambahkan siswa melalui modul PPDB / Roster.</p>
        </div>
      )}
    </div>
  );
};
