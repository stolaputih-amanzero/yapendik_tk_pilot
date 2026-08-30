-- ============================================================================
-- YAPENDIK SCHOOL OS — MIGRATION M12 DOWN (ROLLBACK SCRIPT)
-- STAGE 6-A: THE WARM BRIEFING & CLOSURE MODE SUBSTRATE
-- ============================================================================

-- 1. Drop Stored Procedures (RPCs)
DROP FUNCTION IF EXISTS public.rpc_trigger_closure_ritual(TEXT, INT, INT, TEXT);
DROP FUNCTION IF EXISTS public.rpc_update_phase_action_mapping(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.rpc_get_briefing_data(TEXT, TEXT);

-- 2. Drop RLS Policies & Tables in reverse dependency order
DROP TABLE IF EXISTS public.closure_ritual_ledger CASCADE;
DROP TABLE IF EXISTS public.school_rhythm_configs CASCADE;
DROP TABLE IF EXISTS public.phase_action_mappings CASCADE;
