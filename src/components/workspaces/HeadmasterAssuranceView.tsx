import { SelectSheet } from '../ui';
/**
 * Yapendik School OS — Stage 4.4-D Headmaster Operational Assurance View (Sub-Tab 4)
 * 
 * Resolution Console Paradigm:
 * SEE -> TRIAGE -> ACT -> VERIFY -> CLOSE
 * 
 * Invariants:
 * 1. HD-02: Assurance First, Detail Second.
 * 2. HD-03: Exception Queue != Incident Queue.
 * 3. HD-04: Audited Lifecycle State Machine.
 * 4. HD-07 & HD-NEG-01: Zero Child Surveillance.
 * 5. HD-08: Handover Reconciliation as First-Class Metric.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
  Send,
  X,
  FileCheck2,
  PhoneCall
} from 'lucide-react';
import {
  HeadmasterOperationalAssuranceViewModel,
  SafetyIncidentRecord,
  IncidentLifecycleStatus,
  IncidentSeverityLevel,
  TransitionIncidentLifecycleCommand
} from '../../types/schoolSafetyAssuranceTypes';
import { schoolSafetyAssuranceService } from '../../services/schoolSafetyAssuranceService';

interface Props {
  schoolId: string;
  headmasterPersonId: string;
  headmasterName: string;
  role: string;
}

export const HeadmasterAssuranceView: React.FC<Props> = ({
  schoolId,
  headmasterPersonId,
  headmasterName,
  role
}) => {
  const [data, setData] = useState<HeadmasterOperationalAssuranceViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'DETECTED' | 'TRIAGED' | 'RESOLVED' | 'AUDITED_CLOSED'>('ALL');

  // Triage Modal State
  const [selectedIncidentForTriage, setSelectedIncidentForTriage] = useState<SafetyIncidentRecord | null>(null);
  const [triageSeverity, setTriageSeverity] = useState<IncidentSeverityLevel>('MODERATE_SUPERVISED');
  const [triageAction, setTriageAction] = useState('');
  const [triageRationale, setTriageRationale] = useState('');
  const [notifyParent, setNotifyParent] = useState(true);
  const [parentContactName, setParentContactName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audit Closure Modal State
  const [selectedIncidentForAudit, setSelectedIncidentForAudit] = useState<SafetyIncidentRecord | null>(null);
  const [auditFindings, setAuditFindings] = useState('');

  const loadAssuranceData = async () => {
    try {
      setLoading(true);
      const res = await schoolSafetyAssuranceService.getHeadmasterOperationalAssurance(
        schoolId,
        role,
        headmasterPersonId
      );
      setData(res);
    } catch (err) {
      console.error('Error loading headmaster assurance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssuranceData();
  }, [schoolId, role, headmasterPersonId]);

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-ink-soft pb-[160px] expanded:pb-8">
        <div className="w-8 h-8 border-4 border-lppa-line border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Memuat Jaminan Operasional & Keselamatan Sekolah...</p>
      </div>
    );
  }

  const { school_context, today_assurance, needs_attention_queue, incident_pipeline, audit_readiness } = data;

  const filteredIncidents = incident_pipeline.filter(inc => {
    if (incidentFilter === 'ALL') return true;
    return inc.status === incidentFilter;
  });

  const handleExecuteTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForTriage || !triageAction.trim()) {
      alert('Instruksi tindakan penanganan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cmd: TransitionIncidentLifecycleCommand = {
        incident_id: selectedIncidentForTriage.incident_id,
        school_id: schoolId,
        target_status: 'TRIAGED',
        action_summary: triageAction.trim(),
        rationale_notes: triageRationale.trim() || 'Triage dan eskalasi penanganan oleh Kepala Sekolah.',
        notify_parent: notifyParent,
        parent_name: parentContactName.trim() || undefined,
        actor_person_id: headmasterPersonId,
        actor_name: headmasterName,
        role
      };

      await schoolSafetyAssuranceService.transitionIncidentLifecycle(cmd);
      setSelectedIncidentForTriage(null);
      setTriageAction('');
      setTriageRationale('');
      loadAssuranceData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses triage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteAuditClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForAudit || !auditFindings.trim()) {
      alert('Catatan verifikasi audit akhir wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cmd: TransitionIncidentLifecycleCommand = {
        incident_id: selectedIncidentForAudit.incident_id,
        school_id: schoolId,
        target_status: 'AUDITED_CLOSED',
        action_summary: auditFindings.trim(),
        rationale_notes: 'Verifikasi penutupan audit permanen oleh Kepala Sekolah.',
        notify_parent: false,
        actor_person_id: headmasterPersonId,
        actor_name: headmasterName,
        role
      };

      await schoolSafetyAssuranceService.transitionIncidentLifecycle(cmd);
      setSelectedIncidentForAudit(null);
      setAuditFindings('');
      loadAssuranceData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menutup audit insiden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 medium:px-6 py-6 space-y-6 animate-fadeIn pb-12 text-ink">
      {/* Header Context */}
      <div className="bg-surface border border-line-hairline rounded-2xl p-4 medium:p-6 text-ink shadow-hairline flex flex-col medium:flex-row medium:items-center medium:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-ink-soft uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-ink-soft" />
            <span>Konsol Resolusi & Jaminan Operasional</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink mt-1">
            {school_context.school_name}
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Tahun Ajaran: {school_context.academic_year_name} ({school_context.semester}) • Kepala Sekolah: {school_context.headmaster_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-ink-soft uppercase tracking-wider font-semibold">Skor Integritas Operasional</div>
            <div className="text-xl font-black text-success">
              {today_assurance.operational_integrity_pct}%
            </div>
          </div>
          <div className="p-3 bg-success-tint border border-success-line rounded-field text-success-deep">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* PANEL 1: TODAY'S OPERATIONAL ASSURANCE (4 Metrics) */}
      <div className="grid grid-cols-2 expanded:grid-cols-4 gap-4">
        {/* Metric 1: Kehadiran */}
        <div className="bg-surface border border-line p-4 rounded-field space-y-1 shadow-hairline">
          <div className="flex items-center justify-between text-ink-soft text-xs font-semibold">
            <span>Kehadiran Hari Ini</span>
            <Users className="w-4 h-4 text-ink-soft" />
          </div>
          <div className="text-2xl font-black text-ink">
            {today_assurance.attendance.attendance_rate_pct}%
          </div>
          <p className="text-[11px] text-ink-soft">
            {today_assurance.attendance.present_count} dari {today_assurance.attendance.total_students} peserta didik
          </p>
        </div>

        {/* Metric 2: Rekonsiliasi Kepulangan (Handover) */}
        <div className="bg-surface border border-line p-4 rounded-field space-y-1 shadow-hairline">
          <div className="flex items-center justify-between text-ink-soft text-xs font-semibold">
            <span>Rekonsiliasi Kepulangan</span>
            <UserCheck className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-black text-success">
            {today_assurance.handover.handover_rate_pct}%
          </div>
          <p className="text-[11px] text-ink-soft">
            {today_assurance.handover.reconciled_count} anak ({today_assurance.handover.standard_handover_count} reguler, {today_assurance.handover.alternate_pickup_count} kuasa)
          </p>
        </div>

        {/* Metric 3: Sinyal Pengecualian Aktif */}
        <div className="bg-surface border border-line p-4 rounded-field space-y-1 shadow-hairline">
          <div className="flex items-center justify-between text-ink-soft text-xs font-semibold">
            <span>Sinyal Pengecualian</span>
            <AlertTriangle className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-brand-primary">
            {today_assurance.active_exceptions_count}
          </div>
          <p className="text-[11px] text-ink-soft">
            Peringatan suhu / absensi belum ditutup
          </p>
        </div>

        {/* Metric 4: Insiden Terbuka */}
        <div className="bg-surface border border-line p-4 rounded-field space-y-1 shadow-hairline">
          <div className="flex items-center justify-between text-ink-soft text-xs font-semibold">
            <span>Insiden Terbuka</span>
            <Activity className="w-4 h-4 text-danger" />
          </div>
          <div className="text-2xl font-black text-danger">
            {today_assurance.open_incidents_count}
          </div>
          <p className="text-[11px] text-ink-soft">
            Menunggu triage atau penyelesaian
          </p>
        </div>
      </div>

      {/* PANEL 2: NEEDS ATTENTION (Actionable Queue) */}
      <div className="bg-surface border border-line rounded-card p-4 space-y-3 shadow-hairline">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Antrean Perhatian & Tindakan Kepala Sekolah ({needs_attention_queue.length})
            </h3>
          </div>
          <span className="text-[10px] text-ink-soft font-mono whitespace-nowrap">
            SEE → TRIAGE → ACT → VERIFY → CLOSE
          </span>
        </div>

        {needs_attention_queue.length === 0 ? (
          <div className="py-6 text-center text-ink-faint">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-1.5 text-success/60" />
            <p className="text-xs font-medium text-ink-soft">Semua sinyal dan insiden hari ini telah ditangani.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {needs_attention_queue.map(item => (
              <div
                key={item.id}
                className="bg-surface-subtle p-3 rounded-xl border border-line-hairline flex flex-col medium:flex-row medium:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      item.item_type === 'INCIDENT_TRIAGE'
                        ? 'bg-danger-tint text-danger-deep border border-danger-line'
                        : 'bg-warning-tint text-warning-deep border border-warning-line'
                    }`}>
                      {item.item_type === 'INCIDENT_TRIAGE' ? 'PERLU TRIAGE' : 'PANTAUAN'}
                    </span>
                    <span className="text-xs font-bold text-ink">{item.title}</span>
                    <span className="text-xs text-ink-soft">• {item.classroom_name}</span>
                  </div>
                  <p className="text-xs text-ink-soft font-medium">
                    <strong className="text-ink">Tindakan:</strong> {item.action_required}
                  </p>
                  <p className="text-[10px] text-ink-soft">
                    Dilaporkan oleh: {item.reported_by} ({new Date(item.reported_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                  </p>
                </div>

                {item.item_type === 'INCIDENT_TRIAGE' && (
                  <button
                    onClick={() => {
                      const inc = incident_pipeline.find(i => i.incident_id === item.id);
                      if (inc) setSelectedIncidentForTriage(inc);
                    }}
                    className="w-full medium:w-auto mt-2 medium:mt-0 px-3 py-2 medium:py-1 rounded-lg bg-brand hover-only:opacity-90 text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer shrink-0 shadow-hairline"
                  >
                    <span>Lakukan Triage</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL 3: INCIDENT LIFECYCLE MANAGEMENT */}
      <div className="bg-surface border border-line-hairline rounded-2xl p-4 space-y-4 shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 border-b border-line-soft pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ink-soft" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Manajemen Siklus Hidup Insiden Sekolah
            </h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-xl border border-line-hairline">
            {(['ALL', 'DETECTED', 'TRIAGED', 'RESOLVED', 'AUDITED_CLOSED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setIncidentFilter(f)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  incidentFilter === f
                    ? 'bg-brand text-on-brand shadow-hairline'
                    : 'text-ink-soft hover-only:text-ink'
                }`}
              >
                {f === 'ALL' ? 'Semua' : f}
              </button>
            ))}
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-ink-faint text-xs font-medium">
            Tidak ada insiden dengan filter status '{incidentFilter}'.
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {filteredIncidents.map(inc => (
              <div
                key={inc.incident_id}
                className="bg-surface-subtle p-4 rounded-xl border border-line-hairline space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{inc.title}</span>
                    <span className="text-xs text-ink-soft">({inc.class_name})</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      inc.status === 'AUDITED_CLOSED'
                        ? 'bg-success-tint text-success-deep border border-success-line'
                        : inc.status === 'RESOLVED'
                        ? 'bg-info-tint text-info-deep border border-info-line'
                        : 'bg-danger-tint text-danger-deep border border-danger-line'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-soft flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.detected_at).toLocaleDateString('id-ID')} {new Date(inc.detected_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-ink-soft font-medium leading-relaxed">
                  {inc.factual_chronology}
                </p>

                {/* Audit Trail Timeline */}
                <div className="bg-surface p-2 rounded-lg border border-line text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block">
                    Jejak Transisi Status ({inc.state_transitions.length} Langkah):
                  </span>
                  {inc.state_transitions.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-ink-soft">
                      <span className="text-success font-bold">[{t.to_status}]</span>
                      <span>{t.action_summary}</span>
                      <span className="text-ink-soft text-[10px]">({t.transitioned_by_name} - {new Date(t.transition_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col medium:flex-row medium:items-center justify-end medium:justify-between pt-2 border-t border-line gap-3">
                  <div className="text-[10px] text-ink-soft">
                    {inc.parent_notified ? (
                      <span className="text-success font-semibold flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> Orang tua telah dihubungi ({inc.parent_contacted_name})
                      </span>
                    ) : (
                      <span>Belum ada notifikasi orang tua</span>
                    )}
                  </div>

                  <div className="flex flex-col medium:flex-row items-center gap-2 w-full medium:w-auto">
                    {inc.status === 'DETECTED' && (
                      <button
                        onClick={() => setSelectedIncidentForTriage(inc)}
                        className="w-full medium:w-auto px-3 py-2 medium:py-1 text-xs font-bold rounded-lg bg-brand hover-only:opacity-90 text-on-brand cursor-pointer shadow-hairline flex justify-center items-center"
                      >
                        Triage
                      </button>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedIncidentForAudit(inc)}
                        className="w-full medium:w-auto px-3 py-2 medium:py-1 text-xs font-bold rounded-lg bg-success hover-only:bg-emerald-700 text-on-brand flex justify-center items-center gap-1 cursor-pointer shadow-hairline"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Audit & Tutup Kasus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL 4: AUDIT & HANDOVER RECONCILIATION INTEGRITY */}
      <div className="bg-surface-subtle border border-line rounded-card p-4 text-ink flex flex-col medium:flex-row medium:items-center medium:justify-between gap-4 shadow-hairline">
        <div className="space-y-1">
          <h4 className="text-sm font-bold flex items-center gap-2 text-ink">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Kesiapan Audit & Integritas Penutupan Semester (Option A Gate)</span>
          </h4>
          <p className="text-xs text-ink-soft">
            Rekonsiliasi kepulangan 100% tuntas • Insiden darurat kritis terbuka: {audit_readiness.open_critical_incidents_count}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-field bg-success-tint text-success-deep border border-success-line">
          {audit_readiness.semester_close_ready ? '🟢 SIAP AUDIT SEMESTER' : '🟡 MENUNGGU PENYELESAIAN'}
        </span>
      </div>

      {/* MODAL 1: TRIAGE INCIDENT */}
      {selectedIncidentForTriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs">
          <div className="bg-surface border border-line rounded-card w-full max-w-lg shadow-floating p-4 space-y-4 text-ink">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-danger" />
                <span>Otorisasi Triage Insiden ({selectedIncidentForTriage.title})</span>
              </h3>
              <button onClick={() => setSelectedIncidentForTriage(null)} className="text-ink-faint hover-only:text-ink-soft cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTriage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Tetapkan Tingkat Keparahan
                </label>
                <SelectSheet value={triageSeverity}   options={[{ value: "MINOR_RESOLVABLE", label: "Ringan (Dapat diselesaikan oleh Guru Kelas)" }, { value: "MODERATE_SUPERVISED", label: "Sedang (Perlu Perawatan Khusus / Dijemput Awal)" }, { value: "CRITICAL_URGENT", label: "Kritis / Darurat (Rujukan Medis Segera)" }]} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Instruksi Tindakan Penanganan Kepala Sekolah
                </label>
                <textarea
                  value={triageAction}
                  onChange={e => setTriageAction(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Bersihkan luka dengan antiseptik di UKS, hubungi ayah untuk penjemputan..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-line text-ink focus:outline-none focus:border-line-strong"
                />
              </div>

              <div className="bg-surface-subtle p-3 rounded-lg border border-line space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyParent}
                    onChange={e => setNotifyParent(e.target.checked)}
                    className="rounded border-line text-ink"
                  />
                  <span>Tandai Telah Menghubungi Orang Tua / Wali</span>
                </label>
                {notifyParent && (
                  <input
                    type="text"
                    value={parentContactName}
                    onChange={e => setParentContactName(e.target.value)}
                    placeholder="Nama orang tua yang dihubungi..."
                    className="w-full px-3 py-1 text-xs rounded-lg bg-surface border border-line text-ink"
                  />
                )}
              </div>

              <div className="flex flex-col medium:flex-row justify-end gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForTriage(null)}
                  className="w-full medium:w-auto px-4 py-2 text-xs rounded-lg bg-surface-subtle hover-only:bg-line-soft text-ink-soft cursor-pointer font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full medium:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-brand hover-only:opacity-90 text-on-brand cursor-pointer shadow-hairline flex justify-center items-center"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Keputusan Triage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUDIT CLOSE INCIDENT */}
      {selectedIncidentForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs">
          <div className="bg-surface border border-line rounded-card w-full max-w-lg shadow-floating p-4 space-y-4 text-ink">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-success" />
                <span>Audit & Penutupan Kasus Permanen</span>
              </h3>
              <button onClick={() => setSelectedIncidentForAudit(null)} className="text-ink-faint hover-only:text-ink-soft cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAuditClose} className="space-y-3">
              <p className="text-xs text-ink-soft">
                Insiden: <strong className="text-ink">{selectedIncidentForAudit.title}</strong> ({selectedIncidentForAudit.class_name})
              </p>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Catatan Verifikasi Temuan Audit Kepala Sekolah
                </label>
                <textarea
                  value={auditFindings}
                  onChange={e => setAuditFindings(e.target.value)}
                  rows={3}
                  placeholder="Verifikasi kondisi anak telah pulih, tidak ada komplain keluarga, SOP P3K telah dievaluasi..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-line text-ink focus:outline-none focus:border-line-strong"
                />
              </div>

              <div className="flex flex-col medium:flex-row justify-end gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForAudit(null)}
                  className="w-full medium:w-auto px-4 py-2 text-xs rounded-lg bg-surface-subtle hover-only:bg-line-soft text-ink-soft cursor-pointer font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full medium:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-success hover-only:bg-emerald-700 text-on-brand cursor-pointer shadow-hairline flex justify-center items-center"
                >
                  {isSubmitting ? 'Menutup...' : 'Tutup Kasus Permanen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
