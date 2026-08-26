-- ==============================================================================
-- YAPENDIK SCHOOL OS (TK PILOT) — SUPABASE SCHEMA & INITIAL SEED
-- Kurikulum Merdeka PAUD / TK Institutional Relational Engine
-- ==============================================================================

-- 0. CLEANUP (OPTIONAL / SAFE RE-RUN)
-- Uncomment if you need a clean reset:
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS student_progress_reports CASCADE;
-- DROP TABLE IF EXISTS guardian_notices CASCADE;
-- DROP TABLE IF EXISTS daily_attendance CASCADE;
-- DROP TABLE IF EXISTS observation_records CASCADE;
-- DROP TABLE IF EXISTS learning_activities CASCADE;
-- DROP TABLE IF EXISTS developmental_milestones CASCADE;
-- DROP TABLE IF EXISTS teacher_profiles CASCADE;
-- DROP TABLE IF EXISTS guardian_relationships CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS academic_years CASCADE;
-- DROP TABLE IF EXISTS schools CASCADE;
-- DROP TABLE IF EXISTS persons CASCADE;

-- ------------------------------------------------------------------------------
-- 1. CANONICAL PERSON & IDENTITY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  national_id_number TEXT,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE')),
  birth_date DATE,
  birth_place TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 1.5. AUTHENTICATION MAPPING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_person_identities (
  auth_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_user_person_identities_person ON user_person_identities(person_id);

-- 1.5.1. INFRASTRUCTURE LOCKDOWN
-- Ensure identity mappings cannot be directly modified or read by clients
ALTER TABLE user_person_identities ENABLE ROW LEVEL SECURITY;

-- No access policy for any client
DROP POLICY IF EXISTS "System Only Access" ON user_person_identities;
CREATE POLICY "System Only Access" ON user_person_identities FOR ALL TO anon, authenticated USING (false);

-- Defense in depth: REVOKE all privileges from ordinary roles
REVOKE SELECT, INSERT, UPDATE, DELETE ON user_person_identities FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 1.6. IDENTITY RESOLUTION HELPER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_auth_person_id()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT person_id 
  FROM public.user_person_identities 
  WHERE auth_user_id = auth.uid() 
    AND status = 'ACTIVE'
  LIMIT 1;
$$;

-- Defense in depth: Only authenticated users should even attempt to call this
REVOKE EXECUTE ON FUNCTION get_auth_person_id() FROM anon;
GRANT EXECUTE ON FUNCTION get_auth_person_id() TO authenticated;

-- ------------------------------------------------------------------------------
-- 2. INSTITUTIONAL HIERARCHY (SCHOOL & ACADEMIC YEARS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  npsn TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'TK' CHECK (level IN ('TK', 'SD', 'SMP', 'SMA')),
  sub_type TEXT NOT NULL DEFAULT 'STANDARD' CHECK (sub_type IN ('TK_A', 'TK_B', 'PAUD_TERPADU', 'STANDARD')),
  address TEXT,
  city TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  headmaster_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  academic_year_active_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('GANJIL', 'GENAP')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 3. CLASSES & ROSTERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('TK_A_4_5', 'TK_B_5_6', 'PLAYGROUP')),
  room_number TEXT,
  capacity INTEGER DEFAULT 15,
  homeroom_teacher_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  co_teacher_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 4. STUDENTS & GUARDIAN RELATIONSHIPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  nisn TEXT,
  nis TEXT,
  current_class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  blood_type TEXT CHECK (blood_type IN ('A', 'B', 'AB', 'O')),
  allergies TEXT,
  special_needs_notes TEXT,
  enrollment_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'GRADUATED', 'TRANSFERRED', 'INACTIVE'))
);

CREATE TABLE IF NOT EXISTS guardian_relationships (
  id TEXT PRIMARY KEY,
  student_person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  guardian_person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER')),
  is_primary_contact BOOLEAN DEFAULT false,
  is_legal_guardian BOOLEAN DEFAULT true,
  emergency_contact_priority INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  nuptk TEXT,
  specialization TEXT,
  employment_type TEXT NOT NULL DEFAULT 'TETAP' CHECK (employment_type IN ('TETAP', 'KONTRAK', 'HONORER')),
  join_date DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('HEADMASTER', 'ADMIN', 'COUNSELOR', 'LIBRARIAN', 'OTHER')),
  employment_type TEXT NOT NULL DEFAULT 'TETAP' CHECK (employment_type IN ('TETAP', 'KONTRAK', 'HONORER')),
  join_date DATE,
  is_active BOOLEAN DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 5. PAUD DEVELOPMENTAL MILESTONES (KURIKULUM MERDEKA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS developmental_milestones (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('NILAI_AGAMA_MORAL', 'FISIK_MOTORIK', 'KOGNITIF', 'BAHASA', 'SOSIAL_EMOSIONAL', 'SENI')),
  age_group TEXT NOT NULL CHECK (age_group IN ('TK_A_4_5', 'TK_B_5_6')),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  standard_assessment_guidelines TEXT
);

-- ------------------------------------------------------------------------------
-- 6. TEACHER DAILY WORK (RPPH / LEARNING ACTIVITIES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_activities (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  theme TEXT NOT NULL,
  sub_theme TEXT,
  time_slot TEXT,
  activity_name TEXT NOT NULL,
  developmental_focus TEXT[] DEFAULT '{}',
  materials_needed TEXT[] DEFAULT '{}',
  planned_steps TEXT[] DEFAULT '{}',
  teacher_reflection TEXT,
  completed BOOLEAN DEFAULT false
);

-- ------------------------------------------------------------------------------
-- 7. OBSERVATIONS & ANECDOTAL EVIDENCE (HEARTBEAT OF TK EVALUATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS observation_records (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  observer_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('NILAI_AGAMA_MORAL', 'FISIK_MOTORIK', 'KOGNITIF', 'BAHASA', 'SOSIAL_EMOSIONAL', 'SENI')),
  anecdote_description TEXT NOT NULL,
  behavior_trigger TEXT,
  child_reaction TEXT,
  teacher_intervention TEXT,
  milestone_rating TEXT NOT NULL CHECK (milestone_rating IN ('BB', 'MB', 'BSH', 'BSB')),
  indicators_observed TEXT[] DEFAULT '{}',
  photo_evidence_url TEXT,
  is_confidential_to_staff BOOLEAN DEFAULT false,
  shared_with_guardian BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. ATTENDANCE REGISTERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_attendance (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALPA')),
  notes TEXT,
  recorded_by_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  temperature_celsius NUMERIC(4, 1),
  arrival_mood TEXT CHECK (arrival_mood IN ('CERIA', 'TENANG', 'GELISAH', 'MENANGIS')),
  CONSTRAINT uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date)
);

-- ------------------------------------------------------------------------------
-- 9. GUARDIAN NOTICES (BUKU PENGHUBUNG DIGITAL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guardian_notices (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  author_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  recipient_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('DAILY_SUMMARY', 'ANECDOTE_SHARE', 'HEALTH_ALERT', 'CLASS_ANNOUNCEMENT', 'DIRECT_NOTE')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  requires_acknowledgment BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  guardian_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. STUDENT PROGRESS REPORTS (LPPA / RAPOR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_progress_reports (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  semester TEXT NOT NULL CHECK (semester IN ('GANJIL', 'GENAP')),
  evaluated_by_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
  evaluated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  summary_notes JSONB DEFAULT '[]'::jsonb,
  physical_health_notes JSONB DEFAULT '{}'::jsonb,
  attendance_summary JSONB DEFAULT '{}'::jsonb,
  homeroom_feedback TEXT,
  headmaster_approval_date TIMESTAMPTZ,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED'))
);

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS (GOVERNANCE TRACEABILITY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  school_id TEXT,
  user_id TEXT,
  person_name TEXT,
  role TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 12. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(current_class_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_date ON learning_activities(school_id, class_id, date);
CREATE INDEX IF NOT EXISTS idx_observation_records_student ON observation_records(student_id, domain);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON daily_attendance(school_id, class_id, date);
CREATE INDEX IF NOT EXISTS idx_guardian_notices_recipient ON guardian_notices(school_id, recipient_person_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id, timestamp DESC);

-- ------------------------------------------------------------------------------
-- 13. ENABLE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE developmental_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 14. AUTHORITATIVE RLS NOTE & GOVERNED CLIENT AUDIT RPC
-- NOTE: Granular, contextual RLS policies, state-machine RPCs, and integrity triggers
-- are authoritatively defined in db_migrations/rls_migration_v2_1_5_hardened.sql.
-- Generic permissive "USING (true)" policies are strictly prohibited in production.
-- ------------------------------------------------------------------------------

-- Governed Client Audit RPC (SECURITY DEFINER with non-spoofable session derivation)
CREATE OR REPLACE FUNCTION rpc_log_client_event(
  p_school_id TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT,
  p_details TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_person_name TEXT;
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  v_person_id := get_auth_person_id();
  SELECT full_name INTO v_person_name FROM persons WHERE id = v_person_id;

  INSERT INTO audit_logs (id, school_id, user_id, person_name, role, action, resource, resource_id, details, timestamp)
  VALUES (
    gen_random_uuid()::text,
    p_school_id,
    auth.uid()::text,
    COALESCE(v_person_name, 'Authenticated User'),
    'AUTHENTICATED_ACTOR',
    p_action,
    p_resource,
    p_resource_id,
    p_details,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION rpc_log_client_event(TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_log_client_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;



-- ==============================================================================
-- 15. INITIAL SEED FIXTURES
-- ==============================================================================

-- Persons
INSERT INTO persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, phone, address) VALUES
('per_teacher_siti', '3171015204920001', 'Siti Rahmawati, S.Pd', 'Bu Siti', 'FEMALE', '1992-04-12', 'Surakarta', '0812-3456-7890', 'Jl. Percetakan Negara No. 15, Jakarta Pusat'),
('per_teacher_maria', '3171016011890002', 'Maria Magdalena, S.Pd.Aud', 'Bu Maria', 'FEMALE', '1989-11-20', 'Yogyakarta', '0813-9876-5432', 'Jl. Salemba Tengah No. 8, Jakarta Pusat'),
('per_headmaster_esther', '3171015708760003', 'Dra. Esther Nugroho, M.Pd', 'Ibu Esther', 'FEMALE', '1976-08-17', 'Semarang', '0811-2233-4455', 'Jl. Diponegoro No. 88, Menteng'),
('per_teacher_diana', '3174015402950004', 'Diana Sari, S.Pd', 'Bu Diana', 'FEMALE', '1995-02-14', 'Bandung', '0818-7766-5544', 'Jl. Wolter Monginsidi No. 22, Jakarta Selatan'),
('per_superadmin_andreas', '3171012503700005', 'Dr. Andreas Hendrawan', 'Pak Andreas', 'MALE', '1970-03-25', 'Surabaya', '0812-9988-7766', 'Kompleks Yapendik Graha Lt. 4, Jakarta Pusat'),
('per_parent_budi', '3171011006880006', 'Budi Santoso, S.T.', 'Pak Budi', 'MALE', '1988-06-10', 'Malang', '0813-1122-3344', 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat'),
('per_parent_dewi', '3171015509900007', 'Dewi Anggraini, S.E.', 'Ibu Dewi', 'FEMALE', '1990-09-15', 'Jakarta', '0813-5566-7788', 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat'),
('per_parent_hendra', '3171010512870008', 'Hendra Wijaya, S.Kom', 'Pak Hendra', 'MALE', '1987-12-05', 'Medan', '0815-2244-6688', 'Jl. Kramat Raya No. 40, Jakarta Pusat'),
('per_child_kenzo', '3171011403220009', 'Kenzo Pratama Santoso', 'Kenzo', 'MALE', '2022-03-14', 'Jakarta', '', 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat'),
('per_child_alina', '3171016205220010', 'Alina Putri Wijaya', 'Alina', 'FEMALE', '2022-05-22', 'Jakarta', '', 'Jl. Kramat Raya No. 40, Jakarta Pusat'),
('per_child_gabriel', '3171010901220011', 'Gabriel Christian Sihombing', 'Gabriel', 'MALE', '2022-01-09', 'Jakarta', '', 'Jl. Pegangsaan Timur No. 19, Jakarta Pusat'),
('per_child_keisha', '3171017008210012', 'Keisha Amanda Larasati', 'Keisha', 'FEMALE', '2021-08-30', 'Jakarta', '', 'Jl. Raden Saleh No. 33, Jakarta Pusat'),
('per_child_rafael', '3171011810210013', 'Rafael Jonathan Gunawan', 'Rafael', 'MALE', '2021-10-18', 'Jakarta', '', 'Jl. Gondangdia Lama No. 5, Jakarta Pusat')
ON CONFLICT (id) DO NOTHING;

-- Schools
INSERT INTO schools (id, npsn, name, level, sub_type, address, city, province, phone, email, headmaster_person_id, academic_year_active_id) VALUES
('sch_tk_yapendik_01', '20104821', 'TK Yapendik 01 Menteng', 'TK', 'PAUD_TERPADU', 'Jl. Teuku Cik Ditiro No. 42, Menteng', 'Jakarta Pusat', 'DKI Jakarta', '021-3190284', 'tk01.menteng@yapendik.sch.id', 'per_headmaster_esther', 'ay_2026_2027_ganjil'),
('sch_tk_yapendik_02', '20108955', 'TK Yapendik 02 Kebayoran', 'TK', 'STANDARD', 'Jl. Gandaria I No. 18, Kebayoran Baru', 'Jakarta Selatan', 'DKI Jakarta', '021-7243911', 'tk02.kebayoran@yapendik.sch.id', 'per_teacher_diana', 'ay_2026_2027_ganjil_02')
ON CONFLICT (id) DO NOTHING;

-- Staff Profiles
INSERT INTO staff_profiles (id, person_id, school_id, role, employment_type, join_date, is_active) VALUES
('stf_headmaster_esther', 'per_headmaster_esther', 'sch_tk_yapendik_01', 'HEADMASTER', 'TETAP', '2020-07-01', true)
ON CONFLICT (id) DO NOTHING;

-- Academic Years
INSERT INTO academic_years (id, school_id, name, semester, start_date, end_date, is_active) VALUES
('ay_2026_2027_ganjil', 'sch_tk_yapendik_01', 'Tahun Ajaran 2026/2027', 'GANJIL', '2026-07-15', '2026-12-20', true),
('ay_2026_2027_ganjil_02', 'sch_tk_yapendik_02', 'Tahun Ajaran 2026/2027', 'GANJIL', '2026-07-15', '2026-12-20', true)
ON CONFLICT (id) DO NOTHING;

-- Classes
INSERT INTO classes (id, school_id, academic_year_id, name, age_group, room_number, capacity, homeroom_teacher_id, is_active) VALUES
('cls_tka_01', 'sch_tk_yapendik_01', 'ay_2026_2027_ganjil', 'Kelompok A (Bintang Ceria)', 'TK_A_4_5', 'Ruang Anggrek 1', 15, 'per_teacher_siti', true),
('cls_tkb_01', 'sch_tk_yapendik_01', 'ay_2026_2027_ganjil', 'Kelompok B (Matahari Cemerlang)', 'TK_B_5_6', 'Ruang Melati 2', 18, 'per_teacher_maria', true),
('cls_tka_02', 'sch_tk_yapendik_02', 'ay_2026_2027_ganjil_02', 'Kelompok A (Melati Harum)', 'TK_A_4_5', 'Ruang Kencana', 15, 'per_teacher_diana', true)
ON CONFLICT (id) DO NOTHING;

-- Students
INSERT INTO students (id, person_id, school_id, nisn, nis, current_class_id, blood_type, allergies, special_needs_notes, enrollment_date, status) VALUES
('stu_kenzo_01', 'per_child_kenzo', 'sch_tk_yapendik_01', '3229871021', 'TK-2026-001', 'cls_tka_01', 'O', 'Alergi debu & bulu kucing ringan', 'Memerlukan dorongan saat transisi kegiatan kelompok besar', '2026-07-15', 'ACTIVE'),
('stu_alina_02', 'per_child_alina', 'sch_tk_yapendik_01', '3229871022', 'TK-2026-002', 'cls_tka_01', 'A', 'Tidak ada', 'Sangat mandiri dan suka bernyanyi', '2026-07-15', 'ACTIVE'),
('stu_gabriel_03', 'per_child_gabriel', 'sch_tk_yapendik_01', '3229871023', 'TK-2026-003', 'cls_tka_01', 'B', 'Alergi udang/seafood', 'Kuat di motorik kasar, suka permainan balok', '2026-07-15', 'ACTIVE'),
('stu_keisha_04', 'per_child_keisha', 'sch_tk_yapendik_01', '3218765411', 'TK-2025-014', 'cls_tkb_01', 'AB', 'Tidak ada', 'Kemampuan bercerita dan kosa kata sangat kaya', '2025-07-15', 'ACTIVE'),
('stu_rafael_05', 'per_child_rafael', 'sch_tk_yapendik_01', '3218765412', 'TK-2025-015', 'cls_tkb_01', 'O', 'Sensitif terhadap susu sapi (Lactose intolerant)', 'Fokus tinggi saat merangkai puzzle kompleks', '2025-07-15', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Guardian Relationships
INSERT INTO guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority) VALUES
('rel_kenzo_budi', 'per_child_kenzo', 'per_parent_budi', 'FATHER', true, true, 1),
('rel_kenzo_dewi', 'per_child_kenzo', 'per_parent_dewi', 'MOTHER', false, true, 2),
('rel_alina_hendra', 'per_child_alina', 'per_parent_hendra', 'FATHER', true, true, 1)
ON CONFLICT (id) DO NOTHING;

-- Developmental Milestones
INSERT INTO developmental_milestones (id, domain, age_group, code, title, description, standard_assessment_guidelines) VALUES
('ms_nam_01', 'NILAI_AGAMA_MORAL', 'TK_A_4_5', 'NAM.A.1', 'Mengenal Perilaku Baik & Berdoa Sebelum/Sesudah Kegiatan', 'Anak mampu melafalkan doa sederhana dengan bimbingan dan menunjukkan sikap menghormati ciptaan Tuhan.', 'BSH jika berdoa dengan tertib secara mandiri; BSB jika mengajak rekan berdoa.'),
('ms_fm_01', 'FISIK_MOTORIK', 'TK_A_4_5', 'FM.A.1', 'Koordinasi Motorik Halus (Memegang Sendok & Menggunting Sederhana)', 'Anak mampu memegang alat tulis/gunting dengan genggaman jari yang tepat dan mengendalikan gerakan tangan.', 'BSH bila menggunting mengikuti garis lurus tanpa robek berlebihan.'),
('ms_kog_01', 'KOGNITIF', 'TK_A_4_5', 'KOG.A.1', 'Mengenal Pola, Bentuk Geometri, dan Mengelompokkan Benda', 'Mampu memilah benda berdasarkan warna, ukuran (besar/kecil), atau bentuk (lingkaran, kotak, segitiga).', 'BSH mampu memilah 3 atribut berbeda secara berurutan.'),
('ms_bhs_01', 'BAHASA', 'TK_A_4_5', 'BHS.A.1', 'Mengungkapkan Keinginan & Menjawab Pertanyaan Sederhana', 'Mampu mengekspresikan gagasan dalam kalimat 3-4 kata dan menyimak instruksi bertahap.', 'BSH menjawab pertanyaan apa, siapa, dan di mana dengan jelas.'),
('ms_sosem_01', 'SOSIAL_EMOSIONAL', 'TK_A_4_5', 'SOSEM.A.1', 'Menunjukkan Empati, Berbagi Mainan, & Antre Giliran', 'Mampu berinteraksi dengan teman sebaya, menunggu giliran dalam permainan, serta merapikan mainan.', 'BSH mampu berbagi mainan tanpa konflik dan merapikan alat main.'),
('ms_seni_01', 'SENI', 'TK_A_4_5', 'SENI.A.1', 'Mengekspresikan Diri Melalui Musik, Gerak, dan Finger Painting', 'Menikmati irama musik, bernyanyi bersama, dan menggunakan warna dalam karya lukis bebas.', 'BSH menghasilkan perpaduan warna dan bergerak dinamis mengikuti irama.')
ON CONFLICT (id) DO NOTHING;

-- Learning Activities
INSERT INTO learning_activities (id, school_id, class_id, date, theme, sub_theme, time_slot, activity_name, developmental_focus, materials_needed, planned_steps, teacher_reflection, completed) VALUES
('act_001', 'sch_tk_yapendik_01', 'cls_tka_01', '2026-08-24', 'Diriku / Panca Indra Ciptaan Tuhan', 'Mengenal Rasa (Manis, Asin, Asam, Pahit)', '08:00 - 09:30', 'Eksplorasi Rasa Buah & Bahan Alami di Sentra Bahan Alam', ARRAY['NILAI_AGAMA_MORAL', 'KOGNITIF', 'BAHASA'], ARRAY['Irisan buah jeruk manis', 'Irisan jeruk nipis', 'Larutan gula & garam dalam sendok kecil', 'Kartu ekspresi rasa (tersenyum, meringis, kaget)', 'Lembar dokumentasi anak'], ARRAY['Lingkaran pagi: Doa bersama dan apersepsi tentang indra pengecap lidah.', 'Anak mencicipi sampel buah secara bergantian dalam kelompok kecil (3 anak).', 'Anak mencocokkan rasa yang dirasakan dengan kartu ekspresi wajah.', 'Refleksi bersama: mengucap syukur atas kemampuan mengecap aneka rasa.'], 'Anak-anak sangat antusias. Kenzo mulanya ragu mencicipi jeruk nipis, namun setelah melihat temannya ia berani mencoba dan tertawa bersama.', true),
('act_002', 'sch_tk_yapendik_01', 'cls_tka_01', '2026-08-24', 'Diriku / Panca Indra Ciptaan Tuhan', 'Indra Penglihatan & Warna', '10:00 - 11:15', 'Finger Painting: Melukis Pelangi dengan Jari', ARRAY['FISIK_MOTORIK', 'SENI', 'SOSIAL_EMOSIONAL'], ARRAY['Cat pasta non-toksik 3 warna primer', 'Kertas gambar A3 tebal', 'Lap basah & celemek lukis'], ARRAY['Pemberian instruksi cara mencampur warna merah dan kuning menjadi jingga.', 'Anak mengeksplorasi goresan jari tangan membentuk lengkungan pelangi.', 'Gotong royong mencuci tangan dan merapikan alas lukis.'], 'Motorik halus anak berkembang baik saat meratakan cat dengan jari telunjuk dan jempol.', true),
('act_003', 'sch_tk_yapendik_01', 'cls_tka_01', '2026-08-25', 'Lingkunganku / Sekolahku yang Bersih', 'Menjaga Kebersihan Kelas Bersama Sahabat', '08:00 - 09:30', 'Operasi Semut & Memilah Sampah Daun vs Plastik', ARRAY['NILAI_AGAMA_MORAL', 'SOSIAL_EMOSIONAL', 'KOGNITIF'], ARRAY['2 keranjang sampah warna hijau (organik) dan biru (anorganik)', 'Sarung tangan kain kecil untuk anak', 'Topi detektif lingkungan'], ARRAY['Cerita boneka tangan tentang taman bunga yang bersih.', 'Anak berjalan mengelilingi halaman sekolah mengumpulkan sampah kering.', 'Memilah bersama ke dalam keranjang sesuai kategori.'], '', false)
ON CONFLICT (id) DO NOTHING;

-- Observation Records
INSERT INTO observation_records (id, school_id, class_id, student_id, observer_person_id, observed_at, domain, anecdote_description, behavior_trigger, child_reaction, teacher_intervention, milestone_rating, indicators_observed, photo_evidence_url, is_confidential_to_staff, shared_with_guardian, created_at) VALUES
('obs_001', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', 'per_teacher_siti', '2026-08-24T09:15:00Z', 'KOGNITIF', 'Saat kegiatan sentra rasa, Kenzo mampu membedakan rasa gula dan garam. Ketika ditanya "Bagaimana rasanya?", Kenzo menjawab: "Yang ini manis seperti madu bu, yang ini asin seperti kuah bakso!" dengan ekspresi tersenyum gembira.', 'Mencicipi air garam dan gula batu menggunakan sendok kecil', 'Meringis saat mencicip garam lalu tertawa dan menjelaskan perbedaannya dengan antusias', 'Memberikan afirmasi verbal positif dan menantang Kenzo menceritakan makanan manis favoritnya di rumah', 'BSH', ARRAY['Membedakan rasa manis dan asin', 'Menjelaskan persepsi dengan kalimat lengkap'], '', false, true, '2026-08-24T09:30:00Z'),
('obs_002', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', 'per_teacher_siti', '2026-08-24T10:45:00Z', 'SOSIAL_EMOSIONAL', 'Ketika temannya Alina menjatuhkan wadah cat warna biru, Kenzo spontan mengambil lap bersih dan membantu Alina menyeka tumpahan tanpa diminta guru. Kenzo berkata: "Jangan nangis Alina, aku bantuin beresin ya."', 'Cat air temannya tumpah di meja', 'Menunjukkan inisiatif empati dan membantu teman yang cemas', 'Memuji sikap tolong-menolong Kenzo di hadapan kelompok', 'BSB', ARRAY['Menunjukkan empati terhadap teman sebaya', 'Inisiatif menolong secara sukarela'], '', false, true, '2026-08-24T11:00:00Z'),
('obs_003', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_alina_02', 'per_teacher_siti', '2026-08-24T10:30:00Z', 'SENI', 'Alina membuat gradasi warna jingga dan merah muda pada lukisan bunganya menggunakan jari telunjuk. Pola garisnya rapi dan ia menceritakan bahwa bunganya sedang disinari matahari pagi.', '', '', '', 'BSB', ARRAY['Kreativitas finger painting', 'Menceritakan karya seni yang dibuat'], '', false, true, '2026-08-24T11:05:00Z'),
('obs_004', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_gabriel_03', 'per_teacher_siti', '2026-08-24T08:45:00Z', 'FISIK_MOTORIK', 'Gabriel mampu melompati 4 rintangan busa berturut-turut dengan kedua kaki mendarat seimbang tanpa terjatuh di halaman bermain.', '', '', '', 'BSH', ARRAY['Keseimbangan motorik kasar', 'Melompat dengan dua kaki seimbang'], '', false, true, '2026-08-24T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Daily Attendance
INSERT INTO daily_attendance (id, school_id, class_id, student_id, date, status, notes, recorded_by_person_id, recorded_at, temperature_celsius, arrival_mood) VALUES
('att_001', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', '2026-08-24', 'HADIR', 'Datang diantar ayah, menyapa guru dengan senyum ramah.', 'per_teacher_siti', '2026-08-24T07:45:00Z', 36.4, 'CERIA'),
('att_002', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_alina_02', '2026-08-24', 'HADIR', 'Membawa bekal buah naga dan roti gandum.', 'per_teacher_siti', '2026-08-24T07:50:00Z', 36.5, 'TENANG'),
('att_003', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_gabriel_03', '2026-08-24', 'HADIR', 'Bersemangat bermain balok kayu sebelum bel masuk.', 'per_teacher_siti', '2026-08-24T07:55:00Z', 36.6, 'CERIA')
ON CONFLICT (id) DO NOTHING;

-- Guardian Notices
INSERT INTO guardian_notices (id, school_id, class_id, student_id, author_person_id, recipient_person_id, type, title, content, requires_acknowledgment, acknowledged_at, acknowledged_by_person_id, guardian_reply, created_at) VALUES
('notif_001', 'sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', 'per_teacher_siti', 'per_parent_budi', 'DAILY_SUMMARY', 'Catatan Harian Ananda Kenzo (24 Agustus 2026)', 'Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.', true, '2026-08-24T12:30:00Z', 'per_parent_budi', 'Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.', '2026-08-24T11:45:00Z'),
('notif_002', 'sch_tk_yapendik_01', 'cls_tka_01', NULL, 'per_teacher_siti', NULL, 'CLASS_ANNOUNCEMENT', 'Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)', 'Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.', false, NULL, NULL, NULL, '2026-08-24T12:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (id, school_id, user_id, person_name, role, action, resource, resource_id, details, timestamp) VALUES
('aud_001', 'sch_tk_yapendik_01', 'user_teacher_siti', 'Siti Rahmawati, S.Pd', 'TEACHER', 'CREATE_OBSERVATION', 'STUDENT_OBSERVATION', 'obs_001', 'Merekam catatan anekdot perkembangan kognitif untuk siswa Kenzo Pratama (Rating: BSH)', '2026-08-24T09:30:00Z'),
('aud_002', 'sch_tk_yapendik_01', 'user_teacher_siti', 'Siti Rahmawati, S.Pd', 'TEACHER', 'CREATE_OBSERVATION', 'STUDENT_OBSERVATION', 'obs_002', 'Merekam catatan perkembangan sosial-emosional Kenzo Pratama (Rating: BSB)', '2026-08-24T11:00:00Z'),
('aud_003', 'sch_tk_yapendik_01', 'user_parent_budi', 'Budi Santoso, S.T.', 'GUARDIAN', 'ACKNOWLEDGE_NOTICE', 'GUARDIAN_COMMUNICATION', 'notif_001', 'Orang tua menandatangani tanda terima catatan harian dan mengirimkan respon apresiasi', '2026-08-24T12:30:00Z')
ON CONFLICT (id) DO NOTHING;
