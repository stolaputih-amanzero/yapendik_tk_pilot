/**
 * Yapendik School OS — Stage 4.4-C Safety Incident & Signal Resolution Modal
 * 
 * Invariants:
 * 1. ASSURANCE-INV-01: No Silent Safety State (Requires human action to acknowledge).
 * 2. Signal != Diagnosis: Advisory prompts only.
 * 3. Fast Incident Capture: Logs incident directly into DETECTED status with audited trail.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Clock, 
  MapPin, 
  User, 
  Activity,
  Plus
} from 'lucide-react';
import { 
  SafetyExceptionSignal, 
  SafetyIncidentRecord, 
  IncidentSeverityLevel,
  ReportSafetyIncidentCommand,
  TransitionIncidentLifecycleCommand
} from '../../../types/schoolSafetyAssuranceTypes';
import { schoolSafetyAssuranceService } from '../../../services/schoolSafetyAssuranceService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  classId: string;
  className: string;
  teacherPersonId: string;
  teacherName: string;
  students: { id: string; name: string }[];
  activeSignals: SafetyExceptionSignal[];
  activeIncidents: SafetyIncidentRecord[];
  onRefresh: () => void;
}

export const SafetyIncidentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  schoolId,
  classId,
  className,
  teacherPersonId,
  teacherName,
  students,
  activeSignals,
  activeIncidents,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'REPORT_INCIDENT' | 'ACTIVE_INCIDENTS'>('SIGNALS');
  
  // Form State for Incident Reporting
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverityLevel>('MINOR_RESOLVABLE');
  const [location, setLocation] = useState('Sentra Balok Kelas TK A');
  const [chronology, setChronology] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Acknowledging Signal
  const [ackActions, setAckActions] = useState<Record<string, string>>({});
  const [resolvingIncidentId, setResolvingIncidentId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  if (!isOpen) return null;

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chronology.trim()) {
      setErrorMsg('Judul dan kronologi insiden wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const cmd: ReportSafetyIncidentCommand = {
        school_id: schoolId,
        class_id: classId,
        affected_student_ids: [targetStudentId],
        tier: 'TIER_3_SAFETY_INCIDENT',
        severity,
        is_staff_confidential: false,
        title: title.trim(),
        factual_chronology: chronology.trim(),
        location_in_school: location,
        detected_by_person_id: teacherPersonId,
        detected_by_name: teacherName,
        role: 'TEACHER'
      };

      await schoolSafetyAssuranceService.reportSafetyIncident(cmd);
      setTitle('');
      setChronology('');
      onRefresh();
      setActiveTab('ACTIVE_INCIDENTS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melaporkan insiden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledgeSignal = async (signalId: string) => {
    const actionTaken = ackActions[signalId];
    if (!actionTaken || actionTaken.trim() === '') {
      alert('Tindakan penanganan wajib diisi sebelum mengonfirmasi sinyal.');
      return;
    }

    try {
      setIsSubmitting(true);
      await schoolSafetyAssuranceService.acknowledgeExceptionSignal({
        signal_id: signalId,
        school_id: schoolId,
        resolution_action_taken: actionTaken.trim(),
        acknowledged_by_person_id: teacherPersonId,
        acknowledged_by_name: teacherName,
        role: 'TEACHER'
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal merespons sinyal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    if (!resolutionNote.trim()) {
      alert('Catatan penyelesaian insiden wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cmd: TransitionIncidentLifecycleCommand = {
        incident_id: incidentId,
        school_id: schoolId,
        target_status: 'RESOLVED',
        action_summary: resolutionNote.trim(),
        rationale_notes: 'Penanganan telah tuntas diverifikasi oleh guru kelas.',
        notify_parent: false,
        actor_person_id: teacherPersonId,
        actor_name: teacherName,
        role: 'TEACHER'
      };

      await schoolSafetyAssuranceService.transitionIncidentLifecycle(cmd);
      setResolvingIncidentId(null);
      setResolutionNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan insiden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Keselamatan & Respon Rombel ({className})
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan deterministik & penanganan aktif pengecualian kelas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SIGNALS'
                ? 'bg-slate-800 text-amber-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sinyal Pengecualian Aktif ({activeSignals.filter(s => !s.is_acknowledged).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT_INCIDENT')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'REPORT_INCIDENT'
                ? 'bg-slate-800 text-rose-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lapor Insiden Darurat</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE_INCIDENTS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ACTIVE_INCIDENTS'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Riwayat Insiden Rombel ({activeIncidents.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: EXCEPTION SIGNALS */}
          {activeTab === 'SIGNALS' && (
            <div className="space-y-3">
              {activeSignals.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/40" />
                  <p className="text-sm font-medium">Tidak ada sinyal pengecualian aktif saat ini.</p>
                  <p className="text-xs text-slate-600 mt-1">Seluruh kondisi rombel beroperasi normal.</p>
                </div>
              ) : (
                activeSignals.map(sig => (
                  <div
                    key={sig.signal_id}
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      sig.is_acknowledged
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-amber-950/20 border-amber-500/30 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 uppercase">
                          {sig.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-white">{sig.student_name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sig.advisory_recommendation.escalation_priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        Prioritas: {sig.advisory_recommendation.escalation_priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {sig.deterministic_trigger_reason}
                    </p>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                      <strong className="text-amber-400">💡 Saran Tindakan SOP:</strong> {sig.advisory_recommendation.recommended_action}
                    </div>

                    {sig.is_acknowledged ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sinyal telah direspons oleh pendidik</span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <label className="text-[11px] font-medium text-slate-400">
                          Catatan Tindakan Pendidik (Wajib diisi - Invariant No Silent State):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ackActions[sig.signal_id] || ''}
                            onChange={e => setAckActions({ ...ackActions, [sig.signal_id]: e.target.value })}
                            placeholder="Contoh: Ananda telah diberi minum hangat di UKS..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleAcknowledgeSignal(sig.signal_id)}
                            disabled={isSubmitting || !ackActions[sig.signal_id]}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>Konfirmasi</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: REPORT INCIDENT */}
          {activeTab === 'REPORT_INCIDENT' && (
            <form onSubmit={handleReportIncident} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Peserta Didik Terdampak
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={e => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tingkat Keparahan Insiden
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as IncidentSeverityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="MINOR_RESOLVABLE">Ringan (Terkendali oleh Guru Kelas)</option>
                    <option value="MODERATE_SUPERVISED">Sedang (Perlu Triage Kepala Sekolah & Penjemputan)</option>
                    <option value="CRITICAL_URGENT">Kritis / Darurat (Perlu Penanganan Cepat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Judul Singkat Insiden
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Lutut lecet terbentur meja sentra balok"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lokasi di Lingkungan Sekolah
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Contoh: Sentra Balok Kelas TK A"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fakta Kronologi Insiden (Objektif & Faktual)
                </label>
                <textarea
                  value={chronology}
                  onChange={e => setChronology(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan kejadian faktual secara singkat, tindakan P3K awal yang telah dilakukan..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Insiden'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACTIVE INCIDENTS */}
          {activeTab === 'ACTIVE_INCIDENTS' && (
            <div className="space-y-3">
              {activeIncidents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/40" />
                  <p className="text-sm font-medium">Tidak ada rekor insiden terbuka untuk rombel ini.</p>
                </div>
              ) : (
                activeIncidents.map(inc => (
                  <div
                    key={inc.incident_id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{inc.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inc.status === 'RESOLVED' || inc.status === 'AUDITED_CLOSED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inc.detected_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      {inc.factual_chronology}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {inc.location_in_school}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" /> {inc.affected_student_names.join(', ')}
                      </span>
                    </div>

                    {/* Resolution Section */}
                    {inc.status !== 'RESOLVED' && inc.status !== 'AUDITED_CLOSED' && (
                      <div className="pt-2 border-t border-slate-800">
                        {resolvingIncidentId === inc.incident_id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={resolutionNote}
                              onChange={e => setResolutionNote(e.target.value)}
                              placeholder="Tindakan penyelesaian & kondisi akhir ananda..."
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setResolvingIncidentId(null)}
                                className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-300"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleResolveIncident(inc.incident_id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Selesaikan Insiden
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResolvingIncidentId(inc.incident_id)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tandai Selesai / Ditangani</span>
                          </button>
                        )}
                      </div>
                    )}

                    {inc.resolution_summary && (
                      <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 text-xs text-emerald-200">
                        <strong>Penyelesaian ({inc.resolved_by_name}):</strong> {inc.resolution_summary}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
