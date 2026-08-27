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

  return (
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="provisioning-workspace">
      {/* HEADER SECTION */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Pengaturan Unit</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Pengaturan Unit &amp; Kesiapan Institusi</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              Pusat pembentukan unit TK, konfigurasi rombel belajar, dan admisi siswa resmi yayasan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {isSuperadmin && (
              <button
                onClick={() => setShowCreateSchoolModal(true)}
                className="flex justify-center items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Dirikan Unit TK Baru</span>
              </button>
            )}

            {/* Unit Selector */}
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 mr-2">Unit:</span>
              <select
                value={currentSchool?.id || selectedSchoolId}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setActiveSchoolId(e.target.value);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id} className="bg-white text-slate-900">
                    {s.name} ({readinessMap[s.id]?.status === 'FULLY_READY' ? 'Siap Operasional' : 'Perlu Kelengkapan'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('READINESS')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'READINESS' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Diagnostik Kesiapan (6 Gates)</span>
          </button>

          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('SCHOOL_REGISTRY')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                activeTab === 'SCHOOL_REGISTRY' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SchoolIcon className="w-4 h-4" />
              <span>Matriks Seluruh Cabang ({schools.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('CLASSROOM_SETUP')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'CLASSROOM_SETUP' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Struktur Rombel ({currentSchoolClasses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STUDENT_ADMISSION')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'STUDENT_ADMISSION' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admisi Siswa ({currentSchoolStudents.length})</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-2xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline ml-4 cursor-pointer">Tutup</button>
        </div>
      )}

      {/* TAB 1: READINESS DIAGNOSTIC (THE 6 GATES ENGINE) */}
      {activeTab === 'READINESS' && currentSchool && currentReadiness && (
        <div className="space-y-6">
          {/* TOP READINESS BANNER */}
          <div className={`p-6 rounded-xl border shadow-xs ${
            currentReadiness.isReady 
              ? 'bg-emerald-50/90 border-emerald-200' 
              : 'bg-amber-50/90 border-amber-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    currentReadiness.isReady ? 'bg-white border-emerald-200 text-emerald-900' : 'bg-white border-amber-200 text-amber-900'
                  }`}>
                    NPSN: {currentSchool.npsn}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    currentReadiness.isReady ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-300 text-amber-800'
                  }`}>
                    Status Hukum: {currentSchool.status || 'ACTIVE'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">{currentSchool.name}</h2>
                <p className="text-xs text-slate-600 font-medium">
                  {currentSchool.address}, {currentSchool.city}
                </p>
              </div>

              <div className="flex flex-col md:items-end">
                <div className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2 shadow-xs ${
                  currentReadiness.isReady
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${currentReadiness.isReady ? 'bg-emerald-300 animate-pulse' : 'bg-amber-200'}`}></span>
                  <span>KESIAPAN OPERASIONAL: {currentReadiness.status}</span>
                </div>
                <span className={`text-xs font-bold mt-1.5 ${currentReadiness.isReady ? 'text-emerald-800' : 'text-amber-900'}`}>
                  Gerbang Terpenuhi: {Object.values(currentReadiness.gates).filter(Boolean).length} / 6
                </span>
              </div>
            </div>

            {/* CALL TO ACTION BUTTON */}
            {currentReadiness.isReady ? (
              <div className="mt-6 pt-4 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-emerald-950 font-medium flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Institusi telah memenuhi seluruh syarat kanonikal. Modul operasional harian Stage 1 aktif sepenuhnya.</span>
                </div>
                {onNavigateToOperations && (
                  <button
                    onClick={onNavigateToOperations}
                    className="w-full md:w-auto flex justify-center items-center space-x-2 px-4 py-2.5 md:py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Masuk ke Operasional Harian Sekolah</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-amber-200">
                <div className="text-xs text-amber-950 mb-2 font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Item yang Masih Menghalangi Kesiapan Operasional (Blockers):</span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-900 font-medium space-y-1 pl-1">
                  {currentReadiness.blockers.map((b, idx) => (
                    <li key={idx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gate 1 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate1_legalActive ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 1: Status Hukum Legal</span>
                {currentReadiness.gates.gate1_legalActive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Unit terdaftar sah dengan SK &amp; status ACTIVE.</p>
              <div className="mt-3">
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Status: AKTIF
                </span>
              </div>
            </div>

            {/* Gate 2 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate2_academicYear ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 2: Tahun Ajaran</span>
                {currentReadiness.gates.gate2_academicYear ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Tepat satu Tahun Ajaran aktif terdaftar.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  currentReadiness.gates.gate2_academicYear ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentReadiness.gates.gate2_academicYear ? 'TA 2026/2027 Terdefinisi' : 'Belum Ada TA Aktif'}
                </span>
              </div>
            </div>

            {/* Gate 3 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate3_academicPeriod ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 3: Periode/Semester</span>
                {currentReadiness.gates.gate3_academicPeriod ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Semester akademik aktif terisi.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  currentReadiness.gates.gate3_academicPeriod ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentReadiness.gates.gate3_academicPeriod ? 'Semester Ganjil' : 'Semester Belum Diisi'}
                </span>
              </div>
            </div>

            {/* Gate 4 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate4_headmaster ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 4: Kepala Sekolah</span>
                {currentReadiness.gates.gate4_headmaster ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Pimpinan unit resmi ditugaskan.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  currentReadiness.gates.gate4_headmaster ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchool.headmasterPersonId ? `ID: ${currentSchool.headmasterPersonId}` : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>

            {/* Gate 5 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate5_staffedClassroom ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 5: Rombel &amp; Guru</span>
                {currentReadiness.gates.gate5_staffedClassroom ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Minimal 1 rombel aktif dengan wali kelas.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  currentReadiness.gates.gate5_staffedClassroom ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchoolClasses.length} Rombel Terbentuk
                </span>
              </div>
            </div>

            {/* Gate 6 */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-2xs transition-all ${currentReadiness.gates.gate6_placedStudents ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 6: Penempatan Siswa</span>
                {currentReadiness.gates.gate6_placedStudents ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Minimal 1 siswa ditempatkan di rombel.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  currentReadiness.gates.gate6_placedStudents ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchoolStudents.length} Siswa Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full md:w-auto">
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex justify-center items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Tambah Rombel &amp; Guru</span>
            </button>

            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="flex justify-center items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Admisi &amp; Penempatan Siswa</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL REGISTRY (SUPERADMIN ONLY) */}
      {activeTab === 'SCHOOL_REGISTRY' && isSuperadmin && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Matriks Cabang Institusi Yayasan GPIB</span>
            <span className="text-xs font-mono font-bold text-slate-600">Total: {schools.length} Unit TK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {schools.map(s => {
                  const r = readinessMap[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.npsn}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.city}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.headmasterPersonId || 'Belum diangkat'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-semibold">
                          {s.status || 'AKTIF'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                          r?.isReady ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
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
                          className="text-slate-900 hover:text-slate-700 font-bold hover:underline cursor-pointer"
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

      {/* TAB 3: CLASSROOM SETUP */}
      {activeTab === 'CLASSROOM_SETUP' && currentSchool && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Rombongan Belajar (Rombel) Aktif</h3>
              <p className="text-xs text-slate-500">Unit: {currentSchool.name}</p>
            </div>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex justify-center items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Rombel</span>
            </button>
          </div>

          {currentSchoolClasses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
              Belum ada rombel yang dibentuk untuk unit ini. Silakan tambahkan rombel baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSchoolClasses.map(c => (
                <div key={c.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                      Kapasitas: {c.capacity} anak
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Kelompok Usia: {c.ageGroup === 'TK_A_4_5' ? '4-5 Tahun (TK A)' : '5-6 Tahun (TK B)'}</div>
                  <div className="text-xs font-mono text-slate-700">Wali Kelas: {c.homeroomTeacherId || 'Belum ditugaskan'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ADMISSION */}
      {activeTab === 'STUDENT_ADMISSION' && currentSchool && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Siswa Terdaftar &amp; Penempatan Rombel</h3>
              <p className="text-xs text-slate-500">Unit: {currentSchool.name}</p>
            </div>
            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="flex justify-center items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admisi Siswa Baru</span>
            </button>
          </div>

          {currentSchoolStudents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
              Belum ada siswa yang diadmisikan ke unit ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Rombel Penempatan</th>
                    <th className="py-2.5 px-3">Tgl Masuk</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSchoolStudents.map(st => {
                    const p = db.getPersonById(st.personId);
                    const cl = db.getClassById(st.currentClassId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{st.nis}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p?.fullName || st.personId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{cl?.name || st.currentClassId}</td>
                        <td className="py-2.5 px-3 text-slate-500">{st.enrollmentDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                            {st.status === 'ENROLLED' ? 'TERDAFTAR' : st.status}
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

      {/* MODAL 1: CREATE SCHOOL */}
      {showCreateSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Dirikan Unit TK Baru</h3>
              <button
                onClick={() => setShowCreateSchoolModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Nama Unit TK</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="Contoh: TK Yapendik 03 Rawamangun"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">NPSN (8 Digit Unik)</label>
                <input
                  type="text"
                  value={newSchoolNpsn}
                  onChange={e => setNewSchoolNpsn(e.target.value)}
                  placeholder="20109988"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Alamat Lengkap</label>
                <input
                  type="text"
                  value={newSchoolAddress}
                  onChange={e => setNewSchoolAddress(e.target.value)}
                  placeholder="Jl. Pemuda No. 88"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Kota</label>
                  <input
                    type="text"
                    value={newSchoolCity}
                    onChange={e => setNewSchoolCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Telepon</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={e => setNewSchoolPhone(e.target.value)}
                    placeholder="021-4712345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Email Unit</label>
                <input
                  type="email"
                  value={newSchoolEmail}
                  onChange={e => setNewSchoolEmail(e.target.value)}
                  placeholder="tk03.rawamangun@yapendik.sch.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSchoolModal(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Dirikan Unit TK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CLASSROOM */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Bentuk Rombongan Belajar (Rombel)</h3>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Nama Rombel</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Contoh: Kelompok A (Mawar Indah)"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Kelompok Usia</label>
                  <select
                    value={newClassAgeGroup}
                    onChange={e => setNewClassAgeGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  >
                    <option value="TK_A_4_5">4-5 Tahun (TK A)</option>
                    <option value="TK_B_5_6">5-6 Tahun (TK B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    value={newClassCapacity}
                    onChange={e => setNewClassCapacity(Number(e.target.value))}
                    min={1}
                    max={30}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Guru Wali Kelas (Opsional)</label>
                <input
                  type="text"
                  value={newClassTeacherId}
                  onChange={e => setNewClassTeacherId(e.target.value)}
                  placeholder="Contoh: per_teacher_siti"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Bentuk Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIT & PLACE STUDENT */}
      {showAdmitStudentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Admisi &amp; Penempatan Siswa Baru</h3>
              <button
                onClick={() => setShowAdmitStudentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdmitStudent} className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">1. Data Induk Anak</span>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    value={childFullName}
                    onChange={e => setChildFullName(e.target.value)}
                    placeholder="Contoh: Jonathan Chris Rawamangun"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Nama Panggilan</label>
                    <input
                      type="text"
                      value={childPreferredName}
                      onChange={e => setChildPreferredName(e.target.value)}
                      placeholder="Jonathan"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Jenis Kelamin</label>
                    <select
                      value={childGender}
                      onChange={e => setChildGender(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    >
                      <option value="MALE">Laki-Laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">NIS</label>
                    <input
                      type="text"
                      value={childNis}
                      onChange={e => setChildNis(e.target.value)}
                      placeholder="TK-2026-0301"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Rombel Penempatan</label>
                    <select
                      value={targetClassId}
                      onChange={e => setTargetClassId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    >
                      <option value="">Pilih Rombel...</option>
                      {currentSchoolClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.capacity} anak)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">2. Data Orang Tua / Wali</span>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Nama Lengkap Orang Tua</label>
                  <input
                    type="text"
                    value={guardianFullName}
                    onChange={e => setGuardianFullName(e.target.value)}
                    placeholder="Contoh: Hendrik Rawamangun"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={e => setGuardianPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Email Orang Tua</label>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={e => setGuardianEmail(e.target.value)}
                      placeholder="hendrik@gmail.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdmitStudentModal(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Admisi &amp; Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
