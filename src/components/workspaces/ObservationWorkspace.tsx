/**
 * Yapendik School OS — Domain 02: Student Observation & Anecdotal Records
 * Stage 6 Gate 4: Visual Evidence Wall & Fast Capture Integration
 * Canvas-Native Flat Architecture, Zero Emoji Clutter, FB-01 Child Privacy Protection.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { teacherDailyWorkService } from '../../services/teacherDailyWorkService';
import { StudentRosterItem, PAUDQuickTag } from '../../types/teacherDailyTypes';
import { 
  ObservationRecord, 
  DevelopmentDomain, 
  MilestoneRating, 
  ClassRoom 
} from '../../domain/types';
import { Button, AvatarChild, SelectSheet, AdaptiveDialog, SearchableCombobox } from '../ui';
import { EvidenceCaptureSheet } from './teacher/EvidenceCaptureSheet';
import { 
  Eye, 
  Camera, 
  Plus, 
  Lock, 
  Share2, 
  FileCheck, 
  Check, 
  X,
  Maximize2,
  Tag,
  ShieldCheck,
  Award
} from 'lucide-react';

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ObservationWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  
  // ARB Directive #5: Dynamic Class Assignment without hardcoded fallback
  const isGuardian = securityContext?.role === 'GUARDIAN';
  const hasSupervisoryPrivilege = ['SUPERADMIN', 'FOUNDATION_HEAD', 'HEADMASTER', 'ACADEMIC_COORDINATOR', 'ADMINISTRATOR'].includes(securityContext?.role || '');
  const assignedClasses = securityContext?.assignedClasses || [];

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (assignedClasses.length > 0) return assignedClasses[0];
    return '';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  
  // Modals
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lightboxObs, setLightboxObs] = useState<ObservationRecord | null>(null);

  // Manual Add Form State
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formDomain, setFormDomain] = useState<DevelopmentDomain>('KOGNITIF');
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

    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);

    // Synchronize selectedClassId dynamically
    let activeClassId = selectedClassId;
    if (clsList.length > 0) {
      if (assignedClasses.length > 0) {
        if (!selectedClassId || !clsList.some(c => c.id === selectedClassId)) {
          activeClassId = assignedClasses[0];
          setSelectedClassId(activeClassId);
        }
      } else if (hasSupervisoryPrivilege) {
        if (!selectedClassId || !clsList.some(c => c.id === selectedClassId)) {
          activeClassId = clsList[0].id;
          setSelectedClassId(activeClassId);
        }
      }
    }

    let studentList = db.getStudents(securityContext.activeSchoolId, activeClassId);
    if (isGuardian && securityContext.guardianChildrenPersonIds.length > 0) {
      studentList = studentList.filter(s => securityContext.guardianChildrenPersonIds.includes(s.personId));
    }
    setStudents(studentList);

    if (studentList.length > 0 && !formStudentId) {
      setFormStudentId(studentList[0].id);
    }

    const obsList = db.getObservations(
      securityContext.activeSchoolId, 
      activeClassId, 
      selectedStudentId === 'ALL' ? undefined : selectedStudentId,
      isGuardian
    );
    setObservations(obsList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedStudentId]);

  const visibleObservations = useMemo(() => {
    return observations.filter(obs => {
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
  }, [observations, students, securityContext, selectedDomainFilter]);

  const canCreate = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }).granted : false;

  const rosterItems: StudentRosterItem[] = useMemo(() => {
    return students.map(s => ({
      student_id: s.id,
      name: toTitleCase(s.person?.preferredName || s.person?.fullName?.split(' ')[0] || 'Ananda'),
      nis: s.nis || s.id,
      photo_url: s.photoUrl
    }));
  }, [students]);

  const handleSaveQuickCapture = async (payload: {
    targetStudentIds: string[];
    quickTags: PAUDQuickTag[];
    initialNote: string;
    mediaUrl?: string;
    domain?: DevelopmentDomain;
    milestoneRating?: MilestoneRating;
  }) => {
    if (!securityContext) return;
    await teacherDailyWorkService.captureQuickObservation({
      school_id: securityContext.activeSchoolId,
      class_id: selectedClassId,
      target_student_ids: payload.targetStudentIds,
      quick_tags: payload.quickTags,
      initial_note: payload.initialNote,
      media_url: payload.mediaUrl,
      domain: payload.domain,
      milestone_rating: payload.milestoneRating,
      recorded_by_person_id: securityContext.personId,
      recorded_by_name: securityContext.personName,
      role: securityContext.role
    });
    loadData();
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityContext || !formStudentId || !formDescription.trim()) return;

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
    KOGNITIF: { name: 'Kognitif / STEAM', badge: 'bg-info-tint text-info-deep border-info-line' },
    BAHASA: { name: 'Bahasa & Literasi', badge: 'bg-lppa-tint text-lppa-deep border-lppa-line' },
    SOSIAL_EMOSIONAL: { name: 'Jati Diri (Sosial-Emosional)', badge: 'bg-danger-tint text-danger-deep border-danger-line' },
    SENI: { name: 'Seni & Kreativitas', badge: 'bg-lppa-tint text-lppa-deep border-lppa-line' }
  };

  const ratingBadges: Record<MilestoneRating, { label: string; full: string; color: string }> = {
    BB: { label: 'BB', full: 'Belum Berkembang', color: 'bg-danger-tint text-danger-deep border-danger-line' },
    MB: { label: 'MB', full: 'Mulai Berkembang', color: 'bg-warning-tint text-warning-deep border-warning-line' },
    BSH: { label: 'BSH', full: 'Berkembang Sesuai Harapan', color: 'bg-info-tint text-info-deep border-info-line' },
    BSB: { label: 'BSB', full: 'Berkembang Sangat Baik', color: 'bg-success-tint text-success-deep border-success-line' }
  };

  // Empty State if teacher has no assigned classes (ARB Directive #5)
  if (!isGuardian && !hasSupervisoryPrivilege && assignedClasses.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4" data-testid="observation-workspace">
        <div className="w-16 h-16 rounded-3xl bg-surface-subtle border border-line flex items-center justify-center mx-auto text-ink-soft shadow-hairline">
          <Eye className="w-8 h-8 text-ink-soft" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-ink">Belum Ada Penugasan Rombel</h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Belum ada rombel yang ditugaskan kepada akun ini. Silakan hubungi Administrator Sekolah untuk mendapatkan penugasan kelas mengajar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-8 animate-in fade-in duration-200 text-ink"
      data-testid="observation-workspace"
    >
      {/* 1. Header Hero Canvas */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand text-xs font-bold uppercase tracking-wider mb-1">
              <Eye className="w-4 h-4 text-brand shrink-0" />
              <span>Observasi &amp; Portofolio • Bukti Capaian Siswa</span>
            </div>
            <h1 className="text-2xl medium:text-3xl font-bold tracking-tight text-ink leading-tight">
              Visual Evidence Wall
            </h1>
            <p className="text-ink-soft text-xs medium:text-sm max-w-2xl mt-1">
              Dokumentasi autentik karya, celoteh, dan interaksi anak usia dini berbasis peristiwa faktual.
            </p>
          </div>

          {canCreate && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCaptureSheet(true)}
                className="min-h-[44px] rounded-xl text-xs font-bold bg-brand text-on-brand shadow-sm ring-1 ring-brand/50 hover-only:opacity-90 flex items-center gap-2 px-4 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Rekam Momen</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="min-h-[44px] rounded-xl text-xs font-semibold border-line text-ink hover-only:bg-surface-subtle flex items-center gap-2 px-3.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catatan Manual</span>
              </Button>
            </div>
          )}
        </div>

        {/* 2. Flat Filter Controls */}
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
              ...students.map(s => ({ 
                value: s.id, 
                label: toTitleCase(s.person?.preferredName || s.person?.fullName || s.nis || 'Siswa') 
              }))
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
      {securityContext?.role === 'GUARDIAN' && (
        <div className="border-l-2 border-success-line pl-3 py-2 text-xs text-success-deep flex items-center justify-between bg-surface-subtle rounded-r-xl">
          <div>
            <strong className="font-bold">Konteks Orang Tua / Wali:</strong> Menampilkan portofolio karya dan catatan observasi yang dibagikan untuk ananda.
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success-tint text-success-deep border border-success-line whitespace-nowrap flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            PII Terproteksi
          </span>
        </div>
      )}

      {/* 3. Visual Evidence Wall (Responsive Masonry Cards Grid) */}
      {visibleObservations.length === 0 ? (
        <div className="py-16 text-center text-ink-faint text-xs bg-surface-subtle rounded-3xl border border-line">
          <FileCheck className="w-10 h-10 text-ink-faint mx-auto mb-2" />
          <h3 className="font-bold text-ink-soft text-sm">Belum ada rekaman observasi pada filter ini</h3>
          <p className="text-ink-faint text-xs max-w-md mx-auto mt-1">
            Gunakan tombol "Rekam Momen" untuk mengambil foto karya anak dan menandai capaian perkembangan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-5">
          {visibleObservations.map(obs => {
            const student = db.getStudentById(obs.studentId);
            const observer = db.getPersonById(obs.observerPersonId);
            const domainInfo = domainLabels[obs.domain];
            const ratingInfo = ratingBadges[obs.milestoneRating];
            const studentNickname = toTitleCase(student?.person?.preferredName || student?.person?.fullName?.split(' ')[0] || 'Ananda');

            return (
              <article 
                key={obs.id} 
                className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm hover-only:shadow-md transition flex flex-col justify-between"
              >
                {/* Zone 1: Header (Student Identity & Timestamp) */}
                <div className="p-4 border-b border-line bg-surface-subtle/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarChild name={studentNickname} id={obs.studentId} size="sm" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-ink text-sm truncate">{studentNickname}</h4>
                      <div className="text-[11px] text-ink-faint truncate">
                        {new Date(obs.observedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {observer?.fullName || 'Pendidik'}
                      </div>
                    </div>
                  </div>

                  {/* Sync Status Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-success-tint text-success-deep border border-success-line">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Cloud
                    </span>
                  </div>
                </div>

                {/* Zone 2: Body (Visual Evidence Photo, Domain, Rating & Anecdote) */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Photo Thumbnail if Present */}
                  {obs.photoEvidenceUrl ? (
                    <div 
                      onClick={() => setLightboxObs(obs)}
                      className="relative rounded-2xl overflow-hidden border border-line h-44 bg-surface-inset group cursor-pointer"
                      title="Klik untuk memperbesar bukti karya"
                    >
                      <img 
                        src={obs.photoEvidenceUrl} 
                        alt={`Karya ${studentNickname}`} 
                        className="w-full h-full object-cover group-hover-only:scale-102 transition duration-200" 
                      />
                      <div className="absolute inset-0 bg-brand/0 group-hover-only:bg-brand/20 transition flex items-center justify-center">
                        <span className="opacity-0 group-hover-only:opacity-100 transition px-3 py-1.5 rounded-xl bg-surface/90 text-ink text-xs font-bold shadow-md flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Perbesar</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-brand/70 text-on-brand text-[9px] font-mono font-semibold">
                        PORTOFOLIO KARYA — YAPENDIK
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 rounded-2xl bg-surface-subtle/40 border border-dashed border-line flex items-center justify-center text-[11px] text-ink-faint">
                      <span>Dokumentasi narasi anekdot</span>
                    </div>
                  )}

                  {/* Domain & Rating Badges */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${domainInfo.badge}`}>
                      {domainInfo.name}
                    </span>

                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${ratingInfo.color}`}>
                      {ratingInfo.label} — {ratingInfo.full}
                    </span>
                  </div>

                  {/* Anecdotal Narrative */}
                  <p className="text-xs text-ink leading-relaxed font-medium bg-surface-subtle p-3 rounded-2xl border border-line-soft">
                    "{obs.anecdoteDescription}"
                  </p>
                </div>

                {/* Zone 3: Footer (Indicators & Detail Lightbox Trigger) */}
                <div className="px-4 py-3 border-t border-line bg-surface-subtle/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {obs.indicatorsObserved.length > 0 ? (
                      <span className="text-[10px] font-medium text-ink-soft bg-surface border border-line px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Tag className="w-3 h-3 text-ink-soft" />
                        <span>{obs.indicatorsObserved.length} Indikator</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-ink-faint">Observasi Langsung</span>
                    )}

                    {obs.isConfidentialToStaff && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-ink-soft border border-line flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Internal
                      </span>
                    )}
                    {obs.sharedWithGuardian && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-success-tint text-success-deep border border-success-line flex items-center gap-1">
                        <Share2 className="w-2.5 h-2.5" /> Wali
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxObs(obs)}
                    className="min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold text-ink-soft hover-only:text-ink hover-only:bg-surface border border-line transition cursor-pointer flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. Lightbox Modal for Photo Inspection & Pedagogical Details */}
      {lightboxObs && (
        <AdaptiveDialog
          isOpen={Boolean(lightboxObs)}
          onClose={() => setLightboxObs(null)}
          title="Detail Momen Belajar"
          description={
            <span>
              {toTitleCase(db.getStudentById(lightboxObs.studentId)?.person?.fullName || 'Ananda')} • {new Date(lightboxObs.observedAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          }
          maxWidth="2xl"
          footer={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLightboxObs(null)}
              className="rounded-xl text-xs font-bold"
            >
              Tutup
            </Button>
          }
        >
          <div className="space-y-4 text-xs text-ink">
            {/* High-Res Photo with S-Pen Annotation & Watermark */}
            {lightboxObs.photoEvidenceUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-line bg-surface-inset max-h-[400px] flex items-center justify-center">
                <img 
                  src={lightboxObs.photoEvidenceUrl} 
                  alt="Bukti Karya" 
                  className="max-w-full max-h-[400px] object-contain" 
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-brand/80 text-on-brand text-[10px] font-mono font-bold tracking-wider">
                  PORTOFOLIO KARYA — YAPENDIK
                </div>
              </div>
            )}

            {/* Assessment Meta Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${domainLabels[lightboxObs.domain]?.badge}`}>
                {domainLabels[lightboxObs.domain]?.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${ratingBadges[lightboxObs.milestoneRating]?.color}`}>
                {ratingBadges[lightboxObs.milestoneRating]?.label} — {ratingBadges[lightboxObs.milestoneRating]?.full}
              </span>
            </div>

            {/* Narrative Description */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-line space-y-1">
              <strong className="block text-ink font-bold text-xs">Catatan Faktual Guru:</strong>
              <p className="text-xs leading-relaxed text-ink">
                "{lightboxObs.anecdoteDescription}"
              </p>
            </div>

            {/* Context, Reaction & Interventions */}
            {(lightboxObs.behaviorTrigger || lightboxObs.childReaction || lightboxObs.teacherIntervention) && (
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-3 p-3 rounded-2xl bg-surface-subtle border border-line">
                {lightboxObs.behaviorTrigger && (
                  <div>
                    <strong className="block text-ink-soft">Pemicu / Konteks:</strong>
                    <span className="text-ink">{lightboxObs.behaviorTrigger}</span>
                  </div>
                )}
                {lightboxObs.childReaction && (
                  <div>
                    <strong className="block text-ink-soft">Reaksi / Respon Anak:</strong>
                    <span className="text-ink">{lightboxObs.childReaction}</span>
                  </div>
                )}
                {lightboxObs.teacherIntervention && (
                  <div className="medium:col-span-2 border-t border-line-soft pt-2">
                    <strong className="block text-ink-soft">Tindakan / Penguatan Guru:</strong>
                    <span className="text-ink">{lightboxObs.teacherIntervention}</span>
                  </div>
                )}
              </div>
            )}

            {/* Indicators */}
            {lightboxObs.indicatorsObserved.length > 0 && (
              <div>
                <strong className="block text-ink-soft mb-1.5">Indikator Teramati:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {lightboxObs.indicatorsObserved.map((ind, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-surface border border-line text-ink text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>{ind}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AdaptiveDialog>
      )}

      {/* 5. Fast Capture Evidence Sheet Modal */}
      <EvidenceCaptureSheet
        isOpen={showCaptureSheet}
        onClose={() => setShowCaptureSheet(false)}
        roster={rosterItems}
        onSaveCapture={handleSaveQuickCapture}
      />

      {/* 6. Manual Detailed Observation Modal */}
      <AdaptiveDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Catatan Anekdot Terperinci"
        description={<span>Perekaman observasi naratif &amp; indikator capaian perkembangan</span>}
        maxWidth="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl text-xs w-full medium:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                const form = document.getElementById('observation-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="rounded-xl text-xs font-bold w-full medium:w-auto bg-brand text-on-brand shadow-sm"
            >
              Simpan Catatan Observasi
            </Button>
          </>
        }
      >
        <form id="observation-form" onSubmit={handleCreateObservation} className="space-y-4 text-xs text-ink">
          <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-soft mb-1">Pilih Siswa</label>
              {students.length > 15 ? (
                <SearchableCombobox
                  value={formStudentId}
                  onChange={setFormStudentId}
                  options={students.map(s => {
                    const nickname = toTitleCase(s.person?.preferredName || s.person?.fullName?.split(' ')[0] || 'Siswa');
                    const fullName = toTitleCase(s.person?.fullName || 'Siswa');
                    return {
                      value: s.id,
                      label: nickname,
                      sublabel: `${fullName} • NIS: ${s.nis || s.id}`
                    };
                  })}
                  placeholder="Pilih atau cari siswa..."
                />
              ) : (
                <SelectSheet
                  value={formStudentId}
                  onChange={setFormStudentId}
                  options={students.map(s => {
                    const nickname = toTitleCase(s.person?.preferredName || s.person?.fullName?.split(' ')[0] || 'Siswa');
                    const fullName = toTitleCase(s.person?.fullName || 'Siswa');
                    return {
                      value: s.id,
                      label: nickname,
                      sublabel: `${fullName} • NIS: ${s.nis || s.id}`
                    };
                  })}
                  placeholder="Pilih siswa..."
                />
              )}
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
            <div className="grid grid-cols-2 medium:grid-cols-4 gap-2">
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
                        ? 'bg-brand text-on-brand border-brand font-bold shadow-hairline' 
                        : 'bg-surface-subtle text-ink-soft border-line hover-only:text-ink'
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
              className="w-full bg-surface-subtle border border-line rounded-xl p-3 focus:ring-1 focus:ring-brand outline-none resize-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-soft mb-1">Pemicu / Konteks Kegiatan</label>
              <input
                type="text"
                placeholder="mis. Main peran dokter-pasien"
                value={formTrigger}
                onChange={e => setFormTrigger(e.target.value)}
                className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-soft mb-1">Reaksi / Respon Anak</label>
              <input
                type="text"
                placeholder="mis. Tersenyum dan menjelaskan idenya"
                value={formReaction}
                onChange={e => setFormReaction(e.target.value)}
                className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand outline-none text-xs"
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
              className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-ink-soft mb-1">Indikator Teramati (Satu per baris):</label>
            <textarea
              rows={2}
              value={formIndicators}
              onChange={e => setFormIndicators(e.target.value)}
              placeholder="Kreativitas merancang bentuk&#10;Koordinasi motorik halus"
              className="w-full bg-surface-subtle border border-line rounded-xl p-3 focus:ring-1 focus:ring-brand outline-none resize-none text-xs"
            />
          </div>

          <div className="p-3 bg-surface-subtle border border-line rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sharedGuardian"
                checked={formSharedWithGuardian}
                onChange={e => setFormSharedWithGuardian(e.target.checked)}
                className="rounded text-brand cursor-pointer"
              />
              <label htmlFor="sharedGuardian" className="text-ink font-medium cursor-pointer text-xs">
                Bagikan catatan ini kepada Orang Tua / Wali di Buku Penghubung
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confidential"
                checked={formIsConfidential}
                onChange={e => setFormIsConfidential(e.target.checked)}
                className="rounded text-brand cursor-pointer"
              />
              <label htmlFor="confidential" className="text-ink font-medium cursor-pointer text-xs">
                Tandai sebagai catatan rahasia internal staf (Hanya Pendidik &amp; Kepala Sekolah)
              </label>
            </div>
          </div>
        </form>
      </AdaptiveDialog>
    </div>
  );
};
