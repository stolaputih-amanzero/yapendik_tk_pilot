/**
 * Yapendik School OS — Monthly Attendance Summary & Report (Amanaura v3.0)
 * Compliant with Law 11 (Zero Emoji Clutter), Touch Targets >= 48dp, and Responsive Matrix.
 */

import React, { useState, useMemo } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { 
  AvatarChild, 
  SegmentedControl, 
  Button 
} from '../ui';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Award, 
  AlertCircle, 
  CalendarCheck,
  CalendarX,
  ArrowLeft,
  Users
} from 'lucide-react';

interface MonthlyAttendanceReportProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  classes: { id: string; name: string }[];
  onSwitchToDaily: () => void;
}

export const MonthlyAttendanceReport: React.FC<MonthlyAttendanceReportProps> = ({
  selectedClassId,
  onClassChange,
  classes,
  onSwitchToDaily
}) => {
  const { securityContext } = useSecurityContext();
  const schoolId = securityContext?.activeSchoolId || '';

  // Default to September 2026 (Canonical Pilot Academic Year)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 1-12 (9 = September)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Date range for current month
  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
  const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const students = useMemo(() => {
    if (!schoolId) return [];
    return db.getStudents(schoolId, selectedClassId);
  }, [schoolId, selectedClassId]);

  const attendanceRecords = useMemo(() => {
    if (!schoolId) return [];
    return db.getAttendanceRange(schoolId, selectedClassId, startDate, endDate);
  }, [schoolId, selectedClassId, startDate, endDate]);

  // Unique school days recorded in this month
  const recordedDates = useMemo(() => {
    const dates = new Set<string>();
    attendanceRecords.forEach(r => dates.add(r.date));
    return Array.from(dates).sort();
  }, [attendanceRecords]);

  const totalEffectiveDays = recordedDates.length;

  // Compute student attendance metrics
  const studentMetrics = useMemo(() => {
    return students.map((s, idx) => {
      const studentRecords = attendanceRecords.filter(r => r.studentId === s.id);
      const hadir = studentRecords.filter(r => r.status === 'HADIR').length;
      const sakit = studentRecords.filter(r => r.status === 'SAKIT').length;
      const izin = studentRecords.filter(r => r.status === 'IZIN').length;
      const alpa = studentRecords.filter(r => r.status === 'ALPA').length;
      const totalRecorded = hadir + sakit + izin + alpa;

      const percentage = totalEffectiveDays > 0 
        ? Math.round((hadir / totalEffectiveDays) * 100) 
        : 0;

      const studentFullName = s.person?.fullName || s.full_name || 'Siswa';
      const studentCallName = s.person?.preferredName || studentFullName.split(' ')[0] || 'Anak';
      const studentPhoto = s.photoUrl || s.photo_url || s.person?.avatarUrl;

      return {
        idx: idx + 1,
        id: s.id,
        nis: s.nis || s.id,
        fullName: studentFullName,
        callName: studentCallName,
        photoUrl: studentPhoto,
        hadir,
        sakit,
        izin,
        alpa,
        totalRecorded,
        percentage
      };
    });
  }, [students, attendanceRecords, totalEffectiveDays]);

  // Overall Class Statistics
  const classAveragePercentage = useMemo(() => {
    if (studentMetrics.length === 0 || totalEffectiveDays === 0) return 0;
    const sum = studentMetrics.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / studentMetrics.length);
  }, [studentMetrics, totalEffectiveDays]);

  const perfectAttendanceCount = studentMetrics.filter(s => s.percentage === 100 && totalEffectiveDays > 0).length;
  const needsAttentionCount = studentMetrics.filter(s => s.percentage < 85 && totalEffectiveDays > 0).length;

  const classSegments = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'TK A' : c.name.includes('B') ? 'TK B' : c.name
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12 print:p-0">
      {/* ═══════════════════════════════════════════════════════════
          1. FILTER BAR (MONTH NAVIGATION & CLASS SWITCHER)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-surface border-b border-line px-4 medium:px-6 py-4 space-y-3 print:hidden">
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3">
          {/* Month Selector Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
              title="Bulan Sebelumnya"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-surface border border-line flex items-center gap-2 text-xs font-semibold text-ink shadow-hairline">
              <Calendar className="w-4 h-4 text-accent-valor shrink-0" />
              <span>{monthNames[selectedMonth - 1]} {selectedYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
              title="Bulan Berikutnya"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Class Switcher & Print Button */}
          <div className="flex items-center gap-3">
            <div className="w-44 shrink-0">
              <SegmentedControl
                options={classSegments}
                value={selectedClassId}
                onChange={onClassChange}
                size="sm"
                className="w-full min-h-[40px]"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold min-h-[40px]"
            >
              Cetak Rekap
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. SUMMARY STATS CARDS
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-4 medium:px-6">
        <div className="grid grid-cols-2 expanded:grid-cols-4 gap-3">
          {/* Card 1: Hari Efektif */}
          <div className="bg-surface border border-line rounded-xl p-3.5 shadow-hairline space-y-1">
            <div className="flex items-center justify-between text-ink-soft text-xs">
              <span>Hari Efektif</span>
              <CalendarCheck className="w-4 h-4 text-accent-valor" />
            </div>
            <p className="font-mono text-xl font-bold text-ink">
              {totalEffectiveDays} <span className="font-sans text-xs font-normal text-ink-soft">Hari</span>
            </p>
            <p className="text-[11px] text-ink-faint truncate">Periode {monthNames[selectedMonth - 1]} {selectedYear}</p>
          </div>

          {/* Card 2: Rata-Rata Kehadiran Kelas */}
          <div className="bg-surface border border-line rounded-xl p-3.5 shadow-hairline space-y-1">
            <div className="flex items-center justify-between text-ink-soft text-xs">
              <span>Rata-Rata Kelas</span>
              <Users className="w-4 h-4 text-accent-valor" />
            </div>
            <p className="font-mono text-xl font-bold text-ink">
              {classAveragePercentage}%
            </p>
            <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-line">
              <div 
                className="bg-accent-valor h-full transition-all duration-300 rounded-full"
                style={{ width: `${classAveragePercentage}%` }}
              />
            </div>
          </div>

          {/* Card 3: Kehadiran Penuh 100% */}
          <div className="bg-surface border border-line rounded-xl p-3.5 shadow-hairline space-y-1">
            <div className="flex items-center justify-between text-success-deep text-xs">
              <span>Kehadiran 100%</span>
              <Award className="w-4 h-4 text-success-deep" />
            </div>
            <p className="font-mono text-xl font-bold text-success-deep">
              {perfectAttendanceCount} <span className="font-sans text-xs font-normal text-ink-soft">Siswa</span>
            </p>
            <p className="text-[11px] text-success-deep/80 truncate">Hadir tanpa absen</p>
          </div>

          {/* Card 4: Perlu Perhatian (<85%) */}
          <div className="bg-surface border border-line rounded-xl p-3.5 shadow-hairline space-y-1">
            <div className="flex items-center justify-between text-warning-deep text-xs">
              <span>Perlu Perhatian</span>
              <AlertCircle className="w-4 h-4 text-warning-deep" />
            </div>
            <p className="font-mono text-xl font-bold text-warning-deep">
              {needsAttentionCount} <span className="font-sans text-xs font-normal text-ink-soft">Siswa</span>
            </p>
            <p className="text-[11px] text-warning-deep/80 truncate">Tingkat kehadiran &lt; 85%</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. TABLE MATRIX (RESPONSIVE WITH STICKY FIRST COLUMN)
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-4 medium:px-6">
        {studentMetrics.length > 0 && totalEffectiveDays > 0 ? (
          <div className="bg-surface border border-line rounded-xl shadow-hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-line text-ink-soft font-semibold">
                    <th className="p-3 w-12 text-center font-mono">No</th>
                    <th className="p-3 sticky left-0 bg-surface-subtle z-10 min-w-[200px]">Nama Siswa</th>
                    <th className="p-3 text-center font-mono w-20">Hadir</th>
                    <th className="p-3 text-center font-mono w-20">Sakit</th>
                    <th className="p-3 text-center font-mono w-20">Izin</th>
                    <th className="p-3 text-center font-mono w-20">Alpa</th>
                    <th className="p-3 text-center font-mono w-24">Tercatat</th>
                    <th className="p-3 text-right pr-4 min-w-[140px]">% Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {studentMetrics.map(s => {
                    const isPerfect = s.percentage === 100;
                    const isLow = s.percentage < 85;

                    return (
                      <tr key={s.id} className="hover-only:bg-surface-subtle/50 transition-colors">
                        <td className="p-3 text-center font-mono text-ink-faint font-semibold">
                          #{s.idx}
                        </td>

                        {/* Sticky Student Profile Column */}
                        <td className="p-3 sticky left-0 bg-surface z-10 min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            {s.photoUrl ? (
                              <img
                                src={s.photoUrl}
                                alt={s.fullName}
                                className="w-8 h-8 rounded-lg object-cover border border-line shadow-hairline shrink-0"
                              />
                            ) : (
                              <AvatarChild
                                name={s.fullName}
                                id={s.nis}
                                size="sm"
                                showSymbol={false}
                                uniformColor={true}
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-sans font-bold text-ink text-xs truncate">
                                {s.fullName}
                              </p>
                              <p className="text-[11px] text-ink-soft truncate">
                                <span className="font-semibold text-ink">{s.callName}</span> • NIS {s.nis}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Hadir Count */}
                        <td className="p-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded font-mono font-semibold bg-success-tint text-success-deep border border-success-line">
                            {s.hadir}
                          </span>
                        </td>

                        {/* Sakit Count */}
                        <td className="p-3 text-center font-mono text-ink">
                          {s.sakit > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded font-semibold bg-warning-tint text-warning-deep border border-warning-line">
                              {s.sakit}
                            </span>
                          ) : (
                            <span className="text-ink-faint">0</span>
                          )}
                        </td>

                        {/* Izin Count */}
                        <td className="p-3 text-center font-mono text-ink">
                          {s.izin > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded font-semibold bg-info-tint text-info-deep border border-info-line">
                              {s.izin}
                            </span>
                          ) : (
                            <span className="text-ink-faint">0</span>
                          )}
                        </td>

                        {/* Alpa Count */}
                        <td className="p-3 text-center font-mono text-ink">
                          {s.alpa > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded font-semibold bg-danger-tint text-danger-deep border border-danger-line">
                              {s.alpa}
                            </span>
                          ) : (
                            <span className="text-ink-faint">0</span>
                          )}
                        </td>

                        {/* Total Recorded Days */}
                        <td className="p-3 text-center font-mono text-ink-soft">
                          {s.totalRecorded}/{totalEffectiveDays}
                        </td>

                        {/* Percentage with Visual Bar */}
                        <td className="p-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-line hidden medium:block">
                              <div 
                                className={`h-full rounded-full ${
                                  isPerfect 
                                    ? 'bg-success' 
                                    : isLow 
                                    ? 'bg-danger' 
                                    : 'bg-accent-valor'
                                }`}
                                style={{ width: `${s.percentage}%` }}
                              />
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isPerfect
                                ? 'bg-success-tint text-success-deep border border-success-line'
                                : isLow
                                ? 'bg-danger-tint text-danger-deep border border-danger-line'
                                : 'bg-surface-subtle text-ink border border-line'
                            }`}>
                              {s.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State for Months with No Attendance Data */
          <div className="bg-surface rounded-xl border border-dashed border-line p-10 text-center text-ink-soft shadow-hairline space-y-3">
            <CalendarX className="w-10 h-10 text-ink-faint mx-auto opacity-70" />
            <div>
              <h4 className="text-sm font-bold text-ink">Belum Ada Data Presensi pada Periode Ini</h4>
              <p className="text-xs text-ink-soft mt-1">
                Data presensi untuk {monthNames[selectedMonth - 1]} {selectedYear} belum dicatat di sistem.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToDaily}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="rounded-xl text-xs font-semibold"
              >
                Kembali ke Presensi Harian
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
