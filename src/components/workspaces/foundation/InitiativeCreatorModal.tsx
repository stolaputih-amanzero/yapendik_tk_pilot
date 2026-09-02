/**
 * Yapendik School OS — The Glass Layer
 * Initiative Creator Modal (`/foundation/actions/new`)
 * 
 * Governed action issuance modal for Foundation Superadmin (Shirley A.T. Wakkary).
 * Enforces State Machine H-01 and Closed-Loop Canonical Anchoring (FB-05).
 */

import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Sparkles, 
  HeartHandshake, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  InstitutionalActionRecord, 
  SupportInitiativeType, 
  TargetScope 
} from '../../../types/institutionalLearningTypes';
import { institutionalLearningService } from '../../../services/institutionalLearningService';
import { useSecurityContext } from '../../../auth/context';

export interface InitiativeCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiativeCreated: (action: InstitutionalActionRecord) => void;
}

export const InitiativeCreatorModal: React.FC<InitiativeCreatorModalProps> = ({
  isOpen,
  onClose,
  onInitiativeCreated
}) => {
  const { currentPersona } = useSecurityContext();
  const [actionType, setActionType] = useState<'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE'>('SUPPORT_INITIATIVE');
  const [targetScope, setTargetScope] = useState<TargetScope>('ALL_TK_UNITS');
  const [targetSchoolId, setTargetSchoolId] = useState('sch_tk_maranatha');
  const [title, setTitle] = useState('');
  const [policyIntent, setPolicyIntent] = useState('');

  // Support Payload states
  const [initiativeType, setInitiativeType] = useState<SupportInitiativeType>('LEARNING_MATERIALS');
  const [resourceDetails, setResourceDetails] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');

  // Directive Payload states
  const [directiveCode, setDirectiveCode] = useState(`DIR-2026-${Date.now().toString().slice(-4)}`);
  const [advisoryGuidelines, setAdvisoryGuidelines] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !policyIntent.trim()) {
      setErrorMsg('Judul dan Maksud Kebijakan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const issuedByName = currentPersona?.name || 'SHIRLEY A.T.WAKKARY';
      const issuedByPersonId = currentPersona?.personId || 'per_superadmin_shirley';

      const supportPayload = actionType === 'SUPPORT_INITIATIVE' ? {
        initiative_type: initiativeType,
        resource_allocation_details: resourceDetails || 'Paket fasilitasi pembelajaran unit TK.',
        deployed_facilitator_name: facilitatorName || undefined,
        support_lifecycle_status: 'DEPLOYED' as const
      } : undefined;

      const directivePayload = actionType === 'GOVERNANCE_DIRECTIVE' ? {
        directive_code: directiveCode,
        advisory_guidelines: advisoryGuidelines || 'Panduan tata kelola kurikulum dan ritme satuan.',
        compliance_recommendations: 'Penyesuaian ritme operasional diserahkan kepada kedaulatan Kepala Sekolah.',
        directive_lifecycle_status: 'PUBLISHED' as const
      } : undefined;

      const newAction = await institutionalLearningService.createInstitutionalAction({
        action_type: actionType,
        target_scope: targetScope,
        target_school_id: targetScope === 'SPECIFIC_SCHOOL' ? targetSchoolId : undefined,
        title: title.trim(),
        policy_intent: policyIntent.trim(),
        issued_by_person_id: issuedByPersonId,
        issued_by_name: issuedByName,
        support_payload: supportPayload,
        directive_payload: directivePayload
      });

      onInitiativeCreated(newAction);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menerbitkan inisiatif.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="initiative-creator-modal"
    >
      <div 
        className="w-full max-w-xl bg-surface border border-line rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col text-ink"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="font-bold text-base text-ink leading-tight">
                Terbitkan Inisiatif Yayasan
              </h3>
              <p className="text-[11px] text-ink-soft">
                Penyaluran dukungan kelembagaan &amp; arahan tata kelola (FB-03 / FB-05)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface text-ink-soft hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-tint text-danger-deep border border-danger-line">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Type Segmented Control */}
          <div className="space-y-1.5">
            <label className="block font-bold text-ink">
              Jenis Tindakan Kelembagaan
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-subtle border border-line-hairline">
              <button
                type="button"
                onClick={() => setActionType('SUPPORT_INITIATIVE')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'SUPPORT_INITIATIVE'
                    ? 'bg-brand-primary text-on-brand shadow-hairline'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Inisiatif Bantuan (Support)</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('GOVERNANCE_DIRECTIVE')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionType === 'GOVERNANCE_DIRECTIVE'
                    ? 'bg-brand-primary text-on-brand shadow-hairline'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Direktif Kebijakan</span>
              </button>
            </div>
          </div>

          {/* Target Scope */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-ink">
                Cakupan Sasaran Unit
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as TargetScope)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
              >
                <option value="ALL_TK_UNITS">Seluruh Unit TK Binaan</option>
                <option value="SPECIFIC_SCHOOL">Unit TK Spesifik</option>
              </select>
            </div>

            {targetScope === 'SPECIFIC_SCHOOL' && (
              <div className="space-y-1">
                <label className="block font-bold text-ink">
                  Pilih Unit Sekolah
                </label>
                <select
                  value={targetSchoolId}
                  onChange={(e) => setTargetSchoolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
                >
                  <option value="sch_tk_maranatha">TK YAPENDIK GPIB Maranatha</option>
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block font-bold text-ink">
              Judul Inisiatif / Program
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Fasilitasi Bahan Alam & Loose-Parts untuk Sentra STEAM"
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
              required
            />
          </div>

          {/* Policy Intent */}
          <div className="space-y-1">
            <label className="block font-bold text-ink">
              Maksud Kebijakan &amp; Dasar Pedagogis
            </label>
            <textarea
              rows={2}
              value={policyIntent}
              onChange={(e) => setPolicyIntent(e.target.value)}
              placeholder="Jelaskan alasan kebijakan ini diterbitkan dan hasil yang diharapkan pada unit TK..."
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none resize-none"
              required
            />
          </div>

          {/* Specific Payload fields */}
          {actionType === 'SUPPORT_INITIATIVE' ? (
            <div className="p-3 rounded-2xl bg-surface-subtle border border-line-hairline space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>Detail Alokasi Sumber Daya Bantuan</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-ink-soft">
                    Jenis Bantuan
                  </label>
                  <select
                    value={initiativeType}
                    onChange={(e) => setInitiativeType(e.target.value as SupportInitiativeType)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-line text-ink text-xs font-medium outline-none"
                  >
                    <option value="LEARNING_MATERIALS">Bantuan Material Belajar (APE)</option>
                    <option value="TEACHER_COACHING">Pendampingan &amp; Pelatihan Guru</option>
                    <option value="SAFETY_EQUIPMENT">Peralatan Keamanan Fisik</option>
                    <option value="SPECIALIST_CONSULTATION">Konsultasi Pakar PAUD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-ink-soft">
                    Fasilitator / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={facilitatorName}
                    onChange={(e) => setFacilitatorName(e.target.value)}
                    placeholder="Nama fasilitator (opsional)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-line text-ink text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-ink-soft">
                  Rincian Logistik / Alokasi
                </label>
                <input
                  type="text"
                  value={resourceDetails}
                  onChange={(e) => setResourceDetails(e.target.value)}
                  placeholder="Contoh: 1 set balok kayu hardwood + baki sortir per rombel."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-line text-ink text-xs outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-surface-subtle border border-line-hairline space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>Detail Arahan Kebijakan Tata Kelola</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-ink-soft">
                  Kode Direktif
                </label>
                <input
                  type="text"
                  value={directiveCode}
                  onChange={(e) => setDirectiveCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-line font-mono text-ink text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-ink-soft">
                  Panduan Arahan
                </label>
                <textarea
                  rows={2}
                  value={advisoryGuidelines}
                  onChange={(e) => setAdvisoryGuidelines(e.target.value)}
                  placeholder="Pedoman tata kelola yang disarankan bagi satuan..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-line text-ink text-xs outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft hover:text-ink transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-deep text-on-brand font-bold text-xs shadow-hairline flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
