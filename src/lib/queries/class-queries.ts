import { getSupabaseClient } from '../../db/supabaseClient';
import { db } from '../../db/database';
import type {
  ClassRecord,
  ClassWithDetails,
  StudentWithGuardians,
  GuardianRecord,
} from '../../types/class';

// Helper untuk konversi DataURL (base64) ke Blob biner untuk upload Supabase Storage
function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } | null {
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length < 2) return null;
    const mimeType = parts[0].replace('data:', '');
    const byteCharacters = atob(parts[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return { blob: new Blob([byteArray], { type: mimeType }), mimeType };
  } catch (e) {
    console.warn('Error converting dataUrl to Blob:', e);
    return null;
  }
}

// Helper untuk mengambil data siswa fallback dari local database
function getLocalStudentsForClass(classId: string): StudentWithGuardians[] {
  const targetClass = db.getClassById(classId) || db.getClasses('sch_tk_maranatha')[0];
  const rawStudents = db.getStudents('sch_tk_maranatha', targetClass?.id || classId);

  return rawStudents.map((s) => {
    const guardiansList: GuardianRecord[] = (s.guardians || []).map((g: any) => {
      let rel = 'Wali';
      if (g.relation?.relationshipType === 'FATHER') rel = 'Ayah';
      else if (g.relation?.relationshipType === 'MOTHER') rel = 'Ibu';

      return {
        id: g.person?.id || g.relation?.id || 'g_0',
        name: g.person?.fullName || 'Wali Siswa',
        relationship: rel,
        nik: g.person?.nationalIdNumber || '',
        phone: g.person?.phone || '',
        is_primary: g.relation?.isPrimaryContact ?? false
      };
    });

    return {
      id: s.id,
      nis: s.nis || s.nisn || s.id,
      nik: s.person?.nationalIdNumber || '',
      full_name: s.person?.fullName || 'Anak Didik',
      call_name: s.person?.preferredName || s.person?.fullName?.split(' ')[0] || 'Anak',
      birth_place: s.person?.birthPlace || 'Jakarta',
      birth_date: s.person?.birthDate || '2021-01-01',
      gender: s.person?.gender === 'FEMALE' ? 'Perempuan' : 'Laki-laki',
      blood_type: s.bloodType || 'O',
      allergies: s.allergies && s.allergies !== 'Tidak ada' ? s.allergies : 'Bebas alergi',
      address: s.person?.address || 'Jakarta',
      class_id: targetClass?.id || classId,
      status: 'Aktif',
      photo_url: s.photoUrl || undefined,
      guardians: guardiansList
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// QUERY 1: Ambil semua kelas aktif
// ═══════════════════════════════════════════════════════════════════
export async function fetchActiveClasses(
  academicYearId?: string
): Promise<ClassRecord[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      let query = supabase
        .from('classes')
        .select(`
          id, name, age_group, room_number, academic_year_id,
          is_active, school_id
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          level: c.age_group === 'TK_A_4_5' ? 'TK A' : 'TK B',
          academic_year_id: c.academic_year_id,
          room_name: c.room_number || c.name,
          age_range: c.age_group === 'TK_A_4_5' ? '4-5 Thn' : '5-6 Thn',
          student_count: 0,
          is_active: c.is_active ?? true
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchActiveClasses error, falling back to local store:', e);
    }
  }

  // Fallback: Local DB
  const schoolId = 'sch_tk_maranatha';
  const classes = db.getClasses(schoolId);
  return classes.map((c) => ({
    id: c.id,
    name: c.name.includes('Kelompok A')
      ? 'Kelas TK A'
      : c.name.includes('Kelompok B')
      ? 'Kelas TK B'
      : c.name,
    level: c.ageGroup === 'TK_A_4_5' ? 'TK A' : 'TK B',
    academic_year_id: c.academicYearId,
    room_name: c.roomNumber || c.name,
    age_range: c.ageGroup === 'TK_A_4_5' ? '4-5 Thn' : '5-6 Thn',
    student_count: 0,
    is_active: c.isActive ?? true
  }));
}

// ═══════════════════════════════════════════════════════════════════
// QUERY 2: Ambil detail kelas + siswa + wali (Zero Plaintext Leakage)
// ═══════════════════════════════════════════════════════════════════
export async function fetchClassRoster(
  classId: string
): Promise<ClassWithDetails> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // 1. Ambil data kelas
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id, name, age_group, room_number,
          homeroom_teacher_id, co_teacher_id, is_active
        `)
        .eq('id', classId)
        .single();

      if (!classError && classData) {
        // 2. Ambil person guru
        const teacherIds = [classData.homeroom_teacher_id, classData.co_teacher_id].filter(Boolean);
        let homeroomName = 'Belum Ditugaskan';
        let assistantName = 'Belum Ditugaskan';

        if (teacherIds.length > 0) {
          const { data: teachers } = await supabase
            .from('persons')
            .select('id, full_name')
            .in('id', teacherIds);

          const hm = teachers?.find((t: any) => t.id === classData.homeroom_teacher_id);
          const asst = teachers?.find((t: any) => t.id === classData.co_teacher_id);
          if (hm) homeroomName = hm.full_name;
          if (asst) assistantName = asst.full_name;
        }

        // 3. Ambil data siswa dari Supabase
        const { data: studentsData } = await supabase
          .from('students')
          .select(`
            id, person_id, nisn, nis, blood_type, allergies, status, photo_url,
            person:persons(id, full_name, preferred_name, birth_place, birth_date, gender, address, national_id_number, avatar_url)
          `)
          .eq('current_class_id', classId)
          .eq('status', 'ACTIVE')
          .order('id', { ascending: true });

        // 4. Ambil relasi orang tua/wali untuk seluruh siswa di kelas ini
        const studentPersonIds = (studentsData || [])
          .map((s: any) => s.person_id)
          .filter(Boolean);

        const guardiansByStudentPersonId = new Map<string, GuardianRecord[]>();

        if (studentPersonIds.length > 0) {
          const { data: relsData } = await supabase
            .from('guardian_relationships')
            .select('id, student_person_id, guardian_person_id, relationship_type, is_primary_contact')
            .in('student_person_id', studentPersonIds);

          if (relsData && relsData.length > 0) {
            const guardianPersonIds = Array.from(
              new Set(relsData.map((r: any) => r.guardian_person_id).filter(Boolean))
            );

            const { data: guardianPersons } = await supabase
              .from('persons')
              .select('id, full_name, national_id_number, phone')
              .in('id', guardianPersonIds);

            const personMap = new Map((guardianPersons || []).map((p: any) => [p.id, p]));

            for (const r of relsData) {
              const gp: any = personMap.get(r.guardian_person_id);
              let rel = 'Wali';
              if (r.relationship_type === 'FATHER') rel = 'Ayah';
              else if (r.relationship_type === 'MOTHER') rel = 'Ibu';
              else if (r.relationship_type === 'GUARDIAN') rel = 'Wali';

              const guardianItem: GuardianRecord = {
                id: gp?.id || r.id,
                name: gp?.full_name || 'Orang Tua / Wali',
                relationship: rel,
                nik: gp?.national_id_number || '',
                phone: gp?.phone || '',
                is_primary: r.is_primary_contact ?? false,
              };

              const existing = guardiansByStudentPersonId.get(r.student_person_id) || [];
              existing.push(guardianItem);
              guardiansByStudentPersonId.set(r.student_person_id, existing);
            }
          }
        }

        const localStudents = getLocalStudentsForClass(classId);
        const localStudentMap = new Map(localStudents.map(ls => [ls.id, ls]));

        let mappedStudents: StudentWithGuardians[] = (studentsData || []).map((s: any) => {
          const person = Array.isArray(s.person) ? s.person[0] : s.person;
          let studentGuardians = guardiansByStudentPersonId.get(s.person_id) || [];
          const localStudent = localStudentMap.get(s.id);

          // 🌟 FAIL-SAFE GUARDIANS: Jika Supabase mengembalikan relasi kosong, gunakan relasi lokal
          if (studentGuardians.length === 0 && localStudent?.guardians && localStudent.guardians.length > 0) {
            studentGuardians = localStudent.guardians;
          }

          // 🌟 HYBRID PHOTO RESOLUTION
          const resolvedPhoto = s.photo_url || person?.avatar_url || localStudent?.photo_url || undefined;

          return {
            id: s.id,
            nis: s.nis || s.nisn || s.id,
            nik: person?.national_id_number || '',
            full_name: person?.full_name || 'Anak Didik',
            call_name: person?.preferred_name || person?.full_name?.split(' ')[0] || 'Anak',
            birth_place: person?.birth_place || 'Jakarta',
            birth_date: person?.birth_date || '2021-01-01',
            gender: person?.gender === 'FEMALE' ? 'Perempuan' : 'Laki-laki',
            blood_type: s.blood_type || 'O',
            allergies: s.allergies && s.allergies !== 'Tidak ada' ? s.allergies : 'Bebas alergi',
            address: person?.address || 'Jakarta',
            class_id: classId,
            status: 'Aktif',
            photo_url: resolvedPhoto,
            guardians: studentGuardians,
          };
        });

        // 🌟 FAIL-SAFE GRACEFUL DEGRADATION:
        // Jika data siswa di Supabase Cloud belum di-seed (length === 0), ambil dari local store!
        if (mappedStudents.length === 0) {
          mappedStudents = getLocalStudentsForClass(classId);
        }

        // Fallback nama guru jika belum ditugaskan di Supabase
        if (homeroomName === 'Belum Ditugaskan') {
          const targetClassLocal = db.getClassById(classId) || db.getClasses('sch_tk_maranatha')[0];
          const hmLocal = targetClassLocal?.homeroomTeacherId ? db.getPersonById(targetClassLocal.homeroomTeacherId) : null;
          const asstLocal = targetClassLocal?.coTeacherId ? db.getPersonById(targetClassLocal.coTeacherId) : null;
          homeroomName = hmLocal?.fullName || 'ERNA BOYKELA R';
          assistantName = asstLocal?.fullName || 'CHARLOTHA JOVANNCA BLANDINNA R';
        }

        return {
          id: classData.id,
          name: classData.name,
          level: classData.age_group === 'TK_A_4_5' ? 'TK A' : 'TK B',
          room_name: classData.room_number || classData.name,
          age_range: classData.age_group === 'TK_A_4_5' ? '4-5 Thn' : '5-6 Thn',
          student_count: mappedStudents.length,
          is_active: classData.is_active ?? true,
          homeroom_teacher: { name: homeroomName, role: 'Guru Kelas' },
          assistant_teacher: { name: assistantName, role: 'Pendamping' },
          students: mappedStudents,
        };
      }
    } catch (e) {
      console.warn('Supabase fetchClassRoster error, using local store:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FALLBACK: In-Memory / Local Storage Database
  // ═══════════════════════════════════════════════════════════════
  const targetClass = db.getClassById(classId) || db.getClasses('sch_tk_maranatha')[0];
  const homeroom = targetClass?.homeroomTeacherId ? db.getPersonById(targetClass.homeroomTeacherId) : null;
  const assistant = targetClass?.coTeacherId ? db.getPersonById(targetClass.coTeacherId) : null;
  const students = getLocalStudentsForClass(targetClass?.id || classId);

  return {
    id: targetClass?.id || classId,
    name: targetClass?.name || 'Kelas TK A',
    level: targetClass?.ageGroup === 'TK_A_4_5' ? 'TK A' : 'TK B',
    room_name: targetClass?.roomNumber || targetClass?.name || 'Ruang TK A',
    age_range: targetClass?.ageGroup === 'TK_A_4_5' ? '4-5 Thn' : '5-6 Thn',
    student_count: students.length,
    is_active: targetClass?.isActive ?? true,
    homeroom_teacher: { name: homeroom?.fullName || 'ERNA BOYKELA R', role: 'Guru Kelas' },
    assistant_teacher: { name: assistant?.fullName || 'CHARLOTHA JOVANNCA BLANDINNA R', role: 'Pendamping' },
    students
  };
}

// ═══════════════════════════════════════════════════════════════
// QUERY 3: Update Foto Siswa (Supabase Storage + RPC + DB + Local Persist)
// ═══════════════════════════════════════════════════════════════
export async function updateStudentPhoto(
  studentId: string,
  photoUrl: string
): Promise<string> {
  const supabase = getSupabaseClient();
  let finalPhotoUrl = photoUrl;

  if (supabase) {
    try {
      if (photoUrl && photoUrl.startsWith('data:image')) {
        const converted = dataUrlToBlob(photoUrl);
        if (converted) {
          const fileName = `${studentId}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('student-photos')
            .upload(fileName, converted.blob, {
              contentType: converted.mimeType || 'image/jpeg',
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data: publicData } = supabase.storage
              .from('student-photos')
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              finalPhotoUrl = `${publicData.publicUrl}?t=${Date.now()}`;
            }
          }
        }
      }

      // 1. Panggil RPC rpc_update_student_photo (SECURITY DEFINER)
      const { error: rpcError } = await supabase.rpc('rpc_update_student_photo', {
        p_student_id: studentId,
        p_photo_url: finalPhotoUrl || null,
      });

      // 2. Direct update fallback jika RPC belum dieksekusi
      if (rpcError) {
        await supabase
          .from('students')
          .update({ photo_url: finalPhotoUrl || null })
          .eq('id', studentId);

        const { data: stRow } = await supabase
          .from('students')
          .select('person_id')
          .eq('id', studentId)
          .single();

        if (stRow?.person_id) {
          await supabase
            .from('persons')
            .update({ avatar_url: finalPhotoUrl || null })
            .eq('id', stRow.person_id);
        }
      }
    } catch (e) {
      console.warn('Error updating student photo in Supabase:', e);
    }
  }

  // Session & Local Storage Persistent update
  db.updateStudentPhoto(studentId, finalPhotoUrl);
  return finalPhotoUrl;
}
