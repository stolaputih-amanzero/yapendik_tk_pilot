-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: 20260902120000_seed_coteacher_assignments.sql
-- Compliance: Stage 4.5 Frozen State (Zero DDL / Zero RLS Mutation)
-- Description: Assigns both Homeroom and Co-Teacher to the same class
-- ═══════════════════════════════════════════════════════════════════

-- 1. Idempotent DML: Ensure Homeroom & Co-Teacher assignment on canonical classes
UPDATE public.classes
SET homeroom_teacher_id = 'per_teacher_erna',
    co_teacher_id = 'per_teacher_charlotha'
WHERE id = 'cls_maranatha_tka';

UPDATE public.classes
SET homeroom_teacher_id = 'per_teacher_evi'
WHERE id = 'cls_maranatha_tkb';
