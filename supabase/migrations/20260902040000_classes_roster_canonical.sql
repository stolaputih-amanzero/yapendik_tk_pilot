-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: 20260902040000_classes_roster_canonical.sql
-- Description: Canonical indexes and idempotent seed data for Data Roster
-- Compliant with V2.1.5 Frozen Baseline (No schema teardown / destructive DDL)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Index Penunjang Performa Query Roster
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON public.classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON public.classes(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_students_current_class ON public.students(current_class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_guardian_relationships_student ON public.guardian_relationships(student_person_id);

-- 2. Idempotent Seed: Penjaminan Standar Nomenklatur Kelas TK
INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, room_number, capacity, is_active)
VALUES 
  ('cls_maranatha_tka', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelas TK A', 'TK_A_4_5', 'Ruang TK A', 20, TRUE),
  ('cls_maranatha_tkb', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelas TK B', 'TK_B_5_6', 'Ruang TK B', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  room_number = EXCLUDED.room_number,
  age_group = EXCLUDED.age_group,
  is_active = EXCLUDED.is_active;
