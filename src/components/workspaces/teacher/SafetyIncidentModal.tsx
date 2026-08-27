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
  Plus,
  Lightbulb,
  HeartPulse
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ATTENDANCE_ANOMALY': return 'Anomali Kehadiran';
      case 'ALLERGY_ALERT': return 'Peringatan Alergi';
      case 'MOOD_WARNING': return 'Peringatan Emosional';
      case 'TEMPERATURE_WARNING': return 'Peringatan Suhu Tubuh';
      default: return category.replace('_', ' ');
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Tinggi';
      case 'MEDIUM': return 'Sedang';
      case 'LOW': return 'Rendah';
      default: return priority;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header (Amanaura Standard Eyebrow + Title + Badge) */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-start justify-between relative">
          <div className="flex items-start gap-3.5 pr-8 sm:pr-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              {/* Eyebrow */}
              <div className="flex items-center space-x-1.5 text-rose-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-0.5">
                <span>Perhatian & Kesehatan Ananda</span>
              </div>
              
              {/* Title & Class Badge */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap leading-tight">
                <span>Perhatian Khusus Hari Ini</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {className}
                </span>
              </h3>
              
              {/* Subtitle */}
              <p className="text-xs text-slate-500 mt-1">
                Pantau kondisi kehadiran, riwayat alergi, dan catatan penanganan harian anak.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs (Fluid Pill Bar) */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'SIGNALS'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Perhatian Aktif ({activeSignals.filter(s => !s.is_acknowledged).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT_INCIDENT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'REPORT_INCIDENT'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-rose-500" />
            <span>Catat Kejadian Khusus</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE_INCIDENTS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ACTIVE_INCIDENTS'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>Riwayat Catatan ({activeIncidents.length})</span>
          </button>
        </div>

        {/* Modal Body / Fluid List View */}
        <div className="overflow-y-auto flex-1">
          {errorMsg && (
            <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: EXCEPTION SIGNALS (Fluid Edge-to-Edge List) */}
          {activeTab === 'SIGNALS' && (
            <div>
              {activeSignals.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/30" />
                  <p className="text-sm font-semibold text-slate-700">Tidak ada sinyal pengecualian aktif</p>
                  <p className="text-xs text-slate-500 mt-1">Seluruh kondisi rombel beroperasi normal.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeSignals.map(sig => (
                    <div
                      key={sig.signal_id}
                      className={`p-4 sm:p-5 space-y-3 transition-colors ${
                        sig.is_acknowledged ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Row 1: Header Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide truncate">
                            {getCategoryLabel(sig.category)}
                          </span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-600 truncate">{sig.student_name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          sig.advisory_recommendation.escalation_priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          Prioritas: {getPriorityLabel(sig.advisory_recommendation.escalation_priority)}
                        </span>
                      </div>

                      {/* Row 2: Trigger Reason */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {sig.deterministic_trigger_reason}
                      </p>

                      {/* Row 3: SOP Recommendation */}
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 font-semibold">SOP:</strong>{' '}
                          {sig.advisory_recommendation.recommended_action}
                        </div>
                      </div>

                      {/* Row 4: Action / Input */}
                      {sig.is_acknowledged ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sinyal telah direspons oleh pendidik</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={ackActions[sig.signal_id] || ''}
                            onChange={e => setAckActions({ ...ackActions, [sig.signal_id]: e.target.value })}
                            placeholder="Catatan tindakan penanganan (wajib diisi)..."
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                          />
                          <button
                            onClick={() => handleAcknowledgeSignal(sig.signal_id)}
                            disabled={isSubmitting || !ackActions[sig.signal_id]}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden sm:inline">Konfirmasi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPORT INCIDENT (Clean Form) */}
          {activeTab === 'REPORT_INCIDENT' && (
            <form onSubmit={handleReportIncident} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Peserta Didik Terdampak
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={e => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tingkat Keparahan Insiden
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as IncidentSeverityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  >
                    <option value="MINOR_RESOLVABLE">Ringan (Terkendali oleh Guru Kelas)</option>
                    <option value="MODERATE_SUPERVISED">Sedang (Perlu Triage Kepala Sekolah & Penjemputan)</option>
                    <option value="CRITICAL_URGENT">Kritis / Darurat (Perlu Penanganan Cepat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Singkat Insiden
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Lutut lecet terbentur meja sentra balok"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lokasi di Lingkungan Sekolah
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Contoh: Sentra Balok Kelas TK A"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fakta Kronologi Insiden (Objektif & Faktual)
                </label>
                <textarea
                  value={chronology}
                  onChange={e => setChronology(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan kejadian faktual secara singkat, tindakan P3K awal yang telah dilakukan..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer order-2 sm:order-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition flex justify-center items-center gap-1.5 cursor-pointer shadow-xs order-1 sm:order-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Insiden'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACTIVE INCIDENTS (Fluid Edge-to-Edge List) */}
          {activeTab === 'ACTIVE_INCIDENTS' && (
            <div>
              {activeIncidents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/30" />
                  <p className="text-sm font-semibold text-slate-700">Tidak ada rekor insiden terbuka</p>
                  <p className="text-xs text-slate-500 mt-1">Seluruh kondisi rombel aman.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeIncidents.map(inc => (
                    <div
                      key={inc.incident_id}
                      className="p-4 sm:p-5 space-y-2.5 hover:bg-slate-50/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inc.status === 'RESOLVED' || inc.status === 'AUDITED_CLOSED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inc.detected_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {inc.factual_chronology}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {inc.location_in_school}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {inc.affected_student_names.join(', ')}
                        </span>
                      </div>

                      {/* Resolution Section */}
                      {inc.status !== 'RESOLVED' && inc.status !== 'AUDITED_CLOSED' && (
                        <div className="pt-2">
                          {resolvingIncidentId === inc.incident_id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                placeholder="Tindakan penyelesaian dan kondisi akhir ananda..."
                                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setResolvingIncidentId(null)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleResolveIncident(inc.incident_id)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                                >
                                  Selesaikan Insiden
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingIncidentId(inc.incident_id)}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tandai Selesai / Ditangani</span>
                            </button>
                          )}
                        </div>
                      )}

                      {inc.resolution_summary && (
                        <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                          <strong>Penyelesaian ({inc.resolved_by_name}):</strong> {inc.resolution_summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
