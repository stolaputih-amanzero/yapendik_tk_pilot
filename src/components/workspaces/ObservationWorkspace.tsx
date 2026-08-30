/**
 * Yapendik School OS — Domain 02: Student Observation & Anecdotal Records
 * Heartbeat of TK Pilot: Child-Centered Observation, 6 Developmental Domains, Ratings & Evidence
 * Canvas-Native Flat Architecture (Hukum F-7 / Keluarga A & B).
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
  Lock, 
  Share2, 
  Sparkles, 
  FileCheck, 
  Check,
  X
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

  const visibleObservations = observations.filter(obs => {
    const targetStudent = students.find(s => s.id === obs.studentId);
    const targetPersonId = targetStudent?.personId;

    const authRes = evaluateAuthorization({
      context: securityContext,
      action: 'VIEW',
      resource: 'STUDENT_OBSERVATION',
      resourceSchoolId: obs.schoolId,
      targetClassId: obs.classId,
      targetStudentPersonId: targetPersonId,
      isConfidential: obs.isConfidentialToStaff
    });

    if (!authRes.granted) return false;
    if (selectedDomainFilter !== 'ALL' && obs.domain !== selectedDomainFilter) return false;
    return true;
  });

  const canCreate = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }).granted : false;

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formDescription.trim()) return;

    db.addObservation({
      schoolId: securityContext.activeSchoolId,
      studentId: formStudentId,
      classId: selectedClassId,
      observerPersonId: securityContext.personId,
      observedAt: new Date().toISOString(),
      domain: formDomain,
      milestoneRating: formRating,
      anecdoteDescription: formDescription,
      behaviorTrigger: formTrigger || undefined,
      childReaction: formReaction || undefined,
      teacherIntervention: formIntervention || undefined,
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
    BB: { label: 'BB', full: 'Belum Berkembang', color: 'bg-red-100 text-danger-deep border-danger-line' },
    MB: { label: 'MB', full: 'Mulai Berkembang', color: 'bg-warning-tint text-warning-deep border-warning-line' },
    BSH: { label: 'BSH', full: 'Berkembang Sesuai Harapan', color: 'bg-info-tint text-info-deep border-info-line' },
    BSB: { label: 'BSB', full: 'Berkembang Sangat Baik', color: 'bg-success-tint text-success-deep border-success-line' }
  };

  return (
    <div 
      className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-8 animate-in fade-in duration-200 text-ink"
      data-testid="observation-workspace"
    >
      {/* 1. HERO CANVAS (R-1 Hero Canvas) */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <Eye className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Observasi &amp; Anekdot • Bukti Capaian Siswa</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Catatan Anekdot &amp; Observasi</span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              Perekaman bukti autentik capaian belajar anak usia dini berbasis peristiwa faktual (Evidence-Based).
            </p>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl text-xs font-bold shrink-0"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Catat Observasi
            </Button>
          )}
        </div>

        {/* 2. FLAT CONTROLS (R-2 Kontrol Flat) */}
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-3 pt-2">
          <SelectSheet 
            label="Kelas"
            value={selectedClassId} 
            onChange={setSelectedClassId} 
            options={classes.map(c => ({ value: c.id, label: c.name }))} 
          />

          <SelectSheet
            label="Siswa"
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            options={[
              { value: "ALL", label: "Semua Siswa" },
              ...students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis || 'Siswa' }))
            ]}
          />

          <SelectSheet
            label="Domain Perkembangan"
            value={selectedDomainFilter}
            onChange={setSelectedDomainFilter}
            options={[
              { value: "ALL", label: "Semua Domain" },
              ...(Object.keys(domainLabels) as DevelopmentDomain[]).map(k => ({ value: k, label: domainLabels[k].name }))
            ]}
          />
        </div>
      </header>

      {/* Role Context notice */}
      {securityContext.role === 'GUARDIAN' && (
        <div className="border-l-2 border-success-line pl-3 py-2 text-xs text-success-deep flex items-center justify-between">
          <div>
            <strong className="font-bold">Konteks Orang Tua / Wali:</strong> Menampilkan catatan observasi untuk ananda yang berada di bawah pengampuan sah Anda.
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-success-tint text-success-deep border border-success-line whitespace-nowrap">
            PII Protected
          </span>
        </div>
      )}

      {/* 3. OBSERVATION CARDS STREAM (R-3 divide-y divide-line on Canvas) */}
      {visibleObservations.length === 0 ? (
        <div className="py-12 text-center text-ink-faint text-xs">
          <FileCheck className="w-8 h-8 text-ink-faint mx-auto mb-2" />
          <h3 className="font-bold text-ink-soft">Tidak ada data observasi yang sesuai filter</h3>
          <p className="text-ink-faint text-[11px] max-w-md mx-auto mt-1">
            Pendidik dapat merekam catatan peristiwa, capaian kompetensi, dan foto bukti belajar anak.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {visibleObservations.map(obs => {
            const student = db.getStudentById(obs.studentId);
            const observer = db.getPersonById(obs.observerPersonId);
            const domainInfo = domainLabels[obs.domain];
            const ratingInfo = ratingBadges[obs.milestoneRating];

            return (
              <article key={obs.id} className="py-6 space-y-3">
                {/* Header Row */}
                <div className="flex flex-col medium:flex-row medium:items-start gap-3 justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <AvatarChild name={student?.person?.fullName || 'Siswa'} id={obs.studentId} size="md" />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink text-base truncate">{student?.person?.fullName || 'Siswa'}</h3>
                        <span className="text-xs font-mono text-ink-soft">NIS {student?.nis}</span>
                      </div>
                      <div className="text-xs text-ink-faint">
                        Diamati oleh: {observer?.fullName || 'Pendidik'} • {new Date(obs.observedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span 
                      title={ratingInfo.full}
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border whitespace-nowrap ${ratingInfo.color}`}
                    >
                      {ratingInfo.label} — {ratingInfo.full}
                    </span>

                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${domainInfo.badge}`}>
                      {domainInfo.name}
                    </span>

                    {obs.isConfidentialToStaff && (
                      <span className="text-xs px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line-hairline flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Internal
                      </span>
                    )}

                    {obs.sharedWithGuardian && (
                      <span className="text-xs px-2 py-1 rounded-full bg-success-tint text-success-deep border border-success-line flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> Dibagikan ke Wali
                      </span>
                    )}
                  </div>
                </div>

                {/* Anecdote Content */}
                <div className="text-xs medium:text-sm text-ink-soft space-y-2 pt-1">
                  <p className="leading-relaxed bg-surface-subtle p-3 rounded-xl border border-line-hairline text-ink">
                    <strong className="text-ink block mb-1">Catatan Peristiwa:</strong>
                    "{obs.anecdoteDescription}"
                  </p>

                  {(obs.behaviorTrigger || obs.childReaction) && (
                    <div className="grid grid-cols-1 medium:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-surface-subtle border border-line-hairline">
                      <div>
                        <strong className="text-ink block">Pemicu / Konteks:</strong>
                        <span className="text-ink-soft">{obs.behaviorTrigger || '-'}</span>
                      </div>
                      <div>
                        <strong className="text-ink block">Reaksi Anak:</strong>
                        <span className="text-ink-soft">{obs.childReaction || '-'}</span>
                      </div>
                    </div>
                  )}

                  {obs.teacherIntervention && (
                    <div className="border-l-2 border-warning-line pl-3 py-1 text-xs space-y-0.5">
                      <strong className="text-warning-deep block">Intervensi &amp; Penguatan Guru:</strong>
                      <span className="text-ink-soft">{obs.teacherIntervention}</span>
                    </div>
                  )}

                  {obs.indicatorsObserved.length > 0 && (
                    <div className="pt-1">
                      <strong className="text-ink text-xs block mb-1">Indikator Teramati:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {obs.indicatorsObserved.map((ind, idx) => (
                          <span key={idx} className="text-xs bg-surface-subtle text-ink-soft px-3 py-1 rounded-full border border-line-hairline flex items-center gap-1">
                            <Check className="w-4 h-4 text-success shrink-0" />
                            <span>{ind}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Add Observation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-floating border border-line-hairline max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h2 className="text-base font-bold text-ink">
                Perekaman Observasi &amp; Catatan Anekdot Siswa
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-ink-soft hover-only:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Pilih Siswa</label>
                  <SelectSheet
                    value={formStudentId}
                    onChange={setFormStudentId}
                    options={students.map(s => ({ value: s.id, label: `${s.person?.fullName || 'Siswa'} (${s.nis || s.id})` }))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Domain Perkembangan</label>
                  <SelectSheet
                    value={formDomain}
                    onChange={(val) => setFormDomain(val as DevelopmentDomain)}
                    options={(Object.keys(domainLabels) as DevelopmentDomain[]).map(k => ({ value: k, label: domainLabels[k].name }))}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1.5">Tingkat Capaian / Penilaian:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ratingBadges) as MilestoneRating[]).map(r => {
                    const isSelected = formRating === r;
                    const rInfo = ratingBadges[r];
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setFormRating(r)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-primary text-on-brand border-brand-primary font-bold shadow-hairline' 
                            : 'bg-surface-subtle text-ink-soft border-line-hairline hover-only:text-ink'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold">{rInfo.label}</div>
                        <div className="text-[10px] opacity-80 leading-tight mt-0.5">{rInfo.full}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">
                  Deskripsi Peristiwa Anekdot (Faktual, Objektif, Tanpa Asumsi):
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Contoh: Saat kegiatan sentra balok, Kenzo berhasil menyusun 8 balok kayu menjadi jembatan bertingkat..."
                  required
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Pemicu / Konteks Kegiatan</label>
                  <input
                    type="text"
                    placeholder="mis. Main peran dokter-pasien"
                    value={formTrigger}
                    onChange={e => setFormTrigger(e.target.value)}
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Reaksi / Respon Anak</label>
                  <input
                    type="text"
                    placeholder="mis. Tersenyum dan menjelaskan idenya"
                    value={formReaction}
                    onChange={e => setFormReaction(e.target.value)}
                    className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Tindakan / Penguatan Guru</label>
                <input
                  type="text"
                  placeholder="mis. Mengapresiasi dan menantang anak menambahkan tiang jembatan"
                  value={formIntervention}
                  onChange={e => setFormIntervention(e.target.value)}
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Indikator Teramati (Satu per baris):</label>
                <textarea
                  rows={2}
                  value={formIndicators}
                  onChange={e => setFormIndicators(e.target.value)}
                  placeholder="Kreativitas merancang bentuk&#10;Koordinasi motorik halus"
                  className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-surface-subtle border border-line-hairline rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sharedGuardian"
                    checked={formSharedWithGuardian}
                    onChange={e => setFormSharedWithGuardian(e.target.checked)}
                    className="rounded text-brand-primary cursor-pointer"
                  />
                  <label htmlFor="sharedGuardian" className="text-ink font-medium cursor-pointer">
                    Bagikan catatan ini kepada Orang Tua / Wali di Buku Penghubung
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={formIsConfidential}
                    onChange={e => setFormIsConfidential(e.target.checked)}
                    className="rounded text-brand-primary cursor-pointer"
                  />
                  <label htmlFor="confidential" className="text-ink font-medium cursor-pointer">
                    Tandai sebagai catatan rahasia internal staf (Hanya Pendidik &amp; Kepala Sekolah)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-xl text-xs font-bold"
                >
                  Simpan Catatan Observasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
