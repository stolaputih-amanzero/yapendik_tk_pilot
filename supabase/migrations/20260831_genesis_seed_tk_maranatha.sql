-- ============================================================================
-- SUPABASE MIGRATION: 20260831_genesis_seed_tk_maranatha
-- PURPOSE: Clean legacy pilot fixtures & ingest TK Yapendik Maranatha Jakarta
-- DATE: 2026-08-31
-- ============================================================================

BEGIN;

-- 1. Clean legacy pilot seed data (temporarily bypass immutability triggers for legacy mock cleanup)
ALTER TABLE public.student_progress_reports DISABLE TRIGGER ALL;
ALTER TABLE public.student_placement_records DISABLE TRIGGER ALL;
ALTER TABLE public.observation_records DISABLE TRIGGER ALL;
ALTER TABLE public.daily_attendance DISABLE TRIGGER ALL;

DELETE FROM public.pdf_generation_requests 
WHERE target_student_id IN (
  SELECT id FROM public.students 
  WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
     OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'))
);

DELETE FROM public.student_progress_reports 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
     OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'))
);

DELETE FROM public.student_placement_records 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
     OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'))
);

DELETE FROM public.observation_records 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.daily_attendance 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.learning_activities 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.guardian_notices 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.guardian_relationships 
WHERE student_person_id IN (
  SELECT s.person_id FROM public.students s 
  JOIN public.schools sc ON s.school_id = sc.id 
  WHERE sc.npsn IN ('20104821', '20108955') OR sc.id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
);

DELETE FROM public.students 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

ALTER TABLE public.student_progress_reports ENABLE TRIGGER ALL;
ALTER TABLE public.student_placement_records ENABLE TRIGGER ALL;
ALTER TABLE public.observation_records ENABLE TRIGGER ALL;
ALTER TABLE public.daily_attendance ENABLE TRIGGER ALL;

DELETE FROM public.teacher_profiles 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.staff_profiles 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.school_rhythm_configs 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.classes 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.academic_years 
WHERE school_id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR school_id IN (SELECT id FROM public.schools WHERE npsn IN ('20104821', '20108955'));

DELETE FROM public.schools 
WHERE id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02')
   OR npsn IN ('20104821', '20108955');

DELETE FROM public.persons 
WHERE id IN (
  'per_teacher_siti', 'per_teacher_maria', 'per_headmaster_esther', 
  'per_teacher_diana', 'per_headmaster_johan', 'per_parent_budi', 
  'per_parent_dewi', 'per_parent_hendra', 'per_child_kenzo', 'per_child_alina'
);

-- 2. Persons: Superadmin, Headmaster, Teachers
INSERT INTO public.persons (
  id, national_id_number, full_name, preferred_name, gender, 
  birth_date, birth_place, phone, address, created_at, updated_at
) VALUES 
('per_superadmin_shirley', '3171035906670007', 'SHIRLEY A.T.WAKKARY', 'Ibu Shirley', 'FEMALE', '1967-06-19', 'Jakarta', '081281310123', 'Kompleks Yapendik Graha, Jakarta', NOW(), NOW()),
('per_headmaster_sheryl', '3171034909940005', 'SHERYL Y N UMBAS, S.IKOM, M.PD', 'Ibu Sheryl', 'FEMALE', '1994-09-09', 'Jakarta', '081219748487', 'JL. BALADEWA NO. 32, TANAH TINGGI JAKARTA PUSAT', NOW(), NOW()),
('per_teacher_erna', '3172025811680008', 'ERNA BOYKELA R', 'Bu Erna', 'FEMALE', '1968-11-28', 'Jakarta', '081218641392', 'Jakarta', NOW(), NOW()),
('per_teacher_charlotha', '3172025108050013', 'CHARLOTHA JOVANNCA BLANDINNA R', 'Bu Jovannca', 'FEMALE', '1985-05-01', 'Jakarta', '081385868377', 'Jakarta', NOW(), NOW()),
('per_teacher_evi', '3171054311980001', 'EVI TANIA', 'Bu Evi', 'FEMALE', '1998-03-11', 'Jakarta', '089536851668', 'Jakarta', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  national_id_number = EXCLUDED.national_id_number,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Governance Profile
INSERT INTO public.governance_profiles (id, person_id, role, is_active)
VALUES ('gov_prof_shirley', 'per_superadmin_shirley', 'SUPERADMIN', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

-- 3. School, Academic Year, Profiles
INSERT INTO public.schools (
  id, npsn, name, level, sub_type, address, city, province, 
  phone, email, headmaster_person_id, academic_year_active_id, 
  status, operational_readiness, created_at
) VALUES (
  'sch_tk_maranatha', '69820291', 'TK YAPENDIK GPIB Cabang Maranatha',
  'TK', 'PAUD_TERPADU', 'JL. BALADEWA NO. 32, TANAH TINGGI', 'Jakarta Pusat', 'DKI Jakarta',
  '081281310123', 'yapendikmaranathajkt@gmail.com', 'per_headmaster_sheryl', 'ay_maranatha_2026_2027_ganjil',
  'ACTIVE', 'READY', NOW()
) ON CONFLICT (id) DO UPDATE SET
  npsn = EXCLUDED.npsn,
  name = EXCLUDED.name,
  operational_readiness = 'READY';

INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active)
VALUES ('ay_maranatha_2026_2027_ganjil', 'sch_tk_maranatha', 'Tahun Ajaran 2026/2027', 'GANJIL', '2026-07-01', '2026-12-31', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

INSERT INTO public.staff_profiles (id, person_id, school_id, role, employment_type, join_date, is_active)
VALUES ('staff_prof_sheryl', 'per_headmaster_sheryl', 'sch_tk_maranatha', 'HEADMASTER', 'TETAP', '2026-07-01', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

INSERT INTO public.teacher_profiles (id, person_id, school_id, specialization, employment_type, join_date, is_active)
VALUES 
('tch_prof_erna', 'per_teacher_erna', 'sch_tk_maranatha', 'Guru Sentra Kurikulum Merdeka PAUD', 'TETAP', '2026-07-01', TRUE),
('tch_prof_charlotha', 'per_teacher_charlotha', 'sch_tk_maranatha', 'Pendamping Kelas & Literasi', 'TETAP', '2026-07-01', TRUE),
('tch_prof_evi', 'per_teacher_evi', 'sch_tk_maranatha', 'Guru Sentra & Motorik', 'TETAP', '2026-07-01', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

-- 4. Classes
INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, room_number, capacity, homeroom_teacher_id, co_teacher_id, is_active)
VALUES 
('cls_maranatha_tka', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelompok A (TK A)', 'TK_A_4_5', 'Ruang TK A', 20, 'per_teacher_erna', 'per_teacher_charlotha', TRUE),
('cls_maranatha_tkb', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelompok B (TK B)', 'TK_B_5_6', 'Ruang TK B', 20, 'per_teacher_evi', NULL, TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

-- School Rhythm
INSERT INTO public.school_rhythm_configs (
  config_id, school_id, academic_year_id, school_timezone, rhythm_vocabulary_version, 
  school_opening_time, school_closing_time, phases, updated_by_person_id, created_at, updated_at
) VALUES (
  'a0000001-0000-0000-0000-000000000001', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'WIB', 'v1',
  '06:45', '14:30',
  '[{"phase_key":"PEMBUKA","name":"Pagi Tenang","start_time":"06:45","end_time":"07:30"},{"phase_key":"OPERASIONAL","name":"Momen Belajar & Main","start_time":"07:30","end_time":"11:30"},{"phase_key":"PENUTUP","name":"Refleksi Guru & Pulang","start_time":"11:30","end_time":"14:30"}]'::jsonb,
  'per_headmaster_sheryl', NOW(), NOW()
) ON CONFLICT (school_id, academic_year_id) DO UPDATE SET updated_at = NOW();

-- 5. Class A (9 Students & Guardians)
-- 1. Millen
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_millen', '3276054207210001', 'JEQUALINE ARABELLA MASPAITELLA', 'MILLEN', 'FEMALE', '2021-07-02', 'DEPOK', 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_01', 'per_child_millen', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260101', '3276054207210001', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_michael_maspaitella', '3171044609930003', 'MICHAEL MASPAITELLA', 'Pak Michael', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_julen_patricia', '3171044609930002', 'JULEN PATRICIA', 'Ibu Julen', 'FEMALE', '081296970087', 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_millen_father', 'per_child_millen', 'per_guard_michael_maspaitella', 'FATHER', FALSE, TRUE, 2), ('gr_millen_mother', 'per_child_millen', 'per_guard_julen_patricia', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 2. Carissa
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_carissa', '3171088804210002', 'CARISSA ELEANOR NAPITUPULU', 'CARISSA', 'FEMALE', '2021-04-28', 'JAKARTA', 'KP RAWA SELATAN I NO 45 RT 011/005 KEL GALUR KEC JOHAR BARU JAKARTA PUSAT 10530')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_02', 'per_child_carissa', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260102', '3171088804210002', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_dulpri', '3275027012920008', 'DULPRI', 'Pak Dulpri', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_herni_tiurma', '3275027012920009', 'HERNI TIURMA', 'Ibu Herni', 'FEMALE', '081294212158', 'KP RAWA SELATAN I NO 45 RT 011/005 KEL GALUR KEC JOHAR BARU JAKARTA PUSAT 10530')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_carissa_father', 'per_child_carissa', 'per_guard_dulpri', 'FATHER', FALSE, TRUE, 2), ('gr_carissa_mother', 'per_child_carissa', 'per_guard_herni_tiurma', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Rainer
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_rainer', '3171081711210005', 'RAINER ALDEV NATASHA SUMUAL', 'RAINER', 'MALE', '2021-11-17', 'JAKARTA', 'JL TANAH TINGGI SAWAH RT 015/008 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT 10540')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_03', 'per_child_rainer', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260103', '3171081711210005', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_alfredo_diego', '3171086710990004', 'ALFREDO DIEGO OKTAVIO', 'Pak Alfredo', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_devia_permata', '3171086710990005', 'DEVIA PERMATA SARI', 'Ibu Devia', 'FEMALE', '089633240559', 'JL TANAH TINGGI SAWAH RT 015/008 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT 10540')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_rainer_father', 'per_child_rainer', 'per_guard_alfredo_diego', 'FATHER', FALSE, TRUE, 2), ('gr_rainer_mother', 'per_child_rainer', 'per_guard_devia_permata', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Falen
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_falen', '1214344602220001', 'BRIELLA FALERIE HALKA HULU', 'FALEN', 'FEMALE', '2022-02-06', 'JAKARTA', 'JL TANAH TINGGI 2 NO 16 RT 07/002 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_04', 'per_child_falen', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260104', '1214344602220001', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_hasamuda_hulu', '1204144710970001', 'HASAMUDA HULU', 'Pak Hasamuda', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_senimawati_zega', '1204144710970002', 'SENIMAWATI ZEGA', 'Ibu Senimawati', 'FEMALE', '085261401671', 'JL TANAH TINGGI 2 NO 16 RT 07/002 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_falen_father', 'per_child_falen', 'per_guard_hasamuda_hulu', 'FATHER', FALSE, TRUE, 2), ('gr_falen_mother', 'per_child_falen', 'per_guard_senimawati_zega', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Adrian
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_adrian', '3171051103210003', 'ADRIAN MAHVERT PUTRA', 'ADRIAN', 'MALE', '2023-01-07', 'JAKARTA', 'JL CEMPAKA PUTIH BARAT RT 03/010 KEL CEMPAKA PUTIH BARAT KEC CEMPAKA PUTIH JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_05', 'per_child_adrian', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260105', '3171051103210003', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_catur_putranto', '3305114507940003', 'CATUR PUTRANTO', 'Pak Catur', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_salamah', '3305114507940004', 'SALAMAH', 'Ibu Salamah', 'FEMALE', '083111687805', 'JL CEMPAKA PUTIH BARAT RT 03/010 KEL CEMPAKA PUTIH BARAT KEC CEMPAKA PUTIH JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_adrian_father', 'per_child_adrian', 'per_guard_catur_putranto', 'FATHER', FALSE, TRUE, 2), ('gr_adrian_mother', 'per_child_adrian', 'per_guard_salamah', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 6. Adhi
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_adhi', '3171041509210004', 'ADHINATA RAJENDRA', 'ADHI', 'MALE', '2021-09-15', 'JAKARTA', 'JL CULAN NO 1 KEL KRAMAT KEC SENEN JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_06', 'per_child_adhi', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260106', '3171041509210004', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_herluin_karyadi', '3171046711790001', 'HERLUIN KARYADI PRAPTO U', 'Pak Herluin', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_nancy_ferawati', '3171046711790002', 'NANCY FERAWATI', 'Ibu Nancy', 'FEMALE', '085892291422', 'JL CULAN NO 1 KEL KRAMAT KEC SENEN JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_adhi_father', 'per_child_adhi', 'per_guard_herluin_karyadi', 'FATHER', FALSE, TRUE, 2), ('gr_adhi_mother', 'per_child_adhi', 'per_guard_nancy_ferawati', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 7. Liora
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_liora', '3175027012210002', 'LIORA OLIWIIA HUTAGAOL', 'LIORA', 'FEMALE', '2021-12-30', 'Jakarta', 'JL. PULOMAS BARAT DAYA R5 KAYU PUTIH PULO GADUNG, JAKARTA TIMUR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_07', 'per_child_liora', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260107', '3175027012210002', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_david_ardy', '1208016308890002', 'DAVID ARDY MARULITUA HUTAGAOL', 'Pak David', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_rani_sinaga', '1208016308890001', 'RANI RIDAHYANTA SINAGA', 'Ibu Rani', 'FEMALE', '08118167854', 'JL. PULOMAS BARAT DAYA R5 KAYU PUTIH PULO GADUNG, JAKARTA TIMUR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_liora_father', 'per_child_liora', 'per_guard_david_ardy', 'FATHER', FALSE, TRUE, 2), ('gr_liora_mother', 'per_child_liora', 'per_guard_rani_sinaga', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 8. Zio
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_zio', '3175021804210005', 'ZIONATHAN ELEAZAR PUTRA', 'ZIO', 'MALE', '2021-04-18', 'JAKARTA', 'JL. BATU BIDURI BULAN NO. 52 KAYU PUTIH PULOGADUNG, JAKARTA TIMUR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_08', 'per_child_zio', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260108', '3175021804210005', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_george_alexandre', '2171105802900001', 'GEORGE ALEXANDRE PUTRA', 'Pak George', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_penta_romla', '2171105802900002', 'PENTA ROMLA FRYLAN', 'Ibu Penta', 'FEMALE', '085284560857', 'JL. BATU BIDURI BULAN NO. 52 KAYU PUTIH PULOGADUNG, JAKARTA TIMUR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_zio_father', 'per_child_zio', 'per_guard_george_alexandre', 'FATHER', FALSE, TRUE, 2), ('gr_zio_mother', 'per_child_zio', 'per_guard_penta_romla', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 9. Brian
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_brian', '3175092011210006', 'THEODOR BRIANMBICAR BANCIN', 'BRIAN', 'MALE', '2021-11-20', 'MEDAN', 'JALAN SEDERHANA NO. 5 PANJI DABUTAR SITINJO, SUMATERA UTARA')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_09', 'per_child_brian', 'sch_tk_maranatha', 'cls_maranatha_tka', '20260109', '3175092011210006', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_favor_bancin', '6204065404850003', 'FAVOR ADELAIDE BANCIN', 'Pak Favor', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_muliathy_briany', '6204065404850004', 'MULIATHY BRIANY', 'Ibu Muliathy', 'FEMALE', '081350350144', 'JALAN SEDERHANA NO. 5 PANJI DABUTAR SITINJO, SUMATERA UTARA')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_brian_father', 'per_child_brian', 'per_guard_favor_bancin', 'FATHER', FALSE, TRUE, 2), ('gr_brian_mother', 'per_child_brian', 'per_guard_muliathy_briany', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 6. Class B (8 Students & Guardians)
-- 10. Kayla
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_kayla', '3171086202220006', 'ADELINE MIKAYLA HAREFA', 'KAYLA', 'FEMALE', '2022-02-22', 'JAKARTA', 'JL. RAWA SELATAN I TOWN HOUSE ONASIS B-10 NO. 37, GALUR JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_10', 'per_child_kayla', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260201', '3171086202220006', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_andi_harefa', '1204024604890001', 'ANDI NOVA HAREFA', 'Pak Andi', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_mutiara_zega', '1204024604890002', 'MUTIARA ZEGA', 'Ibu Mutiara', 'FEMALE', '081394642219', 'JL. RAWA SELATAN I TOWN HOUSE ONASIS B-10 NO. 37, GALUR JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_kayla_father', 'per_child_kayla', 'per_guard_andi_harefa', 'FATHER', FALSE, TRUE, 2), ('gr_kayla_mother', 'per_child_kayla', 'per_guard_mutiara_zega', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 11. Dominic
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_dominic', '3171032810200001', 'DOMINIC JOVAN', 'DOMINIC', 'MALE', '2020-10-28', 'JAKARTA', 'JL. HARAPAN MULIA II NO. 5, HARAPAN MULIA KEMAYORAN, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_11', 'per_child_dominic', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260202', '3171032810200001', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_henky_santoso', '3171034202790003', 'HENKY SANTOSO', 'Pak Henky', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_friny', '3171034202790004', 'FRINY', 'Ibu Friny', 'FEMALE', '081288525181', 'JL. HARAPAN MULIA II NO. 5, HARAPAN MULIA KEMAYORAN, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_dominic_father', 'per_child_dominic', 'per_guard_henky_santoso', 'FATHER', FALSE, TRUE, 2), ('gr_dominic_mother', 'per_child_dominic', 'per_guard_friny', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 12. Lyra
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_lyra', '3171085508210001', 'LYRA HENNESSY SUPUSEPA', 'LYRA', 'FEMALE', '2021-08-15', 'JAKARTA', 'JL. KR PULO GUNDUL K.207, TANAH TINGGI JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_12', 'per_child_lyra', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260203', '3171085508210001', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_bram_kevin', '3175017001950003', 'BRAM KEVIN SUPUSEPA', 'Pak Bram', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_lillyanti_posumah', '3175017001950004', 'LILLYANTI FENI POSUMAH', 'Ibu Lillyanti', 'FEMALE', '082128900375', 'JL. KR PULO GUNDUL K.207, TANAH TINGGI JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_lyra_father', 'per_child_lyra', 'per_guard_bram_kevin', 'FATHER', FALSE, TRUE, 2), ('gr_lyra_mother', 'per_child_lyra', 'per_guard_lillyanti_posumah', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 13. Levin
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_levin', '3171052211200002', 'LEVIN BENEDICT NEDEZ SITUMORANG', 'LEVIN', 'MALE', '2020-11-22', 'JAKARTA', 'KP. JAWA RAWASARI CEMPAKA PUTIH, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_13', 'per_child_levin', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260204', '3171052211200002', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_veron_situmorang', '3171054810810006', 'VERON NEDEZ SITUMORANG', 'Pak Veron', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_henny_sitindaon', '3171054810810007', 'HENNY RAYA SITINDAON', 'Ibu Henny', 'FEMALE', '08158351971', 'KP. JAWA RAWASARI CEMPAKA PUTIH, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_levin_father', 'per_child_levin', 'per_guard_veron_situmorang', 'FATHER', FALSE, TRUE, 2), ('gr_levin_mother', 'per_child_levin', 'per_guard_henny_sitindaon', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 14. Adriel
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_adriel', '3175042710200006', 'ADRIEL', 'ADRIEL', 'MALE', '2020-10-27', 'JAKARTA', 'JL. CEMPAKA PUTIH UTARA BLOK O NO. 112, CEMPAKA BARU KEMAYORAN JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_14', 'per_child_adriel', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260205', '3175042710200006', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_andri_syawali', '1204106401960002', 'ANDRI SYAWALI', 'Pak Andri', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_bilief_zebua', '1204106401960001', 'BILIEF SENNIAR ZEBUA', 'Ibu Bilief', 'FEMALE', '085311302763', 'JL. CEMPAKA PUTIH UTARA BLOK O NO. 112, CEMPAKA BARU KEMAYORAN JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_adriel_father', 'per_child_adriel', 'per_guard_andri_syawali', 'FATHER', FALSE, TRUE, 2), ('gr_adriel_mother', 'per_child_adriel', 'per_guard_bilief_zebua', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 15. Zane
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_zane', '3171080909200005', 'ZANE ELEANOR SIMANGUNSONG', 'ZANE', 'MALE', '2020-09-09', 'JAKARTA', 'JL. RAWA TENGAH NO. 8, GALUR JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_15', 'per_child_zane', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260206', '3171080909200005', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_remon', '1212047003920002', 'REMON', 'Pak Remon', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_yanti_siagian', '1212047003920003', 'YANTI MARTHALENA SIAGIAN', 'Ibu Yanti', 'FEMALE', '081293181442', 'JL. RAWA TENGAH NO. 8, GALUR JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_zane_father', 'per_child_zane', 'per_guard_remon', 'FATHER', FALSE, TRUE, 2), ('gr_zane_mother', 'per_child_zane', 'per_guard_yanti_siagian', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 16. Clea
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_clea', '3171084212200002', 'CLEA SERAPHINA DESELLA', 'CLEA', 'MALE', '2020-12-02', 'JAKARTA', 'JL. KP RAWA SAWAH JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_16', 'per_child_clea', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260207', '3171084212200002', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_denis', '3171085911910002', 'DENIS', 'Pak Denis', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_marshella_novita', '3171085911910001', 'MARSHELLA NOVITA', 'Ibu Marshella', 'FEMALE', '087888316350', 'JL. KP RAWA SAWAH JOHAR BARU, JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_clea_father', 'per_child_clea', 'per_guard_denis', 'FATHER', FALSE, TRUE, 2), ('gr_clea_mother', 'per_child_clea', 'per_guard_marshella_novita', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 17. Nathan
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, birth_date, birth_place, address)
VALUES ('per_child_nathan', '3171081704210004', 'SHAWN ELNATHAN DOLOKSARIBU', 'NATHAN', 'MALE', '2021-04-17', 'JAKARTA', 'JL. GALUR SELATAN NO. 20, GALUR JOHAR BARU JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.students (id, person_id, school_id, current_class_id, nis, nisn, enrollment_date, status)
VALUES ('stu_maranatha_17', 'per_child_nathan', 'sch_tk_maranatha', 'cls_maranatha_tkb', '20260208', '3171081704210004', '2026-07-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender)
VALUES ('per_guard_hengki_adi', '1207055011910002', 'HENGKI PRIANDO HALOMOAN ADI CHANDRA', 'Pak Hengki', 'MALE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.persons (id, national_id_number, full_name, preferred_name, gender, phone, address)
VALUES ('per_guard_novita_ginting', '1207055011910001', 'NOVITA SARI BR GINTING', 'Ibu Novita', 'FEMALE', '087889569850', 'JL. GALUR SELATAN NO. 20, GALUR JOHAR BARU JAKARTA PUSAT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.guardian_relationships (id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian, emergency_contact_priority)
VALUES ('gr_nathan_father', 'per_child_nathan', 'per_guard_hengki_adi', 'FATHER', FALSE, TRUE, 2), ('gr_nathan_mother', 'per_child_nathan', 'per_guard_novita_ginting', 'MOTHER', TRUE, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

COMMIT;
