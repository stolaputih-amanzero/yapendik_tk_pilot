import { SelectSheet, SegmentedControl, AdaptiveDialog } from '../ui';
/**
 * Yapendik School OS — Stage 2: Provisioning & Institutional Readiness Workspace
 * 
 * Governed Visual Interface to Institutional Lifecycle Engine:
 * - Superadmin Institutional Birth & Registry Matrix (CREATE_SCHOOL, ASSIGN_HEADMASTER, INIT_AY)
 * - Headmaster Guided Operational Readiness Checklist (6-Gate Projection derived from DB Engine)
 * - ACID Student Admission & Class Placement Modal (ADMIT_AND_PLACE_STUDENT)
 * - Classroom Creation & Teacher Staffing (CREATE_CLASSROOM)
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { School, AcademicYear, ClassRoom, Person, StudentProfile, GuardianRelationship, SchoolReadinessResult } from '../../domain/types';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  PlusCircle, 
  UserCheck, 
  Users, 
  Calendar, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  School as SchoolIcon,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export const ProvisioningWorkspace: React.FC<{ onNavigateToOperations?: () => void }> = ({ onNavigateToOperations }) => {
  const { securityContext, activeSchoolId, setActiveSchoolId } = useSecurityContext();
  const isSuperadmin = securityContext?.role === 'YAPENDIK_SUPERADMIN';
  const isHeadmaster = securityContext?.role === 'HEADMASTER';

  const [schools, setSchools] = useState<School[]>([]);
  const [readinessMap, setReadinessMap] = useState<Record<string, SchoolReadinessResult>>({});
  const [activeTab, setActiveTab] = useState<'READINESS' | 'SCHOOL_REGISTRY' | 'CLASSROOM_SETUP' | 'STUDENT_ADMISSION'>('READINESS');

  // Modal States
  const [showCreateSchoolModal, setShowCreateSchoolModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAdmitStudentModal, setShowAdmitStudentModal] = useState(false);

  // Notification State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form States — Create School
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolNpsn, setNewSchoolNpsn] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('Jakarta');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');

  // Form States — Create Class
  const [newClassName, setNewClassName] = useState('');
  const [newClassAgeGroup, setNewClassAgeGroup] = useState('TK_A_4_5');
  const [newClassCapacity, setNewClassCapacity] = useState(15);
  const [newClassTeacherId, setNewClassTeacherId] = useState('');

  // Form States — Admit Student
  const [childFullName, setChildFullName] = useState('');
  const [childPreferredName, setChildPreferredName] = useState('');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [childBirthDate, setChildBirthDate] = useState('2022-04-10');
  const [childBirthPlace, setChildBirthPlace] = useState('Jakarta');
  const [childNis, setChildNis] = useState('');
  const [childNisn, setChildNisn] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [guardianFullName, setGuardianFullName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'FATHER' | 'MOTHER' | 'GUARDIAN'>('FATHER');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activeSchoolId || 'sch_tk_yapendik_01');

  const currentSchool = schools.find(s => s.id === selectedSchoolId) || schools.find(s => s.id === activeSchoolId) || schools[0];
  const currentReadiness = currentSchool ? readinessMap[currentSchool.id] : null;

  const refreshData = () => {
    const allSchools = db.getSchools();
    setSchools(allSchools);

    const rMap: Record<string, SchoolReadinessResult> = {};
    allSchools.forEach(s => {
      rMap[s.id] = db.evaluateSchoolReadinessLocal(s.id);
    });
    setReadinessMap(rMap);
  };

  useEffect(() => {
    if (activeSchoolId) setSelectedSchoolId(activeSchoolId);
  }, [activeSchoolId]);

  useEffect(() => {
    refreshData();
    const unsubscribe = db.subscribe(refreshData);
    return () => unsubscribe();
  }, [selectedSchoolId, activeSchoolId]);

  // Command Handlers
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolNpsn) return;

    const suffix = Date.now().toString().slice(-4);
    const schoolId = `sch_tk_yapendik_${suffix}`;
    const ayId = `ay_${suffix}_2026_ganjil`;
    const hmPersonId = 'per_headmaster_esther';

    const res = await db.createSchoolCommand({
      id: schoolId,
      npsn: newSchoolNpsn,
      name: newSchoolName,
      level: 'TK',
      subType: 'STANDARD',
      address: newSchoolAddress,
      city: newSchoolCity,
      province: 'DKI Jakarta',
      phone: newSchoolPhone,
      email: newSchoolEmail,
      headmasterPersonId: hmPersonId,
      academicYearActiveId: ayId
    });

    if (res.success) {
      // Initialize School's Academic Year
      await db.initializeAcademicYearCommand({
        id: ayId,
        schoolId: schoolId,
        name: 'T.A. 2026/2027',
        semester: 'GANJIL',
        startDate: '2026-07-15',
        endDate: '2026-12-20',
        isActive: true
      });

      // Appoint Headmaster for the school
      await db.assignHeadmasterCommand(schoolId, hmPersonId);

      setFeedback({ type: 'success', message: `Unit Sekolah "${newSchoolName}" berhasil didirikan (Status: ACTIVE, Kesiapan: NOT_READY).` });
      setShowCreateSchoolModal(false);
      setNewSchoolName('');
      setNewSchoolNpsn('');
      setSelectedSchoolId(schoolId);
      setActiveSchoolId(schoolId);
      refreshData();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal mendirikan unit sekolah.' });
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !newClassName) return;

    const targetSchoolId = currentSchool.id;
    const schoolAys = db.getAcademicYears(targetSchoolId);
    let activeAy = schoolAys.find(a => a.isActive) || schoolAys[0];
    let activeAyId = activeAy?.id;

    if (!activeAyId) {
      activeAyId = currentSchool.academicYearActiveId || `ay_${targetSchoolId.replace(/[^a-zA-Z0-9_]/g, '_')}_2026_ganjil`;
      await db.initializeAcademicYearCommand({
        id: activeAyId,
        schoolId: targetSchoolId,
        name: 'T.A. 2026/2027',
        semester: 'GANJIL',
        startDate: '2026-07-15',
        endDate: '2026-12-20',
        isActive: true
      });
    }

    const classId = `cls_${Date.now().toString().slice(-4)}`;
    const res = await db.createClassroomCommand({
      id: classId,
      schoolId: targetSchoolId,
      academicYearId: activeAyId,
      name: newClassName,
      ageGroup: newClassAgeGroup as any,
      roomNumber: 'R-01',
      capacity: Number(newClassCapacity),
      homeroomTeacherId: newClassTeacherId || 'per_teacher_siti',
      isActive: true
    });

    if (res.success) {
      setFeedback({ type: 'success', message: `Rombel "${newClassName}" berhasil dibentuk dengan kapasitas ${newClassCapacity} anak.` });
      setShowCreateClassModal(false);
      setNewClassName('');
      refreshData();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal membuat rombel.' });
    }
  };

  const handleAdmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !childFullName || !targetClassId) return;

    const childPersonId = `per_stu_${Date.now().toString().slice(-4)}`;
    const studentId = `stu_${Date.now().toString().slice(-4)}`;
    const guardianPersonId = `per_grd_${Date.now().toString().slice(-4)}`;
    const relationId = `rel_${Date.now().toString().slice(-4)}`;

    const childPerson: Person = {
      id: childPersonId,
      fullName: childFullName,
      preferredName: childPreferredName || childFullName,
      gender: childGender,
      birthDate: childBirthDate,
      birthPlace: childBirthPlace,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const student: StudentProfile = {
      id: studentId,
      personId: childPersonId,
      schoolId: currentSchool.id,
      nis: childNis || `TK-${Date.now().toString().slice(-4)}`,
      nisn: childNisn || undefined,
      currentClassId: targetClassId,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };

    const guardianPerson: Person | undefined = guardianFullName ? {
      id: guardianPersonId,
      fullName: guardianFullName,
      preferredName: guardianFullName,
      gender: guardianRelation === 'MOTHER' ? 'FEMALE' : 'MALE',
      phone: guardianPhone,
      address: guardianEmail,
      birthPlace: 'Jakarta',
      birthDate: '1985-01-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : undefined;

    const guardianRelationship: GuardianRelationship | undefined = guardianPerson ? {
      id: relationId,
      studentPersonId: childPersonId,
      guardianPersonId: guardianPersonId,
      relationshipType: guardianRelation,
      isPrimaryContact: true,
      isLegalGuardian: true,
      emergencyContactPriority: 1
    } : undefined;

    const res = await db.admitAndPlaceStudentCommand({
      schoolId: currentSchool.id,
      classId: targetClassId,
      childPerson,
      student,
      guardianPerson,
      guardianRelationship
    });

    if (res.success) {
      setFeedback({ type: 'success', message: `Siswa "${childFullName}" berhasil diadmisikan & ditempatkan ke Rombel secara sah!` });
      setShowAdmitStudentModal(false);
      setChildFullName('');
      setChildNis('');
      setGuardianFullName('');
      refreshData();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal mengadmisikan siswa.' });
    }
  };

  const currentSchoolClasses = currentSchool ? db.getClasses(currentSchool.id) : [];
  const currentSchoolStudents = currentSchool ? db.getStudents(currentSchool.id) : [];

  const tabOptions = [
    { id: 'READINESS', label: 'Diagnostik (6 Gates)', icon: ShieldCheck },
    ...(isSuperadmin ? [{ id: 'SCHOOL_REGISTRY', label: `Matriks Cabang (${schools.length})`, icon: SchoolIcon }] : []),
    { id: 'CLASSROOM_SETUP', label: `Struktur Rombel (${currentSchoolClasses.length})`, icon: Layers },
    { id: 'STUDENT_ADMISSION', label: `Admisi Siswa (${currentSchoolStudents.length})`, icon: Users }
  ];

  return (
    <div className="space-y-6 text-ink font-sans w-full" data-testid="provisioning-workspace">
      {/* HEADER SECTION */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success-deep text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Standar Yayasan • Pengaturan Unit</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Pengaturan Unit &amp; Kesiapan Institusi</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              Pusat pembentukan unit TK, konfigurasi rombel belajar, dan admisi siswa resmi yayasan.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2.5 w-full medium:w-auto shrink-0">
            {isSuperadmin && (
              <button
                onClick={() => setShowCreateSchoolModal(true)}
                className="flex justify-center items-center space-x-2 px-3.5 py-2 bg-brand hover-only:opacity-90 text-on-brand rounded-field text-xs font-bold transition-all shadow-hairline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Dirikan Unit TK Baru</span>
              </button>
            )}

            {/* Status Kesiapan Unit Ringkas (Read-Only Context Badge) */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-field bg-surface border border-line shadow-hairline text-xs font-bold text-ink shrink-0">
              <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap ${
                currentReadiness?.isReady
                  ? 'bg-success-tint border-success-line text-success-deep'
                  : 'bg-warning-tint border-warning-line text-warning-deep'
              }`}>
                {currentReadiness?.isReady ? 'Siap Operasional (6/6 Gates)' : 'Perlu Kelengkapan'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STANDALONE SUB-TAB BAR (Hukum 3 & 10, Directive A-5) */}
      <div className="w-full overflow-x-auto scrollbar-hide select-none">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          options={tabOptions}
        />
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`p-4 rounded-card text-xs flex items-center justify-between border shadow-hairline ${
          feedback.type === 'success' ? 'bg-success-tint border-success-line text-success-deep font-medium' : 'bg-danger-tint border-danger-line text-danger-deep font-medium'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline ml-4 cursor-pointer">Tutup</button>
        </div>
      )}

      {/* TAB 1: READINESS DIAGNOSTIC (THE 6 GATES ENGINE) */}
      {activeTab === 'READINESS' && currentSchool && currentReadiness && (
        <div className="space-y-6">
          {/* TOP READINESS BANNER */}
          <div className={`p-6 rounded-card border shadow-hairline ${
            currentReadiness.isReady 
              ? 'bg-surface border-success-line' 
              : 'bg-surface border-warning-line'
          }`}>
            <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    currentReadiness.isReady ? 'bg-surface-subtle border-success-line text-success-deep' : 'bg-surface-subtle border-warning-line text-warning-deep'
                  }`}>
                    NPSN: {currentSchool.npsn}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    currentReadiness.isReady ? 'bg-success-tint border-success-line text-success-deep' : 'bg-warning-tint border-warning-line text-warning-deep'
                  }`}>
                    Status Hukum: {currentSchool.status || 'ACTIVE'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-ink mb-1 tracking-tight">{currentSchool.name}</h2>
                <p className="text-xs text-ink-soft font-medium">
                  {currentSchool.address}, {currentSchool.city}
                </p>
              </div>

              <div className="flex flex-col medium:items-end">
                <div className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2 border shadow-hairline ${
                  currentReadiness.isReady
                    ? 'bg-success-tint border-success-line text-success-deep'
                    : 'bg-warning-tint border-warning-line text-warning-deep'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${currentReadiness.isReady ? 'bg-success animate-pulse' : 'bg-warning'}`}></span>
                  <span>KESIAPAN: {currentReadiness.status}</span>
                </div>
                <span className={`text-xs font-bold mt-2 ${currentReadiness.isReady ? 'text-success-deep' : 'text-warning-deep'}`}>
                  Gerbang Terpenuhi: {Object.values(currentReadiness.gates).filter(Boolean).length} / 6
                </span>
              </div>
            </div>

            {/* CALL TO ACTION BUTTON */}
            {currentReadiness.isReady ? (
              <div className="mt-6 pt-4 border-t border-line flex flex-col medium:flex-row medium:items-center justify-between gap-3">
                <div className="text-xs text-success-deep font-medium flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-success-deep shrink-0" />
                  <span>Institusi telah memenuhi seluruh syarat kanonikal. Modul operasional harian Stage 1 aktif sepenuhnya.</span>
                </div>
                {onNavigateToOperations && (
                  <button
                    onClick={onNavigateToOperations}
                    className="w-full medium:w-auto flex justify-center items-center space-x-2 px-4 py-2 bg-success hover-only:opacity-90 text-on-brand font-bold text-xs rounded-field transition-all shadow-hairline shrink-0 cursor-pointer"
                  >
                    <span>Masuk ke Operasional Harian Sekolah</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-line">
                <div className="text-xs text-warning-deep mb-2 font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-warning-deep shrink-0" />
                  <span>Item yang Masih Menghalangi Kesiapan Operasional (Blockers):</span>
                </div>
                <ul className="list-disc list-inside text-xs text-warning-deep font-medium space-y-1 pl-1">
                  {currentReadiness.blockers.map((b, idx) => (
                    <li key={idx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-4">
            {/* Gate 1 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate1_legalActive ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 1: Status Hukum Legal</span>
                {currentReadiness.gates.gate1_legalActive ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Unit terdaftar sah dengan SK &amp; status ACTIVE.</p>
              <div className="mt-3">
                <span className="text-xs font-bold font-mono text-success-deep bg-success-tint px-2 py-1 rounded-full border border-success-line whitespace-nowrap">
                  Status: AKTIF
                </span>
              </div>
            </div>

            {/* Gate 2 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate2_academicYear ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 2: Tahun Ajaran</span>
                {currentReadiness.gates.gate2_academicYear ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Tepat satu Tahun Ajaran aktif terdaftar.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-full border ${
                  currentReadiness.gates.gate2_academicYear ? 'bg-success-tint border-success-line text-success-deep' : 'bg-surface-subtle border-line text-ink-soft'
                }`}>
                  {currentReadiness.gates.gate2_academicYear ? 'TA 2026/2027 Terdefinisi' : 'Belum Ada TA Aktif'}
                </span>
              </div>
            </div>

            {/* Gate 3 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate3_academicPeriod ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 3: Periode/Semester</span>
                {currentReadiness.gates.gate3_academicPeriod ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Semester akademik aktif terisi.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-full border ${
                  currentReadiness.gates.gate3_academicPeriod ? 'bg-success-tint border-success-line text-success-deep' : 'bg-surface-subtle border-line text-ink-soft'
                }`}>
                  {currentReadiness.gates.gate3_academicPeriod ? 'Semester Ganjil' : 'Semester Belum Diisi'}
                </span>
              </div>
            </div>

            {/* Gate 4 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate4_headmaster ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 4: Kepala Sekolah</span>
                {currentReadiness.gates.gate4_headmaster ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Pimpinan unit resmi ditugaskan.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-full border ${
                  currentReadiness.gates.gate4_headmaster ? 'bg-success-tint border-success-line text-success-deep' : 'bg-surface-subtle border-line text-ink-soft'
                }`}>
                  {currentSchool.headmasterPersonId ? `ID: ${currentSchool.headmasterPersonId}` : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>

            {/* Gate 5 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate5_staffedClassroom ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 5: Rombel &amp; Guru</span>
                {currentReadiness.gates.gate5_staffedClassroom ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Minimal 1 rombel aktif dengan wali kelas.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-full border ${
                  currentReadiness.gates.gate5_staffedClassroom ? 'bg-success-tint border-success-line text-success-deep' : 'bg-surface-subtle border-line text-ink-soft'
                }`}>
                  {currentSchoolClasses.length} Rombel Terbentuk
                </span>
              </div>
            </div>

            {/* Gate 6 */}
            <div className={`p-4 medium:p-4 rounded-card border bg-surface shadow-hairline transition-all ${currentReadiness.gates.gate6_placedStudents ? 'border-success-line ring-1 ring-success-line/20' : 'border-line'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-ink">Gate 6: Penempatan Siswa</span>
                {currentReadiness.gates.gate6_placedStudents ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">Minimal 1 siswa ditempatkan di rombel.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-full border ${
                  currentReadiness.gates.gate6_placedStudents ? 'bg-success-tint border-success-line text-success-deep' : 'bg-surface-subtle border-line text-ink-soft'
                }`}>
                  {currentSchoolStudents.length} Siswa Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col medium:flex-row gap-3 pt-2 w-full medium:w-auto">
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex justify-center items-center space-x-2 px-4 py-2 bg-surface hover-only:bg-surface-subtle border border-line text-ink rounded-field text-xs font-bold transition-all shadow-hairline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-success" />
              <span>Tambah Rombel &amp; Guru</span>
            </button>

            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="flex justify-center items-center space-x-2 px-4 py-2 bg-surface hover-only:bg-surface-subtle border border-line text-ink rounded-field text-xs font-bold transition-all shadow-hairline cursor-pointer"
            >
              <Users className="w-4 h-4 text-success" />
              <span>Admisi &amp; Penempatan Siswa</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL REGISTRY (SUPERADMIN ONLY) */}
      {activeTab === 'SCHOOL_REGISTRY' && isSuperadmin && (
        <div className="bg-surface border border-line rounded-card overflow-hidden shadow-hairline">
          <div className="p-4 border-b border-line-soft bg-surface-subtle flex items-center justify-between">
            <span className="text-xs font-bold text-ink">Matriks Cabang Institusi Yayasan GPIB</span>
            <span className="text-xs font-mono font-bold text-ink-soft whitespace-nowrap">Total: {schools.length} Unit TK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-ink-soft font-bold border-b border-line">
                <tr>
                  <th className="py-3 px-4">NPSN</th>
                  <th className="py-3 px-4">Nama Unit TK</th>
                  <th className="py-3 px-4">Kota</th>
                  <th className="py-3 px-4">Kepala Sekolah</th>
                  <th className="py-3 px-4">Status Hukum</th>
                  <th className="py-3 px-4">Kesiapan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {schools.map(s => {
                  const r = readinessMap[s.id];
                  return (
                    <tr key={s.id} className="hover-only:bg-surface-subtle/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink">{s.npsn}</td>
                      <td className="py-3 px-4 font-bold text-ink">{s.name}</td>
                      <td className="py-3 px-4 text-ink-soft">{s.city}</td>
                      <td className="py-3 px-4 font-mono text-ink-soft">{s.headmasterPersonId || 'Belum diangkat'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line text-xs font-mono font-semibold whitespace-nowrap">
                          {s.status || 'AKTIF'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono font-bold border ${
                          r?.isReady ? 'bg-success-tint text-success-deep border-success-line' : 'bg-warning-tint text-warning-deep border-warning-line'
                        }`}>
                          {r?.isReady ? 'SIAP' : 'BELUM SIAP'} ({Object.values(r?.gates || {}).filter(Boolean).length}/6)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSchoolId(s.id);
                            setActiveSchoolId(s.id);
                            setActiveTab('READINESS');
                          }}
                          className="text-ink hover-only:text-ink-soft font-bold hover-only:underline cursor-pointer"
                        >
                          Kelola Unit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLASSROOM SETUP (Flattened - Depth = 1 per Directive A-3) */}
      {activeTab === 'CLASSROOM_SETUP' && currentSchool && (
        <div className="bg-surface border border-line rounded-card overflow-hidden shadow-hairline">
          <div className="p-4 border-b border-line-soft bg-surface-subtle flex flex-col medium:flex-row medium:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-ink">Daftar Rombongan Belajar (Rombel) Aktif</h3>
              <p className="text-xs text-ink-soft">Unit: {currentSchool.name}</p>
            </div>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex justify-center items-center space-x-1.5 px-3 py-2 bg-brand hover-only:opacity-90 text-on-brand rounded-field text-xs font-bold shadow-hairline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Rombel</span>
            </button>
          </div>

          {currentSchoolClasses.length === 0 ? (
            <div className="p-8 text-center text-ink-faint text-xs">
              Belum ada rombel yang dibentuk untuk unit ini. Silakan tambahkan rombel baru.
            </div>
          ) : (
            <div className="divide-y divide-line-soft">
              {currentSchoolClasses.map(c => (
                <div key={c.id} className="p-4 hover-only:bg-surface-subtle/60 transition-colors flex flex-col medium:flex-row medium:items-center justify-between gap-3 min-h-[56px]">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-ink text-sm">{c.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-ink-soft border border-line whitespace-nowrap">
                        {c.ageGroup === 'TK_A_4_5' ? '4-5 Tahun (TK A)' : '5-6 Tahun (TK B)'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-ink-soft">Wali Kelas: {c.homeroomTeacherId || 'Belum ditugaskan'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface text-ink border border-line shadow-hairline whitespace-nowrap">
                      Kapasitas: {c.capacity} anak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ADMISSION (Flattened per Directive A-3) */}
      {activeTab === 'STUDENT_ADMISSION' && currentSchool && (
        <div className="bg-surface border border-line rounded-card overflow-hidden shadow-hairline">
          <div className="p-4 border-b border-line-soft bg-surface-subtle flex flex-col medium:flex-row medium:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-ink">Daftar Siswa Terdaftar &amp; Penempatan Rombel</h3>
              <p className="text-xs text-ink-soft">Unit: {currentSchool.name}</p>
            </div>
            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="flex justify-center items-center space-x-1.5 px-3 py-2 bg-brand hover-only:opacity-90 text-on-brand rounded-field text-xs font-bold shadow-hairline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admisi Siswa Baru</span>
            </button>
          </div>

          {currentSchoolStudents.length === 0 ? (
            <div className="p-8 text-center text-ink-faint text-xs">
              Belum ada siswa yang diadmisikan ke unit ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-ink-soft font-bold border-b border-line">
                  <tr>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Rombel Penempatan</th>
                    <th className="py-2.5 px-3">Tgl Masuk</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {currentSchoolStudents.map(st => {
                    const p = db.getPersonById(st.personId);
                    const cl = db.getClassById(st.currentClassId);
                    return (
                      <tr key={st.id} className="hover-only:bg-surface-subtle/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-ink">{st.nis}</td>
                        <td className="py-2.5 px-3 font-bold text-ink">{p?.fullName || st.personId}</td>
                        <td className="py-2.5 px-3 font-semibold text-ink-soft">{cl?.name || st.currentClassId}</td>
                        <td className="py-2.5 px-3 text-ink-soft">{st.enrollmentDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-success-tint text-success-deep border border-success-line text-xs font-mono font-bold whitespace-nowrap">
                            {(st.status as string) === 'ENROLLED' ? 'TERDAFTAR' : st.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE SCHOOL (AdaptiveDialog - Directive A-4) */}
      <AdaptiveDialog
        isOpen={showCreateSchoolModal && isSuperadmin}
        onClose={() => setShowCreateSchoolModal(false)}
        maxWidth="md"
        title={
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-brand-primary shrink-0" />
              <span>Dirikan Unit TK Yapendik Baru</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-soft border border-line">
                Standar Kanonikal Yayasan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-tint text-brand-deep border border-brand/20 font-bold">
                TA 2026/2027
              </span>
            </div>
          </div>
        }
        description="Pendaftaran identitas unit baru ke dalam registri kanonikal yayasan."
      >
        <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-ink-soft mb-1 font-semibold">Nama Resmi Unit Sekolah</label>
            <input
              type="text"
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
              placeholder="Contoh: TK Yapendik Maranatha"
              required
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
            />
          </div>

          <div>
            <label className="block text-ink-soft mb-1 font-semibold">NPSN (Nomor Pokok Sekolah Nasional)</label>
            <input
              type="text"
              value={newSchoolNpsn}
              onChange={e => setNewSchoolNpsn(e.target.value)}
              placeholder="Contoh: 69820291"
              required
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink font-mono focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline whitespace-nowrap"
            />
          </div>

          <div>
            <label className="block text-ink-soft mb-1 font-semibold">Alamat Lengkap Unit</label>
            <textarea
              value={newSchoolAddress}
              onChange={e => setNewSchoolAddress(e.target.value)}
              placeholder="Jl. Pemuda No. 88"
              rows={2}
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Kota</label>
              <input
                type="text"
                value={newSchoolCity}
                onChange={e => setNewSchoolCity(e.target.value)}
                className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
              />
            </div>
            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Telepon</label>
              <input
                type="text"
                value={newSchoolPhone}
                onChange={e => setNewSchoolPhone(e.target.value)}
                placeholder="021-4712345"
                className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-soft mb-1 font-semibold">Email Unit</label>
            <input
              type="email"
              value={newSchoolEmail}
              onChange={e => setNewSchoolEmail(e.target.value)}
              placeholder="tk03.rawamangun@yapendik.sch.id"
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
            />
          </div>

          <div className="flex flex-col medium:flex-row justify-end gap-2 pt-3 border-t border-line-soft">
            <button
              type="button"
              onClick={() => setShowCreateSchoolModal(false)}
              className="w-full medium:w-auto px-4 py-2 bg-surface-subtle text-ink-soft font-bold rounded-field hover-only:bg-line-soft transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full medium:w-auto flex justify-center items-center px-4 py-2 bg-brand hover-only:opacity-90 text-on-brand font-bold rounded-field shadow-hairline transition-colors cursor-pointer"
            >
              Dirikan Unit TK
            </button>
          </div>
        </form>
      </AdaptiveDialog>

      {/* MODAL 2: CREATE CLASSROOM (AdaptiveDialog - Directive A-4) */}
      <AdaptiveDialog
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        maxWidth="md"
        title={
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-primary shrink-0" />
              <span>Bentuk Rombongan Belajar (Rombel)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-soft border border-line">
                Unit: {currentSchool?.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-tint text-brand-deep border border-brand/20 font-bold">
                Semester Ganjil
              </span>
            </div>
          </div>
        }
        description="Penetapan kelompok rombel belajar baru dan penugasan wali kelas."
      >
        <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
          <div>
            <label className="block text-ink-soft mb-1 font-semibold">Nama Rombel</label>
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="Contoh: Kelompok A (Mawar Indah)"
              required
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Kelompok Usia</label>
              <SelectSheet
                value={newClassAgeGroup}
                onChange={(val) => setNewClassAgeGroup(val as any)}
                options={[
                  { value: "TK_A_4_5", label: "4-5 Tahun (TK A)" },
                  { value: "TK_B_5_6", label: "5-6 Tahun (TK B)" }
                ]}
              />
            </div>

            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Kapasitas Maksimal</label>
              <input
                type="number"
                value={newClassCapacity}
                onChange={e => setNewClassCapacity(Number(e.target.value))}
                min={1}
                max={30}
                required
                className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-soft mb-1 font-semibold">Guru Wali Kelas (Opsional)</label>
            <input
              type="text"
              value={newClassTeacherId}
              onChange={e => setNewClassTeacherId(e.target.value)}
              placeholder="Contoh: per_teacher_siti"
              className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
            />
          </div>

          <div className="flex flex-col medium:flex-row justify-end gap-2 pt-3 border-t border-line-soft">
            <button
              type="button"
              onClick={() => setShowCreateClassModal(false)}
              className="w-full medium:w-auto px-4 py-2 bg-surface-subtle text-ink-soft font-bold rounded-field hover-only:bg-line-soft transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full medium:w-auto flex justify-center items-center px-4 py-2 bg-brand hover-only:opacity-90 text-on-brand font-bold rounded-field shadow-hairline transition-colors cursor-pointer"
            >
              Bentuk Rombel
            </button>
          </div>
        </form>
      </AdaptiveDialog>

      {/* MODAL 3: ADMIT & PLACE STUDENT (AdaptiveDialog & Flattened per Directives A-3 & A-4) */}
      <AdaptiveDialog
        isOpen={showAdmitStudentModal}
        onClose={() => setShowAdmitStudentModal(false)}
        maxWidth="lg"
        title={
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-primary shrink-0" />
              <span>Admisi &amp; Penempatan Siswa Baru</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-soft border border-line">
                Unit: {currentSchool?.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-success-tint text-success-deep border border-success-line font-bold">
                Registrasi Resmi
              </span>
            </div>
          </div>
        }
        description="Pencatatan data induk siswa, penetapan rombel kelas, dan hubungan wali sah."
      >
        <form onSubmit={handleAdmitStudent} className="space-y-4 text-xs">
          {/* Section 1: Data Induk Anak (Flattened - Depth = 1) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 pb-1.5 border-b border-line-soft">
              <span className="font-bold text-ink text-xs uppercase tracking-wider">1. Data Induk Anak</span>
            </div>
            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Nama Lengkap Anak</label>
              <input
                type="text"
                value={childFullName}
                onChange={e => setChildFullName(e.target.value)}
                placeholder="Contoh: Jonathan Chris Rawamangun"
                required
                className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Nama Panggilan</label>
                <input
                  type="text"
                  value={childPreferredName}
                  onChange={e => setChildPreferredName(e.target.value)}
                  placeholder="Jonathan"
                  className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                />
              </div>
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Jenis Kelamin</label>
                <SelectSheet
                  value={childGender}
                  onChange={setChildGender}
                  options={[
                    { value: 'MALE', label: 'Laki-Laki' },
                    { value: 'FEMALE', label: 'Perempuan' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">NIS</label>
                <input
                  type="text"
                  value={childNis}
                  onChange={e => setChildNis(e.target.value)}
                  placeholder="TK-2026-0301"
                  className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink font-mono focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline whitespace-nowrap"
                />
              </div>
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Rombel Penempatan</label>
                <SelectSheet
                  value={targetClassId}
                  onChange={setTargetClassId}
                  placeholder="Pilih Rombel..."
                  options={[
                    { value: '', label: 'Pilih Rombel...' },
                    ...currentSchoolClasses.map(c => ({ value: c.id, label: `${c.name} (${c.capacity} anak)` }))
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Orang Tua / Wali (Flattened - Depth = 1) */}
          <div className="space-y-3 pt-3 border-t border-line-soft">
            <div className="flex items-center space-x-2 pb-1.5 border-b border-line-soft">
              <span className="font-bold text-ink text-xs uppercase tracking-wider">2. Data Orang Tua / Wali</span>
            </div>
            <div>
              <label className="block text-ink-soft mb-1 font-semibold">Nama Lengkap Orang Tua</label>
              <input
                type="text"
                value={guardianFullName}
                onChange={e => setGuardianFullName(e.target.value)}
                placeholder="Contoh: Hendrik Rawamangun"
                required
                className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                />
              </div>
              <div>
                <label className="block text-ink-soft mb-1 font-semibold">Email Orang Tua</label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={e => setGuardianEmail(e.target.value)}
                  placeholder="hendrik@gmail.com"
                  className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col medium:flex-row justify-end gap-2 pt-3 border-t border-line-soft">
            <button
              type="button"
              onClick={() => setShowAdmitStudentModal(false)}
              className="w-full medium:w-auto px-4 py-2 bg-surface-subtle text-ink-soft font-bold rounded-field hover-only:bg-line-soft transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full medium:w-auto flex justify-center items-center px-4 py-2 bg-brand hover-only:opacity-90 text-on-brand font-bold rounded-field shadow-hairline transition-colors cursor-pointer"
            >
              Admisi &amp; Simpan Siswa
            </button>
          </div>
        </form>
      </AdaptiveDialog>
    </div>
  );
};
