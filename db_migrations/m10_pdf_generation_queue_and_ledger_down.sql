-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M10 ROLLBACK (DOWN SCRIPT)
-- STAGE 5 / ADR-01 & ADR-04: PDF GENERATION QUEUE & LEDGER ROLLBACK
-- ==============================================================================
-- WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).
-- This script safely removes the PDF generation queue table, triggers, and RLS policies.
-- ==============================================================================

BEGIN;

-- 1. Drop Table (CASCADE automatically removes all attached triggers, policies, and indexes)
DROP TABLE IF EXISTS public.pdf_generation_requests CASCADE;

-- 2. Drop State Machine Functions (if orphaned)
DROP FUNCTION IF EXISTS public.fn_guard_pdf_request_lifecycle();

COMMIT;
