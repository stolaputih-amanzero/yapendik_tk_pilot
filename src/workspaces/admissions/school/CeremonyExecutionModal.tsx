import React, { useState } from 'react';
import { ProspectiveChildApplicant, EnrollmentCeremonyResult } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { GraduationCap, ShieldCheck, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface CeremonyExecutionModalProps {
  applicant: ProspectiveChildApplicant;
  headmasterContext: {
    personId: string;
    role: string;
    activeSchoolId: string;
  };
  onSuccess: (result: EnrollmentCeremonyResult) => void;
  onClose: () => void;
}

export const CeremonyExecutionModal: React.FC<CeremonyExecutionModalProps> = ({
  applicant,
  headmasterContext,
  onSuccess,
  onClose
}) => {
  const [targetClassId, setTargetClassId] = useState<string>('cls_tk_a1');
  const [confirmChildName, setConfirmChildName] = useState<string>('');
  const [executing, setExecuting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isStatusSettled = applicant.status === 'TUITION_SETTLED';
  const isNameConfirmed = confirmChildName.trim().toLowerCase() === applicant.child_full_name.trim().toLowerCase();
  const canConfirm = isStatusSettled && isNameConfirmed && !executing;

  const handleExecuteCeremony = async () => {
    if (!canConfirm) return;
    setExecuting(true);
    setErrorMsg(null);

    try {
      const result = await admissionsService.executeEnrollmentCeremony(
        applicant.applicant_id,
        targetClassId,
        headmasterContext
      );
      onSuccess(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Eksekusi Upacara Penerimaan Gagal.');
    } finally {
      setExecuting(false);
    }
  };

  const schoolDisplayName = applicant.target_school_id === 'sch_tk_yapendik_01'
    ? 'TK Yapendik 01 Menteng'
    : applicant.target_school_id === 'sch_tk_yapendik_02'
    ? 'TK Yapendik 02 Kebayoran'
    : applicant.target_school_id;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" data-testid="ceremony-execution-modal">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🎓
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
            ADR-05: The Enrollment Ceremony (Otoritas Penuh Kepala Sekolah)
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Upacara Pengukuhan Status Siswa Resmi
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Tindakan transaksional tunggal (ACID) untuk mempromosikan calon siswa dari tabel pementasan ke 4 tabel kanonikal sekolah.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isStatusSettled && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <strong className="flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Syarat Upacara Belum Terpenuhi:
            </strong>
            <p className="pl-5 leading-relaxed">
              Status aplikasi calon siswa saat ini adalah <strong>{applicant.status}</strong>. 
              The Enrollment Ceremony hanya dapat dieksekusi jika status adalah <strong>TUITION_SETTLED</strong> (Uang Pangkal Lunas).
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Nama Lengkap Anak</span>
            <strong className="text-slate-900 text-sm font-black">{applicant.child_full_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">NIK Calon Siswa</span>
            <span className="text-slate-800 font-mono font-bold">{applicant.child_nik}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Wali / Orang Tua</span>
            <span className="text-slate-800 font-bold">{applicant.guardian_full_name} ({applicant.guardian_relationship_type})</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Unit Sekolah Penyelenggara</span>
            <span className="text-blue-700 font-bold">{schoolDisplayName}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Penempatan Rombel Kanonikal (student_placement_records)
            </label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-2xs"
            >
              <option value="cls_tk_a1">TK A-1 (Menteng Mawar)</option>
              <option value="cls_tk_a2">TK A-2 (Menteng Melati)</option>
              <option value="cls_tk_b1">TK B-1 (Menteng Anggrek)</option>
              <option value="cls_kb_1">KB Ceria 1</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Konfirmasi Otoritas: Ketik Ulang Nama Lengkap Calon Siswa
            </label>
            <input
              type="text"
              value={confirmChildName}
              onChange={(e) => setConfirmChildName(e.target.value)}
              placeholder={applicant.child_full_name}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-2xs"
              data-testid="confirm-child-name-input"
            />
            <p className="text-xs text-slate-500 mt-1">
              Mencegah kekeliruan pengukuhan identitas hukum anak.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteCeremony}
            disabled={!canConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              canConfirm
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            data-testid="confirm-ceremony-btn"
            aria-disabled={!canConfirm}
          >
            {executing ? 'Mengukuhkan Status Siswa...' : 'Konfirmasi Promosi Resmi (The Ceremony) 🎓'}
          </button>
        </div>
      </div>
    </div>
  );
};
