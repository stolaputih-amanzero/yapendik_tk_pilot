import { SelectSheet } from '../ui';
/**
 * Yapendik School OS — Stage 3.4-C: Graduation Registry Workspace
 * 
 * Governed Visual Interface for Year-End Cohort Graduation:
 * - Final-Year Classroom Selector (TK B / Kelompok B)
 * - Candidate Graduates Multi-Select Ledger
 * - Terminal Graduation Action Modal ($Placement = COMPLETED$, $Student = GRADUATED$, $Class = NULL$)
 * - Historical Graduates / Alumni Registry Archive
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { getSupabaseClient } from '../../db/supabaseClient';
import { cohortLineageService } from '../../services/cohortLineageService';
import { translateGovernanceError, TranslatedGovernanceError } from '../../services/governanceErrorTranslator';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Award, 
  Users, 
  Archive, 
  Lock,
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';

interface CandidateStudentItem {
  student_id: string;
  person_id: string;
  full_name: string;
  gender: string;
  nis: string;
  placement_id: string;
  entry_date: string;
}

interface GraduatedAlumniItem {
  id: string;
  full_name: string;
  nis: string;
  gender: string;
  exit_date: string | null;
  remarks: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  age_group: string;
  capacity: number;
}

export const GraduationRegistryWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const currentSchoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';
  const isAuthorizedActor = 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' || 
    securityContext?.role === 'HEADMASTER';

  // State
  const [tkbClasses, setTkbClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [candidates, setCandidates] = useState<CandidateStudentItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [graduatedAlumni, setGraduatedAlumni] = useState<GraduatedAlumniItem[]>([]);

  // Async & Modal States
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGradModal, setShowGradModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; diagnostics?: TranslatedGovernanceError } | null>(null);

  const school = securityContext ? db.getSchoolById(currentSchoolId) : null;

  const loadClassesAndAlumni = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // 1. Fetch TK B / Level classes
        const { data: clsList } = await supabase
          .from('classes')
          .select('id, name, age_group, capacity')
          .eq('school_id', currentSchoolId)
          .order('name');

        if (clsList) {
          setTkbClasses(clsList as ClassOption[]);
          const defaultCls = clsList.find(c => c.age_group === 'TK_B_5_6') || clsList[0];
          if (defaultCls) setSelectedClassId(defaultCls.id);
        }

        // 2. Fetch Graduated Alumni
        const { data: alumni } = await supabase
          .from('students')
          .select(`
            id,
            nis,
            status,
            persons!inner (
              id,
              full_name,
              gender
            ),
            student_placement_records (
              placement_status,
              exit_date,
              promotion_remarks
            )
          `)
          .eq('school_id', currentSchoolId)
          .eq('status', 'GRADUATED');

        if (alumni) {
          const mappedAlumni: GraduatedAlumniItem[] = alumni.map((a: any) => {
            const compPlc = (a.student_placement_records || []).find((p: any) => p.placement_status === 'COMPLETED');
            return {
              id: a.id,
              full_name: a.persons?.full_name || 'Nama Alumni',
              nis: a.nis || '—',
              gender: a.persons?.gender || 'UNKNOWN',
              exit_date: compPlc?.exit_date || '—',
              remarks: compPlc?.promotion_remarks || 'Lulus dari TK'
            };
          });
          setGraduatedAlumni(mappedAlumni);
        }
      } else {
        // Fallback local memory data
        const localClasses = db.getClasses(currentSchoolId);
        setTkbClasses(localClasses.map(c => ({ id: c.id, name: c.name, age_group: c.ageGroup, capacity: c.capacity })));
        if (localClasses.length > 0) setSelectedClassId(localClasses[0].id);

        const localStudents = db.getStudents(currentSchoolId).filter(s => s.status === 'GRADUATED');
        setGraduatedAlumni(localStudents.map(s => {
          const p = db.getPersonById(s.personId);
          return {
            id: s.id,
            full_name: p?.fullName || 'Nama Alumni',
            nis: s.nis,
            gender: p?.gender || 'UNKNOWN',
            exit_date: '2026-06-30',
            remarks: 'Lulus'
          };
        }));
      }
    } catch (err) {
      console.error('Error loading graduation registry:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates when selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchCandidates = async () => {
      setSelectedStudentIds([]);
      const supabase = getSupabaseClient();
      if (supabase) {
        const students = await cohortLineageService.getClassActiveStudents(selectedClassId);
        setCandidates(students);
      } else {
        const localStudents = db.getStudents(currentSchoolId).filter(s => s.currentClassId === selectedClassId && s.status === 'ACTIVE');
        setCandidates(localStudents.map(s => {
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
        }));
      }
    };

    fetchCandidates();
  }, [selectedClassId, currentSchoolId]);

  useEffect(() => {
    loadClassesAndAlumni();
  }, [currentSchoolId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(candidates.map(c => c.student_id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleExecuteGraduation = async () => {
    if (!selectedClassId || selectedStudentIds.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await cohortLineageService.graduateCohort({
        schoolId: currentSchoolId,
        classId: selectedClassId,
        studentIds: selectedStudentIds
      });

      setFeedback({
        type: 'success',
        message: `Selamat! Berhasil meluluskan ${res.graduated_count} siswa secara resmi. Data penempatan telah diterminalisasi sebagai COMPLETED dan status siswa menjadi GRADUATED.`
      });

      setShowGradModal(false);
      setSelectedStudentIds([]);
      await loadClassesAndAlumni();
      // Reload candidates
      const updatedCandidates = await cohortLineageService.getClassActiveStudents(selectedClassId);
      setCandidates(updatedCandidates);
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
  };

  const selectedClassObj = tkbClasses.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6 text-ink font-sans w-full pb-[160px] expanded:pb-8" data-testid="graduation-registry-workspace">
      {/* Header Banner */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success-deep text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Standar Yayasan • Buku Induk Alumni</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Buku Registrasi Kelulusan Siswa (Tingkat Akhir)</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik'} • Penetapan kelulusan resmi, finalisasi rekam jejak, dan pencatatan buku induk alumni.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            <button
              onClick={loadClassesAndAlumni}
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
            <p className="font-semibold">{feedback.type === 'success' ? 'Kelulusan Sukses' : feedback.diagnostics?.title || 'Operasi Ditolak'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-warning-deep font-medium bg-warning-tint p-2 rounded-field border border-warning-line">
                Saran Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Layout: Candidate Graduates on Left, Graduation Action & Summary on Right */}
      <div className="grid grid-cols-1 expanded:grid-cols-12 gap-6">
        {/* Left Column: Candidates Selection (7 Cols) */}
        <div className="expanded:col-span-7 bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
          <div className="flex items-center justify-between border-b border-line-soft pb-3">
            <div>
              <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Calon Lulusan</span>
              <h3 className="text-sm font-bold text-ink mt-0.5">Daftar Siswa Kelas Tingkat Akhir</h3>
            </div>
            <span className="text-xs text-ink-soft font-bold bg-surface-subtle px-2 py-1 rounded-full border border-line">
              {selectedStudentIds.length} Siswa Terpilih
            </span>
          </div>

          {/* Classroom Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1">Pilih Kelas Tingkat Akhir (TK B):</label>
            <SelectSheet
              value={selectedClassId}
              onChange={setSelectedClassId}
              options={tkbClasses.map(c => ({ value: c.id, label: `${c.name} (${c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: ${c.capacity} anak` }))}
            />
          </div>

          {/* Candidates Table */}
          <div className="border border-line rounded-field overflow-hidden bg-surface shadow-hairline">
            <div className="p-3 bg-surface-subtle border-b border-line flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-ink-soft font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={candidates.length > 0 && selectedStudentIds.length === candidates.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-line text-ink focus:ring-0 w-4 h-4 bg-surface cursor-pointer"
                />
                <span>Pilih Semua Siswa ({candidates.length})</span>
              </label>
              <span className="text-[10px] text-ink-soft font-mono font-semibold whitespace-nowrap">Status: AKTIF</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-line-soft">
              {candidates.length > 0 ? (
                candidates.map(candidate => {
                  const isSelected = selectedStudentIds.includes(candidate.student_id);
                  return (
                    <div
                      key={candidate.student_id}
                      onClick={() => handleToggleStudent(candidate.student_id)}
                      className={`p-3 flex items-center justify-between text-xs hover-only:bg-surface-subtle/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-surface-subtle' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-line text-ink focus:ring-0 w-4 h-4 bg-surface"
                        />
                        <div>
                          <p className="font-bold text-ink">{candidate.full_name}</p>
                          <p className="text-[11px] text-ink-soft font-mono whitespace-nowrap">NIS: {candidate.nis || '—'} • Gender: {candidate.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-ink-soft whitespace-nowrap">Masuk: {candidate.entry_date}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-ink-faint text-xs">
                  Tidak ada siswa dengan penempatan aktif di rombel tingkat akhir ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Graduation Finalization Panel (5 Cols) */}
        <div className="expanded:col-span-5 bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-line-soft pb-3">
              <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Finalisasi</span>
              <h3 className="text-sm font-bold text-ink mt-0.5">Penetapan Kelulusan Resmi</h3>
            </div>

            {/* Summary Card */}
            <div className="bg-surface-subtle border border-line rounded-field p-4 space-y-3 text-xs">
              <div className="flex justify-between text-ink-soft">
                <span>Rombel Tingkat Akhir:</span>
                <span className="font-bold text-ink">{selectedClassObj?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Jumlah Calon Dipilih:</span>
                <span className="font-bold text-ink font-mono">{selectedStudentIds.length} Siswa</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Tanggal Kelulusan:</span>
                <span className="font-mono text-ink-soft">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {/* Terminal Invariants Notice */}
            <div className="bg-surface-subtle border border-line rounded-field p-4 text-xs text-ink-soft space-y-2">
              <div className="flex items-center space-x-1.5 text-ink font-semibold">
                <ShieldCheck className="w-4 h-4 text-ink-soft" />
                <span>Konsekuensi Hukum &amp; Tata Kelola Kelulusan:</span>
              </div>
              <ul className="text-ink-soft text-[11px] space-y-1.5 list-disc list-inside">
                <li>Catatan penempatan aktif diakhiri dengan status <strong>COMPLETED</strong>.</li>
                <li>Status kelembagaan siswa berubah menjadi <strong>GRADUATED</strong>.</li>
                <li>Siswa otomatis terdaftar dalam Buku Induk Alumni.</li>
              </ul>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-line-soft">
            <button
              onClick={() => setShowGradModal(true)}
              disabled={!isAuthorizedActor || selectedStudentIds.length === 0}
              className="w-full py-2 rounded-field bg-brand hover-only:opacity-90 disabled:opacity-40 text-on-brand font-bold text-xs shadow-hairline flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Tetapkan Kelulusan ({selectedStudentIds.length} Siswa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Graduates / Alumni Ledger */}
      <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-ink-soft" />
            <h3 className="text-sm font-bold text-ink">Buku Induk Alumni &amp; Riwayat Kelulusan</h3>
          </div>
          <span className="text-xs text-ink-soft font-medium">Total {graduatedAlumni.length} Alumni Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-ink-soft uppercase tracking-wider font-semibold border-b border-line">
              <tr>
                <th className="py-3 px-4">Nama Alumni</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Tanggal Kelulusan</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft font-medium">
              {graduatedAlumni.length > 0 ? (
                graduatedAlumni.map((alumnus) => (
                  <tr key={alumnus.id} className="hover-only:bg-surface-subtle transition-colors">
                    <td className="py-3 px-4 font-bold text-ink flex items-center space-x-2">
                      <Award className="w-4 h-4 text-ink-soft" />
                      <span>{alumnus.full_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-soft">{alumnus.nis}</td>
                    <td className="py-3 px-4 text-ink-soft">{alumnus.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</td>
                    <td className="py-3 px-4 font-mono text-ink-soft">{alumnus.exit_date}</td>
                    <td className="py-3 px-4 text-ink-soft font-sans">{alumnus.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-faint text-xs">
                    Belum ada data alumni yang tercatat lulus di unit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showGradModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-line rounded-card max-w-lg w-full p-4 medium:p-6 shadow-floating space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center space-x-2 text-ink">
                <Award className="w-4 h-4 text-ink-soft" />
                <h3 className="text-base font-bold text-ink">Konfirmasi Penetapan Kelulusan</h3>
              </div>
              <button
                onClick={() => setShowGradModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-soft space-y-3">
              <p>
                Anda akan menetapkan kelulusan resmi bagi <strong>{selectedStudentIds.length} siswa</strong> dari kelas <strong>{selectedClassObj?.name}</strong>.
              </p>

              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-2 text-[11px]">
                <div className="flex justify-between text-ink-soft">
                  <span>Unit Sekolah:</span>
                  <span className="font-bold text-ink">{school?.name}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Rombel Asal:</span>
                  <span className="font-bold text-ink">{selectedClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Jumlah Lulusan:</span>
                  <span className="font-bold text-ink">{selectedStudentIds.length} Siswa</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Status Siswa:</span>
                  <span className="font-bold text-success-deep">LULUS (Alumni)</span>
                </div>
              </div>

              <div className="bg-warning-tint border border-warning-line p-3 rounded-field text-warning-deep text-[11px]">
                Perhatian: Tindakan ini bersifat final. Catatan penempatan yang telah selesai akan dikunci secara permanen dan dicatat dalam buku induk alumni.
              </div>
            </div>

            <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setShowGradModal(false)}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteGraduation}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand text-xs font-bold flex justify-center items-center space-x-2 cursor-pointer shadow-hairline transition-colors"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Tetapkan Lulus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
