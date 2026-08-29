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
import { ProgressBar, SelectSheet } from '../ui';

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
    <div className="space-y-6 text-ink font-sans w-full pb-[132px] expanded:pb-8" data-testid="cohort-promotion-workspace">
      {/* Header Banner */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Standar Yayasan • Kenaikan Kelas</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Promosi Rombongan Belajar (Kenaikan Kelas)</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik'} • Mutasi penempatan siswa antar-rombel dan antar-semester secara terkelola.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            <button
              onClick={loadClassesAndPeriods}
              disabled={loading}
              className="px-3 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-hairline cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ink-soft' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-card border flex items-start space-x-3 shadow-hairline ${
          feedback.type === 'success' 
            ? 'bg-success-tint border-success-line text-success-deep' 
            : 'bg-danger-tint border-danger-line text-danger-deep'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-success" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{feedback.type === 'success' ? 'Promosi Berhasil' : feedback.diagnostics?.title || 'Promosi Ditolak'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-warning-deep font-medium bg-warning-tint p-2 rounded-field border border-warning-line">
                Saran Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Source Rombel on Left, Target & Preview on Right */}
      <div className="grid grid-cols-1 expanded:grid-cols-12 gap-6">
        {/* Left Column: Source Class & Student Selector (7 Cols) */}
        <div className="expanded:col-span-7 bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Langkah 1: Rombel Asal</span>
                <h3 className="text-sm font-bold text-ink mt-0.5">Daftar Siswa Kelas Asal</h3>
              </div>
              <span className="text-xs text-ink-soft font-bold bg-surface-subtle px-2 py-1 rounded-full border border-line">
                {selectedStudentIds.length} Siswa Terpilih
              </span>
            </div>

            {/* Source Class Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">Pilih Rombel Asal:</label>
              <SelectSheet
    value={sourceClassId}
    onChange={setSourceClassId}
    options={classes.map(c => ({ value: c.id, label: `${c.name} (${c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: ${c.capacity} anak` }))}
  />
            </div>

            {/* Student Table */}
            <div className="border border-line rounded-field overflow-hidden bg-surface shadow-hairline">
              <div className="p-3 bg-surface-subtle border-b border-line flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-ink-soft font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentsInSource.length > 0 && selectedStudentIds.length === studentsInSource.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-line text-ink focus:ring-0 w-4 h-4 bg-surface cursor-pointer"
                  />
                  <span>Pilih Semua Siswa ({studentsInSource.length})</span>
                </label>
                <span className="text-[10px] text-ink-soft font-mono font-semibold whitespace-nowrap">Status: AKTIF</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-line-soft">
                {studentsInSource.length > 0 ? (
                  studentsInSource.map(student => {
                    const isSelected = selectedStudentIds.includes(student.student_id);
                    return (
                      <div
                        key={student.student_id}
                        onClick={() => handleToggleStudent(student.student_id)}
                        className={`p-3 flex items-center justify-between text-xs hover-only:bg-surface-subtle/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-surface-subtle' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div
                            className="rounded border-line text-ink focus:ring-0 w-4 h-4 bg-surface"
                          />
                          <div>
                            <p className="font-bold text-ink">{student.full_name}</p>
                            <p className="text-[11px] text-ink-soft font-mono whitespace-nowrap">NIS: {student.nis || '—'} • Gender: {student.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-ink-soft whitespace-nowrap">Masuk: {student.entry_date}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-ink-faint text-xs">
                    Tidak ada siswa dengan penempatan aktif di kelas ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Target Class & Capacity Preview (5 Cols) */}
        <div className="expanded:col-span-5 bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-line-soft pb-3">
              <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Langkah 2: Tentukan Tujuan</span>
              <h3 className="text-sm font-bold text-ink mt-0.5">Rombel &amp; Semester Tujuan</h3>
            </div>

            {/* Target Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">Tahun Ajaran / Semester Tujuan:</label>
              <SelectSheet value={targetAyId}   options={academicYears.map(y => ({ value: y.id, label: `${y.name} (${y.semester})` }))} />
            </div>

            {/* Target Classroom */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">Pilih Kelas Tujuan:</label>
              <SelectSheet
    value={targetClassId}
    onChange={setTargetClassId}
    options={[
      { value: "", label: "-- Pilih Kelas Tujuan --" },
      ...classes.map(c => ({ value: c.id, label: `${c.name} (${c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: ${c.capacity} anak` }))
    ]}
  />
            </div>

            {/* Real-Time Capacity Preview Card */}
            {targetClassId && (
              <div className="bg-surface-subtle border border-line rounded-field p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft font-semibold">Simulasi Kapasitas Kelas Tujuan:</span>
                  <span className={`font-bold font-mono ${isCapacityExceeded ? 'text-danger' : 'text-success'}`}>
                    {projectedOccupancy} / {targetCapacity} Siswa
                  </span>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  value={Math.min(100, Math.round((projectedOccupancy / (targetCapacity || 1)) * 100))}
                  variant={isCapacityExceeded ? 'danger' : projectedOccupancy === targetCapacity ? 'warning' : 'brass'}
                  trackClassName="h-2"
                />

                <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2 border-t border-line">
                  <div className="bg-surface p-2 rounded-lg border border-line">
                    <p className="text-ink-soft text-[10px]">Terisi Saat Ini</p>
                    <p className="font-bold text-ink font-mono">{targetOccupancy}</p>
                  </div>
                  <div className="bg-surface p-2 rounded-lg border border-line">
                    <p className="text-ink-soft text-[10px]">Akan Ditambah</p>
                    <p className="font-bold text-ink font-mono">+{selectedStudentIds.length}</p>
                  </div>
                  <div className="bg-surface p-2 rounded-lg border border-line">
                    <p className="text-ink-soft text-[10px]">Sisa Kursi</p>
                    <p className={`font-bold font-mono ${isCapacityExceeded ? 'text-danger' : 'text-success'}`}>
                      {Math.max(0, targetCapacity - projectedOccupancy)}
                    </p>
                  </div>
                </div>

                {isCapacityExceeded && (
                  <div className="bg-danger-tint border border-danger-line p-2 rounded-field text-danger-deep text-[11px] flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-danger" />
                    <span>Kapasitas ruang kelas terlampaui. Kurangi jumlah siswa yang dipilih.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-line-soft">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!isAuthorizedActor || selectedStudentIds.length === 0 || !targetClassId || isCapacityExceeded}
              className="w-full py-2 rounded-field bg-brand hover-only:bg-surface-inset disabled:opacity-40 text-on-brand font-bold text-xs shadow-hairline flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Eksekusi Promosi ({selectedStudentIds.length} Siswa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-line rounded-card max-w-lg w-full p-4 medium:p-6 shadow-floating space-y-4 text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-ink-soft" />
                <h3 className="text-base font-bold text-ink">Konfirmasi Promosi Kenaikan Kelas</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-soft space-y-3">
              <p>
                Anda akan mempromosikan <strong>{selectedStudentIds.length} siswa</strong> dari <strong>{sourceClassObj?.name}</strong> ke <strong>{targetClassObj?.name}</strong> pada periode <strong>{targetAyObj?.name} ({targetAyObj?.semester})</strong>.
              </p>

              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-2 text-[11px]">
                <div className="flex justify-between text-ink-soft">
                  <span>Rombel Asal:</span>
                  <span className="font-bold text-ink">{sourceClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Rombel Tujuan:</span>
                  <span className="font-bold text-ink">{targetClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Jumlah Siswa:</span>
                  <span className="font-bold text-ink">{selectedStudentIds.length} Siswa</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Status Penempatan Baru:</span>
                  <span className="font-bold text-success-deep">AKTIF (Rombel Tujuan)</span>
                </div>
              </div>

              <div className="bg-surface-subtle p-3 rounded-field border border-line text-ink-soft text-[11px]">
                Integritas data terjamin: Penempatan lama ditandai <code>PROMOTED</code>, penempatan baru dibuat sebagai <code>ACTIVE</code>.
              </div>
            </div>

            <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecutePromotion}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold flex justify-center items-center space-x-2 cursor-pointer shadow-hairline transition-colors"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Konfirmasi Promosi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
