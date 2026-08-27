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
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="graduation-registry-workspace">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Buku Induk Alumni</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Buku Registrasi Kelulusan Siswa (Tingkat Akhir)</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik'} • Penetapan kelulusan resmi, finalisasi rekam jejak, dan pencatatan buku induk alumni.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={loadClassesAndAlumni}
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
            <p className="font-semibold">{feedback.type === 'success' ? 'Kelulusan Sukses' : feedback.diagnostics?.title || 'Operasi Ditolak'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Saran Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Layout: Candidate Graduates on Left, Graduation Action & Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidates Selection (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Calon Lulusan</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Daftar Siswa Kelas Tingkat Akhir</h3>
            </div>
            <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {selectedStudentIds.length} Siswa Terpilih
            </span>
          </div>

          {/* Classroom Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas Tingkat Akhir (TK B):</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs font-medium"
            >
              {tkbClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age_group === 'TK_A_4_5' ? '4-5 Tahun' : '5-6 Tahun'}) • Kapasitas: {c.capacity} anak
                </option>
              ))}
            </select>
          </div>

          {/* Candidates Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={candidates.length > 0 && selectedStudentIds.length === candidates.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4 bg-white cursor-pointer"
                />
                <span>Pilih Semua Siswa ({candidates.length})</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">Status: AKTIF</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {candidates.length > 0 ? (
                candidates.map(candidate => {
                  const isSelected = selectedStudentIds.includes(candidate.student_id);
                  return (
                    <div
                      key={candidate.student_id}
                      onClick={() => handleToggleStudent(candidate.student_id)}
                      className={`p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4 bg-white"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{candidate.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">NIS: {candidate.nis || '—'} • Gender: {candidate.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">Masuk: {candidate.entry_date}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada siswa dengan penempatan aktif di rombel tingkat akhir ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Graduation Finalization Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Finalisasi</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Penetapan Kelulusan Resmi</h3>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Rombel Tingkat Akhir:</span>
                <span className="font-bold text-slate-900">{selectedClassObj?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jumlah Calon Dipilih:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedStudentIds.length} Siswa</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tanggal Kelulusan:</span>
                <span className="font-mono text-slate-700">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {/* Terminal Invariants Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Konsekuensi Hukum &amp; Tata Kelola Kelulusan:</span>
              </div>
              <ul className="text-slate-600 text-[11px] space-y-1.5 list-disc list-inside">
                <li>Catatan penempatan aktif diakhiri dengan status <strong>COMPLETED</strong>.</li>
                <li>Status kelembagaan siswa berubah menjadi <strong>GRADUATED</strong>.</li>
                <li>Siswa otomatis terdaftar dalam Buku Induk Alumni.</li>
              </ul>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowGradModal(true)}
              disabled={!isAuthorizedActor || selectedStudentIds.length === 0}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Tetapkan Kelulusan ({selectedStudentIds.length} Siswa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Graduates / Alumni Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Buku Induk Alumni &amp; Riwayat Kelulusan</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total {graduatedAlumni.length} Alumni Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Alumni</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Tanggal Kelulusan</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {graduatedAlumni.length > 0 ? (
                graduatedAlumni.map((alumnus) => (
                  <tr key={alumnus.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-slate-600" />
                      <span>{alumnus.full_name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{alumnus.nis}</td>
                    <td className="py-3.5 px-4 text-slate-500">{alumnus.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{alumnus.exit_date}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-sans">{alumnus.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900">
                <Award className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Penetapan Kelulusan</h3>
              </div>
              <button
                onClick={() => setShowGradModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p>
                Anda akan menetapkan kelulusan resmi bagi <strong>{selectedStudentIds.length} siswa</strong> dari kelas <strong>{selectedClassObj?.name}</strong>.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Unit Sekolah:</span>
                  <span className="font-bold text-slate-900">{school?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rombel Asal:</span>
                  <span className="font-bold text-slate-900">{selectedClassObj?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jumlah Lulusan:</span>
                  <span className="font-bold text-slate-900">{selectedStudentIds.length} Siswa</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status Siswa:</span>
                  <span className="font-bold text-emerald-700">LULUS (Alumni)</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-[11px]">
                Perhatian: Tindakan ini bersifat final. Catatan penempatan yang telah selesai akan dikunci secara permanen dan dicatat dalam buku induk alumni.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGradModal(false)}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteGraduation}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex justify-center items-center space-x-2 cursor-pointer shadow-xs transition-colors"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                <span>Tetapkan Lulus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
