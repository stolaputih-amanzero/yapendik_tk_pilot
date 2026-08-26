-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M09 ROLLBACK (DOWN SCRIPT)
-- STAGE 5 / ADR-01 & ADR-03: STORAGE OPTIMIZATION & MEDIA PROXY ROLLBACK
-- ==============================================================================
-- WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).
-- This script safely removes storage RLS policies and authorization helper functions.
-- ==============================================================================

BEGIN;

-- 1. Drop Storage RLS Policies
DROP POLICY IF EXISTS "Headmaster and Governance can delete observation media" ON storage.objects;
DROP POLICY IF EXISTS "School educators can upload observation media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized actors can view observation media" ON storage.objects;

-- 2. Drop Authorization Helper Function
DROP FUNCTION IF EXISTS public.auth_can_access_observation_media(TEXT);

-- 3. Note on Bucket Deletion:
-- Supabase manages storage.buckets with an internal trigger (storage.protect_delete()) that forbids direct SQL DELETE.
-- To delete the bucket itself, use the Supabase Dashboard or Storage API (e.g. supabase.storage.deleteBucket).

COMMIT;
