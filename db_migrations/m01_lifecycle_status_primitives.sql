-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 2: MIGRATION M01
-- Description: Add Canonical Lifecycle Status Primitives to School Table
-- Target: schools table
-- Constraints: Non-destructive, Additive, Idempotent
-- ==============================================================================

-- 1. Add status column (Legal / Institutional Status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schools' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.schools ADD COLUMN status TEXT DEFAULT 'ACTIVE' 
      CHECK (status IN ('ACTIVE', 'ARCHIVED'));
    COMMENT ON COLUMN public.schools.status IS 'Legal / institutional charter status of the school unit (ACTIVE, ARCHIVED)';
  END IF;
END $$;

-- 2. Add operational_readiness column (Topological Readiness Status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schools' AND column_name = 'operational_readiness'
  ) THEN
    ALTER TABLE public.schools ADD COLUMN operational_readiness TEXT DEFAULT 'NOT_READY' 
      CHECK (operational_readiness IN ('NOT_READY', 'READY'));
    COMMENT ON COLUMN public.schools.operational_readiness IS 'Topological readiness contract for School OS runtime operation (NOT_READY, READY)';
  END IF;
END $$;

-- 3. Create index for fast status and readiness filtering
CREATE INDEX IF NOT EXISTS idx_schools_status_readiness 
  ON public.schools(status, operational_readiness);
