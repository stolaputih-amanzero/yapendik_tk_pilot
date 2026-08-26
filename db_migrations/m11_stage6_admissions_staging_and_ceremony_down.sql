-- ============================================================================
-- YAPENDIK SCHOOL OS — MIGRATION M11 DOWN (ROLLBACK SCRIPT)
-- STAGE 6: ADMISSIONS & ENROLLMENT CONTINUUM (PPDB LOOP)
-- ============================================================================
-- GOVERNING ARCHITECTURE: ADR-01 Non-Destructive Rollback & Schema Reversal
-- ============================================================================

-- WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).

-- 1. Drop Stored Procedures (RPCs)
DROP FUNCTION IF EXISTS public.rpc_purge_expired_admissions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.rpc_execute_enrollment_ceremony(TEXT, TEXT);

-- 2. Drop Projections & Views
DROP VIEW IF EXISTS public.admissions_telemetry_projection;

-- 3. Drop RLS Policies & Staging Tables in reverse dependency order
DROP TABLE IF EXISTS public.admissions_intake_observations CASCADE;
DROP TABLE IF EXISTS public.admissions_documents CASCADE;
DROP TABLE IF EXISTS public.admissions_applicants CASCADE;
DROP TABLE IF EXISTS public.admissions_capacity_quotas CASCADE;
