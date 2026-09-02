// ═══════════════════════════════════════════════════════════════════
// TIPE KANONIKAL DATA ROSTER — AMANAURA v3.0
// ═══════════════════════════════════════════════════════════════════

export interface ClassRecord {
  id: string;
  name: string;              // "Kelas TK A", "Kelas TK B" — dari DB, BUKAN hardcoded
  level?: 'TK A' | 'TK B' | string;
  academic_year_id?: string;
  room_name: string;         // "Ruang TK A"
  homeroom_teacher_id?: string;
  assistant_teacher_id?: string;
  age_range: string;         // "4-5 Thn", "5-6 Thn"
  student_count: number;
  is_active?: boolean;
}

export interface StudentRecord {
  id: string;
  nis: string;               // JetBrains Mono
  nik?: string;              // JetBrains Mono (Masked di UI)
  full_name: string;
  call_name: string;
  birth_place: string;
  birth_date: string;        // ISO 8601
  gender: 'Laki-laki' | 'Perempuan' | 'MALE' | 'FEMALE';
  blood_type?: string;
  allergies?: string;
  address?: string;
  class_id?: string;
  photo_url?: string;
  status: 'Aktif' | 'Pindah' | 'Keluar' | 'ACTIVE' | 'TRANSFERRED' | 'INACTIVE';
}

export interface GuardianRecord {
  id: string;
  student_id?: string;
  name: string;
  relationship: string;      // "Ayah", "Ibu", "Wali", "Ayah Kandung", "Ibu Kandung"
  nik?: string;
  phone?: string;
  is_primary?: boolean;
}

export interface StudentWithGuardians extends StudentRecord {
  guardians: GuardianRecord[];
}

export interface ClassWithDetails extends ClassRecord {
  homeroom_teacher: { name: string; role: string };
  assistant_teacher: { name: string; role: string };
  students: StudentWithGuardians[];
}
