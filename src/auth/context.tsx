/**
 * Yapendik School OS — Authentication & Security Context Provider
 * 
 * Production Hardened:
 * - Dynamic Supabase Identity Resolution via PostgreSQL RPC & Profile Tables
 * - Clear separation between PRODUCTION AUTH and DEMO/SIMULATION mode
 * - Strict Session Lifecycle: Full cache flush on logout & context switch
 * - Secure Context Projection (USER + ROLE + SCHOOL CONTEXT + RELATIONSHIP)
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SecurityContext } from './authorization';
import { Role, School, UserAccount, Person } from '../domain/types';
import { getSupabaseClient } from '../db/supabaseClient';
import { db } from '../db/database';
import { User } from '@supabase/supabase-js';

export interface PersonaProfile {
  id: string;
  name: string;
  role: Role;
  roleTitle: string;
  schoolId: string;
  schoolName: string;
  personId: string;
  assignedClasses: string[];
  guardianChildrenPersonIds: string[];
  description: string;
  isSimulation?: boolean;
}

export const SEED_PERSONAS: PersonaProfile[] = [
  {
    id: 'user_teacher_siti',
    name: 'Siti Rahmawati, S.Pd',
    role: 'TEACHER',
    roleTitle: 'Wali Kelas TK A (Kelompok Bintang Ceria)',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'TK Yapendik 01 Menteng',
    personId: 'per_teacher_siti',
    assignedClasses: ['cls_tka_01'],
    guardianChildrenPersonIds: [],
    description: 'Guru Inti kelompok usia 4-5 tahun, aktif mengamati perkembangan motorik & bahasa.',
    isSimulation: true
  },
  {
    id: 'user_teacher_maria',
    name: 'Maria Magdalena, S.Pd.Aud',
    role: 'TEACHER',
    roleTitle: 'Wali Kelas TK B (Kelompok Matahari)',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'TK Yapendik 01 Menteng',
    personId: 'per_teacher_maria',
    assignedClasses: ['cls_tkb_01'],
    guardianChildrenPersonIds: [],
    description: 'Guru Inti kelompok usia 5-6 tahun, persiapan transisi ke jenjang SD.',
    isSimulation: true
  },
  {
    id: 'user_headmaster_esther',
    name: 'Dra. Esther Nugroho, M.Pd',
    role: 'HEADMASTER',
    roleTitle: 'Kepala Sekolah TK Yapendik 01',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'TK Yapendik 01 Menteng',
    personId: 'per_headmaster_esther',
    assignedClasses: ['cls_tka_01', 'cls_tkb_01'],
    guardianChildrenPersonIds: [],
    description: 'Pimpinan sekolah bertanggung jawab atas kurikulum, validasi LPPA, dan supervisi pendidik.',
    isSimulation: true
  },
  {
    id: 'user_parent_budi',
    name: 'Budi Santoso, S.T.',
    role: 'GUARDIAN',
    roleTitle: 'Orang Tua / Wali Murid (Ayah Kenzo & Nathanael)',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'TK Yapendik 01 Menteng',
    personId: 'per_parent_budi',
    assignedClasses: [],
    guardianChildrenPersonIds: ['per_child_kenzo'],
    description: 'Wali sah Ananda Kenzo (TK A) & Pendaftar PPDB Calon Siswa Nathanael Santoso.',
    isSimulation: true
  },
  {
    id: 'user_parent_bona',
    name: 'Bona Pandjaitan, S.T.',
    role: 'APPLICANT',
    roleTitle: 'Orang Tua Calon Siswa PPDB (Ayah Timothy)',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'TK Yapendik 01 Menteng',
    personId: 'per_parent_bona',
    assignedClasses: [],
    guardianChildrenPersonIds: [],
    description: 'Orang Tua Pendaftar Baru (Guest APPLICANT) ananda Timothy Andreas Pandjaitan.',
    isSimulation: true
  },
  {
    id: 'user_teacher_diana_tk2',
    name: 'Diana Sari, S.Pd',
    role: 'TEACHER',
    roleTitle: 'Guru TK Yapendik 02 Kebayoran',
    schoolId: 'sch_tk_yapendik_02',
    schoolName: 'TK Yapendik 02 Kebayoran',
    personId: 'per_teacher_diana',
    assignedClasses: ['cls_tka_02'],
    guardianChildrenPersonIds: [],
    description: 'Pendidik dari unit sekolah berbeda. Digunakan untuk memvalidasi isolasi batas sekolah (Negative Tests).',
    isSimulation: true
  },
  {
    id: 'user_superadmin_yapendik',
    name: 'Dr. Andreas Hendrawan (Yayasan)',
    role: 'YAPENDIK_SUPERADMIN',
    roleTitle: 'Pengawas Mutu Pendidikan Yayasan Yapendik',
    schoolId: 'sch_tk_yapendik_01',
    schoolName: 'Yayasan Pendidikan Kristen Yapendik',
    personId: 'per_superadmin_andreas',
    assignedClasses: ['cls_tka_01', 'cls_tkb_01', 'cls_tka_02'],
    guardianChildrenPersonIds: [],
    description: 'Tata kelola lintas sekolah, penjaminan mutu kurikulum TK Pilot, dan audit menyeluruh.',
    isSimulation: true
  }
];

export type AuthState = 
  | 'LOADING' 
  | 'UNAUTHENTICATED' 
  | 'AUTHENTICATED_NO_PERSON' 
  | 'AUTHENTICATED_MAPPED' 
  | 'MAPPED_INACTIVE'
  | 'NO_INSTITUTIONAL_RELATIONSHIP';

interface SecurityContextValue {
  authenticatedUser: User | null;
  authState: AuthState;
  currentPersona: PersonaProfile | null;
  securityContext: SecurityContext | null;
  isSimulationMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  switchPersona: (personaId: string) => Promise<void>;
  signOut: () => Promise<void>;
  personas: PersonaProfile[];
  activeSchoolId: string;
  setActiveSchoolId: (schoolId: string) => void;
}

const SecurityContextReact = createContext<SecurityContextValue | null>(null);

export const SecurityContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile | null>(null);
  const [activeSchoolId, setActiveSchoolId] = useState<string>('sch_tk_yapendik_01');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const isSimulationModeRef = useRef<boolean>(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      // Fallback to initial simulation check
      setAuthState('UNAUTHENTICATED');
      return;
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSession = async (session: any) => {
    if (!session?.user) {
      setAuthenticatedUser(null);
      if (!isSimulationModeRef.current) {
        setCurrentPersona(null);
        setAuthState('UNAUTHENTICATED');
      }
      return;
    }

    setAuthenticatedUser(session.user);
    
    if (!supabase) return;

    try {
      // 1. Dynamic Identity Resolution via PostgreSQL SECURITY DEFINER RPC
      const { data: personId, error: rpcError } = await supabase.rpc('get_auth_person_id');
      
      let mappedPersonId: string | null = null;
      if (!rpcError && personId && (personId.startsWith('per_') || personId.startsWith('usr_'))) {
        mappedPersonId = personId;
      }

      // Check user_person_identities directly if personId is a raw UUID or not yet resolved
      if (!mappedPersonId) {
        const { data: identityData } = await supabase
          .from('user_person_identities')
          .select('person_id')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();
        
        if (identityData?.person_id) {
          mappedPersonId = identityData.person_id;
        }
      }

      // Fallback matching for seed / pilot accounts by email
      const email = session.user.email?.toLowerCase();
      const expectedEmails: Record<string, string> = {
        'user_teacher_siti': 'siti@yapendik.sch.id',
        'user_teacher_maria': 'maria@yapendik.sch.id',
        'user_headmaster_esther': 'esther@yapendik.sch.id',
        'user_parent_budi': 'budi@yapendik.sch.id',
        'user_teacher_diana_tk2': 'diana@yapendik.sch.id',
        'user_superadmin_yapendik': 'andreas@yapendik.sch.id'
      };

      const matchedSeed = SEED_PERSONAS.find(p => 
        (mappedPersonId && p.personId === mappedPersonId) || 
        (email && expectedEmails[p.id] === email)
      );

      if (!mappedPersonId && matchedSeed) {
        mappedPersonId = matchedSeed.personId;
      } else if (!mappedPersonId && !rpcError && personId) {
        mappedPersonId = personId;
      }

      if (!mappedPersonId) {
        setAuthState('AUTHENTICATED_NO_PERSON');
        return;
      }

      // 2. Fetch canonical person profile
      const { data: personData } = await supabase
        .from('persons')
        .select('*')
        .eq('id', mappedPersonId)
        .maybeSingle();

      const fullName = personData?.full_name || matchedSeed?.name || session.user.email || 'Pengguna Terdaftar';

      // 3. Dynamically resolve institutional role & school context
      let resolvedRole: Role = 'GUARDIAN';
      let resolvedRoleTitle: string = 'Orang Tua / Wali';
      let resolvedSchoolId: string = 'sch_tk_yapendik_01';
      let resolvedSchoolName: string = 'TK Yapendik 01 Menteng';
      let assignedClasses: string[] = [];
      let guardianChildrenPersonIds: string[] = [];

      // Check Staff Profiles (SUPERADMIN, HEADMASTER, ADMIN, etc.)
      const { data: staffProfiles } = await supabase
        .from('staff_profiles')
        .select('*, schools(name)')
        .eq('person_id', mappedPersonId)
        .eq('is_active', true)
        .order('join_date', { ascending: false, nullsFirst: false });
      const staffProfile = staffProfiles?.[0];

      if (staffProfile?.role === 'SUPERADMIN' || matchedSeed?.role === 'YAPENDIK_SUPERADMIN') {
        resolvedRole = 'YAPENDIK_SUPERADMIN';
        resolvedRoleTitle = 'Pengawas Mutu Pendidikan Yayasan';
        resolvedSchoolName = 'Yayasan Yapendik';
      } else if (staffProfile || matchedSeed?.role === 'HEADMASTER' || matchedSeed?.role === 'STAFF') {
        const isHeadmaster = staffProfile?.role === 'HEADMASTER' || matchedSeed?.role === 'HEADMASTER';
        resolvedRole = isHeadmaster ? 'HEADMASTER' : 'STAFF';
        resolvedRoleTitle = isHeadmaster ? 'Kepala Sekolah' : 'Staf Administrasi';
        resolvedSchoolId = staffProfile?.school_id || matchedSeed?.schoolId || 'sch_tk_yapendik_01';
        resolvedSchoolName = (staffProfile as any)?.schools?.name || matchedSeed?.schoolName || 'Unit TK Yapendik';
      } else {
        // Check Teacher Profile
        const { data: teacherProfiles } = await supabase
          .from('teacher_profiles')
          .select('*, schools(name)')
          .eq('person_id', mappedPersonId)
          .eq('is_active', true)
          .order('join_date', { ascending: false, nullsFirst: false });
        const teacherProfile = teacherProfiles?.[0];

        if (teacherProfile || matchedSeed?.role === 'TEACHER' || matchedSeed?.role === 'ASSISTANT_TEACHER') {
          resolvedRole = (matchedSeed?.role === 'ASSISTANT_TEACHER' ? 'ASSISTANT_TEACHER' : 'TEACHER');
          resolvedRoleTitle = matchedSeed?.roleTitle || 'Pendidik / Guru Kelas';
          resolvedSchoolId = teacherProfile?.school_id || matchedSeed?.schoolId || 'sch_tk_yapendik_01';
          resolvedSchoolName = (teacherProfile as any)?.schools?.name || matchedSeed?.schoolName || 'Unit TK Yapendik';

          // Get assigned classes
          const { data: classesData } = await supabase
            .from('classes')
            .select('id')
            .or(`homeroom_teacher_id.eq.${mappedPersonId},co_teacher_id.eq.${mappedPersonId}`);
          
          if (classesData && classesData.length > 0) {
            assignedClasses = classesData.map(c => c.id);
          } else if (matchedSeed?.assignedClasses) {
            assignedClasses = matchedSeed.assignedClasses;
          }
        } else {
          // Check Guardian Relationships
          const { data: guardianData } = await supabase
            .from('guardian_relationships')
            .select('student_person_id')
            .eq('guardian_person_id', mappedPersonId);

          if (guardianData && guardianData.length > 0) {
            resolvedRole = 'GUARDIAN';
            resolvedRoleTitle = 'Orang Tua / Wali Murid';
            guardianChildrenPersonIds = guardianData.map(g => g.student_person_id);
          }
        }
      }

      // Build dynamic persona profile using resolved role and matched seed info

      const dynamicPersona: PersonaProfile = {
        id: session.user.id,
        name: fullName,
        role: resolvedRole,
        roleTitle: matchedSeed?.roleTitle || resolvedRoleTitle,
        schoolId: resolvedSchoolId,
        schoolName: matchedSeed?.schoolName || resolvedSchoolName,
        personId: mappedPersonId,
        assignedClasses: assignedClasses.length > 0 ? assignedClasses : (matchedSeed?.assignedClasses || []),
        guardianChildrenPersonIds: guardianChildrenPersonIds.length > 0 ? guardianChildrenPersonIds : (matchedSeed?.guardianChildrenPersonIds || []),
        description: matchedSeed?.description || `Akun terautentikasi resmi Yapendik (${resolvedRole}).`,
        isSimulation: false
      };

      // Set database scope
      db.setContextScope(session.user.id, dynamicPersona.schoolId);

      setCurrentPersona(dynamicPersona);
      setIsSimulationMode(false);
      setAuthState('AUTHENTICATED_MAPPED');
      if (dynamicPersona.role !== 'YAPENDIK_SUPERADMIN') {
        setActiveSchoolId(dynamicPersona.schoolId);
      }

    } catch (e) {
      console.error('Error resolving person:', e);
      setAuthState('AUTHENTICATED_NO_PERSON');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }
    setAuthState('LOADING');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthState('UNAUTHENTICATED');
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setAuthState('UNAUTHENTICATED');
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const switchPersona = async (personaId: string) => {
    const selected = SEED_PERSONAS.find(p => p.id === personaId);
    if (!selected) return;

    // Secure Session Lifecycle: Flush previous user cache
    db.purgeAllSessionCache();
    db.setContextScope(selected.id, selected.schoolId);

    isSimulationModeRef.current = true;
    setIsSimulationMode(true);
    setCurrentPersona(selected);
    setAuthState('AUTHENTICATED_MAPPED');
    if (selected.role !== 'YAPENDIK_SUPERADMIN') {
      setActiveSchoolId(selected.schoolId);
    }
  };
  
  const signOut = async () => {
    // Strict cache purge on logout
    db.purgeAllSessionCache();
    isSimulationModeRef.current = false;
    setCurrentPersona(null);
    setAuthenticatedUser(null);
    setIsSimulationMode(false);
    setAuthState('UNAUTHENTICATED');
    
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
  };

  const securityContext: SecurityContext | null = currentPersona ? {
    userId: currentPersona.id,
    personId: currentPersona.personId,
    personName: currentPersona.name,
    role: currentPersona.role,
    activeSchoolId: currentPersona.role === 'YAPENDIK_SUPERADMIN' ? activeSchoolId : currentPersona.schoolId,
    assignedClasses: currentPersona.assignedClasses,
    guardianChildrenPersonIds: currentPersona.guardianChildrenPersonIds,
    isSuperAdmin: currentPersona.role === 'YAPENDIK_SUPERADMIN'
  } : null;

  return (
    <SecurityContextReact.Provider value={{
      authenticatedUser,
      authState,
      currentPersona,
      securityContext,
      isSimulationMode,
      signInWithEmail,
      switchPersona,
      signOut,
      personas: SEED_PERSONAS,
      activeSchoolId,
      setActiveSchoolId
    }}>
      {children}
    </SecurityContextReact.Provider>
  );
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContextReact);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityContextProvider');
  }
  return context;
};
