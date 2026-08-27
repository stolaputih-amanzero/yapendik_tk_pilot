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
import { Button, AvatarChild, Badge } from '../ui';
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
  Image as ImageIcon
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
    NILAI_AGAMA_MORAL: { name: 'Nilai Agama & Moral', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    FISIK_MOTORIK: { name: 'Fisik-Motorik', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    KOGNITIF: { name: 'Kognitif', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
    BAHASA: { name: 'Bahasa & Komunikasi', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
    SOSIAL_EMOSIONAL: { name: 'Sosial-Emosional', badge: 'bg-rose-50 text-rose-800 border-rose-200' },
    SENI: { name: 'Seni & Kreativitas', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' }
  };

  const ratingBadges: Record<MilestoneRating, { label: string; full: string; color: string }> = {
    BB: { label: 'BB', full: 'Belum Berkembang', color: 'bg-red-100 text-red-800 border-red-200' },
    MB: { label: 'MB', full: 'Mulai Berkembang', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    BSH: { label: 'BSH', full: 'Berkembang Sesuai Harapan', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    BSB: { label: 'BSB', full: 'Berkembang Sangat Baik', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  return (
    <div className="space-y-6 overflow-x-hidden w-full max-w-full">
      {/* Top Controls Bar */}
      <div className="px-4 md:px-6 py-5 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-start gap-4 flex-wrap w-full">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            Catatan Anekdot & Observasi Perkembangan Anak
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Perekaman bukti autentik capaian belajar anak usia dini berbasis peristiwa faktual (Evidence-Based).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none text-right flex-1 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Siswa:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent font-medium text-slate-800 outline-none text-right flex-1 cursor-pointer"
              >
                <option value="ALL">Semua Siswa</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.person?.fullName || s.nis || 'Siswa'}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Domain:</span>
              <select
                value={selectedDomainFilter}
                onChange={(e) => setSelectedDomainFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 outline-none text-right flex-1 cursor-pointer"
              >
                <option value="ALL">Semua Domain</option>
                {Object.keys(domainLabels).map(k => (
                  <option key={k} value={k}>{domainLabels[k as DevelopmentDomain].name}</option>
                ))}
              </select>
            </div>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              className="w-full md:w-auto mt-2 md:mt-0 shadow-sm"
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
        <div className="mx-4 md:mx-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between">
          <div>
            <span className="font-bold">Konteks Orang Tua / Wali:</span> Menampilkan catatan observasi untuk ananda yang berada di bawah pengampuan sah Anda.
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
            PII Protected
          </span>
        </div>
      )}

      {/* Observation Cards Stream */}
      {visibleObservations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Tidak ada data observasi yang sesuai filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Pendidik dapat merekam catatan peristiwa, capaian kompetensi, dan foto bukti belajar anak.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 pb-[180px]">
          {visibleObservations.map(obs => {
            const student = db.getStudentById(obs.studentId);
            const observer = db.getPersonById(obs.observerPersonId);
            const domainInfo = domainLabels[obs.domain];
            const ratingInfo = ratingBadges[obs.milestoneRating];

            return (
              <div key={obs.id} className="px-4 md:px-6 py-5 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between w-full pb-2 border-b border-slate-100">
                    <div className="flex items-start gap-3 min-w-0 w-full">
                      <AvatarChild name={student?.person?.fullName || 'Siswa'} id={obs.studentId} size="md" showSymbol />
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{student?.person?.fullName || 'Siswa'}</h3>
                          <Badge variant="neutral">NIS {student?.nis}</Badge>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Diamati oleh: {observer?.fullName || 'Pendidik'} • {new Date(obs.observedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span 
                        title={ratingInfo.full}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border ${ratingInfo.color}`}
                      >
                        {ratingInfo.label} — {ratingInfo.full}
                      </span>
                    </div>
                  </div>

                {/* Domain Pill */}
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-xl border ${domainInfo.badge}`}>
                    {domainInfo.name}
                  </span>
                  {obs.isConfidentialToStaff && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Internal Guru
                    </span>
                  )}
                  {obs.sharedWithGuardian && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Share2 className="w-2.5 h-2.5" /> Dibagikan ke Wali
                    </span>
                  )}
                </div>

                {/* Anecdote Content */}
                <div className="text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-1">Catatan Peristiwa:</span>
                    "{obs.anecdoteDescription}"
                  </p>

                  {(obs.behaviorTrigger || obs.childReaction) && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/60 p-2.5 rounded border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800 block">Pemicu / Konteks:</span>
                        <span className="text-slate-600">{obs.behaviorTrigger || '-'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">Reaksi Anak:</span>
                        <span className="text-slate-600">{obs.childReaction || '-'}</span>
                      </div>
                    </div>
                  )}

                  {obs.teacherIntervention && (
                    <div className="text-[11px] p-2 rounded bg-amber-50/50 border border-amber-100">
                      <span className="font-semibold text-amber-900 block">Intervensi & Penguatan Guru:</span>
                      <span className="text-slate-700">{obs.teacherIntervention}</span>
                    </div>
                  )}

                  {obs.indicatorsObserved.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-800 text-[11px] block mb-1">Indikator Teramati:</span>
                      <div className="flex flex-wrap gap-1">
                        {obs.indicatorsObserved.map((ind, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            ✓ {ind}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Perekaman Observasi & Catatan Anekdot Siswa
            </h2>
            <form onSubmit={handleCreateObservation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    required
                    className="w-full flex justify-between items-center border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.person?.fullName || 'Siswa'} ({s.nis || s.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Domain Perkembangan</label>
                  <select
                    value={formDomain}
                    onChange={e => setFormDomain(e.target.value as DevelopmentDomain)}
                    required
                    className="w-full flex justify-between items-center border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  >
                    {Object.keys(domainLabels).map(k => (
                      <option key={k} value={k}>{domainLabels[k as DevelopmentDomain].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Tingkat Capaian / Penilaian:</label>
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
                            ? 'bg-slate-900 text-white border-slate-900 font-bold' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Peristiwa Anekdot (Faktual, Objektif, Tanpa Asumsi):
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Contoh: Saat kegiatan sentra balok, Kenzo berhasil menyusun 8 balok kayu menjadi jembatan bertingkat..."
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pemicu / Konteks Kegiatan</label>
                  <input
                    type="text"
                    placeholder="mis. Main peran dokter-pasien"
                    value={formTrigger}
                    onChange={e => setFormTrigger(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reaksi / Respon Anak</label>
                  <input
                    type="text"
                    placeholder="mis. Tersenyum dan menjelaskan ide karyanya"
                    value={formReaction}
                    onChange={e => setFormReaction(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan / Penguatan Guru</label>
                <input
                  type="text"
                  placeholder="mis. Mengapresiasi dan menantang anak menambahkan tiang jembatan"
                  value={formIntervention}
                  onChange={e => setFormIntervention(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Indikator Teramati (Satu per baris):</label>
                <textarea
                  rows={2}
                  value={formIndicators}
                  onChange={e => setFormIndicators(e.target.value)}
                  placeholder="Kreativitas merancang bentuk&#10;Koordinasi motorik halus"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sharedGuardian"
                    checked={formSharedWithGuardian}
                    onChange={e => setFormSharedWithGuardian(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <label htmlFor="sharedGuardian" className="text-slate-800 font-medium">
                    Bagikan catatan ini kepada Orang Tua / Wali di Buku Penghubung
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={formIsConfidential}
                    onChange={e => setFormIsConfidential(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <label htmlFor="confidential" className="text-slate-800 font-medium">
                    Tandai sebagai catatan rahasia internal staf (Hanya dapat dilihat Pendidik & Kepala Sekolah)
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full md:w-auto px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold flex justify-center items-center"
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
