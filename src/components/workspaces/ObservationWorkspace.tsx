/**
 * Yapendik School OS — Domain 02: Student Observation & Anecdotal Records
 * Heartbeat of TK Pilot: Child-Centered Observation, 6 Developmental Domains, Ratings & Evidence
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { 
  ObservationRecord, 
  DevelopmentDomain, 
  MilestoneRating, 
  ClassRoom 
} from '../../domain/types';
import { Button, AvatarChild, Badge, SelectSheet } from '../ui';
import { 
  Eye, 
  Plus, 
  Filter, 
  Lock, 
  Share2, 
  Tag, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export const ObservationWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formDomain, setFormDomain] = useState<DevelopmentDomain>('SOSIAL_EMOSIONAL');
  const [formRating, setFormRating] = useState<MilestoneRating>('BSH');
  const [formDescription, setFormDescription] = useState('');
  const [formTrigger, setFormTrigger] = useState('');
  const [formReaction, setFormReaction] = useState('');
  const [formIntervention, setFormIntervention] = useState('');
  const [formIndicators, setFormIndicators] = useState('');
  const [formIsConfidential, setFormIsConfidential] = useState(false);
  const [formSharedWithGuardian, setFormSharedWithGuardian] = useState(true);

  const loadData = () => {
    if (!securityContext) return;
    const isGuardian = securityContext.role === 'GUARDIAN';

    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);
    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      setSelectedClassId(clsList[0].id);
    }

    let studentList = db.getStudents(securityContext.activeSchoolId, selectedClassId);
    // Guardian isolation: only show guardian's registered children
    if (isGuardian && securityContext.guardianChildrenPersonIds.length > 0) {
      studentList = studentList.filter(s => securityContext.guardianChildrenPersonIds.includes(s.personId));
    }
    setStudents(studentList);

    if (studentList.length > 0 && !formStudentId) {
      setFormStudentId(studentList[0].id);
    }

    const obsList = db.getObservations(
      securityContext.activeSchoolId, 
      selectedClassId, 
      selectedStudentId === 'ALL' ? undefined : selectedStudentId,
      isGuardian
    );
    setObservations(obsList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedStudentId]);

  // Filter observations based on contextual authorization
  const visibleObservations = observations.filter(obs => {
    const targetStudent = students.find(s => s.id === obs.studentId);
    const targetPersonId = targetStudent?.personId;

    const authRes = evaluateAuthorization({
      context: securityContext,
      action: 'VIEW',
      resource: 'STUDENT_OBSERVATION',
      resourceSchoolId: obs.schoolId,
      targetClassId: obs.classId,
      targetStudentId: obs.studentId,
      targetStudentPersonId: targetPersonId,
      isConfidential: obs.isConfidentialToStaff
    });

    if (!authRes.granted) return false;
    if (selectedDomainFilter !== 'ALL' && obs.domain !== selectedDomainFilter) return false;
    return true;
  });

  const canCreate = evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }).granted;

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formDescription.trim()) return;

    db.addObservation({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      studentId: formStudentId,
      observerPersonId: securityContext.personId,
      observedAt: new Date().toISOString(),
      domain: formDomain,
      anecdoteDescription: formDescription,
      behaviorTrigger: formTrigger || undefined,
      childReaction: formReaction || undefined,
      teacherIntervention: formIntervention || undefined,
      milestoneRating: formRating,
      indicatorsObserved: formIndicators.split('\n').filter(i => i.trim().length > 0),
      isConfidentialToStaff: formIsConfidential,
      sharedWithGuardian: formSharedWithGuardian
    }, securityContext.personName, securityContext.userId, securityContext.role);

    setShowAddModal(false);
    setFormDescription('');
    setFormTrigger('');
    setFormReaction('');
    setFormIntervention('');
    setFormIndicators('');
  };

  const domainLabels: Record<DevelopmentDomain, { name: string; badge: string }> = {
    NILAI_AGAMA_MORAL: { name: 'Nilai Agama & Moral', badge: 'bg-success-tint text-success-deep border-success-line' },
    FISIK_MOTORIK: { name: 'Fisik-Motorik', badge: 'bg-warning-tint text-warning-deep border-warning-line' },
    KOGNITIF: { name: 'Kognitif', badge: 'bg-info-tint text-info-deep border-info-line' },
    BAHASA: { name: 'Bahasa & Komunikasi', badge: 'bg-lppa-tint text-lppa-deep border-lppa-line' },
    SOSIAL_EMOSIONAL: { name: 'Sosial-Emosional', badge: 'bg-danger-tint text-danger-deep border-danger-line' },
    SENI: { name: 'Seni & Kreativitas', badge: 'bg-lppa-tint text-lppa-deep border-lppa-line' }
  };

  const ratingBadges: Record<MilestoneRating, { label: string; full: string; color: string }> = {
    BB: { label: 'BB', full: 'Belum Berkembang', color: 'bg-red-100 text-danger-deep border-red-200' },
    MB: { label: 'MB', full: 'Mulai Berkembang', color: 'bg-warning-tint text-warning-deep border-warning-line' },
    BSH: { label: 'BSH', full: 'Berkembang Sesuai Harapan', color: 'bg-blue-100 text-info-deep border-info-line' },
    BSB: { label: 'BSB', full: 'Berkembang Sangat Baik', color: 'bg-success-tint text-success-deep border-success-line' }
  };

  return (
    <div className="space-y-6 overflow-x-hidden w-full max-w-full pb-[132px] expanded:pb-8">
      {/* Top Controls Bar */}
      <div className="px-4 medium:px-6 py-5 bg-surface border-b border-line-soft flex flex-col medium:flex-row medium:items-start gap-4 flex-wrap w-full">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Eye className="w-5 h-5 text-lppa" />
            Catatan Anekdot & Observasi Perkembangan Anak
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Perekaman bukti autentik capaian belajar anak usia dini berbasis peristiwa faktual (Evidence-Based).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col medium:flex-row medium:items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink-soft text-xs">
              <span className="text-ink-soft font-medium">Kelas:</span>
              <SelectSheet value={selectedClassId}   options={classes.map(c => ({ value: c.id, label: c.name }))} />
            </div>

            <div className="flex items-center justify-between w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink-soft text-xs">
              <span className="text-ink-soft font-medium">Siswa:</span>
              <SelectSheet
    value={selectedStudentId}
    onChange={setSelectedStudentId}
    options={[
      { value: "ALL", label: "Semua Siswa" },
      ...students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis || 'Siswa' }))
    ]}
  />
            </div>

            <div className="flex items-center justify-between w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink-soft text-xs">
              <span className="text-ink-soft font-medium">Domain:</span>
              <SelectSheet
    value={selectedDomainFilter}
    onChange={setSelectedDomainFilter}
    options={[
      { value: "ALL", label: "Semua Domain" },
      ...(Object.keys(domainLabels) as DevelopmentDomain[]).map(k => ({ value: k, label: domainLabels[k].name }))
    ]}
  />
            </div>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              className="w-full medium:w-auto mt-2 medium:mt-0 shadow-hairline"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Catat Observasi
            </Button>
          )}
        </div>
      </div>

      {/* Role Context notice */}
      {securityContext.role === 'GUARDIAN' && (
        <div className="mx-4 expanded:mx-6 bg-success-tint border border-success-line rounded-lg p-3 text-xs text-success-deep flex items-center justify-between">
          <div>
            <span className="font-bold">Konteks Orang Tua / Wali:</span> Menampilkan catatan observasi untuk ananda yang berada di bawah pengampuan sah Anda.
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-surface text-success-deep border border-success-line whitespace-nowrap">
            PII Protected
          </span>
        </div>
      )}

      {/* Observation Cards Stream */}
      {visibleObservations.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <FileCheck className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-ink-soft">Tidak ada data observasi yang sesuai filter</h3>
          <p className="text-xs text-ink-faint max-w-md mx-auto mt-1">
            Pendidik dapat merekam catatan peristiwa, capaian kompetensi, dan foto bukti belajar anak.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-line-soft pb-[180px]">
          {visibleObservations.map(obs => {
            const student = db.getStudentById(obs.studentId);
            const observer = db.getPersonById(obs.observerPersonId);
            const domainInfo = domainLabels[obs.domain];
            const ratingInfo = ratingBadges[obs.milestoneRating];

            return (
              <div key={obs.id} className="px-4 medium:px-6 py-5 hover-only:bg-surface-subtle/50 transition-colors">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-col medium:flex-row medium:items-start gap-3 medium:justify-between w-full pb-2 border-b border-line-soft">
                    <div className="flex items-start gap-3 min-w-0 w-full">
                      <AvatarChild name={student?.person?.fullName || 'Siswa'} id={obs.studentId} size="md" showSymbol />
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-ink text-sm truncate">{student?.person?.fullName || 'Siswa'}</h3>
                          <Badge variant="neutral">NIS {student?.nis}</Badge>
                        </div>
                        <div className="text-[11px] text-ink-faint mt-0.5 truncate">
                          Diamati oleh: {observer?.fullName || 'Pendidik'} • {new Date(obs.observedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span 
                        title={ratingInfo.full}
                        className={`text-[10px] font-bold px-2 py-1 rounded-field border ${ratingInfo.color}`}
                      >
                        {ratingInfo.label} — {ratingInfo.full}
                      </span>
                    </div>
                  </div>

                {/* Domain Pill */}
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-field border ${domainInfo.badge}`}>
                    {domainInfo.name}
                  </span>
                  {obs.isConfidentialToStaff && (
                    <span className="text-[10px] px-1 py-1 rounded-field bg-surface-subtle text-ink-soft border border-line flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Internal Guru
                    </span>
                  )}
                  {obs.sharedWithGuardian && (
                    <span className="text-[10px] px-1 py-1 rounded-field bg-success-tint text-success-deep border border-success-line flex items-center gap-1">
                      <Share2 className="w-2.5 h-2.5" /> Dibagikan ke Wali
                    </span>
                  )}
                </div>

                {/* Anecdote Content */}
                <div className="text-xs text-ink-soft space-y-2">
                  <p className="leading-relaxed bg-surface-subtle p-3 rounded-md border border-line-soft">
                    <span className="font-semibold text-ink block mb-1">Catatan Peristiwa:</span>
                    "{obs.anecdoteDescription}"
                  </p>

                  {(obs.behaviorTrigger || obs.childReaction) && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-subtle/60 p-2 rounded border border-line-soft">
                      <div>
                        <span className="font-semibold text-ink block">Pemicu / Konteks:</span>
                        <span className="text-ink-soft">{obs.behaviorTrigger || '-'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-ink block">Reaksi Anak:</span>
                        <span className="text-ink-soft">{obs.childReaction || '-'}</span>
                      </div>
                    </div>
                  )}

                  {obs.teacherIntervention && (
                    <div className="text-[11px] p-2 rounded bg-warning-tint/50 border border-amber-100">
                      <span className="font-semibold text-warning-deep block">Intervensi & Penguatan Guru:</span>
                      <span className="text-ink-soft">{obs.teacherIntervention}</span>
                    </div>
                  )}

                  {obs.indicatorsObserved.length > 0 && (
                    <div>
                      <span className="font-semibold text-ink text-[11px] block mb-1">Indikator Teramati:</span>
                      <div className="flex flex-wrap gap-1">
                        {obs.indicatorsObserved.map((ind, idx) => (
                          <span key={idx} className="text-[10px] bg-surface-subtle text-ink-soft px-2 py-1 rounded flex items-center">
                            <Check className="w-3 h-3 text-success inline mr-1 shrink-0" />
                            <span>{ind}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Observation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-field shadow-floating border border-line max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs">
            <h2 className="text-lg font-bold text-ink mb-4 pb-2 border-b border-line-soft">
              Perekaman Observasi & Catatan Anekdot Siswa
            </h2>
            <form onSubmit={handleCreateObservation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Pilih Siswa</label>
                  <SelectSheet
    value={formStudentId}
    onChange={setFormStudentId}
    options={students.map(s => ({ value: s.id, label: `${s.person?.fullName || 'Siswa'} (${s.nis || s.id})` }))}
  />
                </div>
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Domain Perkembangan</label>
                  <SelectSheet
    value={formDomain}
    onChange={(val) => setFormDomain(val as DevelopmentDomain)}
    options={(Object.keys(domainLabels) as DevelopmentDomain[]).map(k => ({ value: k, label: domainLabels[k].name }))}
  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1.5">Tingkat Capaian / Penilaian:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ratingBadges) as MilestoneRating[]).map(r => {
                    const isSelected = formRating === r;
                    const rInfo = ratingBadges[r];
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setFormRating(r)}
                        className={`p-2 rounded border text-center transition-all ${
                          isSelected 
                            ? 'bg-brand text-on-brand border-brand font-bold' 
                            : 'bg-surface-subtle text-ink-soft border-line hover-only:bg-surface-subtle'
                        }`}
                      >
                        <div className="text-xs">{rInfo.label}</div>
                        <div className="text-[9px] opacity-80 leading-tight mt-0.5">{rInfo.full}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">
                  Deskripsi Peristiwa Anekdot (Faktual, Objektif, Tanpa Asumsi):
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Contoh: Saat kegiatan sentra balok, Kenzo berhasil menyusun 8 balok kayu menjadi jembatan bertingkat..."
                  required
                  className="w-full border border-line rounded px-2 py-1 focus:ring-1 focus:ring-brass/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Pemicu / Konteks Kegiatan</label>
                  <input
                    type="text"
                    placeholder="mis. Main peran dokter-pasien"
                    value={formTrigger}
                    onChange={e => setFormTrigger(e.target.value)}
                    className="w-full border border-line rounded px-2 py-1 focus:ring-1 focus:ring-brass/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink-soft mb-1">Reaksi / Respon Anak</label>
                  <input
                    type="text"
                    placeholder="mis. Tersenyum dan menjelaskan ide karyanya"
                    value={formReaction}
                    onChange={e => setFormReaction(e.target.value)}
                    className="w-full border border-line rounded px-2 py-1 focus:ring-1 focus:ring-brass/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">Tindakan / Penguatan Guru</label>
                <input
                  type="text"
                  placeholder="mis. Mengapresiasi dan menantang anak menambahkan tiang jembatan"
                  value={formIntervention}
                  onChange={e => setFormIntervention(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 focus:ring-1 focus:ring-brass/30 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-soft mb-1">Indikator Teramati (Satu per baris):</label>
                <textarea
                  rows={2}
                  value={formIndicators}
                  onChange={e => setFormIndicators(e.target.value)}
                  placeholder="Kreativitas merancang bentuk&#10;Koordinasi motorik halus"
                  className="w-full border border-line rounded px-2 py-1 focus:ring-1 focus:ring-brass/30 outline-none"
                />
              </div>

              <div className="p-3 bg-surface-subtle border border-line rounded space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sharedGuardian"
                    checked={formSharedWithGuardian}
                    onChange={e => setFormSharedWithGuardian(e.target.checked)}
                    className="rounded text-ink"
                  />
                  <label htmlFor="sharedGuardian" className="text-ink font-medium">
                    Bagikan catatan ini kepada Orang Tua / Wali di Buku Penghubung
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={formIsConfidential}
                    onChange={e => setFormIsConfidential(e.target.checked)}
                    className="rounded text-ink"
                  />
                  <label htmlFor="confidential" className="text-ink font-medium">
                    Tandai sebagai catatan rahasia internal staf (Hanya dapat dilihat Pendidik & Kepala Sekolah)
                  </label>
                </div>
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full medium:w-auto px-4 py-2 rounded border border-line text-ink-soft hover-only:bg-surface-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full medium:w-auto px-4 py-2 rounded bg-brand text-on-brand hover-only:bg-surface-inset font-semibold flex justify-center items-center"
                >
                  Simpan Catatan Observasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
