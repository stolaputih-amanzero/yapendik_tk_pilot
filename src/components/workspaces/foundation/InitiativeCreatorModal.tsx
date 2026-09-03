/**
 * Yapendik School OS — The Glass Layer
 * Initiative Creator Modal (`/foundation/actions/new`)
 * 
 * Governed action issuance modal for Foundation Superadmin (Shirley A.T. Wakkary).
 * Enforces State Machine H-01 and Closed-Loop Canonical Anchoring (FB-05).
 * Harmonized to Amanaura v3.0-RELEASE (Hukum 8 & 9 AdaptiveDialog & 2-Tier Header).
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
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
import { AdaptiveDialog } from '../../ui/AdaptiveDialog';

export interface InitiativeCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiativeCreated: (action: InstitutionalActionRecord) => void;
  initialData?: Partial<{
    actionType: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
    title: string;
    policyIntent: string;
    resourceDetails: string;
    initiativeType: SupportInitiativeType;
    targetScope: TargetScope;
  }>;
}

export const InitiativeCreatorModal: React.FC<InitiativeCreatorModalProps> = ({
  isOpen,
  onClose,
  onInitiativeCreated,
  initialData
}) => {
  const { currentPersona } = useSecurityContext();
  const [actionType, setActionType] = useState<'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE'>(
    initialData?.actionType || 'SUPPORT_INITIATIVE'
  );
  const [targetScope, setTargetScope] = useState<TargetScope>(initialData?.targetScope || 'ALL_TK_UNITS');
  const [targetSchoolId, setTargetSchoolId] = useState('sch_tk_maranatha');
  const [title, setTitle] = useState(initialData?.title || '');
  const [policyIntent, setPolicyIntent] = useState(initialData?.policyIntent || '');

  // Support Payload states
  const [initiativeType, setInitiativeType] = useState<SupportInitiativeType>(
    initialData?.initiativeType || 'LEARNING_MATERIALS'
  );
  const [resourceDetails, setResourceDetails] = useState(initialData?.resourceDetails || '');
  const [facilitatorName, setFacilitatorName] = useState('');

  // Directive Payload states
  const [directiveCode, setDirectiveCode] = useState(`DIR-2026-${Date.now().toString().slice(-4)}`);
  const [advisoryGuidelines, setAdvisoryGuidelines] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.actionType) setActionType(initialData.actionType);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.policyIntent) setPolicyIntent(initialData.policyIntent);
      if (initialData.resourceDetails) setResourceDetails(initialData.resourceDetails);
      if (initialData.initiativeType) setInitiativeType(initialData.initiativeType);
      if (initialData.targetScope) setTargetScope(initialData.targetScope);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const issuedByPersonId = currentPersona?.personId || 'per_superadmin_shirley';
      const issuedByName = currentPersona?.name || 'SHIRLEY A.T.WAKKARY';

      const supportPayload = actionType === 'SUPPORT_INITIATIVE' ? {
        initiative_type: initiativeType,
        resource_allocation_details: resourceDetails.trim() || 'Alokasi materi pembelajaran standar Yapendik.',
        deployed_facilitator_name: facilitatorName.trim() || undefined,
        support_lifecycle_status: 'DEPLOYED' as const
      } : undefined;

      const directivePayload = actionType === 'GOVERNANCE_DIRECTIVE' ? {
        directive_code: directiveCode.trim(),
        advisory_guidelines: advisoryGuidelines.trim() || 'Pedoman tata kelola dan operasional satuan.',
        compliance_recommendations: 'Diharapkan ditinjau dan diadopsi dalam rapat guru unit.',
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

  const dialogHeader = (
    <div className="space-y-3">
      {/* Tier 1: Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink tracking-tight truncate">
            Terbitkan Inisiatif Yayasan
          </h2>
          <p className="text-xs text-ink-soft">
            Penyaluran fasilitasi kelembagaan &amp; arahan tata kelola (FB-03 / FB-05)
          </p>
        </div>
      </div>

      {/* Tier 2: Context Ribbon (Hukum 9 Matching-Pill Context Ribbon) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
          <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
          <span>Pusat Tata Kelola Yayasan</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
          <span>Cakupan: {targetScope === 'ALL_TK_UNITS' ? 'Semua Unit TK' : 'Unit Spesifik'}</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-tint border border-brand-line text-[11px] font-bold text-brand-deep">
          <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
          <span>{actionType === 'SUPPORT_INITIATIVE' ? 'Inisiatif Bantuan (Support)' : 'Direktif Kebijakan'}</span>
        </span>
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title={dialogHeader}
      description="Penerbitan aksi kebijakan dan fasilitasi sumber daya kelembagaan."
      maxWidth="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-field border border-line text-ink-soft text-xs font-bold hover-only:bg-surface-subtle cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2 rounded-field bg-brand-primary hover:bg-brand-deep text-on-brand font-bold text-xs shadow-hairline flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Sekarang'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[90dvh] overflow-y-auto py-1 text-xs text-ink" data-testid="initiative-creator-modal">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-bold text-ink">
              Cakupan Sasaran Unit
            </label>
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value as TargetScope)}
              className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
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
                className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
              >
                <option value="sch_tk_maranatha">TK YAPENDIK GPIB Maranatha</option>
                <option value="sch_tk_yapendik_01">TK Yapendik 01 Menteng</option>
                <option value="sch_tk_yapendik_02">TK Yapendik 02 Kebayoran</option>
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
            className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none"
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
            className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink font-medium focus:border-brand-primary outline-none resize-none"
            required
          />
        </div>

        {/* Specific Payload fields */}
        {actionType === 'SUPPORT_INITIATIVE' ? (
          <div className="p-3.5 rounded-field bg-surface-subtle border border-line-hairline space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Detail Alokasi Sumber Daya Bantuan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-ink-soft">
                  Jenis Bantuan
                </label>
                <select
                  value={initiativeType}
                  onChange={(e) => setInitiativeType(e.target.value as SupportInitiativeType)}
                  className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink text-xs font-medium outline-none"
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
                  className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink text-xs outline-none"
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
                className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink text-xs outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-field bg-surface-subtle border border-line-hairline space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
              <ShieldCheck className="w-4 h-4 text-success" />
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
                className="w-full px-3 py-2 rounded-field bg-surface border border-line font-mono text-ink text-xs outline-none"
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
                className="w-full px-3 py-2 rounded-field bg-surface border border-line text-ink text-xs outline-none resize-none"
              />
            </div>
          </div>
        )}
      </form>
    </AdaptiveDialog>
  );
};
