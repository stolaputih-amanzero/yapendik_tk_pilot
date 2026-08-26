/**
 * Yapendik School OS — Domain 04: Attendance Register (Presensi Harian TK)
 * Includes health screening (temperature), arrival mood observation, and attendance status.
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
import { 
  CalendarCheck, 
  Check, 
  Thermometer, 
  Smile, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock
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
    { value: 'IZIN', label: 'Izin', color: 'bg-blue-600 text-white' },
    { value: 'ALPA', label: 'Alpa', color: 'bg-red-600 text-white' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            Buku Presensi & Skrining Kedatangan Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan kehadiran harian, pemeriksaan suhu tubuh anak, dan observasi mood kedatangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {authResult.granted && (
            <button
              onClick={handleSaveAll}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Presensi Kelas</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Presensi kelas dan skrining suhu berhasil disimpan ke database.</span>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white border-b border-slate-800">
              <th className="p-3 font-semibold">No</th>
              <th className="p-3 font-semibold">Nama Siswa & NIS</th>
              <th className="p-3 font-semibold text-center">Status Kehadiran</th>
              <th className="p-3 font-semibold">Suhu (°C)</th>
              <th className="p-3 font-semibold">Mood Kedatangan</th>
              <th className="p-3 font-semibold">Catatan Kedatangan / Penjemputan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s, idx) => {
              const row = attendanceMap[s.id] || { status: 'HADIR', temperature: 36.5, arrivalMood: 'CERIA', notes: '' };
              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono text-slate-400 text-center w-12">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{s.person?.fullName || 'Siswa'}</div>
                    <div className="text-slate-400 text-[11px]">NIS: {s.nis || s.id}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-1">
                      {statusOptions.map(opt => {
                        const isSelected = row.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={!authResult.granted}
                            onClick={() => handleStatusChange(s.id, opt.value)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                              isSelected 
                                ? opt.color 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5 w-24">
                      <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        min="35"
                        max="40"
                        disabled={!authResult.granted}
                        value={row.temperature}
                        onChange={(e) => handleTempChange(s.id, parseFloat(e.target.value))}
                        className="w-16 border border-slate-200 rounded px-1.5 py-1 text-center font-mono font-semibold text-slate-800"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      disabled={!authResult.granted}
                      value={row.arrivalMood}
                      onChange={(e) => handleMoodChange(s.id, e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white font-medium outline-none"
                    >
                      <option value="CERIA">😊 Ceria & Bersemangat</option>
                      <option value="TENANG">😌 Tenang & Rileks</option>
                      <option value="GELISAH">😟 Sedikit Gelisah</option>
                      <option value="MENANGIS">😢 Menangis / Cemas</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      disabled={!authResult.granted}
                      placeholder="mis. Diantar mama, membawa obat batuk"
                      value={row.notes}
                      onChange={(e) => handleNotesChange(s.id, e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1 text-slate-700 placeholder-slate-400 outline-none focus:border-slate-900"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
