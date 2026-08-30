-- ============================================================================
-- MIGRATION ROLLBACK: m13_genesis_seed_tk_maranatha_down
-- PURPOSE: Rollback TK Yapendik Maranatha Jakarta genesis data ingestion
-- DATE: 2026-08-31
-- AUTHOR: ARB + Project Owner
-- ============================================================================

BEGIN;

-- 1. Remove School Rhythm Config
DELETE FROM public.school_rhythm_configs WHERE school_id = 'sch_tk_maranatha';

-- 2. Remove Guardian Relationships
DELETE FROM public.guardian_relationships 
WHERE student_person_id IN (
  SELECT person_id FROM public.students WHERE school_id = 'sch_tk_maranatha'
);

-- 3. Remove Students
DELETE FROM public.students WHERE school_id = 'sch_tk_maranatha';

-- 4. Remove Teacher & Staff Profiles
DELETE FROM public.teacher_profiles WHERE school_id = 'sch_tk_maranatha';
DELETE FROM public.staff_profiles WHERE school_id = 'sch_tk_maranatha';
DELETE FROM public.governance_profiles WHERE id = 'gov_prof_shirley';

-- 5. Remove Classes
DELETE FROM public.classes WHERE school_id = 'sch_tk_maranatha';

-- 6. Remove Academic Years
DELETE FROM public.academic_years WHERE school_id = 'sch_tk_maranatha';

-- 7. Remove Schools
DELETE FROM public.schools WHERE id = 'sch_tk_maranatha' OR npsn = '69820291';

-- 8. Remove Persons created for Maranatha
DELETE FROM public.persons 
WHERE id IN (
  'per_superadmin_shirley',
  'per_headmaster_sheryl',
  'per_teacher_erna',
  'per_teacher_charlotha',
  'per_teacher_evi',
  'per_child_millen',
  'per_guard_michael_maspaitella',
  'per_guard_julen_patricia',
  'per_child_carissa',
  'per_guard_dulpri',
  'per_guard_herni_tiurma',
  'per_child_rainer',
  'per_guard_alfredo_diego',
  'per_guard_devia_permata',
  'per_child_falen',
  'per_guard_hasamuda_hulu',
  'per_guard_senimawati_zega',
  'per_child_adrian',
  'per_guard_catur_putranto',
  'per_guard_salamah',
  'per_child_adhi',
  'per_guard_herluin_karyadi',
  'per_guard_nancy_ferawati',
  'per_child_liora',
  'per_guard_david_ardy',
  'per_guard_rani_sinaga',
  'per_child_zio',
  'per_guard_george_alexandre',
  'per_guard_penta_romla',
  'per_child_brian',
  'per_guard_favor_bancin',
  'per_guard_muliathy_briany',
  'per_child_kayla',
  'per_guard_andi_harefa',
  'per_guard_mutiara_zega',
  'per_child_dominic',
  'per_guard_henky_santoso',
  'per_guard_friny',
  'per_child_lyra',
  'per_guard_bram_kevin',
  'per_guard_lillyanti_posumah',
  'per_child_levin',
  'per_guard_veron_situmorang',
  'per_guard_henny_sitindaon',
  'per_child_adriel',
  'per_guard_andri_syawali',
  'per_guard_bilief_zebua',
  'per_child_zane',
  'per_guard_remon',
  'per_guard_yanti_siagian',
  'per_child_clea',
  'per_guard_denis',
  'per_guard_marshella_novita',
  'per_child_nathan',
  'per_guard_hengki_adi',
  'per_guard_novita_ginting'
);

COMMIT;
