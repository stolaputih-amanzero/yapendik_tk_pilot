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
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Konsol Resolusi & Jaminan Operasional</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            {school_context.school_name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tahun Ajaran: {school_context.academic_year_name} ({school_context.semester}) • Kepala Sekolah: {school_context.headmaster_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Skor Integritas Operasional</div>
            <div className="text-xl font-black text-emerald-400">
              {today_assurance.operational_integrity_pct}%
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* PANEL 1: TODAY'S OPERATIONAL ASSURANCE (4 Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Kehadiran */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Kehadiran Hari Ini</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {today_assurance.attendance.attendance_rate_pct}%
          </div>
          <p className="text-[11px] text-slate-500">
            {today_assurance.attendance.present_count} dari {today_assurance.attendance.total_students} peserta didik
          </p>
        </div>

        {/* Metric 2: Rekonsiliasi Kepulangan (Handover) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Rekonsiliasi Kepulangan</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {today_assurance.handover.handover_rate_pct}%
          </div>
          <p className="text-[11px] text-slate-500">
            {today_assurance.handover.reconciled_count} anak ({today_assurance.handover.standard_handover_count} reguler, {today_assurance.handover.alternate_pickup_count} kuasa)
          </p>
        </div>

        {/* Metric 3: Sinyal Pengecualian Aktif */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Sinyal Pengecualian</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {today_assurance.active_exceptions_count}
          </div>
          <p className="text-[11px] text-slate-500">
            Peringatan suhu / absensi belum ditutup
          </p>
        </div>

        {/* Metric 4: Insiden Terbuka */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Insiden Terbuka</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {today_assurance.open_incidents_count}
          </div>
          <p className="text-[11px] text-slate-500">
            Menunggu triage atau penyelesaian
          </p>
        </div>
      </div>

      {/* PANEL 2: NEEDS ATTENTION (Actionable Queue) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Antrean Perhatian & Tindakan Kepala Sekolah ({needs_attention_queue.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            SEE → TRIAGE → ACT → VERIFY → CLOSE
          </span>
        </div>

        {needs_attention_queue.length === 0 ? (
          <div className="py-6 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-1.5 text-emerald-500/40" />
            <p className="text-xs font-medium text-slate-400">Semua sinyal dan insiden hari ini telah ditangani.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {needs_attention_queue.map(item => (
              <div
                key={item.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.item_type === 'INCIDENT_TRIAGE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.item_type === 'INCIDENT_TRIAGE' ? '🚨 PERLU TRIAGE' : '⚠️ PANTAUAN'}
                    </span>
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-xs text-slate-500">• {item.classroom_name}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    <strong className="text-amber-400">Tindakan:</strong> {item.action_required}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Dilaporkan oleh: {item.reported_by} ({new Date(item.reported_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                  </p>
                </div>

                {item.item_type === 'INCIDENT_TRIAGE' && (
                  <button
                    onClick={() => {
                      const inc = incident_pipeline.find(i => i.incident_id === item.id);
                      if (inc) setSelectedIncidentForTriage(inc);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    <span>⚡ Lakukan Triage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL 3: INCIDENT LIFECYCLE MANAGEMENT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Manajemen Siklus Hidup Insiden Sekolah
            </h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'DETECTED', 'TRIAGED', 'RESOLVED', 'AUDITED_CLOSED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setIncidentFilter(f)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  incidentFilter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'ALL' ? 'Semua' : f}
              </button>
            ))}
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            Tidak ada insiden dengan filter status '{incidentFilter}'.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncidents.map(inc => (
              <div
                key={inc.incident_id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{inc.title}</span>
                    <span className="text-xs text-indigo-400">({inc.class_name})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      inc.status === 'AUDITED_CLOSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : inc.status === 'RESOLVED'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.detected_at).toLocaleDateString('id-ID')} {new Date(inc.detected_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {inc.factual_chronology}
                </p>

                {/* Audit Trail Timeline */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jejak Transisi Status ({inc.state_transitions.length} Langkah):
                  </span>
                  {inc.state_transitions.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">[{t.to_status}]</span>
                      <span>{t.action_summary}</span>
                      <span className="text-slate-500 text-[10px]">({t.transitioned_by_name} - {new Date(t.transition_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div className="text-[10px] text-slate-500">
                    {inc.parent_notified ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> Orang tua telah dihubungi ({inc.parent_contacted_name})
                      </span>
                    ) : (
                      <span>Belum ada notifikasi orang tua</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {inc.status === 'DETECTED' && (
                      <button
                        onClick={() => setSelectedIncidentForTriage(inc)}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                      >
                        ⚡ Triage
                      </button>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedIncidentForAudit(inc)}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
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
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kesiapan Audit & Integritas Penutupan Semester (Option A Gate)</span>
          </h4>
          <p className="text-xs text-slate-300">
            Rekonsiliasi kepulangan 100% tuntas • Insiden darurat kritis terbuka: {audit_readiness.open_critical_incidents_count}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          {audit_readiness.semester_close_ready ? '🟢 SIAP AUDIT SEMESTER' : '🟡 MENUNGGU PENYELESAIAN'}
        </span>
      </div>

      {/* MODAL 1: TRIAGE INCIDENT */}
      {selectedIncidentForTriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Otorisasi Triage Insiden ({selectedIncidentForTriage.title})</span>
              </h3>
              <button onClick={() => setSelectedIncidentForTriage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTriage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tetapkan Tingkat Keparahan
                </label>
                <select
                  value={triageSeverity}
                  onChange={e => setTriageSeverity(e.target.value as IncidentSeverityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="MINOR_RESOLVABLE">Ringan (Dapat diselesaikan oleh Guru Kelas)</option>
                  <option value="MODERATE_SUPERVISED">Sedang (Perlu Perawatan Khusus / Dijemput Awal)</option>
                  <option value="CRITICAL_URGENT">Kritis / Darurat (Rujukan Medis Segera)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instruksi Tindakan Penanganan Kepala Sekolah
                </label>
                <textarea
                  value={triageAction}
                  onChange={e => setTriageAction(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Bersihkan luka dengan antiseptik di UKS, hubungi ayah untuk penjemputan..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyParent}
                    onChange={e => setNotifyParent(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Tandai Telah Menghubungi Orang Tua / Wali</span>
                </label>
                {notifyParent && (
                  <input
                    type="text"
                    value={parentContactName}
                    onChange={e => setParentContactName(e.target.value)}
                    placeholder="Nama orang tua yang dihubungi..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForTriage(null)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Audit & Penutupan Kasus Permanen</span>
              </h3>
              <button onClick={() => setSelectedIncidentForAudit(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAuditClose} className="space-y-3">
              <p className="text-xs text-slate-300">
                Insiden: <strong>{selectedIncidentForAudit.title}</strong> ({selectedIncidentForAudit.class_name})
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Verifikasi Temuan Audit Kepala Sekolah
                </label>
                <textarea
                  value={auditFindings}
                  onChange={e => setAuditFindings(e.target.value)}
                  rows={3}
                  placeholder="Verifikasi kondisi anak telah pulih, tidak ada komplain keluarga, SOP P3K telah dievaluasi..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForAudit(null)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Menutup...' : 'Tutup Kasus Permanen (AUDITED_CLOSED)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
