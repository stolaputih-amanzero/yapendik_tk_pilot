import { SelectSheet } from '../../ui';
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
    <div className="fixed inset-0 z-70 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line w-full max-w-2xl shadow-floating overflow-hidden flex flex-col max-h-[90vh] medium:max-h-[85vh]">
        {/* Header (Amanaura Standard Eyebrow + Title + Badge) */}
        <div className="px-5 py-4 border-b border-line-soft bg-surface flex items-start justify-between relative">
          <div className="flex items-start gap-3 pr-8 medium:pr-0">
            <div className="w-10 h-10 rounded-card bg-danger-tint border border-danger-line text-danger-deep flex items-center justify-center shrink-0 mt-0.5">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              {/* Eyebrow */}
              <div className="flex items-center space-x-1.5 text-danger text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-0.5">
                <span>Perhatian & Kesehatan Ananda</span>
              </div>
              
              {/* Title & Class Badge */}
              <h3 className="text-base medium:text-lg font-bold text-ink flex items-center gap-2 flex-wrap leading-tight">
                <span>Perhatian Khusus Hari Ini</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line">
                  {className}
                </span>
              </h3>
              
              {/* Subtitle */}
              <p className="text-xs text-ink-soft mt-1">
                Pantau kondisi kehadiran, riwayat alergi, dan catatan penanganan harian anak.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs (Fluid Pill Bar) */}
        <div className="flex border-b border-line-soft bg-surface-subtle/60 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide min-w-0">
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'SIGNALS'
                ? 'bg-surface text-ink shadow-hairline border border-line/80'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-brand-primary" />
            <span>Perhatian Aktif ({activeSignals.filter(s => !s.is_acknowledged).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT_INCIDENT')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'REPORT_INCIDENT'
                ? 'bg-surface text-ink shadow-hairline border border-line/80'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Plus className="w-4 h-4 text-danger" />
            <span>Catat Kejadian Khusus</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE_INCIDENTS')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ACTIVE_INCIDENTS'
                ? 'bg-surface text-ink shadow-hairline border border-line/80'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-500" />
            <span>Riwayat Catatan ({activeIncidents.length})</span>
          </button>
        </div>

        {/* Modal Body / Fluid List View */}
        <div className="overflow-y-auto flex-1">
          {errorMsg && (
            <div className="m-4 p-3 rounded-field bg-danger-tint border border-danger-line text-danger-deep text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: EXCEPTION SIGNALS (Fluid Edge-to-Edge List) */}
          {activeTab === 'SIGNALS' && (
            <div>
              {activeSignals.length === 0 ? (
                <div className="text-center py-12 text-ink-faint">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success/30" />
                  <p className="text-sm font-semibold text-ink-soft">Tidak ada sinyal pengecualian aktif</p>
                  <p className="text-xs text-ink-soft mt-1">Seluruh kondisi rombel beroperasi normal.</p>
                </div>
              ) : (
                <div className="divide-y divide-line-soft">
                  {activeSignals.map(sig => (
                    <div
                      key={sig.signal_id}
                      className={`p-4 medium:p-4 space-y-3 transition-colors ${
                        sig.is_acknowledged ? 'bg-surface-subtle/60 opacity-60' : 'hover-only:bg-surface-subtle/40'
                      }`}
                    >
                      {/* Row 1: Header Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-ink uppercase tracking-wider tracking-wide truncate">
                            {getCategoryLabel(sig.category)}
                          </span>
                          <span className="text-ink-faint text-xs">•</span>
                          <span className="text-xs font-semibold text-ink-soft truncate">{sig.student_name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                          sig.advisory_recommendation.escalation_priority === 'HIGH'
                            ? 'bg-danger-tint text-danger-deep border border-danger-line'
                            : 'bg-warning-tint text-warning-deep border border-warning-line'
                        }`}>
                          Prioritas: {getPriorityLabel(sig.advisory_recommendation.escalation_priority)}
                        </span>
                      </div>

                      {/* Row 2: Trigger Reason */}
                      <p className="text-xs text-ink-soft leading-relaxed font-medium">
                        {sig.deterministic_trigger_reason}
                      </p>

                      {/* Row 3: SOP Recommendation */}
                      <div className="flex items-start gap-2 text-[11px] text-ink-soft bg-warning-tint/50 p-2 rounded-field border border-warning-line">
                        <Lightbulb className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-warning-deep font-semibold">SOP:</strong>{' '}
                          {sig.advisory_recommendation.recommended_action}
                        </div>
                      </div>

                      {/* Row 4: Action / Input */}
                      {sig.is_acknowledged ? (
                        <div className="flex items-center gap-2 text-xs text-success font-bold pt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sinyal telah direspons oleh pendidik</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={ackActions[sig.signal_id] || ''}
                            onChange={e => setAckActions({ ...ackActions, [sig.signal_id]: e.target.value })}
                            placeholder="Catatan tindakan penanganan (wajib diisi)..."
                            className="flex-1 px-3 py-2 text-xs rounded-field bg-surface-subtle border border-line focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink placeholder:text-ink-faint transition"
                          />
                          <button
                            onClick={() => handleAcknowledgeSignal(sig.signal_id)}
                            disabled={isSubmitting || !ackActions[sig.signal_id]}
                            className="px-3 py-2 rounded-field bg-brand hover-only:opacity-90 disabled:opacity-40 text-on-brand text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-hairline cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden medium:inline">Konfirmasi</span>
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
            <form onSubmit={handleReportIncident} className="p-4 medium:p-6 space-y-4">
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    Peserta Didik Terdampak
                  </label>
                  <SelectSheet
    value={targetStudentId}
    onChange={setTargetStudentId}
    options={[
      { value: "", label: "Pilih Ananda Terkait..." },
      ...students.map(s => ({ value: s.id, label: s.name }))
    ]}
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    Tingkat Keparahan Insiden
                  </label>
                  <SelectSheet
    value={severity}
    onChange={(val) => setSeverity(val as any)}
    options={[
      { value: "MINOR_RESOLVABLE", label: "Ringan (Terkendali oleh Guru Kelas)" },
      { value: "MODERATE_SUPERVISED", label: "Sedang (Perlu Triage Kepala Sekolah & Penjemputan)" },
      { value: "CRITICAL_URGENT", label: "Kritis / Darurat (Perlu Penanganan Cepat)" }
    ]}
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Judul Singkat Insiden
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Lutut lecet terbentur meja sentra balok"
                  className="w-full px-3 py-2 text-xs rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Lokasi di Lingkungan Sekolah
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Contoh: Sentra Balok Kelas TK A"
                  className="w-full px-3 py-2 text-xs rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Fakta Kronologi Insiden (Objektif & Faktual)
                </label>
                <textarea
                  value={chronology}
                  onChange={e => setChronology(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan kejadian faktual secara singkat, tindakan P3K awal yang telah dilakukan..."
                  className="w-full px-3 py-2 text-xs rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>

              <div className="pt-2 flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full medium:w-auto px-4 py-2 medium:py-2 rounded-field bg-surface border border-line hover-only:bg-surface-subtle text-ink-soft text-xs font-bold transition cursor-pointer order-2 medium:order-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full medium:w-auto px-4 py-2 medium:py-2 rounded-field bg-danger hover-only:opacity-90 disabled:opacity-50 text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer shadow-hairline order-1 medium:order-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Insiden'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACTIVE INCIDENTS (Fluid Edge-to-Edge List) */}
          {activeTab === 'ACTIVE_INCIDENTS' && (
            <div>
              {activeIncidents.length === 0 ? (
                <div className="text-center py-12 text-ink-faint">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success/30" />
                  <p className="text-sm font-semibold text-ink-soft">Tidak ada rekor insiden terbuka</p>
                  <p className="text-xs text-ink-soft mt-1">Seluruh kondisi rombel aman.</p>
                </div>
              ) : (
                <div className="divide-y divide-line-soft">
                  {activeIncidents.map(inc => (
                    <div
                      key={inc.incident_id}
                      className="p-4 medium:p-4 space-y-2.5 hover-only:bg-surface-subtle/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink">{inc.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            inc.status === 'RESOLVED' || inc.status === 'AUDITED_CLOSED'
                              ? 'bg-success-tint text-success-deep border border-success-line'
                              : 'bg-danger-tint text-danger-deep border border-danger-line'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-ink-faint flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inc.detected_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-ink-soft font-medium leading-relaxed">
                        {inc.factual_chronology}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-ink-soft">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-ink-faint" /> {inc.location_in_school}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-ink-faint" /> {inc.affected_student_names.join(', ')}
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
                                className="w-full px-3 py-2 text-xs rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-success transition"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setResolvingIncidentId(null)}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg text-ink-soft hover-only:bg-surface-subtle transition"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleResolveIncident(inc.incident_id)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1 text-xs font-bold rounded-lg bg-success hover-only:opacity-90 text-on-brand transition shadow-hairline"
                                >
                                  Selesaikan Insiden
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingIncidentId(inc.incident_id)}
                              className="text-xs text-success hover-only:text-success-deep font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Tandai Selesai / Ditangani</span>
                            </button>
                          )}
                        </div>
                      )}

                      {inc.resolution_summary && (
                        <div className="bg-success-tint/60 p-2 rounded-field border border-success-line text-xs text-success-deep">
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
