import React, { useState } from 'react';
import { ProspectiveChildApplicant, EnrollmentCeremonyResult } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { SelectSheet, Input } from '../../../components/ui';
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
    <div className="fixed inset-0 z-50 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" data-testid="ceremony-execution-modal">
      <div className="w-full max-w-2xl bg-surface border border-line rounded-3xl shadow-floating p-6 medium:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-line-soft pb-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-ink-faint hover-only:text-ink-soft rounded-lg hover-only:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-card bg-success-tint text-success-deep border border-success-line flex items-center justify-center text-3xl mx-auto shadow-hairline">
            
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-success-tint text-success-deep border border-success-line inline-block whitespace-nowrap">
            ADR-05: The Enrollment Ceremony (Otoritas Penuh Kepala Sekolah)
          </span>
          <h2 className="text-2xl font-black text-ink tracking-tight">
            Upacara Pengukuhan Status Siswa Resmi
          </h2>
          <p className="text-xs text-ink-soft max-w-lg mx-auto leading-relaxed">
            Proses akhir untuk meresmikan pendaftar menjadi siswa aktif di sistem Amanaura OS.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-field bg-danger-tint border border-danger-line text-danger-deep text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isStatusSettled && (
          <div className="p-4 rounded-field bg-warning-tint border border-warning-line text-warning-deep text-xs space-y-1">
            <strong className="flex items-center gap-2 text-warning-deep">
              <AlertTriangle className="w-4 h-4 text-brand-primary shrink-0" />
              Syarat Upacara Belum Terpenuhi:
            </strong>
            <p className="pl-5 leading-relaxed">
              Status aplikasi calon siswa saat ini adalah <strong>{applicant.status}</strong>. 
              The Enrollment Ceremony hanya dapat dieksekusi jika status adalah <strong>TUITION_SETTLED</strong> (Uang Pangkal Lunas).
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-card bg-surface-subtle border border-line text-xs">
          <div>
            <span className="text-ink-soft block mb-0.5 font-medium">Nama Lengkap Anak</span>
            <strong className="text-ink text-sm font-black">{applicant.child_full_name}</strong>
          </div>
          <div>
            <span className="text-ink-soft block mb-0.5 font-medium">NIK Calon Siswa</span>
            <span className="text-ink font-mono font-bold">{applicant.child_nik}</span>
          </div>
          <div>
            <span className="text-ink-soft block mb-0.5 font-medium">Wali / Orang Tua</span>
            <span className="text-ink font-bold">{applicant.guardian_full_name} ({applicant.guardian_relationship_type})</span>
          </div>
          <div>
            <span className="text-ink-soft block mb-0.5 font-medium">Unit Sekolah Penyelenggara</span>
            <span className="text-info-deep font-bold">{schoolDisplayName}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <SelectSheet
            label="Penempatan Rombel Kanonikal (student_placement_records)"
            value={targetClassId}
            onChange={setTargetClassId}
            options={[
              { value: 'cls_tk_a1', label: 'TK A-1 (Menteng Mawar)' },
              { value: 'cls_tk_a2', label: 'TK A-2 (Menteng Melati)' },
              { value: 'cls_tk_b1', label: 'TK B-1 (Menteng Anggrek)' },
              { value: 'cls_kb_1', label: 'KB Ceria 1' },
            ]}
          />

          <Input
            label="Konfirmasi Otoritas: Ketik Ulang Nama Lengkap Calon Siswa"
            type="text"
            value={confirmChildName}
            onChange={(e) => setConfirmChildName(e.target.value)}
            placeholder={applicant.child_full_name}
            hint="Mencegah kekeliruan pengukuhan identitas hukum anak."
            data-testid="confirm-child-name-input"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-line-soft">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteCeremony}
            disabled={!canConfirm}
            className={`px-6 py-2 rounded-field text-xs font-black transition-all ${
              canConfirm
                ? 'bg-success hover-only:opacity-90 text-on-brand shadow-hairline cursor-pointer'
                : 'bg-surface-subtle text-ink-faint cursor-not-allowed border border-line'
            }`}
            data-testid="confirm-ceremony-btn"
            aria-disabled={!canConfirm}
          >
            {executing ? 'Mengukuhkan Status Siswa...' : 'Konfirmasi Promosi Resmi  '}
          </button>
        </div>
      </div>
    </div>
  );
};
