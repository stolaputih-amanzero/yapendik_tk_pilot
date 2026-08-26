-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M08 ROLLBACK (DOWN SCRIPT)
-- STAGE 5 / ADR-01 & ADR-02: SHADOW PARTITIONING ROLLBACK
-- ==============================================================================
-- WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).
-- This script only reverts the shadow provisioning artifacts (pre-cutover).
-- ==============================================================================

BEGIN;

-- 1. Drop Helper Functions
DROP FUNCTION IF EXISTS public.fn_execute_attendance_cutover();
DROP FUNCTION IF EXISTS public.fn_backfill_attendance_to_shadow(INT);

-- 2. Drop Shadow Partitioned Table and Partitions (CASCADE drops all attached triggers & policies)
DROP TABLE IF EXISTS public.daily_attendance_p2024_2025 CASCADE;
DROP TABLE IF EXISTS public.daily_attendance_p2025_2026 CASCADE;
DROP TABLE IF EXISTS public.daily_attendance_p2026_2027 CASCADE;
DROP TABLE IF EXISTS public.daily_attendance_p2027_2028 CASCADE;
DROP TABLE IF EXISTS public.daily_attendance_default CASCADE;
DROP TABLE IF EXISTS public.daily_attendance_partitioned CASCADE;

COMMIT;
