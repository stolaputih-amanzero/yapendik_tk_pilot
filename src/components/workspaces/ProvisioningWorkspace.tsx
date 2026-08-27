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
  ChevronRight
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
    <div className="px-4 md:px-6 py-6 space-y-6 text-slate-900 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-y md:border border-slate-200 p-4 md:p-5 md:rounded-xl md:shadow-xs -mx-4 md:mx-0">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Manajemen Siklus Hidup & Kesiapan Institusi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Yapendik School OS • Stage 2 Governed Provisioning & Readiness Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          {isSuperadmin && (
            <button
              onClick={() => setShowCreateSchoolModal(true)}
              className="w-full md:w-auto flex justify-center items-center space-x-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Dirikan Unit Sekolah Baru</span>
            </button>
          )}

          {/* Unit Selector */}
          <div className="w-full md:w-auto flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
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
                  {s.name} ({readinessMap[s.id]?.status || 'NOT_READY'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border shadow-2xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline ml-4 cursor-pointer">Tutup</button>
        </div>
      )}

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('READINESS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'READINESS' ? 'bg-white text-slate-900 border border-slate-300 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'READINESS' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Diagnostik Kesiapan (6 Gates)</span>
        </button>

        {isSuperadmin && (
          <button
            onClick={() => setActiveTab('SCHOOL_REGISTRY')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'SCHOOL_REGISTRY' ? 'bg-white text-slate-900 border border-slate-300 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <SchoolIcon className={`w-4 h-4 ${activeTab === 'SCHOOL_REGISTRY' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Matriks Seluruh Cabang ({schools.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('CLASSROOM_SETUP')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'CLASSROOM_SETUP' ? 'bg-white text-slate-900 border border-slate-300 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'CLASSROOM_SETUP' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Struktur Rombel ({currentSchoolClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENT_ADMISSION')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'STUDENT_ADMISSION' ? 'bg-white text-slate-900 border border-slate-300 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'STUDENT_ADMISSION' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Admisi Siswa ({currentSchoolStudents.length})</span>
        </button>
      </div>

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

          {/* 6 GATES GRID */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 divide-y divide-slate-100 md:divide-none gap-0 md:gap-4 -mx-4 md:mx-0">
            {/* Gate 1 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate1_legalActive ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 1: Status Hukum Legal</span>
                {currentReadiness.gates.gate1_legalActive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Unit terdaftar sah dengan SK & status ACTIVE.</p>
              <div className="mt-3">
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Status: ACTIVE
                </span>
              </div>
            </div>

            {/* Gate 2 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate2_academicYear ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 2: Tahun Akademik</span>
                {currentReadiness.gates.gate2_academicYear ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Tepat satu Tahun Ajaran aktif terdaftar.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                  currentReadiness.gates.gate2_academicYear ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentReadiness.gates.gate2_academicYear ? 'T.A. 2026/2027 Terdefinisi' : 'Belum Ada T.A. Aktif'}
                </span>
              </div>
            </div>

            {/* Gate 3 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate3_academicPeriod ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 3: Periode/Semester</span>
                {currentReadiness.gates.gate3_academicPeriod ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Semester akademik aktif terisi.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                  currentReadiness.gates.gate3_academicPeriod ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentReadiness.gates.gate3_academicPeriod ? 'Semester Ganjil' : 'Semester Belum Diisi'}
                </span>
              </div>
            </div>

            {/* Gate 4 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate4_headmaster ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 4: Kepala Sekolah</span>
                {currentReadiness.gates.gate4_headmaster ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Pimpinan unit resmi diangkat.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                  currentReadiness.gates.gate4_headmaster ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchool.headmasterPersonId ? `ID: ${currentSchool.headmasterPersonId}` : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>

            {/* Gate 5 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate5_staffedClassroom ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 5: Rombel & Guru</span>
                {currentReadiness.gates.gate5_staffedClassroom ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Minimal 1 rombel aktif dengan wali kelas.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                  currentReadiness.gates.gate5_staffedClassroom ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchoolClasses.length} Rombel Terbentuk
                </span>
              </div>
            </div>

            {/* Gate 6 */}
            <div className={`px-4 py-5 md:p-4 md:rounded-xl border-b md:border bg-white md:shadow-2xs transition-all hover:shadow-xs ${currentReadiness.gates.gate6_placedStudents ? 'md:border-emerald-300 md:ring-1 md:ring-emerald-500/10' : 'md:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Gate 6: Penempatan Siswa</span>
                {currentReadiness.gates.gate6_placedStudents ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Minimal 1 siswa ditempatkan di rombel.</p>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                  currentReadiness.gates.gate6_placedStudents ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {currentSchoolStudents.length} Siswa Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-2 w-full md:w-auto">
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="w-full md:w-auto flex justify-center items-center space-x-2 px-4 py-3 md:py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Tambah Rombel & Wali Kelas</span>
            </button>

            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="w-full md:w-auto flex justify-center items-center space-x-2 px-4 py-3 md:py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Admisi & Penempatan Siswa</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL REGISTRY (SUPERADMIN ONLY) */}
      {activeTab === 'SCHOOL_REGISTRY' && isSuperadmin && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Matriks Cabang Institusi Yayasan GPIB</span>
            <span className="text-xs font-mono font-bold text-amber-700">Total: {schools.length} Unit</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NPSN</th>
                <th className="py-3 px-4">Nama Unit</th>
                <th className="py-3 px-4">Kota</th>
                <th className="py-3 px-4">Kepala Sekolah</th>
                <th className="py-3 px-4">Status Hukum</th>
                <th className="py-3 px-4">Kesiapan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schools.map(s => {
                const r = readinessMap[s.id];
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.npsn}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.city}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.headmasterPersonId || 'Belum diangkat'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-semibold">
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                        r?.isReady ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {r?.status || 'NOT_READY'} ({Object.values(r?.gates || {}).filter(Boolean).length}/6)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveSchoolId(s.id);
                          setActiveTab('READINESS');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Buka Setup
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CLASSROOM SETUP */}
      {activeTab === 'CLASSROOM_SETUP' && currentSchool && (
        <div className="bg-white border-y md:border border-slate-200 md:rounded-xl p-4 md:p-6 md:shadow-xs space-y-4 -mx-4 md:mx-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Daftar Rombongan Belajar (Rombel) Aktif</h3>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="w-full md:w-auto flex justify-center items-center space-x-1.5 px-3 py-2 md:py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Rombel</span>
            </button>
          </div>

          {currentSchoolClasses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Belum ada rombel yang dibentuk untuk unit ini. Silakan tambahkan rombel baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSchoolClasses.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                      Kapasitas: {c.capacity} anak
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Kelompok Usia: {c.ageGroup}</div>
                  <div className="text-xs font-mono text-slate-700">Wali Kelas: {c.homeroomTeacherId || 'Belum ditugaskan'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ADMISSION */}
      {activeTab === 'STUDENT_ADMISSION' && currentSchool && (
        <div className="bg-white border-y md:border border-slate-200 md:rounded-xl p-4 md:p-6 md:shadow-xs space-y-4 -mx-4 md:mx-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Daftar Siswa Terdaftar & Penempatan Rombel</h3>
            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="w-full md:w-auto flex justify-center items-center space-x-1.5 px-3 py-2 md:py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admisi Siswa Baru</span>
            </button>
          </div>

          {currentSchoolStudents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Belum ada siswa yang diadmisikan ke unit ini.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NIS</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Rombel Penempatan</th>
                  <th className="py-2.5 px-3">Tgl Masuk</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL: CREATE SCHOOL */}
      {showCreateSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Dirikan Unit Sekolah Baru (Yayasan Superadmin)</h3>
            <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Nama Unit Sekolah</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="Contoh: TK Yapendik 03 Rawamangun"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Alamat Lengkap</label>
                <input
                  type="text"
                  value={newSchoolAddress}
                  onChange={e => setNewSchoolAddress(e.target.value)}
                  placeholder="Jl. Pemuda No. 88"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Kota</label>
                  <input
                    type="text"
                    value={newSchoolCity}
                    onChange={e => setNewSchoolCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Telepon</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={e => setNewSchoolPhone(e.target.value)}
                    placeholder="021-4712345"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateSchoolModal(false)}
                  className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 border border-slate-200 cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto flex justify-center items-center px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow-xs cursor-pointer"
                >
                  Dirikan Sekolah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CLASSROOM */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Bentuk Rombongan Belajar (Rombel)</h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Nama Rombel</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Contoh: Kelompok A (Mawar Indah)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Kelompok Usia</label>
                  <select
                    value={newClassAgeGroup}
                    onChange={e => setNewClassAgeGroup(e.target.value)}
                    className="w-full flex justify-between items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 border border-slate-200 cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto flex justify-center items-center px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow-xs cursor-pointer"
                >
                  Bentuk Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIT & PLACE STUDENT */}
      {showAdmitStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900">Admisi & Penempatan Siswa Baru (ACID Unit)</h3>
            <form onSubmit={handleAdmitStudent} className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-amber-700 text-xs uppercase tracking-wider">1. Data Induk Anak</span>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    value={childFullName}
                    onChange={e => setChildFullName(e.target.value)}
                    placeholder="Contoh: Jonathan Chris Rawamangun"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Jenis Kelamin</label>
                    <select
                      value={childGender}
                      onChange={e => setChildGender(e.target.value as any)}
                      className="w-full flex justify-between items-center bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Rombel Penempatan</label>
                    <select
                      value={targetClassId}
                      onChange={e => setTargetClassId(e.target.value)}
                      required
                      className="w-full flex justify-between items-center bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="">Pilih Rombel...</option>
                      {currentSchoolClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Kapasitas: {c.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-amber-700 text-xs uppercase tracking-wider">2. Data Wali Sah & Hubungan</span>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Nama Lengkap Wali</label>
                  <input
                    type="text"
                    value={guardianFullName}
                    onChange={e => setGuardianFullName(e.target.value)}
                    placeholder="Contoh: Samuel Rawamangun"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Nomor Telepon</label>
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={e => setGuardianPhone(e.target.value)}
                      placeholder="081299887766"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Hubungan</label>
                    <select
                      value={guardianRelation}
                      onChange={e => setGuardianRelation(e.target.value as any)}
                      className="w-full flex justify-between items-center bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="FATHER">Ayah Kandung</option>
                      <option value="MOTHER">Ibu Kandung</option>
                      <option value="GUARDIAN">Wali Sah</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdmitStudentModal(false)}
                  className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 border border-slate-200 cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto flex justify-center items-center px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow-xs cursor-pointer"
                >
                  Admisikan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
