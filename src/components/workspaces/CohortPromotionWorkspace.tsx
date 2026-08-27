/**
 * Yapendik School OS — Stage 3.4-C: Cohort Promotion Workspace
 * 
 * Governed Visual Interface for Cohort Class Progression:
 * - Source Classroom & Enrolled Student Multi-Select Picker
 * - Target Classroom & Academic Period Selector
 * - Real-Time Capacity & Occupancy Preview ($Occupancy + Selected \le Capacity$)
 * - Governed Cohort Promotion Action Modal with Atomic Lineage Mutation
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { getSupabaseClient } from '../../db/supabaseClient';
import { cohortLineageService } from '../../services/cohortLineageService';
import { translateGovernanceError, TranslatedGovernanceError } from '../../services/governanceErrorTranslator';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  School, 
  Calendar, 
  Layers, 
  UserCheck, 
  Lock,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

interface StudentPlacementItem {
  student_id: string;
  person_id: string;
  full_name: string;
  gender: string;
  nis: string;
  placement_id: string;
  entry_date: string;
}

interface ClassOption {
  id: string;
  name: string;
  academic_year_id: string;
  age_group: string;
  capacity: number;
  is_active: boolean;
}

interface AcademicYearOption {
  id: string;
  name: string;
  semester: string;
  is_active: boolean;
  lifecycle_status: string;
}

export const CohortPromotionWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const currentSchoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';
  const isAuthorizedActor = 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' || 
    securityContext?.role === 'HEADMASTER';

  // Data Sources
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [studentsInSource, setStudentsInSource] = useState<StudentPlacementItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Selection States
  const [sourceClassId, setSourceClassId] = useState<string>('');
  const [targetAyId, setTargetAyId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');

  // Capacity Preview State
  const [targetCapacity, setTargetCapacity] = useState<number>(15);
  const [targetOccupancy, setTargetOccupancy] = useState<number>(0);

  // Modal & Async Processing States
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; diagnostics?: TranslatedGovernanceError } | null>(null);

  const school = securityContext ? db.getSchoolById(currentSchoolId) : null;

  const loadClassesAndPeriods = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Fetch academic years
        const { data: ays } = await supabase
          .from('academic_years')
          .select('id, name, semester, is_active, lifecycle_status')
          .eq('school_id', currentSchoolId)
          .order('start_date', { ascending: false });

        if (ays) {
          setAcademicYears(ays as AcademicYearOption[]);
          const activeAy = ays.find(y => y.is_active || y.lifecycle_status === 'ACTIVE');
          if (activeAy) setTargetAyId(activeAy.id);
        }

        // Fetch classes
        const { data: clsList } = await supabase
          .from('classes')
          .select('id, name, academic_year_id, age_group, capacity, is_active')
          .eq('school_id', currentSchoolId)
          .order('name');

        if (clsList) {
          setClasses(clsList as ClassOption[]);
          if (clsList.length > 0) {
            setSourceClassId(clsList[0].id);
          }
        }
      } else {
        // Fallback local memory data
        const localYears = db.getAcademicYears().filter(y => y.schoolId === currentSchoolId);
        setAcademicYears(localYears.map(y => ({
          id: y.id,
          name: y.name,
          semester: y.semester,
          is_active: y.isActive,
          lifecycle_status: y.isActive ? 'ACTIVE' : 'CLOSED'
        })));
        if (localYears.length > 0) setTargetAyId(localYears[0].id);

        const localClasses = db.getClasses(currentSchoolId);
        setClasses(localClasses.map(c => ({
          id: c.id,
          name: c.name,
          academic_year_id: c.academicYearId,
          age_group: c.ageGroup,
          capacity: c.capacity,
          is_active: c.isActive
        })));
        if (localClasses.length > 0) setSourceClassId(localClasses[0].id);
      }
    } catch (err) {
      console.error('Error loading promotion options:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load students when source class changes
  useEffect(() => {
    if (!sourceClassId) return;
    const fetchStudents = async () => {
      setSelectedStudentIds([]);
      const supabase = getSupabaseClient();
      if (supabase) {
        const students = await cohortLineageService.getClassActiveStudents(sourceClassId);
        setStudentsInSource(students);
      } else {
        const localStudents = db.getStudents(currentSchoolId).filter(s => s.currentClassId === sourceClassId);
        const mapped: StudentPlacementItem[] = localStudents.map(s => {
          const p = db.getPersonById(s.personId);
          return {
            student_id: s.id,
            person_id: s.personId,
            full_name: p?.fullName || 'Nama Siswa',
            gender: p?.gender || 'UNKNOWN',
            nis: s.nis,
            placement_id: 'plc_' + s.id,
            entry_date: s.enrollmentDate
          };
        });
        setStudentsInSource(mapped);
      }
    };

    fetchStudents();
  }, [sourceClassId, currentSchoolId]);

  // Load target class capacity and occupancy
  useEffect(() => {
    if (!targetClassId || !targetAyId) return;
    const fetchCapacity = async () => {
      const summary = await cohortLineageService.getClassCapacitySummary(targetClassId, targetAyId);
      setTargetCapacity(summary.capacity);
      setTargetOccupancy(summary.placed_count);
    };

    fetchCapacity();
  }, [targetClassId, targetAyId]);

  useEffect(() => {
    loadClassesAndPeriods();
  }, [currentSchoolId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(studentsInSource.map(s => s.student_id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleExecutePromotion = async () => {
    if (!sourceClassId || !targetClassId || !targetAyId || selectedStudentIds.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await cohortLineageService.promoteCohort({
        schoolId: currentSchoolId,
        sourceClassId,
        targetClassId,
        targetAcademicYearId: targetAyId,
        studentIds: selectedStudentIds
      });

      setFeedback({
        type: 'success',
        message: `Berhasil mempromosikan ${res.promoted_count} siswa ke rombel tujuan! Riwayat penempatan dan data induk siswa telah disinkronkan secara atomik.`
      });

      setShowConfirmModal(false);
      setSelectedStudentIds([]);
      // Reload students in source
      const updatedStudents = await cohortLineageService.getClassActiveStudents(sourceClassId);
      setStudentsInSource(updatedStudents);
      // Reload capacity
      const summary = await cohortLineageService.getClassCapacitySummary(targetClassId, targetAyId);
      setTargetCapacity(summary.capacity);
      setTargetOccupancy(summary.placed_count);
    } catch (err: any) {
      const diag = (err as any).diagnostics || translateGovernanceError(err);
      setFeedback({
        type: 'error',
        message: diag.message || err.message,
        diagnostics: diag
      });
    } finally {
      setIsProcessing(false);
    }
  };  const projectedOccupancy = targetOccupancy + selectedStudentIds.length;
  const isCapacityExceeded = projectedOccupancy > targetCapacity;
  const sourceClassObj = classes.find(c => c.id === sourceClassId);
  const targetClassObj = classes.find(c => c.id === targetClassId);
  const targetAyObj = academicYears.find(y => y.id === targetAyId);

  return (
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="cohort-promotion-workspace">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Kenaikan Kelas</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Promosi Rombongan Belajar (Kenaikan Kelas)</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik'} • Mutasi penempatan siswa antar-rombel dan antar-semester secara terkelola.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={loadClassesAndPeriods}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-600' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 shadow-2xs ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{feedback.type === 'success' ? 'Promosi Berhasil' : feedback.diagnostics?.title || 'Promosi Ditolak'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Saran Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Source Rombel on Left, Target & Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Class & Student Selector (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Langkah 1: Rombel Asal</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">Daftar Siswa Kelas Asal</h3>
              </div>
              <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {selectedStudentIds.length} Siswa Terpilih
              </span>
            </div>

            {/* Source Class Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Rombel Asal:</label>
              <select
                value={sourceClassId}
                onChange={(e) => setSourceClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: {c.capacity} anak
                  </option>
                ))}
              </select>
            </div>

            {/* Student Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentsInSource.length > 0 && selectedStudentIds.length === studentsInSource.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4 bg-white cursor-pointer"
                  />
                  <span>Pilih Semua Siswa ({studentsInSource.length})</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">Status: AKTIF</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {studentsInSource.length > 0 ? (
                  studentsInSource.map(student => {
                    const isSelected = selectedStudentIds.includes(student.student_id);
                    return (
                      <div
                        key={student.student_id}
                        onClick={() => handleToggleStudent(student.student_id)}
                        className={`p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4 bg-white"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{student.full_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">NIS: {student.nis || '—'} • Gender: {student.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">Masuk: {student.entry_date}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada siswa dengan penempatan aktif di kelas ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Target Class & Capacity Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Langkah 2: Tentukan Tujuan</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Rombel &amp; Semester Tujuan</h3>
            </div>

            {/* Target Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran / Semester Tujuan:</label>
              <select
                value={targetAyId}
                onChange={(e) => setTargetAyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs font-medium"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name} ({y.semester}) • {y.lifecycle_status === 'ACTIVE' ? 'Aktif' : y.lifecycle_status}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Classroom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas Tujuan:</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs font-medium"
              >
                <option value="">-- Pilih Kelas Tujuan --</option>
                {classes
                  .filter(c => c.id !== sourceClassId)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: {c.capacity} anak
                    </option>
                  ))}
              </select>
            </div>

            {/* Real-Time Capacity Preview Card */}
            {targetClassId && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Simulasi Kapasitas Kelas Tujuan:</span>
                  <span className={`font-bold font-mono ${isCapacityExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {projectedOccupancy} / {targetCapacity} Siswa
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 p-0.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCapacityExceeded 
                        ? 'bg-rose-500' 
                        : projectedOccupancy === targetCapacity 
                        ? 'bg-amber-500' 
                        : 'bg-slate-900'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((projectedOccupancy / (targetCapacity || 1)) * 100))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2 border-t border-slate-200">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <p className="text-slate-500 text-[10px]">Terisi Saat Ini</p>
                    <p className="font-bold text-slate-900 font-mono">{targetOccupancy}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <p className="text-slate-500 text-[10px]">Akan Ditambah</p>
                    <p className="font-bold text-slate-900 font-mono">+{selectedStudentIds.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <p className="text-slate-500 text-[10px]">Sisa Kursi</p>
                    <p className={`font-bold font-mono ${isCapacityExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Math.max(0, targetCapacity - projectedOccupancy)}
                    </p>
                  </div>
                </div>

                {isCapacityExceeded && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-rose-700 text-[11px] flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>Kapasitas ruang kelas terlampaui. Kurangi jumlah siswa yang dipilih.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!isAuthorizedActor || selectedStudentIds.length === 0 || !targetClassId || isCapacityExceeded}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Eksekusi Promosi ({selectedStudentIds.length} Siswa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Promosi Kenaikan Kelas</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p>
                Anda akan mempromosikan <strong>{selectedStudentIds.length} siswa</strong> dari <strong>{sourceClassObj?.name}</strong> ke <strong>{targetClassObj?.name}</strong> pada periode <strong>{targetAyObj?.name} ({targetAyObj?.semester})</strong>.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Rombel Asal:</span>
                  <span className="font-bold text-slate-900">{sourceClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rombel Tujuan:</span>
                  <span className="font-bold text-slate-900">{targetClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jumlah Siswa:</span>
                  <span className="font-bold text-slate-900">{selectedStudentIds.length} Siswa</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status Penempatan Baru:</span>
                  <span className="font-bold text-emerald-700">AKTIF (Rombel Tujuan)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Integritas data terjamin: Penempatan lama ditandai <code>PROMOTED</code>, penempatan baru dibuat sebagai <code>ACTIVE</code>.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecutePromotion}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex justify-center items-center space-x-2 cursor-pointer shadow-xs transition-colors"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Konfirmasi Promosi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
