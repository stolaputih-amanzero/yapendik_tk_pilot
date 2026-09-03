/**
 * Yapendik School OS — Stage 7 Gate 2
 * The Enrollment Ceremony Modal (ADR-05 & Hukum 8 Adaptive Dialog)
 * 
 * Strict Governance & Ergonomics:
 * - Hukum 8: AdaptiveDialog migration (Bottom sheet on mobile, centered on desktop)
 * - Hukum 9: 2-Tier Header (Matching-Pill Context Ribbon)
 * - Precondition check: applicant.status === 'TUITION_SETTLED'
 * - Authority Confirmation: Manual typed name match verification
 */

import React, { useState } from 'react';
import { ProspectiveChildApplicant, EnrollmentCeremonyResult } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { AdaptiveDialog } from '../../../components/ui/AdaptiveDialog';
import { SelectSheet, Input } from '../../../components/ui';
import { GraduationCap, ShieldCheck, AlertTriangle, Building2, Calendar, Sparkles } from 'lucide-react';

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

  const initials = applicant.child_full_name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  // Tier 1 & Tier 2 Header (Hukum 9 Matching-Pill Context Ribbon)
  const dialogHeader = (
    <div className="space-y-3">
      {/* Tier 1: Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink tracking-tight truncate">
            {applicant.child_full_name}
          </h2>
          <p className="text-xs text-ink-soft font-mono">
            NIK: {applicant.child_nik}
          </p>
        </div>
      </div>

      {/* Tier 2: Context Ribbon */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
          <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
          <span>{schoolDisplayName}</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
          <Calendar className="w-4 h-4 text-brand-secondary shrink-0" />
          <span>T.A. 2026/2027 • Ganjil</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-success-tint border border-success-line text-[11px] font-bold text-success-deep">
          <GraduationCap className="w-4 h-4 text-success shrink-0" />
          <span>Jenjang: {applicant.target_class_level.replace('_', ' ')}</span>
        </span>
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={true}
      onClose={onClose}
      title={dialogHeader}
      description="ADR-05: The Enrollment Ceremony — Pengukuhan Kedaulatan Kepala Sekolah"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line font-bold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteCeremony}
            disabled={!canConfirm}
            className={`px-5 py-2 rounded-field text-xs font-bold transition-all flex items-center space-x-1.5 ${
              canConfirm
                ? 'bg-success hover-only:opacity-90 text-on-brand shadow-hairline cursor-pointer'
                : 'bg-surface-subtle text-ink-faint cursor-not-allowed border border-line'
            }`}
            data-testid="confirm-ceremony-btn"
            aria-disabled={!canConfirm}
          >
            <Sparkles className="w-4 h-4" />
            <span>{executing ? 'Mengukuhkan Status Siswa...' : 'Konfirmasi Promosi Resmi'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-ink font-sans py-2" data-testid="ceremony-execution-modal">
        {errorMsg && (
          <div className="p-4 rounded-field bg-danger-tint border border-danger-line text-danger-deep text-xs flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isStatusSettled && (
          <div className="p-4 rounded-field bg-warning-tint border border-warning-line text-warning-deep text-xs space-y-1">
            <strong className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              Syarat Upacara Belum Terpenuhi:
            </strong>
            <p className="pl-5 leading-relaxed">
              Status aplikasi calon siswa saat ini adalah <strong>{applicant.status}</strong>. 
              The Enrollment Ceremony hanya dapat dieksekusi jika status adalah <strong>TUITION_SETTLED</strong> (Uang Pangkal Lunas).
            </p>
          </div>
        )}

        {/* Details Summary */}
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-3 p-4 rounded-field bg-surface-subtle border border-line-soft text-xs">
          <div>
            <span className="text-ink-soft block text-[10px] font-bold uppercase tracking-wider">Wali / Orang Tua</span>
            <span className="text-ink font-semibold mt-0.5 block">{applicant.guardian_full_name} ({applicant.guardian_relationship_type})</span>
            <span className="text-ink-faint font-mono text-[11px]">{applicant.guardian_phone_number}</span>
          </div>
          <div>
            <span className="text-ink-soft block text-[10px] font-bold uppercase tracking-wider">Status Keuangan</span>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isStatusSettled ? 'bg-success-tint border-success-line text-success-deep' : 'bg-warning-tint border-warning-line text-warning-deep'
            }`}>
              {isStatusSettled ? 'LUNAS (TUITION_SETTLED)' : applicant.status}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 text-xs pt-1">
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
            hint="Mencegah kekeliruan mutasi identitas hukum anak ke buku induk aktif."
            data-testid="confirm-child-name-input"
          />
        </div>
      </div>
    </AdaptiveDialog>
  );
};
